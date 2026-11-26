"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Icon, Skeleton, TextField } from "@/components/ui";
import type { MyList } from "@/lib/creator/data";
import { domainOf, normaliseUrl, type ProductDetails } from "@/lib/scrape/extract";
import { CreatorScreen } from "./CreatorScreen";
import { DetailsForm } from "./DetailsForm";

type Step = "source" | "fetching" | "failed" | "details";
type Reason = "bad_link" | "blocked" | "not_found" | "timeout" | "signed_out";
type Answer = { ok: true; product: ProductDetails } | { ok: false; reason: Reason };

const FIELD_ERRORS: Record<Reason, string> = {
  not_found: "No product found at this address.",
  blocked: "That site wouldn't let us read the page.",
  timeout: "That site took too long to answer.",
  bad_link: "That doesn't look like a web address.",
  signed_out: "You've been signed out. Sign in and try again.",
};

export interface RecentItem { id: string; name: string; image?: string; meta: string }

interface AddProductProps {
  lists: MyList[];
  /** The list the creator came from, preselected on the details step. */
  listId?: string;
  recent?: RecentItem[];
  /** A link handed in with the address (/create?url=…): fetched straight away. */
  initialUrl?: string;
  closeHref: string;
  /** For /dev/screens only: open on a given step. */
  demo?: { step: Step; url?: string; reason?: Reason; product?: ProductDetails };
}

/**
 * C4 Add a product — paste a link, with its fetching and failed states — and
 * C5 the details that follow. One component because the steps hand state to
 * each other (the link, what was found) and Back must not lose it.
 */
export function AddProduct({ lists, listId, recent = [], initialUrl = "", closeHref, demo }: AddProductProps) {
  const [step, setStep] = useState<Step>(demo?.step ?? "source");
  const [url, setUrl] = useState(demo?.url ?? initialUrl);
  const [reason, setReason] = useState<Reason>(demo?.reason ?? "not_found");
  const [product, setProduct] = useState<ProductDetails | null>(demo?.product ?? null);
  const request = useRef<AbortController | null>(null);

  const address = normaliseUrl(url);
  const domain = address ? domainOf(address) : "";

  async function fetchDetails(link = address) {
    if (!link) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setStep("fetching");
    try {
      const res = await fetch("/api/fetch-product", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: link }), signal: controller.signal,
      });
      const answer = (await res.json()) as Answer;
      if (controller.signal.aborted) return;
      if (answer.ok) {
        setProduct(answer.product);
        setStep("details");
      } else {
        setReason(answer.reason);
        setStep("failed");
      }
    } catch {
      if (controller.signal.aborted) return; // they skipped or went back
      setReason("timeout");
      setStep("failed");
    }
  }

  // A link that arrived with the address is fetched without another tap.
  const started = useRef(false);
  useEffect(() => {
    if (started.current || demo || !normaliseUrl(initialUrl)) return;
    started.current = true;
    void fetchDetails(normaliseUrl(initialUrl));
    // Runs once on arrival; fetchDetails only reads state that exists by then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => request.current?.abort(), []);

  function manual() {
    request.current?.abort();
    setProduct(null);
    setStep("details");
  }
  function back() {
    request.current?.abort();
    setStep("source");
  }

  if (step === "details") {
    return (
      <CreatorScreen title="Check the details" step="2 of 3" onBack={back}>
        <DetailsForm
          key={product?.url ?? "manual"} lists={lists}
          values={{ name: product?.name, brand: product?.brand, listId, sourceUrl: product?.url ?? address ?? "" }}
          found={product ? { images: product.images, domain: product.domain } : undefined}
        />
      </CreatorScreen>
    );
  }

  if (step === "fetching") {
    return (
      <CreatorScreen title="Add a product" step="1 of 3" onBack={back} roomy>
        <TextField id="url" type="url" label="Product link" value={url} disabled />
        <div className="creator-fetching fv-loadmore" role="status" aria-live="polite">
          <span className="fv-spinner" />Reading {domain || "the page"}
        </div>
        <div className="creator-skeleton" aria-hidden="true">
          <div className="creator-skeleton-head">
            <Skeleton text width={120} />
            <Skeleton width={88} height={32} />
          </div>
          <div className="fv-skeleton" style={{ width: "100%", aspectRatio: "4 / 3" }} />
          <div className="fv-skeleton fv-skeleton-text" style={{ width: "70%", height: 18 }} />
          <Skeleton text width="45%" />
        </div>
        <p className="caption creator-muted">This usually takes a few seconds. You can fix anything we get wrong on the next step.</p>
        <div className="creator-foot">
          <Button variant="tertiary" size="lg" block label="Skip and add it manually" onClick={manual} />
        </div>
      </CreatorScreen>
    );
  }

  if (step === "failed") {
    return (
      <CreatorScreen title="Add a product" step="1 of 3" onBack={back} roomy>
        <Alert tone="danger" title="We couldn't read that page." message="Some stores block us. Check the link, or add the product by hand below; it takes a minute." />
        <TextField id="url" type="url" label="Product link" value={url} onChange={setUrl} error={FIELD_ERRORS[reason]} inputMode="url" autoCapitalize="none" spellCheck={false} />
        <div className="creator-row">
          <Button variant="tertiary" size="lg" label="Try again" disabled={!address} onClick={() => fetchDetails()} />
          <Button variant="primary" size="lg" label="Add it manually" onClick={manual} />
        </div>
        <div className="creator-section">
          <h3 className="fv-overline">What we need</h3>
          <p className="body-sm creator-muted">A name, one picture and the brand. Your review does the rest.</p>
        </div>
      </CreatorScreen>
    );
  }

  return (
    <CreatorScreen title="Add a product" step="1 of 3" backHref={closeHref} close roomy>
      <div className="creator-intro">
        <h2 className="heading-4">Paste a link</h2>
        <p className="body-sm creator-muted">We&apos;ll fetch the name, picture and brand. Amazon, Shopify stores, app stores and most websites work.</p>
      </div>
      {/* noValidate: we accept "peakdesign.com/…" without https://, which the browser's own check for a url field would refuse. */}
      <form noValidate action={() => { void fetchDetails(); }}>
        <TextField id="url" type="url" label="Product link" placeholder="https://" value={url} onChange={setUrl} autocomplete="off" inputMode="url" autoCapitalize="none" spellCheck={false} />
        <Button type="submit" variant="primary" size="lg" block disabled={!address} label="Fetch details" />
      </form>
      <div className="creator-or caption">OR</div>
      <Button variant="tertiary" size="lg" block label="Add it manually" onClick={manual} />
      {recent.length ? (
        <div className="creator-foot">
          <h3 className="fv-overline" style={{ margin: 0 }}>Recently added by you</h3>
          {recent.map((item) => (
            <Link key={item.id} href={`/create/${item.id}`} className="creator-item creator-recent">
              <div className="fv-referral-thumb creator-thumb-sm">{item.image ? <img src={item.image} alt="" /> : <Icon name="image" size="sm" />}</div>
              <div className="creator-item-text">
                <div className="body-sm" style={{ fontWeight: 600 }}>{item.name}</div>
                <div className="caption creator-muted">{item.meta}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </CreatorScreen>
  );
}
