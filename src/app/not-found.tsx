import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[550px] flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-h4">Nothing here</h1>
      <p className="mt-2 text-p-m text-neutral-700">
        This page doesn&apos;t exist, or it hasn&apos;t been published yet.
      </p>
      <Link href="/" className="mt-6 text-p-m font-medium text-primary-500 hover:text-primary-600">
        Go home
      </Link>
    </main>
  );
}
