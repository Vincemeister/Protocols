import type { Metadata } from "next";
import { Screen } from "@/components/me/Screen";
import { ProductFeed } from "@/components/public/ProductFeed";
import { EmptyState, ListCard } from "@/components/ui";
import { requireViewer } from "@/lib/creator/session";
import { getSaved } from "@/lib/data/public";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Saved" };

// C9 Saved: the products and lists you bookmarked from others.
export default function SavedPage() {
  return (
    <Screen title="Saved" current="Saved">
      <Saved />
    </Screen>
  );
}

async function Saved() {
  const viewer = await requireViewer();
  const { products, lists } = await getSaved([...viewer.savedProducts].sort(), [...viewer.savedLists].sort());
  if (!products.length && !lists.length) {
    return <EmptyState icon="bookmark" title="Nothing saved yet" message="Tap the bookmark on a product or a list and it waits for you here." action={{ label: "Find creators", href: "/search" }} />;
  }
  return (
    <>
      {lists.length ? (
        <>
          <div className="me-section"><h2 className="fv-overline">Lists</h2></div>
          <div className="app-grid">
            {lists.map(({ list, creator }) => (
              <ListCard key={list.id} size="sm" name={list.name} count={plural(list.productCount, "product")} cover={list.cover} href={list.href} creator={{ name: creator.username, avatar: creator.avatar }} />
            ))}
          </div>
        </>
      ) : null}
      {products.length ? (
        <>
          {lists.length ? <div className="me-section"><h2 className="fv-overline">Products</h2></div> : null}
          <ProductFeed products={products} as="mixed" />
        </>
      ) : null}
    </>
  );
}
