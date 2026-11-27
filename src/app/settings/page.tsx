import type { Metadata } from "next";
import { Screen } from "@/components/me/Screen";
import { SettingsMenu } from "@/components/me/SettingsMenu";
import { requireViewer } from "@/lib/creator/session";

export const metadata: Metadata = { title: "Settings" };

// C13 Settings home: a menu. (On desktop it is the same menu in the column;
// a left sub-navigation would only repeat it.)
export default function SettingsPage() {
  return (
    <Screen title="Settings" current="Profile">
      <Menu />
    </Screen>
  );
}

async function Menu() {
  const viewer = await requireViewer();
  return <SettingsMenu email={viewer.email} />;
}
