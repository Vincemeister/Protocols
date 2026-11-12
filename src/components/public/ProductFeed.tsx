import { ForViewer } from "@/components/frame/ForViewer";
import { IconToggle } from "@/components/social/controls";
import { Icon, ProductCard } from "@/components/ui";
import type { PublicProduct, PublicProfile } from "@/lib/data/public";
import { ordinal } from "@/lib/format";

/** The action row of a product card on the public pages: like, save, and "Go to product". (Comments are v2.) */
export function ProductActions({ product }: { product: PublicProduct }) {
  return (
    <div className="fv-product-actions">
      <ForViewer>
        {(viewer) => (
          <>
            <IconToggle icon="heart" label="Like" target={{ like: product.id }} on={!!viewer?.likedProducts.has(product.id)} count={product.likes} />
            <IconToggle icon="bookmark" label="Save" target={{ saveProduct: product.id }} on={!!viewer?.savedProducts.has(product.id)} />
          </>
        )}
      </ForViewer>
      {product.url ? (
        <a className="fv-icon-btn fv-icon-btn-right" href={product.url} target="_blank" rel="noopener">
          Go to product <Icon name="external-link" size="sm" />
        </a>
      ) : null}
    </div>
  );
}

/**
 * Products stacked as cards separated by hairlines, never a grid.
 * `as="profile"` heads each card with the creator and list name (Products and
 * Codes tabs); `as="list"` heads it with its number when the list is numbered.
 */
export function ProductFeed({ products, profile, as, numbered }: { products: PublicProduct[]; profile: PublicProfile; as: "profile" | "list"; numbered?: boolean }) {
  return (
    <>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          creator={as === "profile" ? { name: profile.username, avatar: profile.avatar } : undefined}
          listName={as === "profile" ? p.list.name : undefined}
          number={as === "list" && numbered ? ordinal(p.position) : undefined}
          product={{ name: p.name, image: p.image, brand: p.brand }}
          review={p.review}
          code={p.code?.code}
          codeLabel={p.code?.label}
          href={p.href}
          imageRatio="4 / 3"
          actions={<ProductActions product={p} />}
        />
      ))}
    </>
  );
}
