import type { Metadata } from "next";
import { Suspense } from "react";
import { CreatorLoading } from "@/components/creator/CreatorScreen";
import { ListForm } from "@/components/creator/ListForm";
import { requireCreator } from "@/lib/creator/session";

export const metadata: Metadata = { title: "New list" };

// C3 New list.
export default function NewListPage() {
  return (
    <Suspense fallback={<CreatorLoading title="New list" />}>
      <NewList />
    </Suspense>
  );
}

async function NewList() {
  const { profile } = await requireCreator();
  return <ListForm closeHref={`/${profile.username}`} />;
}
