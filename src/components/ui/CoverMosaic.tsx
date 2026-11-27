/* eslint-disable @next/next/no-img-element */

import { mosaicLayout } from "@/lib/mosaic";

interface CoverMosaicProps {
  /** The list's product pictures, in the list's order. */
  pictures: string[];
  shape?: "square" | "banner";
}

/**
 * A list's cover, made of its products' pictures. Not in the design system
 * yet (it shows a single cover photo): added on 27 Nov 2026 because covers
 * are no longer chosen by hand. Styled in app.css (`.cover-mosaic`); fold it
 * into ListCard at the next re-export.
 */
export function CoverMosaic({ pictures, shape = "square" }: CoverMosaicProps) {
  const { tiles, cols } = mosaicLayout(pictures.length, shape);
  if (!tiles) return null;
  return (
    <div className="cover-mosaic" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} aria-hidden="true">
      {pictures.slice(0, tiles).map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}
    </div>
  );
}
