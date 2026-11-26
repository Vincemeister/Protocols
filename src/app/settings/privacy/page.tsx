import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Screen } from "@/components/me/Screen";
import { PrivacySettings } from "@/components/me/SettingsForms";
import { requireCreator } from "@/lib/creator/session";
import { getMyProfile } from "@/lib/me/data";

export const metadata: Metadata = { title: "Privacy settings" };

// C16 Settings — privacy.
export default function PrivacySettingsPage() {
  return (
    <Screen title="Privacy" backHref="/settings" current="Profile">
      <Privacy />
    </Screen>
  );
}

async function Privacy() {
  const { db } = await requireCreator();
  const profile = await getMyProfile(db);
  if (!profile) redirect("/welcome");
  return <PrivacySettings isPublic={profile.isPublic} />;
}
