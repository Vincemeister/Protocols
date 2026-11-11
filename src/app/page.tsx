import { Button, Mark } from "@/components/ui";
import { APP_NAME } from "@/lib/config";

// Placeholder until the landing page (A8) is built in phase 5.
export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "var(--space-6)", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ width: 32, height: 32, display: "block" }} className="fv-mark-box"><Mark /></span>
        <span className="heading-3">{APP_NAME}</span>
      </div>
      <p className="body" style={{ margin: 0, color: "var(--ink-muted)", maxWidth: 360 }}>
        The products people actually use, reviewed in their own words.
      </p>
      <Button variant="primary" size="lg" href="/sign-in" label="Sign in" />
    </main>
  );
}
