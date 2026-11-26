"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LoadMore } from "@/components/ui";

/**
 * The "Loading more" row at the end of a feed. When it scrolls into view the
 * page is asked for one more page of products (the address changes to
 * ?pages=3, which the server renders with more cards), so the feed grows
 * without a button and Back still returns to the same depth.
 */
export function AutoMore({ href }: { href: string }) {
  const row = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const watch = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        watch.disconnect();
        router.replace(href, { scroll: false });
      }
    }, { rootMargin: "600px" });
    watch.observe(el);
    return () => watch.disconnect();
  }, [href, router]);
  return <div ref={row}><LoadMore /></div>;
}
