import Link from "next/link";
import type { ListSummary } from "@/lib/types";
import { TiledCover } from "./tiled-cover";

// "List card" from the Figma: tiled cover with the item count and title
// overlaid, then the list's description underneath.
export function ListCard({
  handle,
  list,
  priority = false,
}: {
  handle: string;
  list: ListSummary;
  priority?: boolean;
}) {
  const countLabel = `${list.itemCount} ${list.itemCount === 1 ? "item" : "items"}`;

  return (
    <Link
      href={`/${handle}/${list.slug}`}
      className="group flex flex-col gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
    >
      <div className="relative isolate aspect-square w-full overflow-hidden bg-neutral-100">
        <TiledCover images={list.coverImages} priority={priority} />
        <div className="absolute inset-0 bg-cover-overlay/30 transition-colors group-hover:bg-cover-overlay/40" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white [text-shadow:0_1px_16px_rgb(25_7_12/0.45)]">
          <p className="text-cover-count">{countLabel}</p>
          <h3 className="max-w-[16ch] text-cover-title text-balance">{list.title}</h3>
        </div>
      </div>
      {list.description && (
        <p className="line-clamp-4 text-p-m text-neutral-900">{list.description}</p>
      )}
    </Link>
  );
}
