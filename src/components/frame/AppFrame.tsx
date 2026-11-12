import type { ReactNode } from "react";
import { LiveUserCard } from "@/components/social/controls";
import { BottomBar, Button, ListCard, SideNav, UserCard, type SideNavItem } from "@/components/ui";
import { getSuggestions } from "@/lib/data/public";
import { plural } from "@/lib/format";
import type { Viewer } from "@/lib/viewer";
import { ForViewer } from "./ForViewer";
import "./frame.css";

// Home, Search, Create, Saved and Notifications are built in phase 4. Until
// then they lead to the home page for someone signed in and to sign-in for a visitor.
function nav(viewer: Viewer | null): SideNavItem[] {
  const soon = viewer ? "/" : "/sign-in";
  return [
    { label: "Home", icon: "home", href: "/" },
    { label: "Search", icon: "search", href: soon },
    { label: "Create", icon: "plus-square", href: soon },
    { label: "Saved", icon: "bookmark", href: soon },
    { label: "Notifications", icon: "bell", href: soon },
    { label: "Profile", icon: "user", href: viewer?.profile ? `/${viewer.profile.username}` : soon },
  ];
}

/** The frame every signed-in-or-not public page sits in. `except` keeps the creator being viewed out of the suggestions. */
export function AppFrame({ children, except }: { children: ReactNode; except?: string }) {
  return (
    <>
      <div className="app-frame">
        <div className="app-rail">
          <ForViewer>
            {(viewer) => (
              <SideNav
                items={nav(viewer)}
                user={viewer?.profile ? { name: viewer.profile.name, handle: `@${viewer.profile.username}`, avatar: viewer.profile.avatar } : undefined}
              />
            )}
          </ForViewer>
        </div>
        <main className="app-main">
          <div className="app-column">{children}</div>
        </main>
        <div className="app-aside">
          <Suggestions except={except} />
        </div>
      </div>
      <div className="app-bottom">
        <ForViewer>
          {(viewer) =>
            viewer ? (
              <BottomBar items={nav(viewer).filter((i) => i.label !== "Notifications").map((i) => ({ icon: i.icon, label: i.label, href: i.href }))} />
            ) : (
              <div className="visitor-bar">
                <p className="body-sm">Keep your own list of what you actually use.</p>
                <Button variant="secondary" size="sm" href="/sign-in" label="Create yours" />
              </div>
            )
          }
        </ForViewer>
      </div>
    </>
  );
}

/** The right-hand rail: the viewer, suggested lists, suggested profiles. Same markup as the AsideRail component, with Follow wired up. */
async function Suggestions({ except }: { except?: string }) {
  const { lists, people } = await getSuggestions(except);
  return (
    <aside className="fv-aside" aria-label="Suggestions">
      <ForViewer>
        {(viewer) =>
          viewer?.profile ? (
            <UserCard name={viewer.profile.name} handle={`@${viewer.profile.username}`} avatar={viewer.profile.avatar} size={48} action={false} />
          ) : null
        }
      </ForViewer>
      {lists.length ? (
        <section className="fv-aside-section">
          <h2 className="fv-overline">Suggested lists</h2>
          <div className="fv-aside-grid">
            {lists.map(({ list, creator }) => (
              <ListCard
                key={list.id} size="sm" name={list.name} count={plural(list.productCount, "product")} cover={list.cover}
                creator={{ name: creator.username, avatar: creator.avatar }} href={list.href}
              />
            ))}
          </div>
        </section>
      ) : null}
      {people.length ? (
        <section className="fv-aside-section">
          <h2 className="fv-overline">Suggested profiles</h2>
          <ForViewer>
            {(viewer) =>
              people.map((p) => (
                <LiveUserCard
                  key={p.id} profileId={p.id} name={p.name} handle={`@${p.username}`} avatar={p.avatar} size={40}
                  href={`/${p.username}`} following={viewer?.following.has(p.id)} action={viewer?.profile?.id !== p.id}
                />
              ))
            }
          </ForViewer>
        </section>
      ) : null}
    </aside>
  );
}
