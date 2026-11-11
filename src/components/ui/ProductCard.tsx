/* eslint-disable @next/next/no-img-element */
import { Avatar } from "./Avatar";
import { BrandChip } from "./BrandChip";
import { CodeFrame } from "./CodeFrame";
import { Icon } from "./Icon";

export interface ProductCardProps {
  creator: { name: string; avatar?: string };
  listName?: string;
  product: { name: string; image?: string; brand?: string; brandLogo?: string; url?: string };
  /** The creator's own words. Mandatory: a product without a review is not shown. Clamped to 3 lines here, full on the product page. */
  review: string;
  code?: string;
  /** e.g. "10% off with". */
  codeLabel?: string;
  likes?: number;
  comments?: number;
}

export function ProductCard({ creator, listName, product, review, code, codeLabel, likes, comments }: ProductCardProps) {
  return (
    <article className="fv-product">
      <div className="fv-product-head">
        <div className="fv-product-creator">
          <Avatar name={creator.name} src={creator.avatar} size={40} />
          <div>
            <div className="fv-name">{creator.name}</div>
            {listName ? <div className="fv-list">{listName}</div> : null}
          </div>
        </div>
        {product.brand ? <BrandChip name={product.brand} logo={product.brandLogo} /> : null}
      </div>
      <div className="fv-product-image">
        {product.image ? <img src={product.image} alt={product.name || ""} /> : <Icon name="image" size="lg" />}
      </div>
      <h3 className="fv-product-title">{product.name}</h3>
      <p className="fv-product-review">{review}</p>
      {code ? <CodeFrame label={codeLabel || "Code"} code={code} /> : null}
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
    </article>
  );
}
