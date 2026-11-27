import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_PICTURES, allowedPictures, ownFolder } from "../src/lib/creator/pictures.ts";

const folder = ownFolder("https://abc.supabase.co/", "user-1");

test("only the creator's own uploads, or pictures the product already had, are kept", () => {
  assert.equal(folder, "https://abc.supabase.co/storage/v1/object/public/images/user-1/");
  const mine = [`${folder}a.jpg`, `${folder}b.png`];
  const sent = [mine[0], "https://evil.example.com/x.jpg", `${folder.replace("user-1", "user-2")}c.jpg`, `${folder}../user-2/c.jpg`, `${folder}sub/d.jpg`, mine[1], mine[0], "/demo/covers/plum.svg"];
  assert.deepEqual(allowedPictures(sent, folder), mine);
  assert.deepEqual(allowedPictures(sent, folder, ["/demo/covers/plum.svg"]), [...mine, "/demo/covers/plum.svg"]);
});

test("the order sent is the order kept, up to the limit", () => {
  const many = Array.from({ length: 30 }, (_, i) => `${folder}${i}.jpg`);
  const kept = allowedPictures([...many].reverse(), folder);
  assert.equal(kept.length, MAX_PICTURES);
  assert.equal(kept[0], `${folder}29.jpg`);
});
