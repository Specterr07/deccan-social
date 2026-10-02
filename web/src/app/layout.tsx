import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Brand fonts from brand/fonts (reached through the public/brand symlink). Only the weights the app uses.
const leagueSpartan = localFont({
  variable: "--font-league-spartan",
  src: [
    { path: "../../public/brand/fonts/league-spartan-latin-400-normal.woff", weight: "400" },
    { path: "../../public/brand/fonts/league-spartan-latin-500-normal.woff", weight: "500" },
    { path: "../../public/brand/fonts/league-spartan-latin-700-normal.woff", weight: "700" },
  ],
});
const fraunces = localFont({
  variable: "--font-fraunces",
  src: [{ path: "../../public/brand/fonts/fraunces-latin-600-normal.woff", weight: "600" }],
});

export const metadata: Metadata = {
  title: "Deccan Social",
  description: "Monthly calendar to on-brand social posts, with approval.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${leagueSpartan.variable} ${fraunces.variable}`}>
      <head>
        {/* Brand colours come from /brand (symlinked into public/) — never hardcoded here. */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- tokens.css is shared brand source, not app CSS */}
        <link rel="stylesheet" href="/brand/tokens.css" />
      </head>
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
