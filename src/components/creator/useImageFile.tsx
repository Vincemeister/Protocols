"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

/**
 * Picking a picture from the device. A phone photo is several megabytes, so
 * it is scaled down in the browser (longest side 1600px, JPEG) before it is
 * sent: faster on mobile data, and well within what a form may carry.
 *
 * Returns the hidden <input> to render, `open()` to show the file chooser,
 * and the picked picture with a preview address.
 */
export function useImageFile(maxSide = 1600) {
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ blob: Blob; preview: string } | null>(null);
  const [error, setError] = useState<string>();

  // A preview address made with createObjectURL holds memory until it is released.
  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.preview); }, [picked]);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same file again still fires
    if (!file) return;
    try {
      const blob = await scaleDown(file, maxSide);
      setError(undefined);
      setPicked({ blob, preview: URL.createObjectURL(blob) });
    } catch {
      setError("We couldn't read that picture. Try a JPEG or PNG.");
    }
  }

  return {
    field: <input ref={input} type="file" accept="image/*" hidden onChange={onChange} />,
    open: () => input.current?.click(),
    clear: () => setPicked(null),
    picked,
    error,
  };
}

async function scaleDown(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  // JPEG has no transparency: paint white first so a transparent PNG does not turn black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no blob"))), "image/jpeg", 0.85));
}
