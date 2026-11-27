import type { Metadata } from "next";
import { Suspense } from "react";
import { AppFrame } from "@/components/frame/AppFrame";
import { ForViewer } from "@/components/frame/ForViewer";
import { People } from "@/components/me/People";
import { ScreenLoading } from "@/components/me/Screen";
import { SearchBox } from "@/components/me/SearchBox";
import { ProductFeed } from "@/components/public/ProductFeed";
import { EmptyState, ListCard, TopBar } from "@/components/ui";
import { getCreators, searchPublic, type PublicProfile } from "@/lib/data/public";
import { plural } from "@/lib/format";
import "@/components/me/me.css";

export const metadata: Metadata = { title: "Search" };

type Props = { searchParams: Promise<{ q?: string }> };

// A5 Search (with A6, the creators directory, as its starting state): find a
// creator, a list or a product by name. Open to visitors.
export default function SearchPage({ searchParams }: Props) {
  return (
    <AppFrame current="Search">
      <TopBar title="Search" backHref="/" />
      {/* The words typed are in the address (?q=…), which is request data: this part streams in. */}
      <Suspense fallback={<><div className="me-search"><SearchBox query="" /></div><ScreenLoading /></>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </AppFrame>
  );
}

function Creators({ creators }: { creators: PublicProfile[] }) {
  return (
    <ForViewer>
      {(viewer) => (
        <People
          self={viewer?.profile?.id}
          people={creators.map((c) => ({ id: c.id, name: c.name, username: c.username, avatar: c.avatar, meta: plural(c.followers, "follower"), following: !!viewer?.following.has(c.id) }))}
        />
      )}
    </ForViewer>
  );
}

async function Results({ searchParams }: Props) {
  const query = ((await searchParams).q ?? "").trim().slice(0, 80);
  const box = <div className="me-search"><SearchBox key={query} query={query} /></div>;

  if (!query) {
    const creators = await getCreators();
    return (
      <>
        {box}
        {creators.length ? (
          <>
            <div className="me-section"><h2 className="fv-overline">Creators</h2></div>
            <Creators creators={creators} />
          </>
        ) : (
          <EmptyState icon="search" title="Search Favolist" message="Find a creator, a list or a product by name." />
        )}
      </>
    );
  }

  const { creators, lists, products } = await searchPublic(query.toLowerCase());
  if (!creators.length && !lists.length && !products.length) {
    return (
      <>
        {box}
        <EmptyState icon="search" title={`Nothing found for "${query}"`} message="Check the spelling, or try the brand or the creator's name." />
      </>
    );
  }
  return (
    <>
      {box}
      {creators.length ? (
        <>
          <div className="me-section"><h2 className="fv-overline">Creators</h2></div>
          <Creators creators={creators} />
        </>
      ) : null}
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
          <div className="me-section"><h2 className="fv-overline">Products</h2></div>
          <ProductFeed products={products} as="mixed" />
        </>
      ) : null}
    </>
  );
}
