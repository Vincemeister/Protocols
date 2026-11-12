import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppFrame } from "@/components/frame/AppFrame";
import { ForViewer } from "@/components/frame/ForViewer";
import { ProfileTabs } from "@/components/public/ProfileTabs";
import { profileLinks } from "@/components/public/links";
import { LiveProfileHeader, ShareIcon } from "@/components/social/controls";
import { Button, TopBar } from "@/components/ui";
import { getCreators, getProfilePage } from "@/lib/data/public";
import { compact } from "@/lib/format";

type Params = Promise<{ username: string }>;

// Prebuild the pages of the creators that exist at build time; others are built on first visit.
export async function generateStaticParams() {
  return (await getCreators()).map((c) => ({ username: c.username }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await getProfilePage((await params).username);
  if (!page) return { title: "Not found" };
  return { title: `${page.profile.name} (@${page.profile.username})`, description: page.profile.bio };
}

// A1 Creator profile: the header and tabs, shared by the four tab pages below it.
export default async function ProfileLayout({ children, params }: { children: ReactNode; params: Params }) {
  const page = await getProfilePage((await params).username);
  if (!page) notFound();
  const { profile, lists, products, codes } = page;
  const counts = {
    followers: { value: compact(profile.followers), label: profile.followers === 1 ? "follower" : "followers" },
    following: { value: compact(profile.following), label: "following" },
    lists: { value: compact(lists.length), label: lists.length === 1 ? "list" : "lists" },
    products: { value: compact(products.length), label: products.length === 1 ? "product" : "products" },
  };
  const header = { profileId: profile.id, name: profile.name, handle: `@${profile.username}`, avatar: profile.avatar, bio: profile.bio };

  return (
    <AppFrame except={profile.username}>
      <div className="app-mobile-only">
        <TopBar
          brand
          trailing={
            <ForViewer>
              {(viewer) =>
                viewer ? (
                  <ShareIcon title={profile.name} label="Share profile" />
                ) : (
                  <Button variant="link" size="sm" href="/sign-in" label="Sign in" style={{ marginRight: "var(--space-2)" }} />
                )
              }
            </ForViewer>
          }
        />
      </div>
      {/* The header is rendered in its phone and its desktop form; CSS shows one. */}
      <ForViewer>
        {(viewer) => {
          const own = viewer?.profile?.id === profile.id;
          const following = !!viewer?.following.has(profile.id);
          return (
            <>
              <div className="app-mobile-only">
                <LiveProfileHeader
                  {...header} own={own} following={following} links={profileLinks(profile.links, true)}
                  counts={[counts.followers, counts.lists, counts.products]}
                />
              </div>
              <div className="app-desktop-only">
                <LiveProfileHeader
                  {...header} large own={own} following={following} links={profileLinks(profile.links, false)}
                  counts={[counts.followers, counts.following, counts.lists, counts.products]}
                />
              </div>
            </>
          );
        }}
      </ForViewer>
      <ProfileTabs username={profile.username} lists={lists.length} products={products.length} codes={codes.length} />
      {children}
    </AppFrame>
  );
}
