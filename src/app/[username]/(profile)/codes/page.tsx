import { notFound } from "next/navigation";
import { ProductFeed } from "@/components/public/ProductFeed";
import { getProfilePage } from "@/lib/data/public";

// A1 · Codes tab: the Products tab filtered to items with a referral code.
// Same cards, the review still the loudest element; no deal badges, no sorting by discount.
export default async function CodesTab({ params }: { params: Promise<{ username: string }> }) {
  const page = await getProfilePage((await params).username);
  if (!page) return null;
  if (!page.codes.length) notFound(); // the tab only exists for creators with a code
  return <ProductFeed products={page.codes} profile={page.profile} as="profile" />;
}
