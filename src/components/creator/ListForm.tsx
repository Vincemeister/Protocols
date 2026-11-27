"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useActionState, useState, useTransition, type DragEvent } from "react";
import { Alert, Badge, Button, Icon, TextArea, TextField, Toggle } from "@/components/ui";
import { cx } from "@/components/ui/cx";
import { reorderProducts, saveList, type FormState } from "@/lib/creator/actions";
import type { ListProduct, MyList } from "@/lib/creator/data";
import { ordinal } from "@/lib/format";
import { ConfirmDelete } from "@/components/me/ConfirmDelete";
import { deleteList } from "@/lib/me/actions";
import { CreatorScreen } from "./CreatorScreen";
import { useDictation } from "./useDictation";

const MAX_INTRO = 300;

interface ListFormProps {
  /** Leave out for a new list. */
  list?: MyList;
  products?: ListProduct[];
  /** Where Close leads: the creator's own page. */
  closeHref: string;
  /** The public address of the list, when it has one worth visiting. */
  viewHref?: string;
  saved?: boolean;
  /** Whether the server has a transcription service, for speaking the intro. */
  serverTranscribes?: boolean;
}

/**
 * C3 New list / edit list, and on the edit screen C8: the list's products in
 * an order the creator sets. There is no cover to choose: a list's cover is
 * made of its products' pictures.
 */
export function ListForm({ list, products = [], closeHref, viewHref, saved, serverTranscribes = false }: ListFormProps) {
  const [numbered, setNumbered] = useState(list?.numbered ?? false);
  const [intro, setIntro] = useState(list?.intro ?? "");
  const speak = useDictation({ value: intro, onChange: setIntro, serverTranscribes });
  const [state, submit, pending] = useActionState<FormState, FormData>(saveList, {});
  const introTooLong = intro.length > MAX_INTRO && !speak.recording;

  return (
    <CreatorScreen title={list ? "Edit list" : "New list"} backHref={closeHref} close>
      <form action={submit}>
        {list ? <input type="hidden" name="id" value={list.id} /> : null}

        {saved && !state.error && !state.fields ? <Alert tone="success" message="Saved." dismissible /> : null}
        {state.error ? <Alert tone="danger" message={state.error} /> : null}

        <TextField
          id="name" name="name" label="List name" value={list?.name} placeholder="Camera bag essentials" maxLength={60} required
          help="Say what it's for, not just what's in it." error={state.fields?.name}
        />
        <TextArea
          id="intro" name="intro" label="Intro" optional value={intro} onChange={setIntro} rows={3}
          maxLength={speak.recording || introTooLong ? undefined : MAX_INTRO} hideCount
          placeholder="One or two sentences at the top of the list. Tap Speak, or type."
          {...speak.field}
          help={speak.status ?? (list ? undefined : "Its cover makes itself from your products' pictures.")}
          error={introTooLong ? `That's ${intro.length - MAX_INTRO} characters too long. Trim it to ${MAX_INTRO}.` : speak.problem}
        />

        <div className="creator-choices">
          <Toggle name="is_public" label="Show on my profile" help="Off keeps it as a draft only you can see." checked={list ? list.isPublic : true} />
          <Toggle name="numbered" label="Number the products" help={'01, 02, 03 — for ranked or "in this order" lists.'} checked={numbered} onChange={setNumbered} />
        </div>

        {list ? <SortableProducts listId={list.id} initial={products} numbered={numbered} /> : null}

        <div className="creator-foot">
          {list ? (
            <>
              <Button type="submit" variant="primary" size="lg" block disabled={pending || introTooLong || speak.recording || speak.working} label={pending ? "Saving…" : "Save list"} />
              <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)" }}>
                {viewHref ? <Button variant="link" size="sm" href={viewHref} label="View the list" /> : null}
                <ConfirmDelete
                  label="Delete list" title={`Delete ${list.name}?`}
                  message={products.length
                    ? `Its ${products.length === 1 ? "product goes" : `${products.length} products go`} with it, reviews and recordings included. This cannot be undone.`
                    : "This cannot be undone."}
                  action={deleteList.bind(null, list.id)}
                />
              </div>
            </>
          ) : (
            <Button type="submit" variant="primary" size="lg" block disabled={pending || introTooLong || speak.recording || speak.working} label={pending ? "Creating…" : "Create and add a product"} />
          )}
        </div>
      </form>
    </CreatorScreen>
  );
}

/**
 * C8: the products in the creator's order. On a phone each row has up and
 * down arrows; on desktop a grip to drag. Either way the new order is saved
 * at once (no Save button to forget), and put back if saving fails.
 */
function SortableProducts({ listId, initial, numbered }: { listId: string; initial: ListProduct[]; numbered: boolean }) {
  const [items, setItems] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [, startSaving] = useTransition();

  function commit(next: ListProduct[]) {
    const before = items;
    setItems(next);
    setFailed(false);
    startSaving(async () => {
      const result = await reorderProducts(listId, next.map((p) => p.id)).catch(() => ({ ok: false }));
      if (!result.ok) {
        setItems(before);
        setFailed(true);
      }
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    commit(next);
  }

  // HTML drag and drop: the row being dragged is remembered by id, and
  // dropping it on another row moves it to that row's place.
  const drag = (id: string) => ({
    onDragStart: (e: DragEvent) => {
      setDragging(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id); // Firefox starts a drag only when it carries data
      e.dataTransfer.setDragImage(e.currentTarget, 24, 24); // show the whole row moving, not just the grip
    },
    onDragEnd: () => { setDragging(null); setOver(null); },
    onDragOver: (e: DragEvent) => { if (dragging && dragging !== id) { e.preventDefault(); setOver(id); } },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (dragging) move(items.findIndex((p) => p.id === dragging), items.findIndex((p) => p.id === id));
      setDragging(null);
      setOver(null);
    },
  });

  return (
    <div className="creator-section">
      <h3 className="fv-overline">Products</h3>
      {failed ? <Alert tone="danger" message="We couldn't save the new order. Try again." /> : null}
      {items.length ? (
        <div className="creator-sort">
          {items.map((p, i) => (
            <div key={p.id} className={cx("fv-referral", dragging === p.id && "is-dragging", over === p.id && "is-over")} {...drag(p.id)}>
              <div className="fv-referral-thumb">{p.image ? <img src={p.image} alt="" /> : <Icon name="image" />}</div>
              <div className="fv-referral-text">
                <Link className="fv-name" href={`/create/${p.id}`}>
                  {numbered ? <span className="creator-number">{ordinal(i + 1)} </span> : null}
                  {p.name}
                </Link>
                {p.reviewed ? (
                  <div className="fv-meta">{p.brand || "Reviewed"}</div>
                ) : (
                  <Link href={`/create/${p.id}/review`} style={{ textDecoration: "none" }}><Badge tone="warning" label="Needs a review" /></Link>
                )}
              </div>
              <div className="fv-referral-actions">
                <span className="creator-arrows" style={{ display: "inline-flex", gap: "var(--space-1)" }}>
                  <button className="fv-icon-btn" type="button" aria-label={`Move ${p.name} up`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                    <Icon name="chevron-down" style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <button className="fv-icon-btn" type="button" aria-label={`Move ${p.name} down`} disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                    <Icon name="chevron-down" />
                  </button>
                </span>
                <Link className="fv-icon-btn" href={`/create/${p.id}`} aria-label={`Edit ${p.name}`}><Icon name="pencil" /></Link>
                <span className="fv-icon-btn fv-grip" draggable aria-hidden="true" title="Drag to reorder"><Icon name="grip-horizontal" /></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="body-sm creator-muted">Nothing in this list yet.</p>
      )}
      <div><Button variant="tertiary" size="sm" icon="plus" href={`/create?list=${listId}`} label="Add a product" /></div>
    </div>
  );
}
