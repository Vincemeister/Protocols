import type { ReactNode } from "react";
import { AddProduct } from "@/components/creator/AddProduct";
import { CreatorScreen } from "@/components/creator/CreatorScreen";
import { DetailsForm } from "@/components/creator/DetailsForm";
import { ListForm } from "@/components/creator/ListForm";
import { ReviewForm } from "@/components/creator/ReviewForm";
import { WelcomeForm } from "@/components/creator/WelcomeForm";
import type { MyList } from "@/lib/creator/data";

// The creator screens with made-up data, so they can be looked at (and
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

export const SCREENS: { name: string; title: string; render: () => ReactNode }[] = [
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
  { name: "review-tidied", title: "C6 Review, tidied", render: () => <ReviewForm product={product} serverTranscribes={false} backHref="/dev/screens" demo={{ tidied: true, text: TIDIED }} /> },
];
