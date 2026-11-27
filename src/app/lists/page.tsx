import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreatorLoading, CreatorScreen } from "@/components/creator/CreatorScreen";
import { Badge, Button, EmptyState, Icon } from "@/components/ui";
import { getMyLists } from "@/lib/creator/data";
import { requireCreator } from "@/lib/creator/session";

export const metadata: Metadata = { title: "Your lists" };

// Every list of the creator's, drafts included: the way back to a list that
// is not on the profile yet. (C2, the full "own profile", comes in phase 4.)
export default function ListsPage() {
  return (
    <Suspense fallback={<CreatorLoading title="Your lists" />}>
      <Lists />
    </Suspense>
  );
}

async function Lists() {
  const { profile, db } = await requireCreator();
  const lists = await getMyLists(db, profile.id);
  return (
    <CreatorScreen title="Your lists" backHref={`/${profile.username}`} close>
      {lists.length ? (
        <div>
          {lists.map((l) => (
            <Link key={l.id} href={`/lists/${l.id}/edit`} className="creator-item creator-recent">
              <div className="creator-item-text">
                <div className="body" style={{ fontWeight: 600 }}>{l.name}</div>
                <div className="caption creator-muted">{l.numbered ? "Numbered" : "In your order"}</div>
              </div>
              {l.isPublic ? null : <Badge label="Draft" />}
              <Icon name="chevron-right" />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon="list" title="No lists yet" message="A list is where your products live: one per theme, trip or setup." />
      )}
      <div className="creator-foot">
        <Button variant="primary" size="lg" block icon="plus" href="/lists/new" label="New list" />
      </div>
    </CreatorScreen>
  );
}
