# CodeFrame

A referral code you can copy in one tap: a `caption` label ("10% off with"), the code in `code` (mono, 14px) and a `copy` icon button, on `surface-sunken` with `radius-xs`, `control` tall (`control-sm` inside ReferralCard). On copy the frame flips on its x axis over 200ms to a `success-soft` back face reading "Copied" with the code in `success`, and flips back after two seconds; `onCopy` fires so a Toast can confirm when the frame is off screen. This is the only flip in the system.

Used under the review in ProductCard, on the product page and in ReferralCard. The consumer provides `code`, `label` and optional `onCopy`. Don't: show a code frame with no code; style it as a button; add percentages in the code itself.
