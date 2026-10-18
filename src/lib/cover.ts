// Tiled list covers: 1, 2x2, 3x3 or 4x4 depending on how many item images
// the list has. Counting images (not items) keeps every tile filled, since
// routine steps usually have no picture.
export function coverGridSize(imageCount: number): 0 | 1 | 2 | 3 | 4 {
  if (imageCount >= 16) return 4;
  if (imageCount >= 9) return 3;
  if (imageCount >= 4) return 2;
  if (imageCount >= 1) return 1;
  return 0;
}

export function pickCoverImages(images: (string | null | undefined)[]): string[] {
  const present = images.filter((src): src is string => Boolean(src));
  const size = coverGridSize(present.length);
  return present.slice(0, size * size);
}
