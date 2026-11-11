import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { APP_NAME } from "@/lib/config";
import { themeInitScript } from "@/lib/theme";
import "@/styles/tokens.css";
import "../../design-system/components/bundle.css";
import "@/styles/app.css";

// Outfit, self-hosted from the @fontsource package (the same files Google
// Fonts serves), so builds never depend on reaching fonts.googleapis.com.
const outfit = localFont({
  variable: "--font-outfit",
  display: "swap",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "The products people actually use, reviewed in their own words.",
  icons: { icon: "/brand/favicon-128.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#150508" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script sets data-theme before paint, so the attribute
    // differs from what the server sent: suppressHydrationWarning covers it.
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
