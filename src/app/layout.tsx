import "~/styles/globals.css";

import { type Metadata } from "next";
import type { Viewport } from "next/types";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.peoplemet.com"),
  title: {
    template: "%s - SITE NAME HERE",
    default: "TAG LINE HERE",
  },
  description: "A BRIEF DESCRIPTION OF YOUR SITE HERE.",
  // icons: {
  //   icon: [
  //     { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
  //     { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
  //     { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  //   ],
  //   apple: [
  //     { url: "/icons/icon-apple-180.png", sizes: "180x180", type: "image/png" },
  //   ],
  // },
  openGraph: {
    title: "SITE NAME HERE",
    description: "A BRIEF DESCRIPTION OF YOUR SITE HERE.",
    url: "https://www.peoplemet.com",
    siteName: "People Met",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.ENTER-URL-HERE.com/icons/rk-og.jpg",
        width: 1200,
        height: 630,
        alt: "ALT LANGUAGE",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body>
        <TRPCReactProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
