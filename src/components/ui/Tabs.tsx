"use client";

import { useSyncedState } from "./useSyncedState";

export interface TabItem { id: string; label: string; count?: number }

export interface TabsProps {
  items: TabItem[];
  selected: string;
  onChange?: (id: string) => void;
}

export function Tabs({ items, selected, onChange }: TabsProps) {
  const [current, setCurrent] = useSyncedState(selected);
  return (
    <div className="fv-tabs" role="tablist">
      {items.map((it) => (
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
      ))}
    </div>
  );
}
