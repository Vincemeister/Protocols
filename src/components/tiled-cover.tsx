import Image from "next/image";
import { coverGridSize } from "@/lib/cover";

// Static class names so Tailwind can see them at build time.
const GRID_COLS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

// A list's cover: its item images tiled in a 1, 2x2, 3x3 or 4x4 CSS grid.
// No server-side image processing; each tile is an ordinary optimised <Image>.
export function TiledCover({
  images,
  priority = false,
}: {
  images: string[];
  priority?: boolean;
}) {
  const size = coverGridSize(images.length);

  if (size === 0) {
    // No item images yet: a plain tint, as the old `list_fallback_image` did.
    return <div className="absolute inset-0 bg-primary-700" />;
  }

  return (
    <div className={`absolute inset-0 grid ${GRID_COLS[size]}`}>
      {images.map((src, i) => (
        <div key={src + i} className="relative overflow-hidden bg-white">
          <Image
            src={src}
            alt=""
            fill
            // The card is at most 518px wide, so each tile is at most 518/size.
            sizes={`(max-width: 550px) ${Math.ceil(100 / size)}vw, ${Math.ceil(518 / size)}px`}
            priority={priority}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
