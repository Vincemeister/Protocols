import Link from "next/link";
import { APP_NAME } from "@/lib/config";

// Placeholder until the Landing screen is built (spec: one sentence, three
// example profiles, sign-in).
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[550px] flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-h3 font-bold md:text-h3-lg">{APP_NAME}</h1>
      <p className="prose-creator mt-3 text-p-m">
        The tools, products and routines trusted people actually use, with a note on every one.
      </p>
      {/* `.button.button-primary` from the old code */}
      <Link
        href="/tim"
        className="mt-8 rounded-ui bg-primary px-5 py-3 text-button text-white hover:bg-primary-hover"
      >
        See an example profile
      </Link>
    </main>
  );
}
