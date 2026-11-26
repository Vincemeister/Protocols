import type { Metadata } from "next";
import { FollowsScreen } from "@/components/me/FollowsScreen";

export const metadata: Metadata = { title: "Following" };

export default function FollowingPage() {
  return <FollowsScreen tab="following" />;
}
