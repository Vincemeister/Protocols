import { EmptyState, ListCard } from "@/components/ui";
import { getProfilePage } from "@/lib/data/public";
import { plural } from "@/lib/format";

// A1 · Lists tab: the creator's lists as a grid of square covers.
export default async function ListsTab({ params }: { params: Promise<{ username: string }> }) {
  const page = await getProfilePage((await params).username);
  if (!page) return null; // the layout has already answered with not-found
  if (!page.lists.length) {
    return <EmptyState icon="list" title="No lists yet" message={`${page.profile.name} hasn't published a list yet.`} />;
  }
  return (
    <div className="app-grid fv-rise">
      {page.lists.map((l) => (
        <ListCard
          key={l.id} size="sm" name={l.name} count={plural(l.productCount, "product")} cover={l.cover} href={l.href}
          creator={{ name: page.profile.username, avatar: page.profile.avatar }}
        />
      ))}
    </div>
  );
}
