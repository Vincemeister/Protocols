import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/avatar";
import { ListCard } from "@/components/list-card";
import { SocialLinks } from "@/components/social-links";
import { APP_NAME } from "@/lib/config";
import { getProfile } from "@/lib/data/profiles";

export async function generateMetadata({ params }: PageProps<"/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfile(handle);
  if (!profile) return { title: APP_NAME };

  const title = `${profile.name} (@${profile.handle}) · ${APP_NAME}`;
  const description = profile.bio ?? `${profile.name}'s lists on ${APP_NAME}`;
  return {
    title,
    description,
    // /Tim and /tim both resolve; tell crawlers which one is the page.
    alternates: { canonical: `/${profile.handle}` },
    openGraph: { title, description, type: "profile" },
  };
}

// The page itself never awaits `params`. It hands the promise to
// <ProfileContent> inside <Suspense>, so Next can prerender a static shell
// for any handle and stream the profile in (Cache Components pattern).
export default function ProfilePage({ params }: PageProps<"/[handle]">) {
  return (
    <main className="mx-auto w-full max-w-[550px] px-4 pb-16">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent params={params} />
      </Suspense>
      <footer className="mt-16 text-center text-p-xs text-neutral-500">
        <Link href="/" className="hover:text-primary-500">
          Made with {APP_NAME}
        </Link>
      </footer>
    </main>
  );
}

async function ProfileContent({ params }: Pick<PageProps<"/[handle]">, "params">) {
  const { handle } = await params;
  const profile = await getProfile(handle);
  if (!profile) notFound();

  return (
    <>
      <header className="flex flex-col items-center pt-10 pb-8 text-center">
        <Avatar src={profile.avatarUrl} name={profile.name} size="hero" priority />
        <h1 className="mt-4 text-h4 text-neutral-900">{profile.name}</h1>
        {profile.bio && <p className="mt-1 max-w-sm text-p-m text-neutral-700">{profile.bio}</p>}
      </header>

      {/* Spec order: bio, about, then social links. */}
      {profile.about && (
        <section aria-labelledby="about-heading" className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
          <h2 id="about-heading" className="text-h6 text-neutral-900">
            About
          </h2>
          <p className="mt-2 text-p-m text-neutral-700">{profile.about}</p>
        </section>
      )}

      <div className="mt-6">
        <SocialLinks links={profile.socialLinks} />
      </div>

      <section aria-labelledby="lists-heading" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="lists-heading" className="text-h5 text-neutral-900">
            Lists
          </h2>
          <span className="text-p-s text-neutral-500">
            {profile.lists.length} {profile.lists.length === 1 ? "list" : "lists"}
          </span>
        </div>

        {profile.lists.length === 0 ? (
          <p className="rounded-2xl bg-neutral-100 p-6 text-center text-p-s text-neutral-500">
            No published lists yet.
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {profile.lists.map((list, i) => (
              <ListCard key={list.slug} handle={profile.handle} list={list} priority={i === 0} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="flex flex-col items-center pt-10 pb-8">
        <div className="size-24 rounded-full bg-neutral-200" />
        <div className="mt-4 h-7 w-32 rounded bg-neutral-200" />
        <div className="mt-2 h-5 w-64 rounded bg-neutral-100" />
      </div>
      <div className="h-32 rounded-2xl bg-neutral-100" />
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="size-10 rounded-full bg-neutral-100" />
        ))}
      </div>
      <div className="mt-10 aspect-square w-full bg-neutral-100" />
    </div>
  );
}
