import type { Metadata } from "next";
import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";
import { GROUPS, PREVIEWS } from "./previews";
import "./dev.css";

export const metadata: Metadata = { title: "Components", robots: { index: false } };

// The library in one page: every component in the light and the dark theme,
// with the same content as the design system's own previews. Not linked from
// the product; it is the acceptance page for phase 1 and a reference after.
export default function ComponentsPage() {
  return (
    <main className="dev-page">
      <header className="dev-head">
        <div>
          <h1 className="heading-3">Components</h1>
          <p className="body-sm dev-muted">
            {PREVIEWS.length} previews, each in both themes. Open one on its own to compare it with the design system.
          </p>
        </div>
        <ThemeSwitch />
      </header>
      {GROUPS.map((group) => (
        <section key={group} className="dev-group">
          <h2 className="fv-overline">{group}</h2>
          {PREVIEWS.filter((p) => p.group === group).map((p) => (
            <article key={p.name} className="dev-card" id={p.name}>
              <h3 className="heading-6">
                <Link href={`/dev/components/${p.name}/light`}>{p.name}</Link>
              </h3>
              <div className="dev-pair">
                {(["light", "dark"] as const).map((theme) => (
                  <div key={theme} data-theme={theme} className="dev-panel">
                    <div style={{ maxWidth: p.width }}>{p.render()}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
