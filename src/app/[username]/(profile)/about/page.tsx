import { profileLinks } from "@/components/public/links";
import { Icon } from "@/components/ui";
import { getProfilePage } from "@/lib/data/public";

// A1 · About tab: the creator's longer introduction and their links.
export default async function AboutTab({ params }: { params: Promise<{ username: string }> }) {
  const page = await getProfilePage((await params).username);
  if (!page) return null;
  const { profile } = page;
  return (
    <div className="app-pad app-stack">
      <p className="body-lg app-about">{profile.about || profile.bio || `${profile.name} hasn't written an introduction yet.`}</p>
      {profile.links.length ? (
        <div className="fv-profile-links" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          {profileLinks(profile.links, false).map((l) => (
            <a key={l.href} className="fv-profile-link" href={l.href} target="_blank" rel="noopener">
              <Icon name={l.icon ?? "link"} size="sm" />
              {l.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
