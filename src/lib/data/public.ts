import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { ago, exactDate } from "@/lib/format";
import { PUBLIC_DATA, loadDataset, type Dataset, type ListRow, type ProductRow, type ProfileRow } from "./dataset";

// What the public pages show, shaped for the screens. Each function is cached
// ('use cache'), so a page view costs no database round trip; relative dates
// ("updated last week") are worked out here, inside the cache, because a
// cached page may not read the clock itself.

export interface PublicProfile {
  id: string; username: string; name: string; avatar?: string; bio?: string; about?: string;
  links: { kind: string; url: string }[];
  followers: number; following: number;
}
export interface PublicList {
  id: string; slug: string; name: string; intro?: string; cover?: string; numbered: boolean;
  productCount: number; updated: string; updatedExact: string; href: string;
}
export interface PublicProduct {
  id: string; slug: string; name: string; brand?: string; image?: string; url?: string; domain?: string;
  review: string; code?: { code: string; label: string }; likes: number;
  added: string; addedExact: string; edited?: string;
  list: { name: string; slug: string; href: string }; position: number; href: string;
}

function index(ds: Dataset) {
  const reviewOf = new Map(ds.reviews.filter((r) => r.published_at).map((r) => [r.product_id, r]));
  const codeOf = new Map(ds.referral_codes.filter((c) => c.status === "active").map((c) => [c.product_id, c]));
  const likesOf = new Map(ds.like_counts.map((l) => [l.product_id, l.likes]));
  const followsOf = new Map(ds.follow_counts.map((f) => [f.profile_id, f]));
  return { reviewOf, codeOf, likesOf, followsOf };
}

function toProfile(p: ProfileRow, ix: ReturnType<typeof index>): PublicProfile {
  const f = ix.followsOf.get(p.id);
  return {
    id: p.id, username: p.username, name: p.display_name, avatar: p.avatar_url ?? undefined, bio: p.bio ?? undefined,
    about: p.about ?? undefined, links: p.links ?? [], followers: f?.followers ?? 0, following: f?.following ?? 0,
  };
}

function toList(l: ListRow, owner: ProfileRow, productCount: number, now: Date): PublicList {
  return {
    id: l.id, slug: l.slug, name: l.name, intro: l.intro ?? undefined, cover: l.cover_url ?? undefined, numbered: l.numbered,
    productCount, updated: ago(l.updated_at, now), updatedExact: exactDate(l.updated_at), href: `/${owner.username}/${l.slug}`,
  };
}

function toProduct(pr: ProductRow, list: ListRow, owner: ProfileRow, position: number, ix: ReturnType<typeof index>, now: Date): PublicProduct {
  const review = ix.reviewOf.get(pr.id)!;
  const code = ix.codeOf.get(pr.id);
  const listHref = `/${owner.username}/${list.slug}`;
  // "edited <when>" only when the review changed after it was published (more than a day later).
  const edited = new Date(review.updated_at).getTime() - new Date(review.published_at!).getTime() > 86_400_000;
  return {
    id: pr.id, slug: pr.slug, name: pr.name, brand: pr.brand ?? undefined, image: pr.image_url ?? undefined,
    url: code?.link ?? pr.source_url ?? undefined, domain: pr.source_domain ?? undefined, review: review.body_text,
    code: code?.code ? { code: code.code, label: code.benefit_text ? `${code.benefit_text} with` : "Code" } : undefined,
    likes: ix.likesOf.get(pr.id) ?? 0,
    added: ago(review.published_at!, now), addedExact: exactDate(review.published_at!),
    edited: edited ? ago(review.updated_at, now) : undefined,
    list: { name: list.name, slug: list.slug, href: listHref }, position, href: `${listHref}/${pr.slug}`,
  };
}

/** The reviewed products of one list, in the creator's order. */
function productsOf(ds: Dataset, list: ListRow, owner: ProfileRow, ix: ReturnType<typeof index>, now: Date) {
  return ds.products
    .filter((p) => p.list_id === list.id && ix.reviewOf.has(p.id))
    .sort((a, b) => a.position - b.position)
    .map((p, i) => toProduct(p, list, owner, i + 1, ix, now));
}

const listsOf = (ds: Dataset, owner: ProfileRow) =>
  ds.lists.filter((l) => l.owner_id === owner.id && l.is_public).sort((a, b) => a.position - b.position);

const findProfile = (ds: Dataset, username: string) =>
  ds.profiles.find((p) => p.username.toLowerCase() === decodeURIComponent(username).toLowerCase());

/** A1: a creator's profile with their lists and every reviewed product, newest first. */
export async function getProfilePage(username: string) {
  "use cache";
  cacheTag(PUBLIC_DATA);
  cacheLife("minutes");
  const ds = await loadDataset();
  const owner = findProfile(ds, username);
  if (!owner) return null;
  const ix = index(ds);
  const now = new Date();
  const lists = listsOf(ds, owner);
  const byList = lists.map((l) => ({ list: l, products: productsOf(ds, l, owner, ix, now) }));
  const products = byList.flatMap((x) => x.products.map((p) => ({ p, at: ix.reviewOf.get(p.id)!.published_at! })))
    .sort((a, b) => b.at.localeCompare(a.at)).map((x) => x.p);
  return {
    profile: toProfile(owner, ix),
    lists: byList.map((x) => toList(x.list, owner, x.products.length, now)),
    products,
    // The Codes tab is the Products tab filtered to items with a code; it exists only when there is one.
    codes: products.filter((p) => p.code),
  };
}

/** A2: one list as a reading experience. */
export async function getListPage(username: string, listSlug: string) {
  "use cache";
  cacheTag(PUBLIC_DATA);
  cacheLife("minutes");
  const ds = await loadDataset();
  const owner = findProfile(ds, username);
  const list = owner && listsOf(ds, owner).find((l) => l.slug === listSlug);
  if (!owner || !list) return null;
  const ix = index(ds);
  const now = new Date();
  const products = productsOf(ds, list, owner, ix, now);
  return { profile: toProfile(owner, ix), list: toList(list, owner, products.length, now), products };
}

/** A3: one product with the full review. */
export async function getProductPage(username: string, listSlug: string, productSlug: string) {
  "use cache";
  cacheTag(PUBLIC_DATA);
  cacheLife("minutes");
  const page = await getListPage(username, listSlug);
  const product = page?.products.find((p) => p.slug === productSlug);
  if (!page || !product) return null;
  return { profile: page.profile, list: page.list, product, total: page.products.length };
}

/** The suggestions rail: lists and creators other than the one being viewed. */
export async function getSuggestions(exceptUsername?: string) {
  "use cache";
  cacheTag(PUBLIC_DATA);
  cacheLife("minutes");
  const ds = await loadDataset();
  const ix = index(ds);
  const now = new Date();
  const others = ds.profiles.filter((p) => p.is_public && p.username !== exceptUsername);
  const lists = others.flatMap((owner) => {
    const first = listsOf(ds, owner)[0];
    if (!first) return [];
    const count = productsOf(ds, first, owner, ix, now).length;
    return count ? [{ list: toList(first, owner, count, now), creator: toProfile(owner, ix) }] : [];
  });
  return { lists: lists.slice(0, 2), people: others.slice(0, 3).map((p) => toProfile(p, ix)) };
}

/** Every public creator (the placeholder home page, and the addresses to prebuild). */
export async function getCreators() {
  "use cache";
  cacheTag(PUBLIC_DATA);
  cacheLife("minutes");
  const ds = await loadDataset();
  const ix = index(ds);
  return ds.profiles.filter((p) => p.is_public).map((p) => toProfile(p, ix));
}
