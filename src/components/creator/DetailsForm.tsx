"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useState } from "react";
import { Alert, BrandChip, Button, Icon, Select, TextField } from "@/components/ui";
import { FieldShell } from "@/components/ui/Field";
import { saveProduct, type FormState } from "@/lib/creator/actions";
import type { MyList } from "@/lib/creator/data";
import { usePictures } from "./usePictures";

export interface DetailsValues {
  /** Set when editing a product that already exists. */
  id?: string;
  name?: string;
  brand?: string;
  listId?: string;
  code?: string;
  benefit?: string;
  /** The pictures already saved with the product, in order. */
  images?: string[];
  /** The brand logo already saved with the product. */
  logo?: string;
  sourceUrl?: string;
}

interface DetailsFormProps {
  lists: MyList[];
  values: DetailsValues;
  /** What the link fetch found, when this follows one. */
  found?: { images: string[]; domain: string; logo?: string; kind?: "book"; partial?: boolean };
}

/**
 * C5 Check the details (and C7, the same form for a product that exists):
 * name, pictures, brand, list, referral code. Saving it leads to the review.
 */
export function DetailsForm({ lists, values, found }: DetailsFormProps) {
  const pictures = usePictures({ saved: values.images ?? [], found: found?.images ?? [] });
  const [brand, setBrand] = useState(values.brand ?? "");
  // The logo: one found on the page, else the one already saved; the creator can take it off.
  const [logo, setLogo] = useState<{ src: string; fresh: boolean } | undefined>(
    found?.logo ? { src: found.logo, fresh: true } : values.logo ? { src: values.logo, fresh: false } : undefined,
  );
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [list, setList] = useState(values.listId && lists.some((l) => l.id === values.listId) ? values.listId : lists[0]?.id ?? "new");
  const [code, setCode] = useState(values.code ?? "");
  const [benefit, setBenefit] = useState(values.benefit ?? "");

  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (prev, form) => {
      // The pictures go into storage first, one small request each; the save then carries only their addresses.
      for (const url of await pictures.store()) form.append("picture", url);
      return saveProduct(prev, form);
    },
    {},
  );

  const codeHelp = code.trim()
    ? `Shown as "${benefit.trim() ? `${benefit.trim()} with ${code.trim()}` : `Code ${code.trim()}`}" under your review.`
    : 'Shown as "10% off with VINCE10" under your review.';

  return (
    <form action={submit}>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="source_url" value={values.sourceUrl ?? ""} />
      {logo?.fresh && brand.trim() ? <input type="hidden" name="logo_remote" value={logo.src} /> : null}
      {logoRemoved ? <input type="hidden" name="logo_removed" value="1" /> : null}

      {found?.partial ? (
        <Alert tone="warning" message={`${found.domain} wouldn't show us the page, so this comes from the link itself. Check the name and the picture.`} />
      ) : found ? (
        <Alert tone="success" message={`Fetched from ${found.domain}. Fix anything that's off.`} />
      ) : null}
      {state.error ? <Alert tone="danger" message={state.error} /> : null}

      <div className="creator-group">
        {pictures.field}
        <div className="creator-pictures" role="group" aria-label="Pictures">
          <button className="fv-uploader" type="button" onClick={pictures.open} aria-label="Add pictures of your own">
            <Icon name="plus" />
            <span>Add</span>
          </button>
          {pictures.tiles.map((t, i) => {
            const place = pictures.place(t.key);
            return (
              <button
                key={t.key} type="button" className="creator-picture-tile" aria-pressed={place > 0} disabled={pending}
                aria-label={place ? `Picture ${i + 1}, ${place === 1 ? "the cover" : `number ${place}`}. Tap to drop it.` : `Picture ${i + 1}, not used. Tap to add it.`}
                onClick={() => pictures.toggle(t.key)}
              >
                <img
                  src={t.src} alt="" loading="lazy"
                  onError={() => pictures.drop(t.key)}
                  // Some shops answer a missing picture with a 1×1 blank instead of an error.
                  onLoad={(e) => { if (e.currentTarget.naturalWidth < 60) pictures.drop(t.key); }}
                  // And one that failed before this form was listening (it can arrive already rendered) is caught here.
                  ref={(el) => { if (el && el.complete && el.naturalWidth < 60) queueMicrotask(() => pictures.drop(t.key)); }}
                />
                {place ? <span className="creator-picture-n caption">{place === 1 ? "Cover" : place}</span> : null}
              </button>
            );
          })}
        </div>
        <p className="caption creator-muted">
          {pictures.notice ?? (pictures.tiles.length
            ? `${pictures.chosen} of ${pictures.tiles.length} chosen. Number 1 is the cover. Tap a picture to drop it or add it back.`
            : "Add pictures: the product's, and your own of it in use. Square ones look best.")}
        </p>
      </div>

      <TextField id="name" name="name" label="Product name" value={values.name} maxLength={80} hideCount required error={state.fields?.name} />
      <TextField
        id="brand" name="brand" label={found?.kind === "book" ? "Author" : "Brand"} value={brand} onChange={setBrand} maxLength={60} hideCount
        help={found?.kind === "book" ? "For a book, the author takes the brand's place on the card." : undefined}
      />
      {brand.trim() ? (
        <div className="creator-brand">
          <span className="caption creator-muted">On the card:</span>
          <BrandChip name={brand.trim()} logo={logo?.src} />
          {logo ? <Button variant="link" size="sm" label="Remove logo" onClick={() => { setLogo(undefined); setLogoRemoved(true); }} /> : null}
        </div>
      ) : null}

      <Select
        id="list" name="list" label="Add to list" value={list} onChange={setList} error={state.fields?.list}
        options={[...lists.map((l) => ({ value: l.id, label: l.name })), { value: "new", label: "New list…" }]}
      />
      {list === "new" ? (
        <TextField
          id="new_list" name="new_list" label="List name" placeholder="Camera bag essentials" maxLength={60} required
          help="Say what it's for, not just what's in it." error={state.fields?.new_list}
        />
      ) : null}

      <FieldShell id="code" label="Referral code" optional help={codeHelp}>
        <div className="creator-pair">
          <input
            className="fv-input creator-code" id="code" name="code" type="text" placeholder="VINCE10" maxLength={40} value={code}
            autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-describedby="code-help" onChange={(e) => setCode(e.target.value)}
          />
          <input
            className="fv-input" name="benefit" type="text" placeholder="10% off" maxLength={40} value={benefit}
            aria-label="What the code gives" autoComplete="off" onChange={(e) => setBenefit(e.target.value)}
          />
        </div>
      </FieldShell>

      <div className="creator-foot">
        <Button
          type="submit" variant="primary" size="lg" block disabled={pending}
          label={pictures.progress ? `Saving pictures ${Math.min(pictures.progress.done + 1, pictures.progress.total)} of ${pictures.progress.total}…` : pending ? "Saving…" : "Next: your review"}
        />
      </div>
    </form>
  );
}
