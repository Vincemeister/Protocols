# ImageUploader

The square drop target that replaces the old Dropzone: 160px, `surface-sunken` with a 1px dashed `line-strong` border, an `upload` icon and two `caption` lines ("Add a cover" / "Square, at least 600px"). Tapping opens the file picker; dropping a file works on desktop. With an image it shows the picture `object-fit: cover` with a solid `line` border and two small buttons under it, Replace (tertiary) and Remove (link). The `wide` variant (16:9) is for list covers on desktop.

The consumer provides `src`, `label`, `hint`, `onPick`, `onRemove`, `wide`. Don't: progress bars (show the picture as soon as the browser has it, upload in the background); cropping UI in v1 — crop centre.
