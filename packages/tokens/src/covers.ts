/**
 * The pen's placeholder cover gradients.
 *
 * The card covers in the design are gradients — placeholders standing in for
 * imagery. Several articles and projects do have real images in Sanity, but the
 * design says gradient, so it stays a gradient; swapping in `main_image` /
 * `project_image` is a one-line change once the pen allows it.
 *
 * The pairs are lifted verbatim from the cards in the pen and picked per item by
 * a hash of its id, so a page shows the same variety of colours the design does
 * without anyone hand-assigning them. The colours themselves live once, in
 * tokens.css (`--p-cover-N-from/-to`, `--p-tint-N`); this only picks which.
 */

/** How many `--p-cover-N-*` pairs tokens.css defines (1-based). */
export const COVER_COUNT = 6;
/** How many `--p-tint-N` colours tokens.css defines (1-based). */
export const TINT_COUNT = 8;

const hash = (seed: string): number => {
  let value = 0;
  for (let i = 0; i < seed.length; i++) value = (value * 31 + seed.charCodeAt(i)) >>> 0;
  return value;
};

/** A CSS gradient for any id: same id, same colours, on every build. */
export function gradientFor(seed: string): string {
  const n = (hash(seed) % COVER_COUNT) + 1;
  return `linear-gradient(220deg, var(--p-cover-${n}-from) 0%, var(--p-cover-${n}-to) 100%)`;
}

/** Monogram colours for avatars and favicons, from the same placeholder idea. */
export function tintFor(seed: string): string {
  return `var(--p-tint-${(hash(seed) % TINT_COUNT) + 1})`;
}
