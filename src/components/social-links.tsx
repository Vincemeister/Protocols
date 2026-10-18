import { siInstagram, siTiktok, siX, siYoutube } from "simple-icons";
import type { SocialLink, SocialPlatform } from "@/lib/types";

const LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  tiktok: "TikTok",
  podcast: "Podcast",
  newsletter: "Newsletter",
  website: "Website",
};

function BrandIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

function LineIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "instagram":
      return <BrandIcon path={siInstagram.path} />;
    case "youtube":
      return <BrandIcon path={siYoutube.path} />;
    case "x":
      return <BrandIcon path={siX.path} />;
    case "tiktok":
      return <BrandIcon path={siTiktok.path} />;
    case "podcast":
      return (
        <LineIcon>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
        </LineIcon>
      );
    case "newsletter":
      return (
        <LineIcon>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 6 10-6" />
        </LineIcon>
      );
    default:
      return (
        <LineIcon>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </LineIcon>
      );
  }
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {links.map((link) => (
        <li key={link.platform + link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={LABELS[link.platform as SocialPlatform] ?? link.platform}
            className="grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <PlatformIcon platform={link.platform} />
          </a>
        </li>
      ))}
    </ul>
  );
}
