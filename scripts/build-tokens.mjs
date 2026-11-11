// Generates src/styles/tokens.css from design-system/tokens.json.
// Runs before `dev` and `build`. The output format matches the design
// system's own tokens.css, so a re-exported tokens.json is a drop-in.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(resolve(root, "design-system/tokens.json"), "utf8"));

const cssName = (name) => `--${name.replace(/\./g, "\\.")}`;
const alias = (value) => value.replace(/^\{(.+)\}$/, (_, ref) => `var(--${ref})`);
const themed = (value, theme) => alias(typeof value === "string" ? value : value[theme]);

// Colours and shadows have a value per theme; everything else is theme-free.
function themeBlock(theme) {
  const decls = [...tokens.color.tokens, ...tokens.shadow.tokens].map(
    (t) => `${cssName(t.name)}: ${themed(t.value, theme)};`,
  );
  return decls.join(" ");
}

const staticDecls = [
  ...["spacing", "radius", "opacity", "zIndex", "layout"].flatMap((group) =>
    tokens[group].tokens.map((t) => `${cssName(t.name)}: ${t.value};`),
  ),
  ...Object.entries(tokens.type.families).map(([name, stack]) => `--font-${name}: ${stack};`),
].join(" ");

const typeClasses = tokens.type.groups.flatMap((group) =>
  group.styles.map((s) => {
    const decls = [
      `font-family: var(--font-${group.family});`,
      `font-size: ${s.fontSize};`,
      `line-height: ${s.lineHeight};`,
      `font-weight: ${s.fontWeight};`,
      s.letterSpacing ? `letter-spacing: ${s.letterSpacing};` : null,
    ].filter(Boolean);
    return `.${s.name} { ${decls.join(" ")} }`;
  }),
);

const css = [
  `/* ${tokens.name} — generated from tokens.json */`,
  `:root, [data-theme="light"] { ${themeBlock("light")} }`,
  `[data-theme="dark"] { ${themeBlock("dark")} }`,
  `:root { ${staticDecls} }`,
  ...typeClasses,
  "",
].join("\n");

const out = resolve(root, "src/styles/tokens.css");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);
console.log(`tokens.css written (${css.length} bytes)`);
