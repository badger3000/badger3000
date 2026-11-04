/**
 * The island lifecycle, in one place.
 *
 * `<ClientRouter />` replaces the page's markup on every navigation, so any node
 * found at module load is detached one click later — that is how the mobile
 * drawer died. The rule this file enforces:
 *
 * - Module scope holds only document-level delegated listeners, bound once.
 * - Per-page DOM is found on `astro:page-load` and never cached across pages.
 * - Binding a root is idempotent (`data-bound`), and its cleanup runs before the
 *   next swap.
 *
 * `astro:page-load` also fires on the first load (the router dispatches it on
 * `window.load`), so nothing should call its setup at the top level as well —
 * that double-bound every island before this.
 */
type Cleanup = void | (() => void);

/** Run `setup` once per matching root per page-load. */
export function island(selector: string, setup: (root: HTMLElement) => Cleanup): void {
  let cleanups: (() => void)[] = [];

  const mount = () => {
    for (const root of document.querySelectorAll<HTMLElement>(selector)) {
      const bound = (root.dataset.bound ?? "").split("|");
      if (bound.includes(selector)) continue;
      root.dataset.bound = [...bound.filter(Boolean), selector].join("|");
      const cleanup = setup(root);
      if (cleanup) cleanups.push(cleanup);
    }
  };

  document.addEventListener("astro:page-load", mount);
  document.addEventListener("astro:before-swap", () => {
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
  });
}

const delegated = new Set<string>();

/**
 * A document-level listener for everything matching `selector`, bound once per
 * document however often it is registered. Look other elements up inside `fn`,
 * at event time — never hold on to them.
 */
export function delegate<E extends Event = Event>(
  type: string,
  selector: string,
  fn: (element: HTMLElement, event: E) => void,
): void {
  const key = `${type} ${selector}`;
  if (delegated.has(key)) return;
  delegated.add(key);

  document.addEventListener(type, (event) => {
    const element = (event.target as Element | null)?.closest<HTMLElement>(selector);
    if (element) fn(element, event as E);
  });
}
