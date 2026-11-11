import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductWall } from "@/components/auth/ProductWall";
import { SignInForm } from "@/components/auth/SignInForm";
import { Button, Mark } from "@/components/ui";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, string> = {
  link: "That link has expired or was already used. Ask for a new one.",
  google: "Google sign-in didn't go through. Try again, or use your email.",
  "not-connected": "Sign-in isn't connected yet: add the Supabase values to .env.local.",
};

// B1 Sign up / sign in, on the product wall.
export default function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div className="wall-screen">
      <ProductWall />
      <main className="wall-card">
        <div className="wall-mobile">
          <div className="wall-brand">
            <span className="fv-mark-box"><Mark /></span>
            <span className="heading-3">{APP_NAME}</span>
          </div>
        </div>
        <h1 className="heading-3 wall-title wall-desktop">Sign in or create your {APP_NAME}</h1>
        <p className="body wall-muted">The products people actually use, reviewed in their own words.</p>
        {/* searchParams is request data, so the part that reads it streams in behind Suspense. */}
        <Suspense fallback={<SignInForm />}>
          <FormWithNotice searchParams={searchParams} />
        </Suspense>
        <div className="wall-foot wall-mobile">
          <Button variant="link" size="sm" href="/" label="Just browsing? Explore creators" />
        </div>
      </main>
    </div>
  );
}

async function FormWithNotice({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <SignInForm notice={error ? NOTICES[error] : undefined} />;
}
