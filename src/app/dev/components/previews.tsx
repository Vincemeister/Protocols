import type { CSSProperties, ReactNode } from "react";
import {
  Alert, AsideRail, Avatar, Badge, BottomBar, BrandChip, Button, Checkbox, CodeFrame, Dialog, EmptyState,
  FollowButton, ImageUploader, ListCard, LoadMore, MarkLoader, NotificationRow, ProductCard, ProfileHeader,
  ReferralCard, SearchField, Select, Sheet, SideNav, Skeleton, Tabs, TextArea, TextField, Toast, Toggle,
  TopBar, UserCard,
} from "@/components/ui";

// Every component rendered with the same props and stage markup as its
// design-system/components/<Name>/preview.html, so the two can be compared
// side by side (scripts/compare-components.mjs does it pixel by pixel).

export interface Preview {
  name: string;
  group: "Identity" | "Actions" | "Navigation" | "Forms" | "Content" | "Feedback";
  /** Natural width of the design system's preview card, when it sets one. */
  width?: number;
  render: () => ReactNode;
}

const svgUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** A stand-in cover photo: a diagonal gradient as an SVG, so ListCard gets a real image. */
function cover(x1: number, y1: number, x2: number, y2: number, stops: [string, string, string]) {
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" preserveAspectRatio="none"><defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${stops[0]}"/><stop offset=".6" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[2]}"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/></svg>`,
  );
}
const PLUM = cover(0, 0, 1, 1, ["#8c7f85", "#4d3c43", "#2a1a20"]);
const SAGE = cover(0.281, -0.102, 0.719, 1.102, ["#a9b4a7", "#5a6b5e", "#2c3a31"]);
const SWATCH = svgUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#6b5a5f"/><rect x="2" y="3" width="6" height="4" fill="#998a90"/></svg>',
);

const stage = "fv-stage";
const col = "fv-stage-col";
const flush: CSSProperties = { padding: 0 };
const bio = "Travel photographer in Bali. Everything here I own, use and would buy again.";
const counts = [
  { value: "1.2k", label: "followers" },
  { value: "86", label: "following" },
  { value: "8", label: "lists" },
];
const REVIEW =
  "I've carried this through four countries and it still looks new. The strap is the reason I bought it: one pull and the bag swings to the front, and the magnetic latch has never once opened on its own in a crowd.";

export const PREVIEWS: Preview[] = [
  {
    name: "Avatar", group: "Identity",
    render: () => (
      <div className={stage} style={{ alignItems: "flex-end" }}>
        <Avatar name="Vic Roy" size={24} />
        <Avatar name="Ana Lim" size={32} />
        <Avatar name="Mo Khan" size={40} />
        <Avatar name="Vic Roy" size={48} />
        <Avatar name="Ana Lim" size={56} />
        <Avatar name="Mo Khan" size={72} />
        <Avatar name="Vic Roy" size={144} bordered />
      </div>
    ),
  },
  {
    name: "Badge", group: "Identity",
    render: () => (
      <div className={stage}>
        <Badge label="12 products" />
        <Badge label="New" tone="accent" />
        <Badge label="Published" tone="success" icon="check" />
        <Badge label="Draft" tone="warning" />
        <Badge label="Removed" tone="danger" />
      </div>
    ),
  },
  {
    name: "BrandChip", group: "Identity",
    render: () => (
      <div className={stage}>
        <BrandChip name="Peak Design" />
        <BrandChip name="Notion" />
        <BrandChip name="Allbirds" />
      </div>
    ),
  },
  {
    name: "UserCard", group: "Identity", width: 400,
    render: () => (
      <div className={col} style={{ gap: 0 }}>
        <UserCard name="Mira Kusuma" handle="@mira.makes" meta="2.4k followers" lined />
        <UserCard name="Alden Pratama" handle="@alden" meta="312 followers" following lined />
        <UserCard name="Vince Rehms" handle="@vince.rehms" size={40} action={false} />
      </div>
    ),
  },
  {
    name: "ProfileHeader", group: "Identity",
    render: () => (
      <>
        <div>
          <ProfileHeader
            name="Vince Rehms" handle="@vince.rehms" bio={bio} counts={counts} large
            links={[
              { href: "https://youtube.com/@vince", label: "youtube.com/@vince", icon: "youtube" },
              { href: "https://instagram.com/vince.rehms", label: "instagram.com/vince.rehms", icon: "instagram" },
              { href: "https://vincerehms.com", label: "vincerehms.com", icon: "globe" },
            ]}
          />
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: 0 }} />
        <div style={{ maxWidth: 390 }}>
          <ProfileHeader
            name="Vince Rehms" handle="@vince.rehms" bio={bio} counts={counts} own
            links={[
              { href: "https://youtube.com/@vince", label: "@vince", icon: "youtube" },
              { href: "https://instagram.com/vince.rehms", label: "@vince.rehms", icon: "instagram" },
              { href: "https://vincerehms.com", label: "vincerehms.com", icon: "globe" },
            ]}
          />
        </div>
      </>
    ),
  },
  {
    name: "Button", group: "Actions",
    render: () => (
      <div className={col}>
        <div className={stage} style={flush}>
          <Button variant="primary" icon="plus" label="Create a list" />
          <Button variant="secondary" label="Follow" />
          <Button variant="tertiary" label="Edit profile" />
          <Button variant="link" label="View all" />
          <Button variant="danger" label="Delete list" />
        </div>
        <div className={stage} style={flush}>
          <Button variant="primary" size="lg" label="Save to list" />
          <Button variant="tertiary" size="sm" icon="copy" label="Copy code" />
          <Button variant="secondary" size="sm" label="Following" />
          <Button variant="primary" label="Saving…" disabled />
        </div>
      </div>
    ),
  },
  {
    name: "FollowButton", group: "Actions",
    render: () => (
      <div className={stage}>
        <FollowButton />
        <FollowButton following />
        <FollowButton size="sm" />
      </div>
    ),
  },
  {
    name: "CodeFrame", group: "Actions",
    render: () => (
      <div className={stage}>
        <CodeFrame label="10% off with" code="VINCE10" />
        <CodeFrame label="Code" code="FAVO-ALDEN" />
      </div>
    ),
  },
  {
    name: "Tabs", group: "Navigation",
    render: () => (
      <div>
        <Tabs
          selected="lists"
          items={[
            { id: "lists", label: "Lists", count: 8 },
            { id: "products", label: "Products", count: 64 },
            { id: "codes", label: "Codes", count: 12 },
            { id: "about", label: "About" },
          ]}
        />
      </div>
    ),
  },
  {
    name: "TopBar", group: "Navigation",
    render: () => (
      <>
        <div><TopBar brand mark="/brand/favolist-mark.svg" action={{ icon: "bell", label: "Notifications", badge: true }} /></div>
        <div style={{ height: 16 }} />
        <div><TopBar title="Camera bag essentials" action={{ icon: "share", label: "Share" }} /></div>
      </>
    ),
  },
  {
    name: "BottomBar", group: "Navigation",
    render: () => (
      <div>
        <BottomBar
          items={[
            { icon: "home", label: "Home", current: true },
            { icon: "search", label: "Search" },
            { icon: "plus-square", label: "Create" },
            { icon: "bookmark", label: "Saved" },
            { icon: "user", label: "Profile", unread: true },
          ]}
        />
      </div>
    ),
  },
  {
    name: "SideNav", group: "Navigation",
    render: () => (
      <div style={{ height: 600, padding: 0, display: "flex" }}>
        <SideNav
          homeHref="#"
          user={{ name: "Vince Rehms", handle: "@vince.rehms" }}
          items={[
            { label: "Home", icon: "home", current: true },
            { label: "Search", icon: "search" },
            { label: "Create", icon: "plus-square" },
            { label: "Saved", icon: "bookmark" },
            { label: "Notifications", icon: "bell" },
            { label: "Profile", icon: "user" },
          ]}
        />
      </div>
    ),
  },
  {
    name: "AsideRail", group: "Navigation",
    render: () => (
      <div style={{ height: 720, display: "flex", justifyContent: "flex-end" }}>
        <AsideRail
          user={{ name: "Vince Rehms", handle: "@vince.rehms" }}
          lists={[
            { name: "Desk setup", count: "7 products", creator: { name: "Alden" } },
            { name: "Trail runs", count: "5 products", creator: { name: "Mira Kusuma" } },
          ]}
          people={[
            { name: "Mira Kusuma", handle: "@mira.makes" },
            { name: "Ketut Arya", handle: "@ketut.rides" },
            { name: "Sofia Lindqvist", handle: "@sofia.l" },
          ]}
        />
      </div>
    ),
  },
  {
    name: "SearchField", group: "Navigation", width: 480,
    render: () => (
      <div className={col}>
        <SearchField />
        <SearchField value="camera" size="lg" />
      </div>
    ),
  },
  {
    name: "TextField", group: "Forms", width: 480,
    render: () => (
      <div className={col}>
        <TextField label="Display name" value="Vince Rehms" help="Shown on your profile and cards." maxLength={40} />
        <TextField label="Username" value="vince rehms" error="Usernames can only use letters, numbers, dots and underscores." />
        <TextField label="Website" optional placeholder="https://" disabled />
      </div>
    ),
  },
  {
    name: "TextArea", group: "Forms",
    render: () => (
      <div className={col}>
        <TextArea label="Intro" placeholder="One or two sentences at the top of the list." rows={3} optional />
        <TextArea
          label="Your review" voice recording recordingTime="0:14" maxLength={600}
          value="I've carried this through four countries and it still looks new, um, the strap is the reason I bought it"
          help="Why did you buy it? What would you tell a friend?"
        />
        <TextArea
          label="Your review" voice tidied maxLength={600}
          value="I've carried this through four countries and it still looks new. The strap is the reason I bought it."
          help="Why did you buy it? What would you tell a friend?"
        />
      </div>
    ),
  },
  {
    name: "Select", group: "Forms", width: 480,
    render: () => (
      <div className={col}>
        <Select
          label="Add to list" value="camera"
          options={[
            { value: "camera", label: "Camera bag essentials" },
            { value: "desk", label: "Desk setup" },
            { value: "new", label: "New list…" },
          ]}
        />
      </div>
    ),
  },
  {
    name: "Checkbox", group: "Forms", width: 480,
    render: () => (
      <div className={col} style={{ gap: 0 }}>
        <Checkbox label="Show this list on my profile" checked />
        <Checkbox label="Email me when someone follows me" help="At most once a day." />
        <Checkbox label="Agree to the terms" disabled />
      </div>
    ),
  },
  {
    name: "Toggle", group: "Forms", width: 480,
    render: () => (
      <div className={col} style={{ gap: 0 }}>
        <Toggle label="Public profile" help="Anyone with the link can see your lists." checked />
        <Toggle label="Show follower counts" />
        <Toggle label="Allow comments" help="Coming in a later version." disabled />
      </div>
    ),
  },
  {
    name: "ImageUploader", group: "Forms", width: 480,
    render: () => (
      <div className={stage} style={{ alignItems: "flex-start" }}>
        <ImageUploader label="Add a cover" hint="Square, at least 600px" />
        <ImageUploader src={SWATCH} />
      </div>
    ),
  },
  {
    name: "ProductCard", group: "Content",
    render: () => (
      <ProductCard
        creator={{ name: "vince.rehms" }}
        listName="Camera bag essentials"
        product={{ name: "Everyday Sling 6L", brand: "Peak Design", url: "#" }}
        review={REVIEW}
        code="VINCE10" codeLabel="10% off with"
        likes={128} comments={14}
      />
    ),
  },
  {
    name: "ListCard", group: "Content",
    render: () => (
      <div className={stage} style={{ alignItems: "flex-start" }}>
        <div style={{ width: 300 }}>
          <ListCard name="Camera bag essentials" count="12 products" cover={PLUM} creator={{ name: "vince.rehms", followers: "1.2k followers" }} />
        </div>
        <div style={{ width: 160 }}>
          <ListCard name="Desk setup" count="7 products" cover={SAGE} creator={{ name: "alden" }} size="sm" />
        </div>
      </div>
    ),
  },
  {
    name: "ReferralCard", group: "Content", width: 560,
    render: () => (
      <div>
        <ReferralCard product={{ name: "Everyday Sling 6L" }} listName="Camera bag essentials" code="VINCE10" codeLabel="10% off with" sortable />
        <ReferralCard product={{ name: "Notion Plus" }} listName="Desk setup" sortable />
      </div>
    ),
  },
  {
    name: "NotificationRow", group: "Content", width: 480,
    render: () => (
      <div>
        <NotificationRow actor={{ name: "Mira Kusuma" }} message="started following you." time="2 hours ago" />
        <NotificationRow actor={{ name: "Alden Pratama" }} message="saved your list Camera bag essentials." time="Yesterday" read />
        <NotificationRow actor={{ name: "Ketut Arya" }} message="started following you." time="3 days ago" read />
      </div>
    ),
  },
  {
    name: "Dialog", group: "Feedback",
    render: () => (
      <div className="fv-dialog-stage" style={{ height: 360 }}>
        <div className="fv-scrim" />
        <Dialog
          alert
          title="Delete 'Camera bag essentials'?"
          body="This removes 12 products and their reviews. People who saved the list will lose it."
          actions={[{ variant: "tertiary", label: "Keep list" }, { variant: "danger", label: "Delete list" }]}
        />
      </div>
    ),
  },
  {
    name: "Sheet", group: "Feedback",
    render: () => (
      <div className="fv-dialog-stage" style={{ height: 420, alignItems: "flex-end" }}>
        <div className="fv-scrim" />
        <Sheet
          title="Save product"
          body={
            <div>
              <Select
                label="Add to list" value="camera"
                options={[{ value: "camera", label: "Camera bag essentials" }, { value: "desk", label: "Desk setup" }]}
              />
            </div>
          }
          actions={[{ variant: "tertiary", label: "Cancel" }, { variant: "primary", label: "Save to list" }]}
        />
      </div>
    ),
  },
  {
    name: "Alert", group: "Feedback", width: 560,
    render: () => (
      <div className={col}>
        <Alert message="Your profile is private. Only you can see it until you publish." />
        <Alert tone="success" title="Published." message="Your list is live at favolist.com/vince.rehms." dismissible />
        <Alert tone="warning" message="This product has no review yet, so it is hidden from your profile." />
        <Alert tone="danger" title="We couldn't fetch that page." message="Check the link or add the product manually." />
      </div>
    ),
  },
  {
    name: "Toast", group: "Feedback",
    render: () => (
      <div className={col} style={{ alignItems: "flex-start" }}>
        <Toast tone="success" message="Saved to Camera bag essentials." action={{ label: "View" }} duration={0} />
        <Toast tone="danger" message="Couldn't copy the code." action={{ label: "Retry" }} duration={0} />
      </div>
    ),
  },
  {
    name: "EmptyState", group: "Feedback", width: 560,
    render: () => (
      <div className={stage} style={{ justifyContent: "space-around", alignItems: "flex-start" }}>
        <EmptyState icon="list" title="Your lists show up here" message="Start with the five things you would recommend to anyone." action={{ label: "Create your first list", icon: "plus" }} />
        <EmptyState icon="search" title={'Nothing for "cmaera"'} message="Check the spelling, or try a creator's name." />
      </div>
    ),
  },
  {
    name: "Skeleton", group: "Feedback",
    render: () => (
      <div className={col}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton width={40} height={40} round />
          <Skeleton width={140} height={14} text />
        </div>
        <div><Skeleton height={80} /></div>
        <div><Skeleton width="70%" text /></div>
        <div><Skeleton width="45%" text /></div>
      </div>
    ),
  },
  {
    name: "LoadMore", group: "Feedback", width: 480,
    render: () => <div><LoadMore /></div>,
  },
  {
    name: "MarkLoader", group: "Feedback",
    render: () => (
      <div className={stage} style={{ gap: 48, alignItems: "center", padding: 32 }}>
        <MarkLoader size="sm" />
        <MarkLoader />
        <MarkLoader size="lg" />
      </div>
    ),
  },
];

export const GROUPS: Preview["group"][] = ["Identity", "Actions", "Navigation", "Forms", "Content", "Feedback"];
