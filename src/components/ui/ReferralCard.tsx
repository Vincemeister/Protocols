/* eslint-disable @next/next/no-img-element */
import type { MouseEventHandler } from "react";
import { CodeFrame } from "./CodeFrame";
import { Icon } from "./Icon";

export interface ReferralCardProps {
  product: { name: string; image?: string };
  listName?: string;
  code?: string;
  codeLabel?: string;
  sortable?: boolean;
  onEdit?: MouseEventHandler<HTMLElement>;
}

export function ReferralCard({ product, listName, code, codeLabel, sortable, onEdit }: ReferralCardProps) {
  return (
    <div className="fv-referral">
      <div className="fv-referral-thumb">
        {product.image ? <img src={product.image} alt="" /> : <Icon name="image" />}
      </div>
      <div className="fv-referral-text">
        <div className="fv-name">{product.name}</div>
        {listName ? <div className="fv-meta">{listName}</div> : null}
        {code ? <CodeFrame label={codeLabel || "Code"} code={code} /> : <div className="fv-meta">No code yet</div>}
      </div>
      <div className="fv-referral-actions">
        <button className="fv-icon-btn" type="button" aria-label="Edit code" onClick={onEdit}>
          <Icon name="pencil" />
        </button>
        {sortable ? (
          <span className="fv-icon-btn fv-grip" aria-hidden="true">
            <Icon name="grip-horizontal" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
