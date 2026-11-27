import Link from "next/link";
import { SCREENS } from "./screens";

// Index of the creator screens with made-up data. See screens.tsx.
export default function ScreensIndex() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "var(--space-8) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h1 className="heading-4" style={{ margin: 0 }}>Creator screens</h1>
      <p className="body-sm" style={{ margin: 0, color: "var(--ink-muted)" }}>Made-up data; nothing here saves. Each opens in the light or the dark theme.</p>
      {SCREENS.map((s) => (
        <div key={s.name} className="body" style={{ display: "flex", gap: "var(--space-3)", borderTop: "1px solid var(--line)", paddingTop: "var(--space-3)" }}>
          <span style={{ flex: 1 }}>{s.title}</span>
          <Link href={`/dev/screens/${s.name}/light`}>Light</Link>
          <Link href={`/dev/screens/${s.name}/dark`}>Dark</Link>
        </div>
      ))}
    </main>
  );
}
