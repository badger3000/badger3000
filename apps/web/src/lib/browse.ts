/**
 * One client-side filter, shared by every browse screen.
 *
 * The site is a static build, so there is no server to ask: each item carries
 * `data-search` (and `data-topic` where the screen has topic chips) and this
 * hides the ones that do not match. An item without `data-search` is matched on
 * its own text and link URLs (Bookmarks, where the attribute would repeat the
 * whole page). Matching items open any `<details>` they hold while a search is
 * on; clearing it puts them back. A root that also has `button[data-view]`s
 * and a `[data-grid]` gets the grid | list toggle (Projects).
 *
 * Mounted through `island()`, so it binds once per `[data-browse]` per page-load.
 */
import { island } from "./island.ts";

island("[data-browse]", (root) => {
  // Items are the root's; the controls can sit anywhere on the page — the
  // FilterBar and the PageHeader search are siblings of the root, not inside it.
  const page = root.closest("main") ?? document;
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-item]"));
  const chips = Array.from(page.querySelectorAll<HTMLButtonElement>("[data-filter-chip]"));
  const search = page.querySelector<HTMLInputElement>('input[type="search"], input[name="q"]');
  const empty = page.querySelector<HTMLElement>("[data-empty]");

  let topic = "all";
  let term = "";

  // Built on the first search, not at load: most visits never search. The
  // spoken-only text (ExternalLink's "(opens in a new tab)") is left out, or
  // every folder would match "tab".
  const texts = new WeakMap<HTMLElement, string>();
  const textOf = (item: HTMLElement): string => {
    if (item.dataset.search !== undefined) return item.dataset.search;
    let text = texts.get(item);
    if (text === undefined) {
      const words: string[] = [];
      const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.parentElement?.closest(".ext-sr")) words.push(node.textContent ?? "");
      }
      for (const link of item.querySelectorAll<HTMLAnchorElement>("a[href]")) words.push(link.href);
      text = words.join(" ").toLowerCase();
      texts.set(item, text);
    }
    return text;
  };

  // Each <details>' own state from before the search, restored when it clears.
  const folds = Array.from(root.querySelectorAll<HTMLDetailsElement>("[data-item] details"));
  let before: boolean[] | null = null;

  const apply = () => {
    if (term && !before) before = folds.map((fold) => fold.open);
    let shown = 0;
    for (const item of items) {
      const matchesTopic = topic === "all" || item.dataset.topic === topic;
      const matchesTerm = !term || textOf(item).includes(term);
      const visible = matchesTopic && matchesTerm;
      item.hidden = !visible;
      if (visible) shown++;
      if (visible && term) for (const fold of item.querySelectorAll("details")) fold.open = true;
    }
    if (!term && before) {
      folds.forEach((fold, i) => (fold.open = before![i] ?? fold.open));
      before = null;
    }
    if (empty) empty.hidden = shown > 0;
  };

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      topic = chip.dataset.filterChip ?? "all";
      for (const other of chips) {
        other.setAttribute("aria-pressed", String(other === chip));
      }
      apply();
    });
  }

  search?.addEventListener("input", () => {
    term = search.value.trim().toLowerCase();
    apply();
  });

  const grid = root.querySelector<HTMLElement>("[data-grid]");
  const views = Array.from(page.querySelectorAll<HTMLButtonElement>("button[data-view]"));
  for (const button of views) {
    button.addEventListener("click", () => {
      grid?.setAttribute("data-view", button.dataset.view ?? "grid");
      for (const other of views) other.setAttribute("aria-pressed", String(other === button));
    });
  }
});
