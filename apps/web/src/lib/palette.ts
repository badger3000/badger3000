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
 * without anyone hand-assigning them.
 */
const PAIRS: [string, string][] = [
  ["#f6c6ad", "#e4572e"], // coral  — ProjectCard FE7oC
  ["#e7d4f5", "#7c3aed"], // violet — Browse — Articles
  ["#bfe0d0", "#3bbe7a"], // green
  ["#bce9ea", "#36c3d6"], // cyan
  ["#fbe3b3", "#f59e0b"], // amber
  ["#cbd9f2", "#5b7cc2"], // blue   — Browse — Articles secondary
];

const hash = (seed: string): number => {
  let value = 0;
  for (let i = 0; i < seed.length; i++) value = (value * 31 + seed.charCodeAt(i)) >>> 0;
  return value;
};

/** A CSS gradient for any id: same id, same colours, on every build. */
export function gradientFor(seed: string): string {
  const [from, to] = PAIRS[hash(seed) % PAIRS.length];
  return `linear-gradient(220deg, ${from} 0%, ${to} 100%)`;
}

/** Monogram colours for avatars and favicons, from the same placeholder idea. */
const TINTS = ["#e4572e", "#5b7cc2", "#3bbe7a", "#f59e0b", "#6366f1", "#36c3d6", "#ec4899", "#7c3aed"];

export function tintFor(seed: string): string {
  return TINTS[hash(seed) % TINTS.length];
}