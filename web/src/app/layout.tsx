import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deccan Social",
  description: "Monthly calendar to on-brand social posts, with approval.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        {/* Brand colours and fonts come from /brand (symlinked into public/) — never hardcoded here. */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- tokens.css is shared brand source, not app CSS */}
        <link rel="stylesheet" href="/brand/tokens.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
