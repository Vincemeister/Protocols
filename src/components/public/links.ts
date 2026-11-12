import type { IconName, ProfileLink } from "@/components/ui";

const ICONS: Record<string, IconName> = { youtube: "youtube", instagram: "instagram", website: "globe" };

/** A creator's links for the profile header: short labels on a phone ("@vince"), the address on desktop ("youtube.com/@vince"). */
export function profileLinks(links: { kind: string; url: string }[], short: boolean): ProfileLink[] {
  return links.slice(0, 4).map((l) => {
    let label = l.url;
    try {
      const u = new URL(l.url);
      const host = u.hostname.replace(/^www\./, "");
      const path = u.pathname.replace(/\/$/, "");
      const handle = path.split("/").filter(Boolean).pop();
      label = short && (l.kind === "youtube" || l.kind === "instagram") && handle ? `@${handle.replace(/^@/, "")}` : `${host}${short ? "" : path}`;
    } catch {
      // not an address: show it as written
    }
    return { href: l.url, label, icon: ICONS[l.kind] ?? "link" };
  });
}
