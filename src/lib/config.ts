// The product name lives here only ("Favolist for now", decided 24 Oct 2026).
export const APP_NAME = "Favolist";

export const THEME_COOKIE = "fv-theme";
export type Theme = "light" | "dark";

/**
 * The site's own address without "https://", for copy that names it
 * ("favolist.com/you"). Empty until a domain is connected: set
 * NEXT_PUBLIC_SITE_HOST in Vercel then. Sentences that would name it are
 * worded without it meanwhile.
 */
export const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_HOST ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
