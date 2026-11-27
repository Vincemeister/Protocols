"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { MAX_PICTURES } from "@/lib/creator/pictures";
import { scaleDown } from "./useImageFile";

/** One picture on offer: already in our storage, found on the product's page, or picked from the device. */
export interface PictureTile {
  key: string;
  /** What the tile shows. */
  src: string;
  kind: "stored" | "remote" | "local";
  blob?: Blob;
}

/**
 * A product's pictures while its details are being checked: which are on
 * offer, which are chosen and in what order (number 1 is the cover), and,
 * at the moment of saving, getting each chosen one into the creator's storage.
 *
 * Starts with everything chosen: the pictures the product already has, then
 * the ones found on its page. Tapping a chosen picture drops it; tapping it
 * again adds it back at the end, which is also how the order is changed.
 */
export function usePictures({ saved, found }: { saved: string[]; found: string[] }) {
  const [tiles, setTiles] = useState<PictureTile[]>(() => [
    ...saved.map((src): PictureTile => ({ key: src, src, kind: "stored" })),
    ...found.filter((src) => !saved.includes(src)).map((src): PictureTile => ({ key: src, src, kind: "remote" })),
  ]);
  const [order, setOrder] = useState<string[]>(() => [...saved, ...found.filter((src) => !saved.includes(src))].slice(0, MAX_PICTURES));
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  // Preview addresses made with createObjectURL hold memory until released.
  const live = useRef(tiles);
  useEffect(() => { live.current = tiles; }, [tiles]);
  useEffect(() => () => live.current.forEach((t) => { if (t.kind === "local") URL.revokeObjectURL(t.src); }), []);

  function toggle(key: string) {
    setNotice(undefined);
    setOrder((now) => {
      if (now.includes(key)) return now.filter((k) => k !== key);
      if (now.length >= MAX_PICTURES) {
        setNotice(`That's the limit: ${MAX_PICTURES} pictures. Drop one to add another.`);
        return now;
      }
      return [...now, key];
    });
  }

  /** A picture that would not load, or is a blank placeholder: taken off the offer altogether. */
  function drop(key: string) {
    setTiles((now) => now.filter((t) => t.key !== key));
    setOrder((now) => now.filter((k) => k !== key));
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // so choosing the same files again still fires
    setNotice(undefined);
    const added: PictureTile[] = [];
    let unreadable = 0;
    for (const file of files) {
      try {
        const blob = await scaleDown(file, 1600);
        added.push({ key: `local-${++counter.current}`, src: URL.createObjectURL(blob), kind: "local", blob });
      } catch {
        unreadable++;
      }
    }
    setTiles((now) => [...now, ...added]);
    setOrder((now) => {
      const room = Math.max(0, MAX_PICTURES - now.length);
      if (added.length > room) setNotice(`That's the limit: ${MAX_PICTURES} pictures. The rest are here to swap in.`);
      else if (unreadable) setNotice(unreadable === 1 ? "We couldn't read one of those. Try a JPEG or PNG." : `We couldn't read ${unreadable} of those. Try JPEG or PNG.`);
      return [...now, ...added.slice(0, room).map((t) => t.key)];
    });
  }

  /**
   * Puts every chosen picture into storage (four at a time) and returns their
   * addresses in the chosen order. One that cannot be stored (a shop that
   * refuses to hand its picture over) is left out rather than stopping the save.
   */
  async function store(): Promise<string[]> {
    const chosen = order.flatMap((key) => tiles.filter((t) => t.key === key));
    const stored: (string | null)[] = chosen.map((t) => (t.kind === "stored" ? t.src : null));
    const todo = chosen.map((t, i) => ({ t, i })).filter(({ t }) => t.kind !== "stored");
    if (!todo.length) return stored.filter((u): u is string => Boolean(u));

    let done = 0;
    setProgress({ done, total: todo.length });
    const one = async ({ t, i }: { t: PictureTile; i: number }) => {
      try {
        let res: Response;
        if (t.kind === "local" && t.blob) {
          const form = new FormData();
          form.set("file", t.blob, "picture.jpg");
          res = await fetch("/api/product-image", { method: "POST", body: form });
        } else {
          res = await fetch("/api/product-image", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: t.src }) });
        }
        if (res.ok) stored[i] = ((await res.json()) as { url?: string }).url ?? null;
      } catch {
        // left out
      }
      setProgress({ done: ++done, total: todo.length });
    };
    // A small pool: each worker takes the next picture until none are left.
    const queue = [...todo];
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) await one(next);
    }));
    setProgress(null);
    return stored.filter((u): u is string => Boolean(u));
  }

  return {
    tiles,
    /** A tile's place among the chosen, from 1; 0 when it is not chosen. */
    place: (key: string) => order.indexOf(key) + 1,
    chosen: order.length,
    toggle,
    drop,
    open: () => input.current?.click(),
    field: <input ref={input} type="file" accept="image/*" multiple hidden onChange={onPick} />,
    /** While saving: how many pictures are stored so far. */
    progress,
    notice,
    store,
  };
}
