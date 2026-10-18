import Link from "next/link";
import { APP_NAME } from "@/lib/config";

// Placeholder until the Landing screen is built (spec: one sentence, three
// example profiles, sign-in).
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[550px] flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-h3">{APP_NAME}</h1>
      <p className="mt-3 text-p-m text-neutral-700">
        The tools, products and routines trusted people actually use, with a note on every one.
      </p>
      <Link
        href="/tim"
        className="mt-8 rounded-lg bg-primary-500 px-5 py-2.5 text-p-m font-medium text-white hover:bg-primary-600"
      >
        See an example profile
      </Link>
    </main>
  );
}
