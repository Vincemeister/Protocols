/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Avatar } from "./Avatar";
import { BrandChip } from "./BrandChip";
import { CodeFrame } from "./CodeFrame";
import { Icon } from "./Icon";

export interface ProductCardProps {
  /** Shown top left with the list name. Leave out on a list page, where `number` takes its place. */
  creator?: { name: string; avatar?: string };
  listName?: string;
  product: { name: string; image?: string; brand?: string; brandLogo?: string; url?: string };
  /** The creator's own words. Mandatory: a product without a review is not shown. Clamped to 3 lines here, full on the product page. */
  review: string;
  code?: string;
  /** e.g. "10% off with". */
  codeLabel?: string;
  likes?: number;
  comments?: number;
  // --- Beyond index.d.ts, for the designed screens (A1 Products tab, A2 list page) ---
  /** Position in a numbered list ("01"), top left instead of the creator. */
  number?: string;
  /** The product page: the image and title link to it. */
  href?: string;
  /** Image frame ratio; the screens use "4 / 3" in lists (the component default is square). */
  imageRatio?: CSSProperties["aspectRatio"];
  /** Replaces the default action row (like, comment, share, go to product). */
  actions?: ReactNode;
}

export function ProductCard({
  creator, listName, product, review, code, codeLabel, likes, comments, number, href, imageRatio, actions,
}: ProductCardProps) {
  const image = product.image ? <img src={product.image} alt={product.name || ""} /> : <Icon name="image" size="lg" />;
  const frameStyle = imageRatio ? { aspectRatio: imageRatio } : undefined;
  return (
    <article className="fv-product">
      <div className="fv-product-head">
        {creator ? (
          <div className="fv-product-creator">
            <Avatar name={creator.name} src={creator.avatar} size={40} />
            <div>
              <div className="fv-name">{creator.name}</div>
              {listName ? <div className="fv-list">{listName}</div> : null}
            </div>
          </div>
        ) : (
          <div className="fv-overline">{number}</div>
        )}
        {product.brand ? <BrandChip name={product.brand} logo={product.brandLogo} /> : null}
      </div>
      {href ? (
        <Link className="fv-product-image" href={href} aria-label={product.name} style={frameStyle}>{image}</Link>
      ) : (
        <div className="fv-product-image" style={frameStyle}>{image}</div>
      )}
      <h3 className="fv-product-title">
        {href ? <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>{product.name}</Link> : product.name}
      </h3>
      <p className="fv-product-review">{review}</p>
      {code ? <CodeFrame label={codeLabel || "Code"} code={code} /> : null}
      {actions ?? (
        <div className="fv-product-actions">
          <button className="fv-icon-btn" type="button" aria-label={likes == null ? "Like" : undefined}>
            <Icon name="heart" />
            {likes}
          </button>
          <button className="fv-icon-btn" type="button" aria-label={comments == null ? "Comment" : undefined}>
            <Icon name="message-circle" />
            {comments}
          </button>
          <button className="fv-icon-btn" type="button" aria-label="Share">
            <Icon name="share" />
          </button>
          {product.url ? (
            <a className="fv-icon-btn fv-icon-btn-right" href={product.url}>
              Go to product <Icon name="external-link" size="sm" />
            </a>
          ) : null}
        </div>
      )}
    </article>
  );
}
