// The tidy pass for spoken reviews (build brief, section 6). It may remove
// filler words, false starts and an immediately repeated word, and add
// punctuation. It may never add, change or reorder a word: the review has to
// stay the creator's own. Pure functions, unit-tested in tests/tidy.test.ts.

const FILLERS = new Set(["um", "umm", "uh", "uhh", "uhm", "er", "erm", "eh", "hmm", "hm", "mm", "mhm", "ah"]);
/** Small words people stumble on ("the, the latch"). Other doubled words ("very very") are left alone. */
const STUMBLES = new Set(["the", "a", "an", "and", "i", "it", "its", "it's", "to", "of", "in", "on", "is", "so", "but", "that", "this", "we", "you", "my", "for", "with", "was", "i've", "i'm"]);

/** A word as the validator compares it: lower-case, no punctuation, curly apostrophes straightened. */
const bare = (token: string) => token.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']/gu, "").replace(/^'+|'+$/g, "");

/** The spoken words of a text, in order, without fillers. */
export function spokenWords(text: string) {
  return text.split(/\s+/).map(bare).filter((w) => w && !FILLERS.has(w));
}

/**
 * True when `tidied` only removed things: its words (minus filler) appear in
 * `raw` in the same order. Anything else means the tidy pass rewrote the
 * creator, and the caller must discard it and show the raw transcript.
 */
export function isFaithful(raw: string, tidied: string) {
  const source = spokenWords(raw);
  const result = spokenWords(tidied);
  if (!result.length) return source.length === 0;
  let at = 0;
  for (const word of source) {
    if (word === result[at]) at++;
    if (at === result.length) return true;
  }
  return false;
}

const upperFirst = (s: string) => s.replace(/^([^\p{L}]*)(\p{L})/u, (_, lead, ch) => lead + ch.toUpperCase());

/**
 * Tidies without a language model, so it cannot invent anything: drops
 * fillers ("um", "uh"), drops a stumbled repeat ("the, the"), and makes sure
 * the text starts with a capital and ends with a full stop. Sentence breaks
 * come from the transcription itself.
 */
export function tidyTranscript(raw: string) {
  const out: string[] = [];
  let capitaliseNext = false;
  for (const token of raw.trim().split(/\s+/).filter(Boolean)) {
    const word = bare(token);
    const tail = token.match(/[.!?…]+["')\]]*$/)?.[0] ?? "";

    if (FILLERS.has(word)) {
      const prev = out[out.length - 1];
      if (tail && prev) {
        // "…looks new, um. The strap" → the full stop moves back to "new" (unless it already has one).
        if (!/[.!?…]["')\]]*$/.test(prev)) out[out.length - 1] = prev.replace(/[,;:]+$/, "") + tail;
      } else if (prev && /[,;]$/.test(token)) {
        // "had it, um, two years" → "had it two years"
        out[out.length - 1] = prev.replace(/[,;]+$/, "");
      }
      if (!prev || /^\p{Lu}/u.test(token)) capitaliseNext = true;
      continue;
    }

    const prev = out[out.length - 1];
    if (prev && bare(prev) === word && (/[,…-]$/.test(prev) || STUMBLES.has(word)) && !/[.!?]$/.test(prev)) {
      // "the, the latch" → keep the second one, with the first one's capital if it had one.
      out[out.length - 1] = /^\p{Lu}/u.test(prev) ? upperFirst(token) : token;
      continue;
    }

    out.push(capitaliseNext ? upperFirst(token) : token);
    capitaliseNext = false;
  }

  let text = upperFirst(out.join(" ").replace(/\s+([,.;:!?])/g, "$1"));
  if (text && !/[.!?…]["')\]]*$/.test(text)) text = text.replace(/[,;:\s]+$/, "") + ".";
  return text;
}

export const TIDY_PROMPT = `You tidy the transcript of a spoken product review. The words must stay the speaker's own.

You may ONLY:
- remove filler words (um, uh, er) and false starts
- remove a word or phrase that is immediately repeated
- add punctuation and sentence breaks, and fix capital letters

You may NOT add a word, change a word, reorder anything, remove a sentence, shorten, summarise, change the tone or correct an opinion. If in doubt, leave the text as it is.

Reply with the tidied text only.`;

/** Keeps a review within the field's limit without cutting a word in half. */
export function clampReview(text: string, max = 600) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).replace(/[,;:\s]+$/, "");
}
