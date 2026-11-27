import assert from "node:assert/strict";
import { test } from "node:test";
import { clampReview, isFaithful, spokenWords, tidyTranscript } from "../src/lib/voice/tidy.ts";

const RAW = "So this bag, I've had it, um, two years now, carried it through four countries and it still looks new. The strap is the thing, the reason I bought it really, one pull and the bag swings round to the front and the, the magnetic latch has never opened on its own, not once, even in a crowd";

test("removes fillers and stumbles, keeps every other word", () => {
  const tidied = tidyTranscript(RAW);
  assert.equal(
    tidied,
    "So this bag, I've had it two years now, carried it through four countries and it still looks new. The strap is the thing, the reason I bought it really, one pull and the bag swings round to the front and the magnetic latch has never opened on its own, not once, even in a crowd.",
  );
  assert.ok(isFaithful(RAW, tidied));
});

test("a filler at the start hands its capital to the next word", () => {
  assert.equal(tidyTranscript("Um, so I use it daily"), "So I use it daily.");
  assert.equal(tidyTranscript("uh it is great. Um. I love it"), "It is great. I love it.");
});

test("a filler that ends a sentence gives its full stop back", () => {
  assert.equal(tidyTranscript("It still looks new, um. The strap is great."), "It still looks new. The strap is great.");
});

test("deliberate repeats stay", () => {
  assert.equal(tidyTranscript("It is very very good."), "It is very very good.");
  assert.equal(tidyTranscript("I had had enough."), "I had had enough.");
});

test("nothing to do means nothing changes", () => {
  const clean = "Two years in and it still looks new.";
  assert.equal(tidyTranscript(clean), clean);
});

test("the validator refuses added, changed or reordered words", () => {
  assert.ok(isFaithful("I, um, like it a lot", "I like it a lot."));
  assert.ok(isFaithful("I like it it a lot", "I like it a lot"));
  assert.ok(!isFaithful("I like it a lot", "I love it a lot"));
  assert.ok(!isFaithful("I like it a lot", "I really like it a lot"));
  assert.ok(!isFaithful("it works and I like it", "I like it and it works"));
  assert.ok(!isFaithful("", "Great product."));
  assert.ok(isFaithful("um", ""));
});

test("curly apostrophes and case do not count as changes", () => {
  assert.ok(isFaithful("i've had it two years", "I’ve had it two years."));
  assert.deepEqual(spokenWords("Well — um — it's “fine”."), ["well", "it's", "fine"]);
});

test("clampReview cuts at a word", () => {
  const long = "word ".repeat(200).trim();
  const cut = clampReview(long, 600);
  assert.ok(cut.length <= 600 && cut.endsWith("word"));
  assert.equal(clampReview("short"), "short");
});
