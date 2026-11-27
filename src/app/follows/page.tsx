import type { Metadata } from "next";
import { FollowsScreen } from "@/components/me/FollowsScreen";

export const metadata: Metadata = { title: "Followers" };

export default function FollowersPage() {
  return <FollowsScreen tab="followers" />;
}
