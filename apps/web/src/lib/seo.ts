/**
 * SEO — the per-page values `<Seo>` (components/Seo.astro) turns into <head>
 * tags. Pages pass `seo` to `Base` (or `Browse`); everything is optional and
 * falls back to the site defaults below.
 *
 * The host comes from `site` in astro.config.mjs (`Astro.site`), never from
 * here, so www-vs-apex is decided in one place.
 */
export interface SeoProps {
  title?: string;
  description?: string;
  /** Absolute URL, or a path under the site. */
  image?: string;
  type?: "website" | "article";
  /** ISO date, articles only. */
  publishedTime?: string;
  noindex?: boolean;
}

export const SITE_NAME = "Badger3000";
export const AUTHOR = "Kyle Ross";
export const DEFAULT_TITLE = "Badger3000 — Kyle Ross's AI";
export const DEFAULT_DESCRIPTION = "Badger3000 — Kyle Ross's AI. Ask about his projects, writing, and experience.";

/**
 * The default share image: the Next site's header art, at its real size (the
 * Next metadata claimed 1200×630). A designed 1200×630 card is a pen item.
 */
export const DEFAULT_IMAGE = { path: "/og/default.webp", width: 490, height: 320, alt: "Kyle Ross — Badger3000" };

/** Titles get the site name once: "Projects — Badger3000", never twice. */
export function pageTitle(title: string | undefined): string {
  if (!title) return DEFAULT_TITLE;
  return title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
}

/**
 * The canonical form of a path on `site`: no trailing slash (except `/`), no
 * `.html`, no query or hash. Build output is `projects.html`, and `Astro.url`
 * can carry either form depending on dev vs build.
 */
export function canonicalUrl(pathname: string, site: URL): string {
  const path = pathname.replace(/(\/index)?\.html$/, "").replace(/\/+$/, "");
  return new URL(path || "/", site).href;
}

/** An absolute URL for an image given as a path or a full URL. */
export function absoluteUrl(src: string, site: URL): string {
  return new URL(src, site).href;
}
