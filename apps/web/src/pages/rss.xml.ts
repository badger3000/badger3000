/**
 * GET /rss.xml — articles and pens, newest 10 (parity with the Next app's
 * `/api/articles-feed`, which `/api/articles-feed` here re-exports for the
 * README workflow).
 *
 * Prerendered, like every page: the feed changes when content is published,
 * and publishing rebuilds the site. The README workflow's parser
 * (`scripts/update-readme.js`) reads `<item>`, `<title>` and `<link>` in that
 * order, which is how @astrojs/rss writes them; keep it that way.
 *
 * No placeholder item when there is no content (the Next route added a
 * "Welcome to my blog" one): an empty channel is valid RSS, and a placeholder
 * would end up in the profile README.
 */
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { querySet } from "../lib/sanity/index.ts";
import { AUTHOR } from "../lib/seo.ts";

export const prerender = true;

/** The detail route of each feed type, built by B3a's `[slug]` pages. */
const ROUTE = { articles: "/articles", codepen: "/codepen" } as const;

export const GET: APIRoute = async ({ site, url }) => {
  const origin = site ?? new URL(url.origin);
  const self = new URL(url.pathname.replace(/\/$/, ""), origin).href;
  const posts = await querySet.feed();

  return rss({
    title: `${AUTHOR} - Articles`,
    description: "Latest articles and insights",
    site: origin,
    trailingSlash: false,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      `<language>en</language>`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<copyright>© ${new Date().getFullYear()} ${AUTHOR}</copyright>`,
      `<atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    ].join(""),
    items: posts.map((post) => ({
      title: post.title,
      link: `${ROUTE[post.type]}/${post.slug}`,
      description: post.excerpt ?? "Read this article on my blog",
      pubDate: new Date(post.publishedAt),
    })),
  });
};
