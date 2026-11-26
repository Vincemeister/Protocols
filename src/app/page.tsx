import { Suspense } from "react";
import { Button, Mark, UserCard } from "@/components/ui";
import { getCreators } from "@/lib/data/public";
import { plural } from "@/lib/format";
import { signOut } from "@/lib/auth/actions";
import { APP_NAME } from "@/lib/config";
import { getViewer } from "@/lib/viewer";

// Placeholder home until phase 4 (the signed-in feed, C1) and phase 5 (the
// landing page, A8). It shows the brand and whether you are signed in.
export default async function Home() {
  const creators = await getCreators();
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "var(--space-6)", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ width: 32, height: 32, display: "block" }} className="fv-mark-box"><Mark /></span>
        <span className="heading-3">{APP_NAME}</span>
      </div>
      <p className="body" style={{ margin: 0, color: "var(--ink-muted)", maxWidth: 360 }}>
        The products people actually use, reviewed in their own words.
      </p>
      {/* The session lives in a cookie, so this part renders per request and streams in. */}
      <Suspense fallback={<Button variant="primary" size="lg" href="/sign-in" label="Sign in" />}>
        <Session />
      </Suspense>
      {creators.length ? (
        <section style={{ width: "100%", maxWidth: 400, textAlign: "left", paddingTop: "var(--space-8)" }}>
          <h2 className="fv-overline">Creators</h2>
          {creators.map((c) => (
            <UserCard key={c.id} name={c.name} handle={`@${c.username}`} meta={plural(c.followers, "follower")} avatar={c.avatar} href={`/${c.username}`} action={false} lined />
          ))}
        </section>
      ) : null}
    </main>
  );
}

async function Session() {
  const viewer = await getViewer();
  if (!viewer) return <Button variant="primary" size="lg" href="/sign-in" label="Sign in" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
      {viewer.profile ? (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button variant="primary" size="lg" icon="plus" href="/create" label="Add a product" />
          <Button variant="tertiary" size="lg" href={`/${viewer.profile.username}`} label="Your page" />
        </div>
      ) : (
        <Button variant="primary" size="lg" href="/welcome" label="Set up your page" />
      )}
      <form action={signOut} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
        <p className="caption" style={{ margin: 0, color: "var(--ink-muted)" }}>Signed in as {viewer.email}</p>
        <Button type="submit" variant="link" size="sm" label="Sign out" />
      </form>
    </div>
  );
}
