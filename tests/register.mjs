// Lets `node --test` import the app's server modules as they are written:
// the "@/…" alias, relative imports without ".ts", and the "server-only"
// marker package (which exists to break client bundles, not tests).
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
    let file = null;
    if (specifier.startsWith("@/")) file = path.join(root, "src", specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) file = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    if (file && !existsSync(file)) {
      for (const ext of [".ts", ".tsx", "/index.ts"]) {
        if (existsSync(file + ext)) return nextResolve(pathToFileURL(file + ext).href, context);
      }
    }
    return nextResolve(file && existsSync(file) ? pathToFileURL(file).href : specifier, context);
  },
});
