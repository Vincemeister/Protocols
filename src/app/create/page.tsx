import type { Metadata } from "next";
import { Suspense } from "react";
import { AddProduct } from "@/components/creator/AddProduct";
import { CreatorLoading } from "@/components/creator/CreatorScreen";
import { getMyLists, getRecentProducts } from "@/lib/creator/data";
import { requireCreator } from "@/lib/creator/session";
import { ago } from "@/lib/format";

export const metadata: Metadata = { title: "Add a product" };

type Props = { searchParams: Promise<{ list?: string; url?: string; text?: string }> };

// C4 Add a product: paste a link (or skip it), then C5 the details.
export default function CreatePage(props: Props) {
  return (
    <Suspense fallback={<CreatorLoading title="Add a product" />}>
      <Create {...props} />
    </Suspense>
  );
}

async function Create({ searchParams }: Props) {
  const { list, url, text } = await searchParams;
  const { profile, db } = await requireCreator();
  const [lists, recent] = await Promise.all([getMyLists(db, profile.id), getRecentProducts(db, profile.id)]);
  const now = new Date();
  // A page shared to the app arrives as ?url=… or, from some apps, as a link inside ?text=….
  const shared = url ?? text?.match(/https?:\/\/\S+/)?.[0] ?? "";
  return (
    <AddProduct
      lists={lists} listId={lists.some((l) => l.id === list) ? list : undefined} initialUrl={shared.slice(0, 2000)}
      recent={recent.map((p) => ({ id: p.id, name: p.name, image: p.image, meta: [p.listName, ago(p.createdAt, now)].filter(Boolean).join(" · ") }))}
      closeHref={`/${profile.username}`}
    />
  );
}
