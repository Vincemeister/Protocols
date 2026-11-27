import type { MouseEventHandler, ReactNode } from "react";
import { TopBar } from "@/components/ui";
import { cx } from "@/components/ui/cx";
import "./creator.css";

interface CreatorScreenProps {
  title: string;
  /** "1 of 3" at the right of the top bar. */
  step?: string;
  /** Where the top-left button leads… */
  backHref?: string;
  /** …or what it does, inside a flow that keeps its state on the page. */
  onBack?: MouseEventHandler<HTMLElement>;
  /** The first screen of a flow closes (an X); later ones go back (a chevron). */
  close?: boolean;
  /** More air at the top, as on the paste-a-link and welcome screens. */
  roomy?: boolean;
  children: ReactNode;
}

/** The frame of every creator screen: a top bar and one column of form. */
export function CreatorScreen({ title, step, backHref, onBack, close, roomy, children }: CreatorScreenProps) {
  return (
    <div className="creator-screen">
      <div className="creator-sheet">
        <TopBar
          title={title} backHref={onBack ? undefined : backHref} onBack={onBack}
          backIcon={close ? "x" : "chevron-left"} backLabel={close ? "Close" : "Back"}
          trailing={step ? <span className="caption creator-step">{step}</span> : undefined}
        />
        <main className={cx("creator-main", roomy && "is-roomy")}>{children}</main>
      </div>
    </div>
  );
}

/** What shows for the moment it takes to read the session and the creator's data. */
export function CreatorLoading({ title }: { title: string }) {
  return (
    <CreatorScreen title={title} backHref="/" close>
      <div className="fv-skeleton fv-skeleton-text" style={{ width: "60%", height: 24 }} aria-hidden="true" />
      <div className="fv-skeleton" style={{ width: "100%", height: 40 }} aria-hidden="true" />
      <div className="fv-skeleton" style={{ width: "100%", height: 40 }} aria-hidden="true" />
    </CreatorScreen>
  );
}
