/**
 * One client-side filter, shared by every browse screen.
 *
 * The site is a static build, so there is no server to ask: each item carries
 * `data-search` (and `data-topic` where the screen has topic chips) and this
 * hides the ones that do not match. Re-initialised on `astro:page-load` because
 * the router replaces the markup on navigation.
 */
const init = () => {
  for (const root of document.querySelectorAll<HTMLElement>("[data-browse]")) {
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-item]"));
    const chips = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-filter-chip]"),
    );
    const search = root.querySelector<HTMLInputElement>('input[type="search"], input[name="q"]');
    const empty = document.querySelector<HTMLElement>("[data-empty]");

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
  }
};

init();
document.addEventListener("astro:page-load", init);