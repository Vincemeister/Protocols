import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductWall } from "@/components/auth/ProductWall";
import { ResendLink } from "@/components/auth/ResendLink";
import { Button, Icon, Mark } from "@/components/ui";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: "Check your email" };

// B2 Check your email: the confirmation state of sign-in.
export default function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  return (
    <div className="wall-screen">
      <ProductWall />
      <main className="wall-card">
        <div className="wall-brand">
          <span className="fv-mark-box"><Mark /></span>
          <span className="heading-3">{APP_NAME}</span>
        </div>
        <Suspense fallback={<Message email="" />}>
          <MessageFor searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function MessageFor({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return <Message email={email} />;
}

function Message({ email }: { email: string }) {
  return (
    <>
      <div className="wall-stack">
        <Icon name="mail" />
        <h1 className="heading-4 wall-title">Check your email</h1>
        <p className="body">
          We sent a sign-in link to <b style={{ fontWeight: 600 }}>{email || "your address"}</b>. Open it on this phone and you&apos;re in.
        </p>
        <p className="caption wall-muted">The link works for 15 minutes. Not there? Check spam, or try again below.</p>
      </div>
      <div className="wall-actions">
        <Button variant="tertiary" size="lg" href="/sign-in" label="Use another email" />
        {email ? <ResendLink email={email} /> : null}
      </div>
    </>
  );
}
