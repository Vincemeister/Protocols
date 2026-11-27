"use client";

import { useActionState, useState } from "react";
import { Alert, EmptyState, ReferralCard } from "@/components/ui";
import { FieldShell } from "@/components/ui/Field";
import { saveCode, type SavedState } from "@/lib/me/actions";
import type { MyReferral } from "@/lib/me/data";
import { Modal } from "./Modal";

/** C10 Referrals: every product with its code, and a pencil to set or change it. */
export function ReferralList({ items }: { items: MyReferral[] }) {
  const [editing, setEditing] = useState<MyReferral | null>(null);
  if (!items.length) {
    return <EmptyState icon="link" title="No products yet" message="Codes belong to products. Add one and its code shows up here." action={{ label: "Add a product", href: "/create" }} />;
  }
  return (
    <div className="me-list">
      {items.map((r) => (
        <ReferralCard
          key={r.productId} product={{ name: r.name, image: r.image }} listName={r.reviewed ? r.listName : `${r.listName} · needs a review`}
          code={r.code || undefined} codeLabel={r.benefit ? `${r.benefit} with` : "Code"} onEdit={() => setEditing(r)}
        />
      ))}
      {editing ? <CodeEditor key={editing.productId} item={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}

function CodeEditor({ item, onClose }: { item: MyReferral; onClose: () => void }) {
  const [state, submit, pending] = useActionState<SavedState, FormData>(async (prev, form) => {
    const next = await saveCode(prev, form);
    if (next.saved) onClose(); // the list re-renders with the new code
    return next;
  }, {});
  const formId = `code-${item.productId}`;
  return (
    <Modal
      title={item.code ? "Edit code" : "Add a code"} onClose={onClose}
      body={
        <form id={formId} action={submit}>
          <input type="hidden" name="product" value={item.productId} />
          <p className="body-sm me-muted">{item.name}</p>
          {state.error ? <Alert tone="danger" message={state.error} /> : null}
          <FieldShell id="edit-code" label="Referral code" help="Leave the code empty to remove it.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
              <input className="fv-input" id="edit-code" name="code" type="text" defaultValue={item.code} placeholder="VINCE10" maxLength={40} autoComplete="off" autoCapitalize="characters" spellCheck={false} style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }} />
              <input className="fv-input" name="benefit" type="text" defaultValue={item.benefit} placeholder="10% off" maxLength={40} aria-label="What the code gives" autoComplete="off" />
            </div>
          </FieldShell>
        </form>
      }
      actions={[
        { label: "Cancel", variant: "tertiary", onClick: onClose },
        // The button sits in the dialog's footer, outside the form: clicking it submits the form by its id.
        { label: pending ? "Saving…" : "Save code", variant: "primary", disabled: pending, onClick: () => (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit() },
      ]}
    />
  );
}
