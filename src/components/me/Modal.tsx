"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Dialog, Sheet, type ButtonProps } from "@/components/ui";
import "./me.css";

const DESKTOP = "(min-width: 992px)";
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(DESKTOP);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

interface ModalProps {
  title: string;
  body?: ReactNode;
  actions?: ButtonProps[];
  /** A destructive confirmation (role=alertdialog). */
  alert?: boolean;
  onClose: () => void;
}

/**
 * The design system's Dialog, placed over the page: a bottom sheet on a
 * phone, a centred box from 992px. Escape and a tap on the scrim close it,
 * the page behind does not scroll, and focus returns to where it was.
 */
export function Modal({ title, body, actions, alert, onClose }: ModalProps) {
  // useSyncExternalStore reads a browser value (here: is this a wide screen?) and re-renders when it changes.
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the first field if there is one, otherwise the first button (Cancel).
    const target = box.current?.querySelector<HTMLElement>("input, textarea, select") ?? box.current?.querySelector<HTMLElement>(".fv-dialog-foot button");
    target?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key !== "Tab" || !box.current) return;
      // Keep Tab inside the dialog.
      const items = Array.from(box.current.querySelectorAll<HTMLElement>("button, input, textarea, select, a[href]")).filter((el) => !el.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus?.();
    };
  }, []);

  const Box = desktop ? Dialog : Sheet;
  return (
    <div className="app-modal" ref={box}>
      <div className="fv-scrim" onClick={onClose} />
      <Box title={title} body={body} actions={actions} alert={alert} onClose={onClose} />
    </div>
  );
}
