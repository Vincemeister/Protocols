"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useEffect, useRef, useState } from "react";
import { Alert, Button, Icon, Select, TextArea, TextField, Toggle } from "@/components/ui";
import { useImageFile } from "@/components/creator/useImageFile";
import { checkUsername } from "@/lib/creator/actions";
import { USERNAME_PATTERN } from "@/lib/creator/slug";
import type { Theme } from "@/lib/config";
import { changeEmail, deleteAccount, saveProfile, savePrivacy, saveTheme, type SavedState } from "@/lib/me/actions";
import type { MyProfile } from "@/lib/me/data";
import { setTheme } from "@/lib/theme";
import { ConfirmDelete } from "./ConfirmDelete";
import "./me.css";

const Saved = ({ state, text = "Saved." }: { state: SavedState; text?: string }) =>
  state.saved ? <Alert tone="success" message={text} /> : state.error ? <Alert tone="danger" message={state.error} /> : null;

/** C14 Settings — profile: name, username, photo, the one line, the About text, up to four links. */
export function ProfileSettingsForm({ profile, host, saved }: { profile: MyProfile; host: string; saved?: boolean }) {
  const photo = useImageFile(800);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [availability, setAvailability] = useState<"idle" | "available" | "taken" | "invalid">("idle");
  const [state, submit, pending] = useActionState<SavedState, FormData>(
    (prev, form) => {
      if (photo.picked) form.set("avatar_file", photo.picked.blob, "avatar.jpg");
      return saveProfile(prev, form);
    },
    { saved },
  );

  // Only a changed username is checked; their own is theirs already.
  const latest = useRef(0);
  useEffect(() => {
    const candidate = username.trim().toLowerCase();
    const ticket = ++latest.current;
    const timer = setTimeout(async () => {
      if (candidate === profile.username.toLowerCase()) return setAvailability("idle");
      if (!USERNAME_PATTERN.test(candidate)) return setAvailability("invalid");
      const answer = await checkUsername(candidate).catch(() => "idle" as const);
      if (ticket === latest.current) setAvailability(answer);
    }, 350);
    return () => clearTimeout(timer);
  }, [username, profile.username]);

  const shown = photo.picked?.preview ?? (photoRemoved ? undefined : profile.avatar);
  const links = [...profile.links.map((l) => l.url), "", "", "", ""].slice(0, 4);
  const changed = username.trim().toLowerCase() !== profile.username.toLowerCase();

  return (
    <div className="me-form">
      <form action={submit}>
        {photoRemoved && !photo.picked ? <input type="hidden" name="avatar_removed" value="1" /> : null}
        <Saved state={state} />

        <div className="me-avatar">
          {photo.field}
          <button className={`fv-uploader${shown ? " has-image" : ""}`} type="button" aria-label={shown ? "Replace photo" : "Add a photo"} onClick={photo.open}>
            {shown ? <img src={shown} alt="" /> : <><Icon name="upload" /><span>Photo</span></>}
          </button>
          <div className="me-group" style={{ flex: 1 }}>
            <p className="caption me-muted">{photo.error ?? "A real photo of you, not a logo. It's the first trust signal on your page."}</p>
            {shown ? (
              <div className="me-actions">
                <Button variant="tertiary" size="sm" label="Replace" onClick={photo.open} />
                <Button variant="link" size="sm" label="Remove" onClick={() => { photo.clear(); setPhotoRemoved(true); }} />
              </div>
            ) : null}
          </div>
        </div>

        <TextField id="name" name="name" label="Your name" value={profile.name} autocomplete="name" maxLength={60} hideCount required error={state.fields?.name} />
        <TextField
          id="username" name="username" label="Username" prefix={`${host}/`} value={username} onChange={setUsername}
          autocomplete="username" autoCapitalize="none" spellCheck={false} maxLength={30} hideCount required
          error={state.fields?.username && availability !== "available" ? state.fields.username
            : availability === "taken" ? "That username is taken. Try another."
            : availability === "invalid" ? "3 to 30 characters: letters, numbers, dots and underscores." : undefined}
          success={availability === "available" ? "Available." : undefined}
          help={changed ? "Changing it changes the address of your page. Links you shared with the old one stop working." : "This is the link you put in your bio."}
        />
        <TextField id="bio" name="bio" label="One line about you" optional value={profile.bio} placeholder="Travel photographer in Bali." maxLength={80} help="What you do, where you are, what you're into." />
        <TextArea id="about" name="about" label="About" optional value={profile.about} rows={5} maxLength={1500} help="The longer story, on the About tab of your page." />

        <div className="me-group">
          {links.map((url, i) => (
            <TextField
              key={i} id={`link${i}`} name="link" type="url" label={i === 0 ? "Links" : undefined} optional={i === 0} value={url}
              placeholder={["youtube.com/@you", "instagram.com/you", "tiktok.com/@you", "yoursite.com"][i]}
              inputMode="url" autoCapitalize="none" spellCheck={false} error={state.fields?.[`link${i}`]}
            />
          ))}
          <p className="caption me-muted">Up to four, shown under your name in this order.</p>
        </div>

        <div><Button type="submit" variant="primary" size="lg" disabled={pending || availability === "taken" || availability === "invalid"} label={pending ? "Saving…" : "Save profile"} /></div>
      </form>
    </div>
  );
}

/** C15 Settings — account: the sign-in email (there are no passwords), and deleting the account. */
export function AccountSettings({ email, username }: { email: string; username: string }) {
  const [state, submit, pending] = useActionState<SavedState, FormData>(changeEmail, {});
  return (
    <div className="me-form">
      {/* noValidate: the action gives the message, in the design system's style, instead of the browser's bubble. */}
      <form action={submit} noValidate>
        <div className="me-group">
          <h2 className="heading-6">Email</h2>
          <p className="body-sm me-muted">You sign in with a link sent to {email || "your email address"}. There is no password to change.</p>
        </div>
        <Saved state={state} text="Check the new address: we sent a link to confirm it. Until you open it, nothing changes." />
        <TextField id="email" name="email" type="email" label="New email address" placeholder="you@example.com" autocomplete="email" autoCapitalize="none" error={state.fields?.email} />
        <div><Button type="submit" variant="tertiary" disabled={pending} label={pending ? "Sending…" : "Send confirmation"} /></div>
      </form>

      <hr className="me-divider" />

      <div className="me-group">
        <h2 className="heading-6">Delete account</h2>
        <p className="body-sm me-muted">Removes your page, your lists, every product and review, your recordings and your sign-in. It cannot be undone.</p>
        <div>
          <ConfirmDelete
            label="Delete my account" title="Delete your account?" confirmWord={username} trigger={{ variant: "tertiary", size: undefined }}
            message={`Your page at /${username}, all your lists, products, reviews and recordings will be gone for good, and people who saved them will lose them too.`}
            action={deleteAccount}
          />
        </div>
      </div>
    </div>
  );
}

/** C16 Settings — privacy: one honest switch. */
export function PrivacySettings({ isPublic }: { isPublic: boolean }) {
  const [state, submit, pending] = useActionState<SavedState, FormData>(savePrivacy, {});
  return (
    <div className="me-form">
      <form action={submit}>
        <Saved state={state} />
        <Toggle name="is_public" label="Show my page to everyone" help="Off hides your page, lists and products from everyone but you. Your followers keep following; they see nothing until you switch it back on." checked={isPublic} />
        <p className="body-sm me-muted">
          Single lists can be kept as drafts on their own, from the list&apos;s edit screen. A product is never public before it has your review.
        </p>
        <div><Button type="submit" variant="primary" size="lg" disabled={pending} label={pending ? "Saving…" : "Save"} /></div>
      </form>
    </div>
  );
}

/** Settings — theme: light, dark, or whatever the device is set to. Applies at once. */
export function ThemeSettings({ stored }: { stored: Theme | null }) {
  // The account's value is what a new device starts from; on this device the cookie decides.
  const [choice, setChoice] = useState<string>(stored ?? "device");
  useEffect(() => {
    // Read after hydration: the server cannot know this device's cookie-less default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(document.cookie.match(/(?:^|; )fv-theme=(light|dark)/)?.[1] ?? "device");
  }, []);
  return (
    <div className="me-form">
      <Select
        // Select takes its starting value once; the key makes it start again when the cookie has been read.
        key={choice} id="theme" label="Theme" value={choice}
        options={[{ value: "device", label: "Same as my device" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
        onChange={(value) => {
          const theme = value === "light" || value === "dark" ? value : null;
          setChoice(value);
          setTheme(theme);
          void saveTheme(theme);
        }}
        help="Changes at once, and is remembered on this device and with your account."
      />
    </div>
  );
}
