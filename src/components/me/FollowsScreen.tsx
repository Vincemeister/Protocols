import { People } from "@/components/me/People";
import { Screen } from "@/components/me/Screen";
import { EmptyState, Tabs } from "@/components/ui";
import { requireCreator } from "@/lib/creator/session";
import { getPeople } from "@/lib/data/public";
import { plural } from "@/lib/format";
import { getFollowIds } from "@/lib/me/data";

/** C12 Followers / following: one screen, two tabs, each with its own address. */
export function FollowsScreen({ tab }: { tab: "followers" | "following" }) {
  return (
    <Screen title="Followers" backHref="/settings">
      <Follows tab={tab} />
    </Screen>
  );
}

async function Follows({ tab }: { tab: "followers" | "following" }) {
  const { profile, db } = await requireCreator();
  const ids = await getFollowIds(db, profile.id);
  const mine = new Set(ids.following);
  const people = await getPeople(tab === "followers" ? ids.followers : ids.following);
  return (
    <>
      <Tabs
        selected={tab}
        items={[
          { id: "followers", label: "Followers", count: ids.followers.length, href: "/follows" },
          { id: "following", label: "Following", count: ids.following.length, href: "/follows/following" },
        ]}
      />
      {people.length ? (
        <People
          self={profile.id} removable={tab === "followers"}
          people={people.map((p) => ({ id: p.id, name: p.name, username: p.username, avatar: p.avatar, meta: plural(p.followers, "follower"), following: mine.has(p.id) }))}
        />
      ) : tab === "followers" ? (
        <EmptyState icon="user" title="No followers yet" message="Put your link in your bio. People who like what you recommend follow from your page." />
      ) : (
        <EmptyState icon="user" title="You follow nobody yet" message="Follow a creator and their newest products show up on your home screen." action={{ label: "Find creators", href: "/search" }} />
      )}
    </>
  );
}
