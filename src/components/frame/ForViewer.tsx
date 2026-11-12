import { Suspense, type ReactNode } from "react";
import { getViewer, type Viewer } from "@/lib/viewer";

/**
 * Renders something that depends on who is looking. The page is sent at once
 * with the signed-out version (most visitors arrive signed out, from a bio
 * link); when the session has been read, the signed-in version replaces it.
 * This keeps the rest of the page cacheable.
 */
export function ForViewer({ children }: { children: (viewer: Viewer | null) => ReactNode }) {
  return (
    <Suspense fallback={children(null)}>
      <Resolved>{children}</Resolved>
    </Suspense>
  );
}

async function Resolved({ children }: { children: (viewer: Viewer | null) => ReactNode }) {
  return <>{children(await getViewer())}</>;
}
