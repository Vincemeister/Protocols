import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CreatorLoading, CreatorScreen } from "@/components/creator/CreatorScreen";
import { DetailsForm } from "@/components/creator/DetailsForm";
import { getMyLists, getMyProduct } from "@/lib/creator/data";
import { requireCreator } from "@/lib/creator/session";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ product: string }> };

// C7 Edit product: the details form (C5) for a product that exists; its review (C6) is the next step.
export default function EditProductPage(props: Props) {
  return (
    <Suspense fallback={<CreatorLoading title="Check the details" />}>
      <EditProduct {...props} />
    </Suspense>
  );
}

async function EditProduct({ params }: Props) {
  const { product: id } = await params;
  const { profile, db } = await requireCreator();
  const [product, lists] = await Promise.all([getMyProduct(db, profile.id, id), getMyLists(db, profile.id)]);
  if (!product) notFound();
  const back = product.review?.published ? `/${profile.username}/${product.list.slug}/${product.slug}` : `/lists/${product.list.id}/edit`;
  return (
    <CreatorScreen title="Check the details" step="2 of 3" backHref={back} close>
      <DetailsForm
        lists={lists}
        values={{ id: product.id, name: product.name, brand: product.brand, listId: product.list.id, code: product.code, benefit: product.benefit, image: product.image, sourceUrl: product.sourceUrl }}
      />
    </CreatorScreen>
  );
}
