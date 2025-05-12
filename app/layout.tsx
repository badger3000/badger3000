import "./css/style.css";

import {Inter, Inter_Tight} from "next/font/google";
import {Metadata} from "next";
import Theme from "./theme-provider";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import {Providers} from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const inter_tight = Inter_Tight({
  weight: ["600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

import {Viewport} from "next";

export const viewport: Viewport = {
  themeColor: [
    {media: "(prefers-color-scheme: light)", color: "white"},
    {media: "(prefers-color-scheme: dark)", color: "#0f172a"},
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://www.badger3000.com"),
  title: {
    default: "Kyle Ross | Frontend Developer",
    template: "%s | Kyle Ross",
  },
  description:
    "Frontend Developer | Builder of Digital Things | ReactJS, Astro, JavaScript, | Golf Addict",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        {url: "/rss-feed.xml", title: "Kyle Ross RSS Feed"},
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.SITE_URL || "https://www.badger3000.com",
    title: "Kyle Ross | Frontend Developer",
    description:
      "Frontend Developer | Builder of Digital Things | ReactJS, Astro, JavaScript, | Golf Addict",
    siteName: "Kyle Ross | Badger3000",
    images: [
      {
        url: "/images/header-image-06.webp",
        width: 1200,
        height: 630,
        alt: "Kyle Ross | Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyle Ross | Frontend Developer",
    description:
      "Frontend Developer | Builder of Digital Things | ReactJS, Astro, JavaScript, | Golf Addict",
    images: ["/images/header-image-06.webp"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Badger3000",
  },
  icons: {
    icon: [
      {url: "/favicon.ico"},
      {url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png"},
      {url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png"},
    ],
    apple: [{url: "/icons/apple-touch-icon.png", sizes: "180x180"}],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      {/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
      <body
        className={`${inter.variable} ${inter_tight.variable} font-inter antialiased bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-100 tracking-tight`}
      >
        <Providers>
          <Theme>
            <div className="overflow-hidden supports-[overflow:clip]:overflow-clip">
              <div className="max-w-[728px] mx-auto">
                <div className="w-full bg-white dark:bg-gray-900 border-x border-gray-100 dark:border-gray-800 box-content">
                  <div className="px-3 md:px-16">
                    <div className="flex flex-col min-h-screen">
                      <Header />

                      <main className="grow py-12 space-y-12">{children}</main>

                      <Footer />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
