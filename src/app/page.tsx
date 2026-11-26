import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppFrame } from "@/components/frame/AppFrame";
import { AutoMore } from "@/components/me/AutoMore";
import { People } from "@/components/me/People";
import { ProductFeed } from "@/components/public/ProductFeed";
import { Landing } from "@/components/landing/Landing";
import { EmptyState, Icon, MarkLoader, TopBar } from "@/components/ui";
import { getCreators, getFeed } from "@/lib/data/public";
import { plural } from "@/lib/format";
import { getViewer } from "@/lib/viewer";
import "@/components/me/me.css";

type Props = { searchParams: Promise<{ pages?: string }> };

const PAGE = 12;

// The root address is two screens: C1, the home feed, for someone signed in;
// and A8, the landing page, for a visitor.
export default function Home(props: Props) {
  return (
    // Who is looking is request data: the choice streams in. The mark assembles meanwhile.
    <Suspense fallback={<div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}><MarkLoader /></div>}>
      <HomeFor {...props} />
    </Suspense>
  );
}

async function HomeFor({ searchParams }: Props) {
  const viewer = await getViewer();
  if (!viewer) return <Visitor />;
  if (!viewer.profile) redirect("/welcome");

  const pages = Math.min(50, Math.max(1, Number((await searchParams).pages) || 1));
  const [{ products, more }, creators] = await Promise.all([getFeed([...viewer.following].sort(), 0, pages * PAGE), getCreators()]);
  const others = creators.filter((c) => c.id !== viewer.profile!.id && !viewer.following.has(c.id));

  return (
    <AppFrame current="Home">
      <div className="app-mobile-only">
        <TopBar
          brand
          trailing={
            <Link className="fv-icon-btn" href="/notifications" aria-label={viewer.unread ? "Notifications, new" : "Notifications"} style={{ position: "relative" }}>
              <Icon name="bell" size="lg" />
              {viewer.unread ? <span style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--accent)" }} /> : null}
            </Link>
          }
        />
      </div>
      {products.length ? (
        <>
          <ProductFeed products={products} as="mixed" />
          {more ? <AutoMore href={`/?pages=${pages + 1}`} /> : null}
        </>
      ) : (
        <>
          <EmptyState
            icon="home"
            title={viewer.following.size ? "Nothing new yet" : "Your feed starts with a follow"}
            message={viewer.following.size ? "The creators you follow haven't published anything yet." : "Follow a few creators and their newest products show up here."}
            action={{ label: "Add a product of your own", href: "/create", variant: "tertiary" }}
          />
          {others.length ? (
            <>
              <div className="me-section"><h2 className="fv-overline">Creators to follow</h2></div>
              <People people={others.slice(0, 8).map((c) => ({ id: c.id, name: c.name, username: c.username, avatar: c.avatar, meta: plural(c.followers, "follower"), following: false }))} />
            </>
          ) : null}
        </>
      )}
    </AppFrame>
  );
}

async function Visitor() {
  // "See a creator's page" leads to a real one: the first creator there is, or the directory when there is none yet.
  const creators = await getCreators();
  return <Landing creatorHref={creators[0] ? `/${creators[0].username}` : "/search"} />;
}
