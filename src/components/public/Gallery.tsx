"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { Icon } from "@/components/ui";

/**
 * A product's pictures on its page (A3): swipe sideways through them, with a
 * "3 / 12" counter and a strip of square thumbnails to jump around. One
 * picture is simply shown; none shows the empty frame.
 *
 * Not in the design system (it describes one product picture): added on
 * 27 Nov 2026 when products got many pictures. Styled in frame.css
 * (`.gallery`); give it a component README at the next re-export.
 *
 * The sideways scrolling is the browser's own (CSS scroll snapping), so
 * swiping, trackpads and keyboards work without any gesture code; the script
 * only reads where the track has got to.
 */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);

  if (images.length < 2) {
    return (
      <div className="fv-product-image product-hero">
        {images[0] ? <img src={images[0]} alt={name} /> : <Icon name="image" size="lg" />}
      </div>
    );
  }

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, Math.min(images.length - 1, i)) * el.clientWidth, behavior: calm ? "auto" : "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const now = Math.round(el.scrollLeft / el.clientWidth);
    if (now === at) return;
    setAt(now);
    // Keep the current thumbnail in sight, moving only the strip (never the page).
    const thumb = strip.current?.children[now] as HTMLElement | undefined;
    if (thumb && strip.current) strip.current.scrollTo({ left: thumb.offsetLeft - strip.current.clientWidth / 2 + thumb.clientWidth / 2 });
  }

  return (
    <div className="gallery">
      <div className="gallery-stage">
        <div className="gallery-track" ref={track} onScroll={onScroll} tabIndex={0} aria-label={`Pictures of ${name}`}>
          {images.map((src, i) => (
            <div className="fv-product-image product-hero gallery-slide" key={src}>
              <img src={src} alt={i === 0 ? name : `${name}, picture ${i + 1}`} loading={i === 0 ? undefined : "lazy"} />
            </div>
          ))}
        </div>
        <span className="gallery-count caption" aria-live="polite">{at + 1} / {images.length}</span>
        <button className="fv-icon-btn gallery-arrow gallery-prev" type="button" aria-label="Previous picture" disabled={at === 0} onClick={() => go(at - 1)}>
          <Icon name="chevron-left" />
        </button>
        <button className="fv-icon-btn gallery-arrow gallery-next" type="button" aria-label="Next picture" disabled={at === images.length - 1} onClick={() => go(at + 1)}>
          <Icon name="chevron-right" />
        </button>
      </div>
      <div className="gallery-strip" ref={strip}>
        {images.map((src, i) => (
          <button key={src} type="button" aria-label={`Picture ${i + 1} of ${images.length}`} aria-current={i === at ? "true" : undefined} onClick={() => go(i)}>
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
