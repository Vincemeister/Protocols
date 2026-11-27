/**
 * How many pictures a list's cover shows and in how many columns. A square
 * cover grows 1 → 2×2 → 3×3 as the list fills (the first Favolist's rule, and
 * the mark's own geometry); a wide banner goes 1 → 2 → 4×2 so its tiles stay
 * close to square.
 */
export function mosaicLayout(count: number, shape: "square" | "banner") {
  if (shape === "square") return count >= 9 ? { tiles: 9, cols: 3 } : count >= 4 ? { tiles: 4, cols: 2 } : { tiles: Math.min(count, 1), cols: 1 };
  return count >= 8 ? { tiles: 8, cols: 4 } : count >= 2 ? { tiles: 2, cols: 2 } : { tiles: Math.min(count, 1), cols: 1 };
}
