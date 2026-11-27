import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppFrame } from "@/components/frame/AppFrame";
import { AutoMore } from "@/components/me/AutoMore";
import { People } from "@/components/me/People";
import { ProductFeed } from "@/components/public/ProductFeed";
import { Button, EmptyState, Icon, Mark, MarkLoader, TopBar, UserCard } from "@/components/ui";
import { getCreators, getFeed } from "@/lib/data/public";
import { plural } from "@/lib/format";
import { APP_NAME } from "@/lib/config";
import { getViewer } from "@/lib/viewer";
import "@/components/me/me.css";

type Props = { searchParams: Promise<{ pages?: string }> };

const PAGE = 12;

// The root address is two screens: C1, the home feed, for someone signed in;
// and for a visitor the page that says what Favolist is (A8, the landing
// page, is built in phase 5; until then a short placeholder).
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
  const creators = await getCreators();
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "var(--space-6)", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ width: 32, height: 32, display: "block" }} className="fv-mark-box"><Mark /></span>
        <span className="heading-3">{APP_NAME}</span>
      </div>
      <p className="body" style={{ margin: 0, color: "var(--ink-muted)", maxWidth: 360 }}>
        The products people actually use, reviewed in their own words.
      </p>
      <Button variant="primary" size="lg" href="/sign-in" label="Sign in" />
      {creators.length ? (
        <section style={{ width: "100%", maxWidth: 400, textAlign: "left", paddingTop: "var(--space-8)" }}>
          <h2 className="fv-overline">Creators</h2>
          {creators.map((c) => (
            <UserCard key={c.id} name={c.name} handle={`@${c.username}`} meta={plural(c.followers, "follower")} avatar={c.avatar} href={`/${c.username}`} action={false} lined />
          ))}
        </section>
      ) : null}
    </main>
  );
}
