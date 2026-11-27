import type { Metadata } from "next";
import { Screen } from "@/components/me/Screen";
import { NotificationRows } from "@/components/me/NotificationRows";
import { EmptyState } from "@/components/ui";
import { requireCreator } from "@/lib/creator/session";
import { getPeople } from "@/lib/data/public";
import { ago } from "@/lib/format";
import { getNotifications } from "@/lib/me/data";

export const metadata: Metadata = { title: "Notifications" };

// C11 Notifications: who followed you, who saved something of yours. (Comments and replies are v2.)
export default function NotificationsPage() {
  return (
    <Screen title="Notifications" current="Notifications">
      <Notifications />
    </Screen>
  );
}

async function Notifications() {
  const { profile, db } = await requireCreator();
  const items = await getNotifications(db, profile.id);
  if (!items.length) {
    return <EmptyState icon="bell" title="Nothing yet" message="When someone follows you or saves one of your products, you'll see it here." />;
  }

  // Names for the sentences: the people who acted, and the creator's own products and lists they acted on.
  const productIds = [...new Set(items.flatMap((n) => (n.productId ? [n.productId] : [])))];
  const listIds = [...new Set(items.flatMap((n) => (n.listId ? [n.listId] : [])))];
  const [people, products, lists] = await Promise.all([
    getPeople([...new Set(items.map((n) => n.actorId))].sort()),
    productIds.length ? db.from("products").select("id, name, slug, lists(slug)").in("id", productIds) : null,
    listIds.length ? db.from("lists").select("id, name, slug").in("id", listIds) : null,
  ]);
  const personOf = new Map(people.map((p) => [p.id, p]));
  type ProductRow = { id: string; name: string; slug: string; lists: { slug: string } | { slug: string }[] | null };
  const productOf = new Map(((products?.data ?? []) as ProductRow[]).map((p) => [p.id, p]));
  const listOf = new Map(((lists?.data ?? []) as { id: string; name: string; slug: string }[]).map((l) => [l.id, l]));
  const now = new Date();

  return (
    <NotificationRows
      items={items.map((n) => {
        const actor = personOf.get(n.actorId);
        const product = n.productId ? productOf.get(n.productId) : undefined;
        const list = n.listId ? listOf.get(n.listId) : undefined;
        const listSlug = product ? (Array.isArray(product.lists) ? product.lists[0]?.slug : product.lists?.slug) : undefined;
        const message = n.kind === "follow" ? "started following you."
          : product ? `saved ${product.name}.`
          : list ? `saved your list ${list.name}.`
          : "saved something of yours.";
        const href = n.kind === "follow" || (!product && !list) ? (actor ? `/${actor.username}` : "/follows")
          : product && listSlug ? `/${profile.username}/${listSlug}/${product.slug}`
          : list ? `/${profile.username}/${list.slug}` : "/";
        return { id: n.id, actor: { name: actor?.name ?? "Someone", avatar: actor?.avatar }, message, time: ago(n.createdAt, now), read: n.read, href };
      })}
    />
  );
}
