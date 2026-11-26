import { Suspense, type ReactNode } from "react";
import { AppFrame, type NavLabel } from "@/components/frame/AppFrame";
import { Skeleton, TopBar } from "@/components/ui";
import "./me.css";

interface ScreenProps {
  title: string;
  /** The navigation item to mark. */
  current?: NavLabel;
  backHref?: string;
  trailing?: ReactNode;
  children: ReactNode;
}

/**
 * A signed-in screen in the page frame: the top bar is sent at once, and the
 * part that needs the session (everything inside) streams in behind Suspense.
 */
export function Screen({ title, current, backHref = "/", trailing, children }: ScreenProps) {
  return (
    <AppFrame current={current}>
      <TopBar title={title} backHref={backHref} trailing={trailing} />
      <Suspense fallback={<ScreenLoading />}>{children}</Suspense>
    </AppFrame>
  );
}

export function ScreenLoading() {
  return (
    <div className="me-loading" aria-hidden="true">
      <Skeleton height={48} />
      <Skeleton height={48} />
      <Skeleton height={48} />
    </div>
  );
}
