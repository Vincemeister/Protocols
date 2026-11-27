import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Screen } from "@/components/me/Screen";
import { ProfileSettingsForm } from "@/components/me/SettingsForms";
import { requireCreator } from "@/lib/creator/session";
import { getMyProfile } from "@/lib/me/data";

export const metadata: Metadata = { title: "Profile settings" };

type Props = { searchParams: Promise<{ saved?: string }> };

// C14 Settings — profile.
export default function ProfileSettingsPage({ searchParams }: Props) {
  return (
    <Screen title="Profile" backHref="/settings" current="Profile">
      <ProfileSettings searchParams={searchParams} />
    </Screen>
  );
}

async function ProfileSettings({ searchParams }: Props) {
  const { db } = await requireCreator();
  const [profile, h, { saved }] = await Promise.all([getMyProfile(db), headers(), searchParams]);
  if (!profile) redirect("/welcome");
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "favolist").replace(/^www\./, "");
  return <ProfileSettingsForm profile={profile} host={host} saved={saved === "1"} />;
}
