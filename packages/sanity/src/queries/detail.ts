import { defineQuery } from "groq";
import { IMAGE } from "./fragments.ts";

/**
 * Detail views — Article (pen I4mvDB) and Experiment (pen vKVLC), one document
 * by `$slug`, plus the slug lists their `getStaticPaths` prerender from.
 *
 * Related rows rank the same topic first and fill up with the newest, so there
 * are always 3 when the archive has them: `order()` on the boolean puts the
 * topic matches ahead, then `_createdAt` breaks the tie.
 */

/** An image with its caption; the alt and caption live on the image object. */
const FIGURE = `{
  alt,
  caption,
  "asset": asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } }
}`;

/**
 * Portable Text with its assets dereferenced, so the renderer never fetches.
 * Shared by `articles.content` (blockContent) and `codepen.description`.
 */
const BLOCKS = `[]{
  ...,
  _type == "image" => ${FIGURE},
  _type == "selfHostedVideo" => {
    ...,
    "videoFile": videoFile { "asset": asset->{ url, mimeType } },
    "poster": poster { "asset": asset->{ url } }
  }
}`;

/** `*[_type == "articles"]` slugs, for `pages/articles/[slug].astro`. */
export const articleSlugsQuery = defineQuery(
  `*[_type == "articles" && defined(slug.current)] | order(_createdAt desc).slug.current`,
);

/** `*[_type == "codepen"]` slugs, for `pages/codepen/[slug].astro`. */
export const experimentSlugsQuery = defineQuery(
  `*[_type == "codepen" && defined(slug.current)] | order(_createdAt desc).slug.current`,
);

/**
 * Article — Detail. The excerpt is the field itself (null hides the lede), not
 * the list's "Read more..." coalesce. There is no read-time field: it is the
 * plain text's length over 1000 characters (~200 words a minute), at least 1.
 * The byline falls back to the site owner when the article is not a citation.
 */
export const articleBySlugQuery = defineQuery(`*[_type == "articles" && slug.current == $slug][0] {
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  "topic": topic->title,
  "publishedAt": _createdAt,
  "readTime": math::max([1, round(length(pt::text(content)) / 1000)]),
  "byline": coalesce(authorName, *[_type == "settings"][0].name),
  "mainImage": main_image ${FIGURE},
  "content": content ${BLOCKS},
  "citation": select(defined(authorName) || defined(originalArticleUrl) => {
    authorName,
    authorProfileUrl,
    originalArticleUrl,
    disclaimer
  }),
  "related": *[_type == "articles" && defined(slug.current) && _id != ^._id]
    | order((topic._ref == ^.topic._ref) desc, _createdAt desc) [0...3] {
      "id": _id,
      title,
      "slug": slug.current,
      excerpt,
      "topic": topic->title
    }
}`);

/**
 * Experiments — Detail (`codepen`). `penUrl` is the pen's hash; the page builds
 * the embed, pen and fork URLs from it. `embedCode` is CodePen's own snippet,
 * used when the author pasted one. No tech, fork or heart fields exist (P-7).
 */
export const experimentBySlugQuery = defineQuery(`*[_type == "codepen" && slug.current == $slug][0] {
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  "topic": topic->title,
  penUrl,
  embedCode,
  "createdAt": _createdAt,
  "thumbnail": thumbnail ${IMAGE},
  "description": description ${BLOCKS},
  "related": *[_type == "codepen" && defined(slug.current) && _id != ^._id]
    | order((topic._ref == ^.topic._ref) desc, _createdAt desc) [0...3] {
      "id": _id,
      title,
      "slug": slug.current,
      "excerpt": coalesce(excerpt, description[0].children[0].text),
      "topic": topic->title
    }
}`);

/**
 * `sanity:check` fetches every query without params; these take a `$slug`, so
 * the check runs the slug list first and passes its first entry.
 */
export const detailSampleSlugs = {
  articleBySlug: articleSlugsQuery,
  experimentBySlug: experimentSlugsQuery,
} as const;
