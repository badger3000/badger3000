import { imageUrl } from "@badger3000/sanity";

/**
 * Helpers for the Portable Text block components: Sanity image sources, video
 * embed URLs and the code theme. Plain functions, no Astro, so the detail pages
 * can share them (the hero uses `sources` too).
 */

/** An image as the detail queries project it (`FIGURE` in queries/detail.ts). */
export interface FigureAsset {
  url: string;
  metadata: { dimensions: { width: number; height: number } | null } | null;
}

const WIDTHS = [480, 720, 960, 1440, 1920];

/**
 * A Sanity CDN URL at `width`. `imageUrl`'s default writes `auto=auto`, which
 * the CDN rejects with a 400 (the only valid value is `auto=format`), so pass
 * `format` explicitly until the package default is fixed.
 */
export const cdnUrl = (url: string | undefined, width: number) => imageUrl(url, { width, format: "format" });

/**
 * `src`/`srcset` and intrinsic `width`/`height` for a Sanity image shown at
 * `display` CSS pixels wide. Never asks the CDN to upscale: widths past the
 * original are dropped. The height keeps the original's aspect ratio, so the
 * box is reserved before the image loads.
 */
export function sources(asset: FigureAsset, display: number) {
  const natural = asset.metadata?.dimensions;
  const max = natural?.width ?? display * 2;
  const widths = [...WIDTHS.filter((w) => w < max && w < display * 2), Math.min(max, display * 2)];
  const unique = [...new Set(widths)].sort((a, b) => a - b);
  const width = Math.min(display, max);
  const height = natural ? Math.round((width * natural.height) / natural.width) : undefined;
  return {
    src: cdnUrl(asset.url, width)!,
    srcset: unique.map((w) => `${cdnUrl(asset.url, w)} ${w}w`).join(", "),
    width,
    height,
  };
}

/**
 * A YouTube or Vimeo page URL → its embed URL, or undefined for anything else.
 * YouTube goes through the no-cookie host, so nothing is set until it plays.
 */
export function embedUrl(url: string | undefined, provider?: string): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (provider === "youtube" || host === "youtube.com" || host === "youtu.be") {
    const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : undefined;
  }
  if (provider === "vimeo" || host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : undefined;
  }
  return undefined;
}

/**
 * The Shiki theme for `<Code>`: every colour is a `--a-code-*` token, so code
 * blocks follow the skin like everything else instead of shipping a fixed
 * palette. The scopes are the broad TextMate families; anything unmatched is
 * plain `--a-code-text`.
 */
export const codeTheme = {
  name: "badger-code",
  type: "dark" as const,
  colors: {
    "editor.background": "var(--a-code-bg)",
    "editor.foreground": "var(--a-code-text)",
  },
  settings: [
    { settings: { foreground: "var(--a-code-text)", background: "var(--a-code-bg)" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--a-code-comment)", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "variable.language",
        "entity.name.tag",
        "support.type.property-name",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "var(--a-code-keyword)" },
    },
    {
      scope: ["string", "constant.numeric", "constant.language", "constant.other", "support.constant"],
      settings: { foreground: "var(--a-code-string)" },
    },
  ],
};
