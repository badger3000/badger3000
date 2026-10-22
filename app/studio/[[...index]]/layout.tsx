import type {Metadata} from "next";
import {metadata as studioMetadata} from "next-sanity/studio";

// Studio is its own root layout (see app/(site)/layout.tsx for the site's),
// so it renders full-screen without the site's header, footer and styles.
export {viewport} from "next-sanity/studio";

export const metadata: Metadata = {
  ...studioMetadata,
  title: "Sanity Studio",
  description: "Content management for your blog",
};

export default function StudioLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body style={{margin: 0}}>{children}</body>
    </html>
  );
}
