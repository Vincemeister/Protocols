import Link from "next/link";
import { Icon, type IconName } from "@/components/ui";
import { signOut } from "@/lib/auth/actions";
import "./me.css";

const ROWS: { href: string; icon: IconName; label: string; hint: string }[] = [
  { href: "/settings/profile", icon: "user", label: "Profile", hint: "Name, username, photo, links" },
  { href: "/settings/account", icon: "mail", label: "Account", hint: "Sign-in email, delete account" },
  { href: "/settings/privacy", icon: "info", label: "Privacy", hint: "Who can see your page" },
  { href: "/settings/theme", icon: "settings", label: "Theme", hint: "Light, dark or like your device" },
  { href: "/lists", icon: "list", label: "Your lists", hint: "Every list, drafts included" },
  { href: "/referrals", icon: "link", label: "Referral codes", hint: "The codes on your products" },
  { href: "/follows", icon: "heart", label: "Followers", hint: "Who follows you, who you follow" },
];

/** C13: the settings menu, and the way out. */
export function SettingsMenu({ email }: { email?: string }) {
  return (
    <nav className="me-menu" aria-label="Settings">
      {ROWS.map((row) => (
        <Link key={row.href} href={row.href}>
          <Icon name={row.icon} />
          <span className="me-menu-text body">
            {row.label}
            <small className="caption">{row.hint}</small>
          </span>
          <Icon name="chevron-right" />
        </Link>
      ))}
      <form action={signOut}>
        <button type="submit">
          <Icon name="log-out" />
          <span className="me-menu-text body">
            Sign out
            {email ? <small className="caption">{email}</small> : null}
          </span>
        </button>
      </form>
    </nav>
  );
}
