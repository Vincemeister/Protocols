import { ProductFeed } from "@/components/public/ProductFeed";
import { EmptyState } from "@/components/ui";
import { getProfilePage } from "@/lib/data/public";

// A1 · Products tab: every reviewed product, newest first.
export default async function ProductsTab({ params }: { params: Promise<{ username: string }> }) {
  const page = await getProfilePage((await params).username);
  if (!page) return null;
  if (!page.products.length) {
    return <EmptyState icon="image" title="No products yet" message="Products show up here once they have a review." />;
  }
  return <ProductFeed products={page.products} profile={page.profile} as="profile" />;
}
