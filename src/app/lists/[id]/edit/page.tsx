import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CreatorLoading } from "@/components/creator/CreatorScreen";
import { ListForm } from "@/components/creator/ListForm";
import { getMyList } from "@/lib/creator/data";
import { requireCreator } from "@/lib/creator/session";
import { canTranscribe } from "@/lib/voice/transcribe";

export const metadata: Metadata = { title: "Edit list" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

// C3 Edit list, with C8 (reorder) on the same screen.
export default function EditListPage(props: Props) {
  return (
    <Suspense fallback={<CreatorLoading title="Edit list" />}>
      <EditList {...props} />
    </Suspense>
  );
}

async function EditList({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const { profile, db } = await requireCreator();
  const found = /^[0-9a-f-]{36}$/i.test(id) ? await getMyList(db, profile.id, id) : null;
  if (!found) notFound();
  const { list, products } = found;
  // The list has a public page only when it is shown and something in it has a review.
  const visible = list.isPublic && products.some((p) => p.reviewed);
  return (
    <ListForm
      // A new key after each save makes the form start again from the saved values.
      key={saved ?? "edit"}
      list={list} products={products} saved={saved === "1"} serverTranscribes={canTranscribe()}
      closeHref={visible ? `/${profile.username}/${list.slug}` : `/${profile.username}`}
      viewHref={visible ? `/${profile.username}/${list.slug}` : undefined}
    />
  );
}
