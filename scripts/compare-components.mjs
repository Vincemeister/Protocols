// Phase 1 acceptance check: renders every design-system preview with the
// system's own bundle.js, renders the same preview from the React library,
// and compares the two screenshots pixel by pixel in both themes.
//
//   npm run build && npm run start -- -p 3111 &
//   node scripts/compare-components.mjs [--out <dir>] [--base http://localhost:3111]
//
// Needs Playwright (not a project dependency; `npx playwright install chromium` once).
import { createRequire } from "node:module";
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("--base", "http://localhost:3111");
const outDir = arg("--out", null);
const only = arg("--only", null);
if (outDir) mkdirSync(outDir, { recursive: true });

const ds = resolve(root, "design-system");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const font = readFileSync(resolve(root, "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2")).toString("base64");
const head = `<meta charset="utf-8"><style>
@font-face { font-family: "Outfit"; font-weight: 100 900; src: url(data:font/woff2;base64,${font}) format("woff2"); }
${read("src/styles/tokens.css")}
${read("design-system/components/bundle.css")}
a { color: var(--accent); } a:hover { color: var(--accent-hover); }
</style><script>${read("design-system/components/bundle.js")}</script>`;
const BLOBS = {
  "80f8d640e455838de1ac7468e3b2612a": "favolist-mark.svg",
  "e7204842962e182682d0dc2c0e7fb52a": "favolist-mark-light.svg",
  "3ad37ccfb6b82816c9dae9cb1ff36b25": "favolist-mark-ink.svg",
};

function referenceHtml(name, theme) {
  const src = readFileSync(resolve(ds, "components", name, "preview.html"), "utf8");
  const body = src
    .slice(src.indexOf("<body>") + 6, src.indexOf("</body>"))
    .replace(/setInterval\([^\n]*\n/g, "\n"); // the previews click themselves on a timer; compare the resting state
  const extra = (src.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
  return `<!doctype html><html lang="en" data-theme="${theme}"><head>${head}${extra}</head><body>${body}</body></html>`;
}

const names = readdirSync(resolve(ds, "components"))
  .filter((n) => existsSync(resolve(ds, "components", n, "preview.html")) && n !== "Cover")
  .filter((n) => !only || n === only);

const browser = await chromium.launch();
const results = [];
for (const width of [1280, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  await context.route("**/_blob/*", (route) => {
    const file = BLOBS[route.request().url().split("/").pop()];
    return file
      ? route.fulfill({ contentType: "image/svg+xml", body: readFileSync(resolve(ds, "assets/Logos", file)) })
      : route.abort();
  });
  let reference = "";
  await context.route("**/__reference", (route) => route.fulfill({ contentType: "text/html", body: reference }));
  const page = await context.newPage();
  for (const name of names) {
    for (const theme of ["light", "dark"]) {
      reference = referenceHtml(name, theme);
      await page.goto(`${base}/__reference`, { waitUntil: "load" }); // served below, on the app's origin
      await page.evaluate(() => document.fonts.ready);
      const ref = await page.screenshot({ fullPage: true });

      const res = await page.goto(`${base}/dev/components/${name}/${theme}`, { waitUntil: "load" });
      if (!res || !res.ok()) { results.push({ name, theme, width, missing: true }); continue; }
      await page.evaluate(() => document.fonts.ready);
      const act = await page.screenshot({ fullPage: true });

      const diff = await page.evaluate(async ([a, b]) => {
        const load = (b64) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = "data:image/png;base64," + b64; });
        const [ia, ib] = await Promise.all([load(a), load(b)]);
        const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height);
        const px = (img) => { const c = new OffscreenCanvas(w, h); const x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
        const da = px(ia), db = px(ib);
        let changed = 0;
        for (let i = 0; i < da.length; i += 4) {
          if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) changed++;
        }
        return { changed, total: w * h, sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height] };
      }, [ref.toString("base64"), act.toString("base64")]);

      results.push({ name, theme, width, ...diff });
      if (outDir && diff.changed > 0) {
        writeFileSync(resolve(outDir, `${name}-${theme}-${width}-design.png`), ref);
        writeFileSync(resolve(outDir, `${name}-${theme}-${width}-react.png`), act);
      }
    }
  }
  await context.close();
}
await browser.close();

let worst = 0;
for (const r of results) {
  const pct = r.missing ? 100 : (100 * r.changed) / r.total;
  worst = Math.max(worst, pct);
  const size = r.missing ? "page missing" : `${r.sizeA.join("x")} vs ${r.sizeB.join("x")}`;
  console.log(`${pct === 0 ? "same " : "DIFF "} ${r.name.padEnd(16)} ${r.theme.padEnd(5)} ${String(r.width).padEnd(5)} ${pct.toFixed(3)}%  ${size}`);
}
const same = results.filter((r) => !r.missing && r.changed === 0).length;
console.log(`\n${same} of ${results.length} comparisons are pixel-identical; worst difference ${worst.toFixed(3)}%.`);
