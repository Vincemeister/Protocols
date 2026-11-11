# TextArea

TextField for several lines: the review step, list descriptions, the bio. Minimum 120px tall, `space-2` vertical padding, vertically resizable, same borders and states as TextField. The helper line carries the prompt ("Why did you buy it?") and the counter.

The review field is the **voice** variant: a "Speak" button with the `mic` icon sits inside the field, bottom right. Tapping it starts recording: the button fills `accent` and reads "Stop", and a "Listening" bar on `accent-soft` with a blinking dot, a small level wave and a mono timer appears above the field while the transcript streams into it. When the recording stops, the tidy pass runs and the field shows a "Tidied from your recording" badge in `accent-soft` with a `wand` icon and a link button, "Use my words as spoken", that restores the raw transcript. The tidy pass follows the brand book's rule to the letter: filler, punctuation and repeats only, never new words, never a changed opinion.

The consumer provides the same props as TextField plus `rows`, and for the voice variant `voice`, `recording`, `recordingTime`, `tidied`, `onRecord` and `onRevert`. The review field is never optional and never shows a skip link. Don't: a round mic button; auto-starting the recording; hiding the revert link once the tidy has been accepted (it stays until publish).
