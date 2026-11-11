"use client";

import { Button } from "@/components/ui";
import { setTheme } from "@/lib/theme";

/** Flip the whole page's theme and remember the choice (the same cookie the settings screen will write). */
export function ThemeSwitch() {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)" }}>
      <Button size="sm" label="Light" onClick={() => setTheme("light")} />
      <Button size="sm" label="Dark" onClick={() => setTheme("dark")} />
      <Button size="sm" variant="link" label="Follow device" onClick={() => setTheme(null)} />
    </div>
  );
}
