"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Tabs } from "@/components/ui";

/** Lists · Products · Codes · About. Each tab is its own address; Codes appears only when the creator has a code. */
export function ProfileTabs({ username, lists, products, codes }: { username: string; lists: number; products: number; codes: number }) {
  // The part of the address after the username: null on the Lists tab, otherwise "products", "codes" or "about".
  const segment = useSelectedLayoutSegment();
  const base = `/${username}`;
  return (
    <Tabs
      selected={segment ?? "lists"}
      items={[
        { id: "lists", label: "Lists", count: lists, href: base },
        { id: "products", label: "Products", count: products, href: `${base}/products` },
        ...(codes ? [{ id: "codes", label: "Codes", count: codes, href: `${base}/codes` }] : []),
        { id: "about", label: "About", href: `${base}/about` },
      ]}
    />
  );
}
