/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/frame/AppFrame";
import { ForViewer } from "@/components/frame/ForViewer";
import { ProductFeed } from "@/components/public/ProductFeed";
import { FollowSmall, SaveButton, ShareIcon } from "@/components/social/controls";
import { Avatar, EmptyState, TopBar } from "@/components/ui";
import { getListPage } from "@/lib/data/public";
import { plural } from "@/lib/format";

type Params = Promise<{ username: string; list: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, list } = await params;
  const page = await getListPage(username, list);
  if (!page) return { title: "Not found" };
  return { title: `${page.list.name} by ${page.profile.name}`, description: page.list.intro };
}

// A2 List page: one list as a reading experience. Cover, intro, then the products in the creator's order.
export default async function ListPage({ params }: { params: Params }) {
  const { username, list: listSlug } = await params;
  const page = await getListPage(username, listSlug);
  if (!page) notFound();
  const { profile, list, products } = page;
  const profileHref = `/${profile.username}`;

  return (
    <AppFrame except={profile.username}>
      <TopBar
        title={profile.username} backHref={profileHref} backLabel={`Back to ${profile.name}`}
        trailing={<ShareIcon title={`${list.name} by ${profile.name}`} label="Share list" />}
      />
      <div className="list-cover">
        {list.cover ? <img src={list.cover} alt="" /> : null}
        <div className="list-cover-text">
          <h2 className="heading-3">{list.name}</h2>
          <p className="body-sm" title={`Updated ${list.updatedExact}`}>
            {plural(list.productCount, "product")} · updated {list.updated}
          </p>
        </div>
      </div>
      <div className="list-intro">
        {list.intro ? <p className="body">{list.intro}</p> : null}
        <div className="app-row">
          <Avatar name={profile.name} src={profile.avatar} size={32} />
          <div className="app-row-text">
            <Link href={profileHref} className="body-sm app-strong" style={{ color: "inherit", textDecoration: "none", display: "block" }}>
              {profile.name}
            </Link>
            <div className="caption app-muted">{plural(profile.followers, "follower")}</div>
          </div>
          <ForViewer>
            {(viewer) => (
              <>
                {viewer?.profile?.id === profile.id ? null : <FollowSmall profileId={profile.id} following={!!viewer?.following.has(profile.id)} />}
                <SaveButton size="sm" label="Save list" target={{ saveList: list.id }} on={!!viewer?.savedLists.has(list.id)} />
              </>
            )}
          </ForViewer>
        </div>
      </div>
      {products.length ? (
        <ProductFeed products={products} profile={profile} as="list" numbered={list.numbered} />
      ) : (
        <EmptyState icon="image" title="Nothing in this list yet" message="Products show up here once they have a review." />
      )}
    </AppFrame>
  );
}
