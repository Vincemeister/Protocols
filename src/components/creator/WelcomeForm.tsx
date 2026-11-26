"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useEffect, useRef, useState } from "react";
import { Alert, Button, Icon, TextField, TopBar } from "@/components/ui";
import { checkUsername, createProfile, type FormState } from "@/lib/creator/actions";
import { USERNAME_PATTERN } from "@/lib/creator/slug";
import "./creator.css";
import { useImageFile } from "./useImageFile";

interface WelcomeFormProps {
  /** A first guess from the email address; the person can change it. */
  suggestedUsername?: string;
  /** "favolist.com/" — the site's own address, shown before the username. */
  host: string;
}

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

/** B5, first step: name, username, photo, one line. It gives the person the profile every later screen needs. */
export function WelcomeForm({ suggestedUsername = "", host }: WelcomeFormProps) {
  const photo = useImageFile(800);
  const [username, setUsername] = useState(suggestedUsername);
  const [availability, setAvailability] = useState<Availability>("idle");
  // useActionState runs the server action on submit and hands back what it returned (the errors to show).
  const [state, submit, pending] = useActionState<FormState, FormData>(
    (prev, form) => {
      if (photo.picked) form.set("avatar_file", photo.picked.blob, "avatar.jpg");
      return createProfile(prev, form);
    },
    {},
  );

  // Ask the server whether the name is free, a moment after the typing stops.
  const latest = useRef(0);
  useEffect(() => {
    const candidate = username.trim().toLowerCase();
    const ticket = ++latest.current;
    const timer = setTimeout(async () => {
      if (!candidate) return setAvailability("idle");
      if (!USERNAME_PATTERN.test(candidate)) return setAvailability("invalid");
      setAvailability("checking");
      const answer = await checkUsername(candidate).catch(() => "idle" as const);
      if (ticket === latest.current) setAvailability(answer);
    }, 350);
    return () => clearTimeout(timer);
  }, [username]);

  const usernameError =
    state.fields?.username && availability !== "available" ? state.fields.username
    : availability === "taken" ? "That username is taken. Try another."
    : availability === "invalid" ? "3 to 30 characters: letters, numbers, dots and underscores."
    : undefined;

  return (
    <div className="creator-screen">
      <div className="creator-sheet">
        <TopBar brand trailing={<span className="caption creator-step" style={{ paddingRight: "var(--space-4)" }}>1 of 3</span>} />
        <main className="creator-main is-roomy" style={{ gap: "var(--space-5)" }}>
          <form action={submit}>
            <div className="creator-intro">
              <h1 className="heading-3" style={{ margin: 0, fontWeight: 700 }}>Welcome. Who are you?</h1>
              <p className="body-sm creator-muted">This is what people see at the top of your page. You can change all of it later.</p>
            </div>

            {state.error ? <Alert tone="danger" message={state.error} /> : null}

            <div className="creator-avatar">
              {photo.field}
              <button className={`fv-uploader${photo.picked ? " has-image" : ""}`} type="button" aria-label={photo.picked ? "Replace photo" : "Add a photo"} onClick={photo.open}>
                {photo.picked ? <img src={photo.picked.preview} alt="" /> : <><Icon name="upload" /><span>Photo</span></>}
              </button>
              <p className="caption creator-muted" style={{ flex: 1 }}>
                {photo.error ?? "A real photo of you, not a logo. It's the first trust signal on your page."}
              </p>
            </div>

            <TextField id="name" name="name" label="Your name" autocomplete="name" maxLength={60} hideCount required error={state.fields?.name} />

            <TextField
              id="username" name="username" label="Username" prefix={`${host}/`} value={username} onChange={setUsername}
              autocomplete="username" autoCapitalize="none" spellCheck={false} maxLength={30} hideCount required
              error={usernameError}
              success={availability === "available" ? "Available. This is the link you'll put in your bio." : undefined}
              help={availability === "checking" ? "Checking…" : "Letters, numbers, dots and underscores."}
            />

            <TextField
              id="bio" name="bio" label="One line about you" optional placeholder="Travel photographer in Bali." maxLength={80}
              help="What you do, where you are, what you're into."
            />

            <div className="creator-foot">
              <Button
                type="submit" variant="primary" size="lg" block
                disabled={pending || availability === "taken" || availability === "invalid"}
                label={pending ? "Saving…" : "Next: your first list"}
              />
              <p className="caption">Then one product with a review, and your page is live.</p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
