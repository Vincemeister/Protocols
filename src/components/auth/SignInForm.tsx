"use client";

import { useActionState } from "react";
import { Button, TextField } from "@/components/ui";
import { continueWithGoogle, sendLink, type SignInState } from "@/lib/auth/actions";

/** B1: Google, or an email address for a magic link. One form for new and returning people; no passwords. */
export function SignInForm({ notice }: { notice?: string }) {
  // useActionState runs the server action on submit and hands back its result
  // (here: an error to show under the field) plus a pending flag.
  const [state, submit, pending] = useActionState<SignInState, FormData>(sendLink, {});
  return (
    <>
      <form action={continueWithGoogle}>
        <Button type="submit" variant="tertiary" size="lg" block label="Continue with Google" />
      </form>
      <div className="wall-or caption">OR</div>
      <form action={submit}>
        <TextField
          id="email" name="email" type="email" label="Email" placeholder="you@example.com"
          autocomplete="email" required error={state.error ?? notice}
        />
        <Button type="submit" variant="primary" size="lg" block disabled={pending} label={pending ? "Sending…" : "Send me a link"} />
      </form>
      <p className="caption wall-muted">No passwords. We&apos;ll email you a link that signs you in, new or returning.</p>
    </>
  );
}
