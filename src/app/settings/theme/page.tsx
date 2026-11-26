import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Screen } from "@/components/me/Screen";
import { ThemeSettings } from "@/components/me/SettingsForms";
import { requireCreator } from "@/lib/creator/session";
import { getMyProfile } from "@/lib/me/data";

export const metadata: Metadata = { title: "Theme" };

// Settings — theme (brief, section 2: default from the device, the user's choice in settings).
export default function ThemeSettingsPage() {
  return (
    <Screen title="Theme" backHref="/settings" current="Profile">
      <ThemeChoice />
    </Screen>
  );
}

async function ThemeChoice() {
  const { db } = await requireCreator();
  const profile = await getMyProfile(db);
  if (!profile) redirect("/welcome");
  return <ThemeSettings stored={profile.theme} />;
}
