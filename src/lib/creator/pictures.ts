// A product's pictures: how many, and which addresses may be saved as one.
// Pure, so the rules are unit-tested (tests/pictures.test.ts).

/** "Many" without letting one product weigh a page down. */
export const MAX_PICTURES = 20;

/** Where a creator's own uploads live in storage: …/storage/v1/object/public/images/<their auth id>/… */
export function ownFolder(supabaseUrl: string, uid: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/images/${uid}/`;
}

/**
 * The pictures a save may keep, in the order sent: only files in the
 * creator's own storage folder, or ones the product already had (a curated
 * product's pictures may live elsewhere). Anything else is dropped, so a
 * product can never be made to point at someone else's server or files.
 */
export function allowedPictures(sent: string[], folder: string, already: string[] = []) {
  const kept: string[] = [];
  for (const url of sent) {
    const ok = (url.startsWith(folder) && !url.slice(folder.length).includes("/") && !url.includes("..")) || already.includes(url);
    if (ok && !kept.includes(url)) kept.push(url);
    if (kept.length === MAX_PICTURES) break;
  }
  return kept;
}
