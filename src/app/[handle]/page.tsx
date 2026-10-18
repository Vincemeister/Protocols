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
        <Link href="/" className="hover:text-primary">
          Made with {APP_NAME}
        </Link>
      </footer>
    </main>
  );
}

// Layout follows the Figma "User profile" frame; the styling of each part
// follows `_user_card.scss` (.user-card-show-page, .intro, .about-text).
async function ProfileContent({ params }: Pick<PageProps<"/[handle]">, "params">) {
  const { handle } = await params;
  const profile = await getProfile(handle);
  if (!profile) notFound();

  return (
    <>
      <header className="flex flex-col items-center gap-4 border-b border-neutral-100 py-6 text-center">
        <Avatar src={profile.avatarUrl} name={profile.name} size="xl" priority />
        <h1 className="text-h5 font-medium md:text-h5-lg">{profile.name}</h1>
        {profile.bio && <p className="max-w-sm text-p-s text-neutral-700">{profile.bio}</p>}
      </header>

      {profile.about && (
        <section aria-labelledby="about-heading" className="border-b border-neutral-100 px-4 py-8 text-center">
          <h2 id="about-heading" className="text-h6 font-medium md:text-h6-lg">
            About
          </h2>
          <p className="prose-creator mt-3 text-p-m">{profile.about}</p>
        </section>
      )}

      <div className="border-b border-neutral-100 py-6">
        <SocialLinks links={profile.socialLinks} />
      </div>

      <section aria-labelledby="lists-heading" className="mt-6">
        {/* `.overline` + `.custom-nav-link-count`: the old profile's tab label */}
        <h2 id="lists-heading" className="mb-4 text-overline text-neutral-700">
          <span className="font-semibold text-primary-500">{profile.lists.length}</span>{" "}
          {profile.lists.length === 1 ? "List" : "Lists"}
        </h2>

        {profile.lists.length === 0 ? (
          <p className="bg-neutral-50 p-6 text-center text-p-s text-neutral-500">
            No published lists yet.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
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
      <div className="flex flex-col items-center gap-4 border-b border-neutral-100 py-6">
        <div className="size-[72px] rounded-full bg-neutral-100" />
        <div className="h-6 w-28 rounded-ui bg-neutral-100" />
        <div className="h-4 w-56 rounded-ui bg-neutral-50" />
      </div>
      <div className="border-b border-neutral-100 px-4 py-8">
        <div className="mx-auto h-5 w-16 rounded-ui bg-neutral-100" />
        <div className="mx-auto mt-3 h-20 max-w-sm rounded-ui bg-neutral-50" />
      </div>
      <div className="flex justify-center gap-2 border-b border-neutral-100 py-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="size-10 rounded-ui bg-neutral-50" />
        ))}
      </div>
      <div className="mt-6 h-4 w-14 rounded-ui bg-neutral-100" />
      <div className="mt-4 aspect-square w-full bg-neutral-50" />
    </div>
  );
}
