import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CreatorLoading } from "@/components/creator/CreatorScreen";
import { ReviewForm } from "@/components/creator/ReviewForm";
import { getMyProduct } from "@/lib/creator/data";
import { requireCreator } from "@/lib/creator/session";
import { canTranscribe } from "@/lib/voice/transcribe";

export const metadata: Metadata = { title: "Your review" };

type Props = { params: Promise<{ product: string }> };

// C6 Your review: the step that publishes the product.
export default function ReviewPage(props: Props) {
  return (
    <Suspense fallback={<CreatorLoading title="Your review" />}>
      <Review {...props} />
    </Suspense>
  );
}

async function Review({ params }: Props) {
  const { product: id } = await params;
  const { profile, db } = await requireCreator();
  const product = await getMyProduct(db, profile.id, id);
  if (!product) notFound();
  return (
    <ReviewForm
      product={{ id: product.id, name: product.name, brand: product.brand || undefined, image: product.image, listName: product.list.name }}
      review={product.review} serverTranscribes={canTranscribe()} backHref={`/create/${product.id}`}
    />
  );
}
