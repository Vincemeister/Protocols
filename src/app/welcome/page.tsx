import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CreatorLoading } from "@/components/creator/CreatorScreen";
import { WelcomeForm } from "@/components/creator/WelcomeForm";
import { suggestUsername } from "@/lib/creator/slug";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Welcome" };

// B5, first step: name and username. Everyone lands here once, straight after
// their first sign-in; the creator screens send people here until it is done.
export default function WelcomePage() {
  // The session is request data, so the part that reads it streams in behind Suspense.
  return (
    <Suspense fallback={<CreatorLoading title="Welcome" />}>
      <Welcome />
    </Suspense>
  );
}

async function Welcome() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (viewer.profile) redirect(`/${viewer.profile.username}`);
  const host = ((await headers()).get("x-forwarded-host") ?? (await headers()).get("host") ?? "favolist").replace(/^www\./, "");
  return <WelcomeForm suggestedUsername={suggestUsername(viewer.email ?? "")} host={host} />;
}
