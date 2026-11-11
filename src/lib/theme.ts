import { THEME_COOKIE, type Theme } from "@/lib/config";

// Runs inline in <head>, before first paint: the stored choice wins, otherwise
// the device setting. Kept as a string so it can be inlined without a bundle.
export const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);var t=m?m[1]:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

/** Apply a theme now and remember it for a year. Pass null to follow the device again. */
export function setTheme(theme: Theme | null) {
  if (theme) {
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  } else {
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
}
