/**
 * Every document-level delegate the chrome needs, bound once.
 *
 * Imported once by `AppShell.astro`, so it runs on every page and survives
 * every client-side navigation. Nothing here caches a node: the router replaces
 * the sidebar, the drawer and the bars on each swap, so each handler looks up
 * what it needs at event time (see `island.ts`).
 */
import { delegate } from "./island.ts";
import { applyTheme, isTheme, readTheme } from "./theme.ts";
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
 * One delegate for the desktop toggle and the drawer's Appearance segment.
 * `Base.astro` applies the skin before paint and before every swap; this only
 * handles clicks and paints `aria-pressed`. The drawer has no Forest option,
 * so a forest user sees neither of its options pressed.
 */
const paintTheme = (theme: string) => {
  for (const option of document.querySelectorAll<HTMLElement>("[data-theme-option]")) {
    option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme));
  }
};

delegate("click", "[data-theme-option]", (option) => {
  const next = option.dataset.themeOption;
  if (isTheme(next)) applyTheme(next);
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
