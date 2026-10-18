import Link from "next/link";
import type { ListSummary } from "@/lib/types";
import { TiledCover } from "./tiled-cover";

// The tiled list card from Favolist 4.0 (`_list_card_mobile.scss`): item
// images in a grid, a black 44% tint, and the title and count sitting
// left-aligned in the middle. The description underneath follows the Figma's
// "User lists" frame.
export function ListCard({
  handle,
  list,
  priority = false,
}: {
  handle: string;
  list: ListSummary;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/${handle}/${list.slug}`}
      className="group flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="relative isolate aspect-square w-full overflow-hidden bg-neutral-50">
        <TiledCover images={list.coverImages} priority={priority} />
        <div className="absolute inset-0 bg-cover-overlay/44 transition-colors group-hover:bg-cover-overlay/50" />
        <div className="relative flex h-full flex-col justify-center p-4 text-white">
          <h3 className="text-h4 font-bold leading-none text-balance md:text-h3-lg md:leading-none">
            {list.title}
          </h3>
          <hr className="my-2 h-0.5 w-[70%] border-0 bg-white" />
          <p className="text-p-s font-light">
            <span className="font-semibold">{list.itemCount}</span>{" "}
            {list.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      {list.description && (
        <p className="prose-creator line-clamp-3 text-p-m">{list.description}</p>
      )}
    </Link>
  );
}
