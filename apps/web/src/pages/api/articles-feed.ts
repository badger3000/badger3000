/**
 * GET /api/articles-feed — the same feed as `/rss.xml`, at the path the Next app
 * served it from. The weekly README workflow (`scripts/update-readme.js`) and
 * any existing subscribers read this URL, so it stays.
 *
 * Prerendered to an extensionless file; `public/_headers` gives it the RSS
 * content type.
 */
export { GET } from "../rss.xml.ts";

export const prerender = true;
