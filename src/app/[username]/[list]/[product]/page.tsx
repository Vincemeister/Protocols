/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/frame/AppFrame";
import { ForViewer } from "@/components/frame/ForViewer";
import { FollowSmall, IconToggle, SaveButton, ShareIcon } from "@/components/social/controls";
import { Avatar, BrandChip, Button, CodeFrame, Icon, TopBar } from "@/components/ui";
import { getProductPage } from "@/lib/data/public";
import { ordinal } from "@/lib/format";

type Params = Promise<{ username: string; list: string; product: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, list, product } = await params;
  const page = await getProductPage(username, list, product);
  if (!page) return { title: "Not found" };
  return { title: `${page.product.name}, reviewed by ${page.profile.name}`, description: page.product.review.slice(0, 160) };
}

// A3 Product page: the full review (never clamped), the image, brand and referral code.
export default async function ProductPage({ params }: { params: Params }) {
  const { username, list: listSlug, product: productSlug } = await params;
  const page = await getProductPage(username, listSlug, productSlug);
  if (!page) notFound();
  const { profile, list, product, total } = page;

  return (
    <AppFrame except={profile.username}>
      <TopBar
        title={list.name} backHref={list.href} backLabel={`Back to ${list.name}`}
        trailing={<ShareIcon title={`${product.name}, reviewed by ${profile.name}`} label="Share product" />}
      />
      <div className="fv-product-image product-hero">
        {product.image ? <img src={product.image} alt={product.name} /> : <Icon name="image" size="lg" />}
      </div>
      <div className="product-body">
        <div className="product-title">
          <div>
            <h2 className="heading-4">{product.name}</h2>
            {product.domain ? <p className="caption app-muted">Via {product.domain}</p> : null}
          </div>
          {product.brand ? <BrandChip name={product.brand} /> : null}
        </div>

        <div className="app-row">
          <Avatar name={profile.name} src={profile.avatar} size={40} />
          <div className="app-row-text">
            <Link href={`/${profile.username}`} className="body-sm app-strong" style={{ color: "inherit", textDecoration: "none", display: "block" }}>
              {profile.name}
            </Link>
            <div className="caption app-muted">
              In {list.name} · {ordinal(product.position)} of {total}
            </div>
          </div>
          <ForViewer>
            {(viewer) =>
              viewer?.profile?.id === profile.id ? null : <FollowSmall profileId={profile.id} following={!!viewer?.following.has(profile.id)} />
            }
          </ForViewer>
        </div>

        <p className="body-lg">{product.review}</p>

        {product.code ? <CodeFrame label={product.code.label} code={product.code.code} /> : null}

        <div className="product-cta">
          {product.url ? (
            <Button variant="primary" size="lg" href={product.url}>
              Go to product <Icon name="external-link" />
            </Button>
          ) : null}
          <ForViewer>
            {(viewer) => (
              <SaveButton
                size="lg" ariaLabel="Save product" target={{ saveProduct: product.id }} on={!!viewer?.savedProducts.has(product.id)}
                style={{ padding: "0 var(--space-3)" }}
              />
            )}
          </ForViewer>
        </div>

        <div className="fv-product-actions product-meta">
          <ForViewer>
            {(viewer) => (
              <IconToggle icon="heart" label="Like" countWord="like" target={{ like: product.id }} on={!!viewer?.likedProducts.has(product.id)} count={product.likes} />
            )}
          </ForViewer>
          <span className="caption app-muted" title={product.addedExact}>
            Added {product.added}
            {product.edited ? ` · edited ${product.edited}` : ""}
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
