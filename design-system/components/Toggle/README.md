# Toggle

An on/off switch for settings: a 40×24 track in `line-strong` (off) or `accent` (on) with a 20px `surface-raised` knob carrying `shadow-sm`. With Avatar and the tab-count pill it is the only round thing in the system. The label and optional help sit to the left; the whole row is the hit target. Changes apply immediately and get a Toast; a Toggle never needs a Save button.

The consumer provides `label`, `help`, `checked`, `disabled`, `onChange`. Don't: use a Toggle inside a form that has a Save button (use Checkbox); label it with a question.
