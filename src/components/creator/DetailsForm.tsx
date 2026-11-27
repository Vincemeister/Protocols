"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useEffect, useRef, useState } from "react";
import { Alert, BrandChip, Button, Icon, Select, TextField } from "@/components/ui";
import { cx } from "@/components/ui/cx";
import { FieldShell } from "@/components/ui/Field";
import { saveProduct, type FormState } from "@/lib/creator/actions";
import type { MyList } from "@/lib/creator/data";
import { useImageFile } from "./useImageFile";

export interface DetailsValues {
  /** Set when editing a product that already exists. */
  id?: string;
  name?: string;
  brand?: string;
  listId?: string;
  code?: string;
  benefit?: string;
  /** The picture already saved with the product. */
  image?: string;
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
 * name, picture, brand, list, referral code. Saving it leads to the review.
 */
export function DetailsForm({ lists, values, found }: DetailsFormProps) {
  const upload = useImageFile(1600);
  const candidates = found?.images ?? [];
  // The picture shown: one they uploaded, else one chosen from the page, else the one already saved.
  const [remote, setRemote] = useState<string | undefined>(candidates[0]);
  const [choosing, setChoosing] = useState(false);
  // Pictures that turned out not to load, or to be a blank placeholder: dropped from the choice.
  const [broken, setBroken] = useState<string[]>([]);
  const drop = (src: string) => setBroken((b) => (b.includes(src) ? b : [...b, src]));
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
    (prev, form) => {
      if (upload.picked) form.set("image_file", upload.picked.blob, "product.jpg");
      return saveProduct(prev, form);
    },
    {},
  );

  const usable = candidates.filter((src) => !broken.includes(src));
  // If the chosen picture fails, the next one that works takes its place.
  const chosen = upload.picked ? undefined : remote && !broken.includes(remote) ? remote : usable[0];
  const shown = upload.picked?.preview ?? chosen ?? values.image;
  // A picture that failed before this form was listening (it can arrive already rendered) is caught here.
  const shownImg = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = shownImg.current;
    if (el && el.complete && el.naturalWidth < 60 && chosen && shown === chosen) drop(chosen);
  }, [shown, chosen]);
  const codeHelp = code.trim()
    ? `Shown as "${benefit.trim() ? `${benefit.trim()} with ${code.trim()}` : `Code ${code.trim()}`}" under your review.`
    : 'Shown as "10% off with VINCE10" under your review.';

  return (
    <form action={submit}>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="source_url" value={values.sourceUrl ?? ""} />
      {chosen ? <input type="hidden" name="image_remote" value={chosen} /> : null}
      {logo?.fresh && brand.trim() ? <input type="hidden" name="logo_remote" value={logo.src} /> : null}
      {logoRemoved ? <input type="hidden" name="logo_removed" value="1" /> : null}

      {found?.partial ? (
        <Alert tone="warning" message={`${found.domain} wouldn't show us the page, so this comes from the link itself. Check the name and the picture.`} />
      ) : found ? (
        <Alert tone="success" message={`Fetched from ${found.domain}. Fix anything that's off.`} />
      ) : null}
      {state.error ? <Alert tone="danger" message={state.error} /> : null}

      <div className="creator-picture">
        {upload.field}
        <button className={cx("fv-uploader", shown && "has-image")} type="button" aria-label={shown ? "Replace image" : "Add a picture"} onClick={upload.open}>
          {shown ? (
            <img
              ref={shownImg} src={shown} alt=""
              onError={() => { if (shown === chosen) drop(shown); }}
              // Some shops answer a missing picture with a 1×1 blank instead of an error.
              onLoad={(e) => { if (shown === chosen && e.currentTarget.naturalWidth < 60) drop(shown); }}
            />
          ) : (
            <div className="fv-uploader-fill" style={{ background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)" }}>
              <Icon name="image" size="lg" />
            </div>
          )}
        </button>
        <div className="creator-picture-text">
          <p className="caption creator-muted">
            {upload.error ?? (usable.length > 1
              ? `We found ${usable.length} pictures. Square ones look best.`
              : usable.length === 1 ? "We found 1 picture. Square ones look best."
              : shown ? "Square pictures look best." : "Add a picture. Square ones look best.")}
          </p>
          <div className="creator-picture-actions">
            {usable.length > 1 ? <Button variant="tertiary" size="sm" label={choosing ? "Done" : "Choose"} onClick={() => setChoosing(!choosing)} /> : null}
            <Button variant={usable.length > 1 ? "link" : "tertiary"} size="sm" label={usable.length ? "Upload mine" : "Upload"} onClick={upload.open} />
          </div>
        </div>
      </div>
      {choosing && usable.length > 1 ? (
        <div className="creator-found" role="group" aria-label="Pictures from the page">
          {usable.map((src, i) => (
            <button
              key={src} type="button" aria-label={`Picture ${i + 1}`} aria-pressed={chosen === src}
              onClick={() => { upload.clear(); setRemote(src); }}
            >
              <img src={src} alt="" loading="lazy" onError={() => drop(src)} onLoad={(e) => { if (e.currentTarget.naturalWidth < 60) drop(src); }} />
            </button>
          ))}
        </div>
      ) : null}

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
        <Button type="submit" variant="primary" size="lg" block disabled={pending} label={pending ? "Saving…" : "Next: your review"} />
      </div>
    </form>
  );
}
