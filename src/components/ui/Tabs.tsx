"use client";

import Link from "next/link";
import { useSyncedState } from "./useSyncedState";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  /** Beyond index.d.ts: makes the tab a link to its own address (the profile tabs), so each tab can be opened and shared directly. */
  href?: string;
}

export interface TabsProps {
  items: TabItem[];
  selected: string;
  onChange?: (id: string) => void;
}

export function Tabs({ items, selected, onChange }: TabsProps) {
  const [current, setCurrent] = useSyncedState(selected);
  return (
    <div className="fv-tabs" role="tablist">
      {items.map((it) =>
        it.href ? (
          <Link key={it.id} className="fv-tab" role="tab" href={it.href} aria-selected={it.id === current} scroll={false} onClick={() => setCurrent(it.id)}>
            {it.label}
            {it.count != null ? <span className="fv-tab-count">{it.count}</span> : null}
          </Link>
        ) : (
        <button
          key={it.id}
          className="fv-tab"
          role="tab"
          type="button"
          aria-selected={it.id === current}
          onClick={() => {
            setCurrent(it.id);
            onChange?.(it.id);
          }}
        >
          {it.label}
          {it.count != null ? <span className="fv-tab-count">{it.count}</span> : null}
        </button>
        ),
      )}
    </div>
  );
}
