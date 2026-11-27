import type { Metadata } from "next";
import { Screen } from "@/components/me/Screen";
import { AccountSettings } from "@/components/me/SettingsForms";
import { requireViewer } from "@/lib/creator/session";

export const metadata: Metadata = { title: "Account settings" };

// C15 Settings — account. No passwords exist, so this is the sign-in email and the way out.
export default function AccountSettingsPage() {
  return (
    <Screen title="Account" backHref="/settings" current="Profile">
      <Account />
    </Screen>
  );
}

async function Account() {
  const viewer = await requireViewer();
  return <AccountSettings email={viewer.email ?? ""} username={viewer.profile.username} />;
}
