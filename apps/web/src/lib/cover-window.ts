/**
 * The experiment card's code window, re-rolled per visit and animated on arrival.
 *
 * The page is static, so the server renders the pen's first window (GWZwY) and
 * this island picks a fresh palette and set of bar widths in the browser. The
 * CSS keeps the bars hidden while scripting is on, so the default is never seen
 * before the re-roll; `data-in-view` plays the arrival once the card is on screen
 * and `data-done` settles it, so a filter hiding and re-showing the card (which
 * would restart a CSS animation) stays still.
 *
 * Colours come from `WINDOW_PALETTES` / `--p-line-*` in the tokens package; this
 * file only chooses between them.
 */
import { lineColor, WINDOW_PALETTES } from "@badger3000/tokens/covers";
import { island } from "./island.ts";

const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const between = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

/** Four bar widths, %, in the pen's range; the first and last differ visibly. */
const widths = (): number[] => {
  const w = [between(38, 92), between(38, 92), between(38, 92), between(38, 92)];
  while (Math.abs(w[3] - w[0]) < 12) w[3] = between(38, 92);
  return w;
};

const settle = (window: HTMLElement) => {
  window.setAttribute("data-in-view", "");
  window.setAttribute("data-done", "");
};

island("[data-cover-window]", (window) => {
  const [a, b, c] = pick(WINDOW_PALETTES);
  [a, b, c].forEach((name, index) => window.style.setProperty(`--l${index + 1}`, lineColor(name)));
  widths().forEach((value, index) => window.style.setProperty(`--w${index + 1}`, `${value}%`));

  // No motion wanted, or no way to watch the card: show the final state at once.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in globalThis)) {
    settle(window);
    return;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      window.setAttribute("data-in-view", "");
      // The last bar's animation ends last; the timer covers a tab that never
      // fires `animationend` (hidden while loading).
      const last = window.querySelector(".lines b:last-child");
      const done = () => {
        clearTimeout(timer);
        window.setAttribute("data-done", "");
      };
      last?.addEventListener("animationend", done, { once: true });
      timer = setTimeout(done, 1500);
    },
    { threshold: 0.3 },
  );
  // Observing the card: the window itself is clipped by it.
  observer.observe(window.closest("article") ?? window);

  return () => {
    observer.disconnect();
    clearTimeout(timer);
  };
});
