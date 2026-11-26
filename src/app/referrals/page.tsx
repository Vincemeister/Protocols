import type { Metadata } from "next";
import { ReferralList } from "@/components/me/ReferralList";
import { Screen } from "@/components/me/Screen";
import { requireCreator } from "@/lib/creator/session";
import { getMyReferrals } from "@/lib/me/data";

export const metadata: Metadata = { title: "Referral codes" };

// C10 Referrals: the codes across all of the creator's products. (Viewers see them as the Codes tab.)
export default function ReferralsPage() {
  return (
    <Screen title="Referral codes" backHref="/settings">
      <Referrals />
    </Screen>
  );
}

async function Referrals() {
  const { profile, db } = await requireCreator();
  return <ReferralList items={await getMyReferrals(db, profile.id)} />;
}
