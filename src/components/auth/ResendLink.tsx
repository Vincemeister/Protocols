"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { sendLink, type SignInState } from "@/lib/auth/actions";

/** B2 "Resend link": asks for a fresh magic link for the same address. */
export function ResendLink({ email }: { email: string }) {
  const [state, submit, pending] = useActionState<SignInState, FormData>(sendLink, {});
  return (
    <form action={submit}>
      <input type="hidden" name="email" value={email} />
      <Button type="submit" variant="secondary" size="lg" disabled={pending} label={pending ? "Sending…" : "Resend link"} />
      {state.error ? <span className="fv-visually-hidden" role="alert">{state.error}</span> : null}
    </form>
  );
}
