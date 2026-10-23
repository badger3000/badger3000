# B3a lane: detail pages

Read `b2-_common.md`, then `b3-_common.md`. Report: **`design.md` §D (Detail views: build-ready spec)**, plus findings 27–29. Pen frames: Article — Detail `I4mvDB` and Experiments — Detail `vKVLC`, read through the pencil MCP.

## Your files

New `apps/web/src/pages/articles/[slug].astro`, `apps/web/src/pages/codepen/[slug].astro`, and new `apps/web/src/components/portable/**` (the Portable Text renderer and its block components). `apps/web/src/pages/articles.astro` and `codepen.astro`: **links only**. New `packages/sanity/src/queries/detail.ts`, plus its line in `queries/index.ts` and the typegen outputs. `packages/ui/**`: additions only, if a master needs a prop. `apps/web/package.json`: you may add a Portable Text library (`astro-portabletext` or `@portabletext/to-html`). For highlighting, use Astro's built-in `<Code>` (Shiki) and no new highlighter.
**Not:** `layouts/**`, `Base.astro`, the SEO component (B3b); `lib/agent/**`, `pages/api/**`, the existing chat queries (B3c).

## Tasks, in order

1. **Queries** (`detail.ts`, `defineQuery`):
   - `articleBySlugQuery` and `experimentBySlugQuery`: every field §D binds. Compute read time in GROQ. The excerpt has **no** "Read more…" coalesce.
   - Related queries: same topic, current item excluded, 3 items, falling back to the latest 3.
   - `articleSlugsQuery` and `experimentSlugsQuery` for `getStaticPaths`.

   Add them to the `queries` record so `sanity:check` covers them, then run typegen.
2. **Portable Text renderer** (`components/portable/`):
   - Blocks: paragraphs, `h2`/`h3`, lists, blockquote (3px `--a-accent` bar), links (external links get `rel` and a new-tab cue), inline images with `figcaption`.
   - The `code` type: `pre > code` with the head row (dots plus `filename`), Shiki via `<Code>`, `--a-code-*` tokens, and horizontal scroll inside `pre`, never on the page.
   - `video` and `selfHostedVideo`: lazy iframe or `<video>`.
   - Sized Sanity images through `imageUrl` (`width`, `height`, `srcset`) with `loading="lazy"`.
   - One component per block type, all tokens-only.
3. **`articles/[slug].astro`** per §D's Article table:
   - Byline: `AvatarUser`, the settings name, the date and the read time.
   - Hero: `main_image` with its caption, or the gradient fallback.
   - Citation `aside` only when `authorCitation`. The tags row is the topic only.
   - "More articles" uses 3 compact `ProjectCard`s.
   - Prerendered via `getStaticPaths`; with `SANITY_ALLOW_EMPTY=1` it builds zero pages without errors.
4. **`codepen/[slug].astro`** per §D's Experiments table:
   - The CodePen preview `iframe` (lazy, 16:9, `title`), using `embedCode` when present.
   - "View on CodePen" is `Button primary`, "Fork" is `Button secondary`. No heart.
   - The About section renders `description` through the renderer. No tech block (P-7).
   - Related: "More in {topic}".
5. **Links:** `articles.astro` and `codepen.astro` link to the detail routes instead of 404s or off-site (§D "Fixes this unblocks").
6. **Responsive:** follow §D's responsive list (≤720px gutters, full-bleed hero and preview, single-column related, clamped titles).

## Lane-specific checks

- The build emits one page per document: 8 articles and 28 experiments (compare with `sanity:check` counts). Every link on `/articles` and `/codepen` resolves (crawl `dist/` or curl your dev server; no 404s).
- Screenshots of one article with a code block and an image, and one experiment, at 1440×900 and 390×844 in light, dark and forest. Compare them with the pen frames (pencil MCP `get_screenshot` of `I4mvDB` and `vKVLC`) and list any deliberate differences. Keep the screenshots in your scratch dir.
- 390px: `document.documentElement.scrollWidth <= 390` on both detail pages, including with a long code line.
- No colour literals outside `packages/tokens` (`rg -n '#[0-9a-fA-F]{3,8}\b' apps/web/src packages/ui`).
