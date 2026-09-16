import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import { SmoothScroll } from "@/components/public/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: true,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Adi Alfian Hafis — Portfolio",
    template: "%s | Adi Alfian Hafis",
  },
  description:
    "Software developer portfolio — selected work, about, and contact.",
  openGraph: {
    type: "website",
    siteName: "Adi Alfian Hafis",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
