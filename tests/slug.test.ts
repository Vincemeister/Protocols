import assert from "node:assert/strict";
import { test } from "node:test";
import { slugify, suggestUsername, uniqueSlug } from "../src/lib/creator/slug.ts";

test("slugify", () => {
  assert.equal(slugify("Everyday Sling 6L"), "everyday-sling-6l");
  assert.equal(slugify("  Café Crème — №1!  "), "cafe-creme-no1");
  assert.equal(slugify("日本語"), "item");
  assert.equal(slugify("", "list"), "list");
  assert.ok(slugify("x".repeat(200)).length <= 60);
  assert.match(slugify("a".repeat(59) + " b c"), /^[a-z0-9-]{1,80}$/);
});

test("uniqueSlug", () => {
  assert.equal(uniqueSlug("desk", []), "desk");
  assert.equal(uniqueSlug("desk", ["desk"]), "desk-2");
  assert.equal(uniqueSlug("desk", ["desk", "desk-2", "desk-3"]), "desk-4");
  assert.equal(uniqueSlug("products", ["products", "codes", "about"]), "products-2");
});

test("suggestUsername", () => {
  assert.equal(suggestUsername("v.rehms@gmail.com"), "v.rehms");
  assert.equal(suggestUsername("Vince Rehms"), "vince.rehms");
  assert.equal(suggestUsername("ab"), "");
});
