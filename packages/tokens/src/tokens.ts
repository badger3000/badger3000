/**
 * The token names, for TypeScript. Names only: tokens.css is the one place a
 * value lives, so nothing here can drift from it. `pnpm run check` in this
 * package compares the lists below with the CSS.
 */

/** The skins, in picker order. Each is a `[data-theme]` block in tokens.css. */
export const themes = ["light", "dark", "forest"] as const;
export type Theme = (typeof themes)[number];

/** Every semantic token, without the leading `--`. */
export const semanticTokens = [
  "a-bg",
  "a-surface",
  "a-sidebar",
  "a-ink",
  "a-muted",
  "a-faint",
  "a-line",
  "a-line-2",
  "a-accent",
  "a-accent-soft",
  "a-on-accent",
  "a-subtle",
  "a-accent-text",
  "a-ok",
  "a-badge-key",
  "a-on-cover",
  "a-on-cover-soft",
  "a-on-cover-muted",
  "a-on-cover-faint",
  "a-cover-overlay",
  "a-cover-window",
  "a-cover-window-dot",
  "a-cover-window-line",
  "a-scrim",
  "a-code-bg",
  "a-code-head",
  "a-code-text",
  "a-code-comment",
  "a-code-keyword",
  "a-code-string",
] as const;

/** A semantic custom property name, e.g. `"--a-accent"`. */
export type SemanticToken = `--${(typeof semanticTokens)[number]}`;

/** `var(--a-…)` for a known token, so a typo fails the type check. */
export const token = (name: SemanticToken): string => `var(${name})`;
