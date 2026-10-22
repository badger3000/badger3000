/**
 * One client-side filter, shared by every browse screen.
 *
 * The site is a static build, so there is no server to ask: each item carries
 * `data-search` (and `data-topic` where the screen has topic chips) and this
 * hides the ones that do not match. A root that also has `button[data-view]`s
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

  const apply = () => {
    let shown = 0;
    for (const item of items) {
      const matchesTopic = topic === "all" || item.dataset.topic === topic;
      const matchesTerm = !term || (item.dataset.search ?? "").includes(term);
      const visible = matchesTopic && matchesTerm;
      item.hidden = !visible;
      if (visible) shown++;
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
