import type { ReactNode } from "react";
import { AddProduct } from "@/components/creator/AddProduct";
import { CreatorScreen } from "@/components/creator/CreatorScreen";
import { DetailsForm } from "@/components/creator/DetailsForm";
import { ListForm } from "@/components/creator/ListForm";
import { ReviewForm } from "@/components/creator/ReviewForm";
import { WelcomeForm } from "@/components/creator/WelcomeForm";
import { AppFrame } from "@/components/frame/AppFrame";
import { ConfirmDelete } from "@/components/me/ConfirmDelete";
import { NotificationRows } from "@/components/me/NotificationRows";
import { People } from "@/components/me/People";
import { ReferralList } from "@/components/me/ReferralList";
import { AccountSettings, PrivacySettings, ProfileSettingsForm, ThemeSettings } from "@/components/me/SettingsForms";
import { SettingsMenu } from "@/components/me/SettingsMenu";
import { ProductFeed } from "@/components/public/ProductFeed";
import { EmptyState, Tabs, TopBar } from "@/components/ui";
import { Landing } from "@/components/landing/Landing";
import type { MyList } from "@/lib/creator/data";
import { getCreators, getFeed } from "@/lib/data/public";

// The creator and signed-in screens with made-up data, so they can be looked at (and
// screenshotted at 390px and 1280px in both themes) without signing in. The
// forms are live but nothing here can save: the actions need a session.

const lists: MyList[] = [
  { id: "00000000-0000-4000-8000-000000000001", name: "Camera bag essentials", slug: "camera-bag-essentials", isPublic: true, numbered: false, intro: "What is in the bag on every shoot, and why it earned the space." },
  { id: "00000000-0000-4000-8000-000000000002", name: "Desk setup", slug: "desk-setup", isPublic: true, numbered: true, intro: "" },
  { id: "00000000-0000-4000-8000-000000000003", name: "Bali travel kit", slug: "bali-travel-kit", isPublic: false, numbered: false, intro: "" },
];
const sling = { name: "Everyday Sling 6L", brand: "Peak Design", images: ["/demo/covers/slate.svg", "/demo/covers/umber.svg", "/demo/covers/sage.svg", "/demo/covers/plum.svg"], url: "https://www.peakdesign.com/products/everyday-sling", domain: "peakdesign.com" };
const product = { id: "00000000-0000-4000-8000-000000000010", name: "Everyday Sling 6L", brand: "Peak Design", listName: "Camera bag essentials" };
const recent = [{ id: product.id, name: "Everyday Sling 6L", meta: "Camera bag essentials · yesterday" }];
const SPOKEN = "So this bag, I've had it, um, two years now, carried it through four countries and it still looks new. The strap is the thing, the reason I bought it really, one pull and the bag swings round to the front and the, the magnetic latch has never opened on its own, not once, even in a crowd";
const TIDIED = "So this bag, I've had it two years now, carried it through four countries and it still looks new. The strap is the thing, the reason I bought it really: one pull and the bag swings round to the front, and the magnetic latch has never opened on its own, not once, even in a crowd.";

const people = [
  { id: "p1", name: "Mira Santoso", username: "mira.makes", meta: "1.2k followers", following: true },
  { id: "p2", name: "Ketut Arta", username: "ketut.rides", meta: "348 followers", following: false },
  { id: "p3", name: "Sebastian Holm", username: "seb.holm", meta: "12 followers", following: false },
];

/** A signed-in screen as it sits in the page frame, with its top bar. */
function Framed({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AppFrame>
      <TopBar title={title} backHref="/dev/screens" />
      {children}
    </AppFrame>
  );
}

/** The home feed, filled with whatever public products exist (the demo profiles on a fresh checkout). */
async function FeedDemo() {
  const creators = await getCreators();
  const { products } = await getFeed(creators.map((c) => c.id).sort(), 0, 6);
  return (
    <AppFrame current="Home">
      <div className="app-mobile-only"><TopBar brand /></div>
      <ProductFeed products={products} as="mixed" />
    </AppFrame>
  );
}

export const SCREENS: { name: string; title: string; render: () => ReactNode }[] = [
  { name: "landing", title: "A8 Landing", render: () => <Landing creatorHref="/vince.rehms" /> },
  { name: "welcome", title: "B5 Welcome", render: () => <WelcomeForm suggestedUsername="vince.rehms" host="favolist.com" /> },
  { name: "new-list", title: "C3 New list", render: () => <ListForm closeHref="/dev/screens" /> },
  {
    name: "edit-list", title: "C3 Edit list + C8 Reorder",
    render: () => (
      <ListForm
        closeHref="/dev/screens" viewHref="/dev/screens" list={{ ...lists[1], intro: "Everything on the desk, in the order I would buy it again." }}
        products={[
          { id: "00000000-0000-4000-8000-000000000011", slug: "a", name: "Studio Display", brand: "Apple", reviewed: true },
          { id: "00000000-0000-4000-8000-000000000012", slug: "b", name: "MX Master 3S", brand: "Logitech", reviewed: true },
          { id: "00000000-0000-4000-8000-000000000013", slug: "c", name: "Keychron Q1 Pro", brand: "Keychron", reviewed: false },
        ]}
      />
    ),
  },
  { name: "add-source", title: "C4 Paste a link", render: () => <AddProduct lists={lists} recent={recent} closeHref="/dev/screens" /> },
  { name: "add-fetching", title: "C4 Fetching", render: () => <AddProduct lists={lists} closeHref="/dev/screens" demo={{ step: "fetching", url: sling.url }} /> },
  { name: "add-failed", title: "C4 Failed", render: () => <AddProduct lists={lists} closeHref="/dev/screens" demo={{ step: "failed", url: "https://www.somestore.id/p/9918-sling", reason: "not_found" }} /> },
  { name: "add-details", title: "C5 Details", render: () => <AddProduct lists={lists} closeHref="/dev/screens" demo={{ step: "details", url: sling.url, product: sling }} /> },
  {
    name: "add-manual", title: "C5 Details, by hand (first product)",
    render: () => (
      <CreatorScreen title="Check the details" step="2 of 3" backHref="/dev/screens">
        <DetailsForm lists={[]} values={{}} />
      </CreatorScreen>
    ),
  },
  { name: "review", title: "C6 Review", render: () => <ReviewForm product={product} serverTranscribes={false} backHref="/dev/screens" /> },
  { name: "review-recording", title: "C6 Review, listening", render: () => <ReviewForm product={product} serverTranscribes={false} backHref="/dev/screens" demo={{ recording: true, seconds: 14, text: SPOKEN }} /> },
  { name: "home-feed", title: "C1 Home feed", render: () => <FeedDemo /> },
  {
    name: "home-empty", title: "C1 Home feed, nobody followed yet",
    render: () => (
      <AppFrame current="Home">
        <div className="app-mobile-only"><TopBar brand /></div>
        <EmptyState icon="home" title="Your feed starts with a follow" message="Follow a few creators and their newest products show up here." action={{ label: "Add a product of your own", href: "/create", variant: "tertiary" }} />
        <div className="me-section"><h2 className="fv-overline">Creators to follow</h2></div>
        <People people={people.map((p) => ({ ...p, following: false }))} />
      </AppFrame>
    ),
  },
  {
    name: "referrals", title: "C10 Referral codes",
    render: () => (
      <Framed title="Referral codes">
        <ReferralList
          items={[
            { productId: "r1", name: "Everyday Sling 6L", listName: "Camera bag essentials", code: "VINCE10", benefit: "10% off", reviewed: true },
            { productId: "r2", name: "Studio Display", listName: "Desk setup", code: "", benefit: "", reviewed: true },
            { productId: "r3", name: "Keychron Q1 Pro", listName: "Desk setup", code: "", benefit: "", reviewed: false },
          ]}
        />
      </Framed>
    ),
  },
  {
    name: "notifications", title: "C11 Notifications",
    render: () => (
      <Framed title="Notifications">
        <NotificationRows
          items={[
            { id: "n1", actor: { name: "Mira Santoso" }, message: "started following you.", time: "today", read: false, href: "/dev/screens" },
            { id: "n2", actor: { name: "Ketut Arta" }, message: "saved Everyday Sling 6L.", time: "yesterday", read: false, href: "/dev/screens" },
            { id: "n3", actor: { name: "Sebastian Holm" }, message: "saved your list Desk setup.", time: "3 days ago", read: true, href: "/dev/screens" },
          ]}
        />
      </Framed>
    ),
  },
  {
    name: "follows", title: "C12 Followers",
    render: () => (
      <Framed title="Followers">
        <Tabs selected="followers" items={[{ id: "followers", label: "Followers", count: 3 }, { id: "following", label: "Following", count: 1 }]} />
        <People people={people} removable />
      </Framed>
    ),
  },
  { name: "settings", title: "C13 Settings", render: () => <Framed title="Settings"><SettingsMenu email="vince@example.com" /></Framed> },
  {
    name: "settings-profile", title: "C14 Settings, profile",
    render: () => (
      <Framed title="Profile">
        <ProfileSettingsForm
          host="favolist.com"
          profile={{ id: "me", username: "vince.rehms", name: "Vince Rehms", bio: "Travel photographer in Bali.", about: "", links: [{ kind: "instagram", url: "https://instagram.com/vince" }], isPublic: true, theme: null }}
        />
      </Framed>
    ),
  },
  { name: "settings-account", title: "C15 Settings, account", render: () => <Framed title="Account"><AccountSettings email="vince@example.com" username="vince.rehms" /></Framed> },
  { name: "settings-privacy", title: "C16 Settings, privacy", render: () => <Framed title="Privacy"><PrivacySettings isPublic /></Framed> },
  { name: "settings-theme", title: "Settings, theme", render: () => <Framed title="Theme"><ThemeSettings stored={null} /></Framed> },
  {
    name: "confirm-delete", title: "C17 Delete confirmation (tap the button)",
    render: () => (
      <Framed title="Delete">
        <div className="me-pad">
          <ConfirmDelete label="Delete product" title="Delete Everyday Sling 6L?" message="It comes off Camera bag essentials, with your review and the recording. This cannot be undone." action={async () => { "use server"; return { error: "Nothing is deleted on this page." }; }} />
        </div>
      </Framed>
    ),
  },
  { name: "review-tidied", title: "C6 Review, tidied", render: () => <ReviewForm product={product} serverTranscribes={false} backHref="/dev/screens" demo={{ tidied: true, text: TIDIED }} /> },
];
