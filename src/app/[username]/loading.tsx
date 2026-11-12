import { MarkLoader } from "@/components/ui";

// Shown while a page under /[username] is being prepared for the first time
// (a creator whose pages are not cached yet). The mark assembling is the page loader.
export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <MarkLoader />
    </div>
  );
}
