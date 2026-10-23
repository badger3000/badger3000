/**
 * Every document-level delegate the chrome needs, bound once.
 *
 * Imported once by `AppShell.astro`, so it runs on every page and survives
 * every client-side navigation. Nothing here caches a node: the router replaces
 * the sidebar, the drawer and the bars on each swap, so each handler looks up
 * what it needs at event time (see `island.ts`).
 */
import { delegate } from "./island.ts";
import { THEMES, applyTheme, isTheme, readTheme } from "./theme.ts";
import { reset } from "./chat.ts";

const drawer = () => document.querySelector<HTMLDialogElement>("[data-drawer]");
const composer = () => document.querySelector<HTMLInputElement>("[data-composer-input]");

// --- Mobile drawer ---------------------------------------------------------

delegate("click", "[data-drawer-open]", () => {
  const dialog = drawer();
  if (dialog && !dialog.open) dialog.showModal();
});
delegate("click", "[data-drawer-close]", () => drawer()?.close());

// A click on the backdrop lands on the dialog element itself; so does one on
// the dialog's own padding, which must not close it. `offset*` is the layout
// box, so the slide-in transform cannot make an inside click look outside.
delegate<MouseEvent>("click", "[data-drawer]", (dialog, event) => {
  if (event.target !== dialog) return;
  const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = dialog;
  const inside =
    event.clientX >= left && event.clientX <= left + width && event.clientY >= top && event.clientY <= top + height;
  if (!inside) (dialog as HTMLDialogElement).close();
});

// The old dialog leaves the top layer with the old page; close it explicitly so
// nothing (focus, `inert`) is left behind for the new one.
document.addEventListener("astro:before-swap", () => drawer()?.close());

// --- Back ------------------------------------------------------------------

/** True once this document has made a client-side navigation. */
let navigated = false;
document.addEventListener("astro:after-swap", () => {
  navigated = true;
});

// A deep link has nothing on this site to go back to, so go home instead of
// leaving.
delegate("click", "[data-drawer-back]", () => {
  if (navigated || document.referrer.startsWith(location.origin)) history.back();
  else location.assign("/");
});

// --- Theme -----------------------------------------------------------------

/**
 * The theme picker has two distinct affordances:
 *
 *   1. The gear glyph in the profile block (`[data-cycle-theme]`) is a pure
 *      drawer trigger. Pressed while the tray is closed: open it. Pressed
 *      while the tray is open: close it. The gear never touches the theme
 *      itself — it just reveals or hides the picker.
 *
 *   2. The pill row (`[data-theme-option]`) selects the actual skin. Clicking
 *      one runs `applyTheme()` and the browser interpolates every
 *      `transition` rule on the way through, so the highlight slides,
 *      the colours transition, the gear glyph spins. This is also where a
 *      user can jump straight to a skin without scrolling through the
 *      others.
 *
 * Each `applyTheme()` triggers `badger:theme`; we listen on that to repaint
 * `aria-pressed` and the indicator position so the highlight follows the
 * stored skin. The gear itself rotates on every picker-toggle via the
 * `spin` class — a reflow between `remove` and `add` is what makes the
 * second click actually restart the animation instead of caching.
 */
const indexOf = (theme: string): number => {
  const i = (THEMES as readonly string[]).indexOf(theme);
  return i < 0 ? 0 : i;
};

const paintTheme = (theme: string) => {
  const idx = indexOf(theme);
  for (const option of document.querySelectorAll<HTMLElement>("[data-theme-option]")) {
    option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme));
  }
  for (const toggle of document.querySelectorAll<HTMLElement>("[data-theme-toggle]")) {
    toggle.style.setProperty("--indicator-x", String(idx));
  }
};

const spinGears = () => {
  for (const glyph of document.querySelectorAll<SVGElement>(".gear > svg")) {
    glyph.classList.remove("spin");
    void glyph.getBoundingClientRect();
    glyph.classList.add("spin");
  }
};

delegate("click", "[data-cycle-theme]", () => {
  const block = document.querySelector<HTMLElement>("[data-profile-block]");
  if (!block) return;
  spinGears();
  block.dataset.trayOpen = block.dataset.trayOpen === "true" ? "false" : "true";
});

delegate("click", "[data-theme-option]", (option) => {
  const next = option.dataset.themeOption;
  if (!isTheme(next)) return;
  applyTheme(next);
});

addEventListener("badger:theme", (event) => paintTheme((event as CustomEvent<string>).detail));
document.addEventListener("astro:page-load", () => paintTheme(readTheme()));

// --- Chat ------------------------------------------------------------------

/**
 * "New conversation" (sidebar and drawer) must actually start a fresh session
 * from any page: forget the thread, then either let the link navigate to `/` or,
 * on `/` already, stay put and focus the composer.
 */
delegate<MouseEvent>("click", "[data-new-chat]", (link, event) => {
  // A new tab or window keeps this one's conversation.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  reset();
  drawer()?.close();

  const target = (link as HTMLAnchorElement).pathname.replace(/\/$/, "") || "/";
  const here = location.pathname.replace(/\/$/, "") || "/";
  if (target !== here) return; // let the navigation happen
  event.preventDefault();
  composer()?.focus();
});

// SuggestionChips fill the composer rather than sending, so the question can be
// edited first.
delegate("click", "[data-suggestion]", (chip) => {
  const prompt = chip.dataset.suggestion;
  const field = composer();
  if (!prompt || !field) return;
  field.value = prompt;
  field.focus();
  field.dispatchEvent(new Event("input", { bubbles: true }));
});

// --- Search ----------------------------------------------------------------

// The pen's mobile bar has a search button but no field; the page owns the only
// search input, so the button focuses that instead of being decorative.
delegate("click", "[data-search-focus]", () => {
  const field = document.querySelector<HTMLInputElement>('input[name="q"]:not([data-composer-input])');
  if (!field) return;
  field.scrollIntoView({ block: "center" });
  field.focus({ preventScroll: true });
});
