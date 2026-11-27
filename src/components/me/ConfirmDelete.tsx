"use client";

import { useState, useTransition } from "react";
import { Alert, Button, TextField, type ButtonProps } from "@/components/ui";
import { Modal } from "./Modal";

interface ConfirmDeleteProps {
  /** The button that opens the confirmation: "Delete product". */
  label: string;
  /** "Delete Everyday Sling 6L?" — the thing is named, so nobody deletes the wrong one. */
  title: string;
  /** What goes with it, in a sentence. */
  message: string;
  /** For the heaviest deletion: a word that must be typed first (the username). */
  confirmWord?: string;
  /** The server action; it redirects on success and returns { error } otherwise. */
  action: (typed: string) => Promise<{ error: string } | void>;
  trigger?: Pick<ButtonProps, "variant" | "size" | "icon" | "block">;
}

/** C17: one pattern for every deletion. A named object, a plain sentence, Cancel first, a red Delete. */
export function ConfirmDelete({ label, title, message, confirmWord, action, trigger }: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const ready = !confirmWord || typed.trim().toLowerCase() === confirmWord.toLowerCase();

  function close() {
    if (pending) return;
    setOpen(false);
    setTyped("");
    setError(undefined);
  }

  return (
    <>
      <Button variant="link" size="sm" icon="trash-2" {...trigger} label={label} onClick={() => setOpen(true)} />
      {open ? (
        <Modal
          alert title={title} onClose={close}
          body={
            <>
              <p>{message}</p>
              {confirmWord ? (
                <TextField label={`Type ${confirmWord} to confirm`} value={typed} onChange={setTyped} autocomplete="off" autoCapitalize="none" spellCheck={false} />
              ) : null}
              {error ? <Alert tone="danger" message={error} /> : null}
            </>
          }
          actions={[
            { label: "Cancel", variant: "tertiary", onClick: close },
            {
              label: pending ? "Deleting…" : "Delete", variant: "danger", disabled: pending || !ready,
              onClick: () => start(async () => {
                const result = await action(typed);
                if (result?.error) setError(result.error);
              }),
            },
          ]}
        />
      ) : null}
    </>
  );
}
