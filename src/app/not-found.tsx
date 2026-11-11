import { EmptyState } from "@/components/ui";

// A11 Not found: say what happened, offer a way back.
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6)" }}>
      <EmptyState
        icon="search"
        title="Nothing here"
        message="This page doesn't exist, or it hasn't been published yet."
        action={{ label: "Go home", href: "/" }}
      />
    </main>
  );
}
