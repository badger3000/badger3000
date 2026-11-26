/**
 * The golf page's island: the All / Counted filter, the course drawer and the
 * courses scroller. Same rules as the rest (see `island.ts`): document-level
 * delegates bound once, per-page DOM looked up at event time or inside an
 * `island()` that re-runs on every `astro:page-load`.
 */
import { delegate, island } from "./island.ts";

const dialog = () => document.querySelector<HTMLDialogElement>("[data-course-drawer]");
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Round filter -----------------------------------------------------------

delegate("click", '[data-chip-group="rounds"]', (chip) => {
  const mode = chip.dataset.chipValue === "counted" ? "counted" : "all";
  const section = chip.closest("section");
  const table = section?.querySelector<HTMLElement>("[data-rounds-table]");
  if (!section || !table) return;
  table.dataset.filter = mode;
  for (const other of section.querySelectorAll<HTMLElement>('[data-chip-group="rounds"]')) {
    other.setAttribute("aria-pressed", String(other === chip));
  }
  const shown = table.querySelectorAll(mode === "counted" ? 'tbody tr[data-counts="true"]' : "tbody tr").length;
  const live = section.querySelector<HTMLElement>("[data-rounds-live]");
  if (live) live.textContent = mode === "counted" ? `Showing ${shown} counted ${shown === 1 ? "round" : "rounds"}` : `Showing all ${shown} rounds`;
});

// --- Course drawer ----------------------------------------------------------

/** The button that opened the drawer and its course, so focus can go back. */
let opener: HTMLElement | null = null;
let openSlug: string | null = null;

function openCourse(slug: string) {
  const el = dialog();
  const template = [...document.querySelectorAll<HTMLTemplateElement>("template[data-course-body]")].find(
    (t) => t.dataset.courseBody === slug,
  );
  const slot = el?.querySelector<HTMLElement>("[data-course-slot]");
  if (!el || !template || !slot) return;
  slot.replaceChildren(template.content.cloneNode(true));
  openSlug = slug;
  if (!el.open) el.showModal();
  const url = new URL(location.href);
  if (url.searchParams.get("course") !== slug) {
    url.searchParams.set("course", slug);
    history.replaceState(history.state, "", url);
  }
}

delegate("click", "[data-course]", (button) => {
  const slug = button.dataset.course;
  if (!slug) return;
  opener = button;
  openCourse(slug);
});

delegate("click", "[data-course-close]", () => dialog()?.close());

// A click on the backdrop lands on the dialog element itself; one on its own
// padding must not close it (same rule as the mobile drawer in shell.ts).
delegate<MouseEvent>("click", "[data-course-drawer]", (el, event) => {
  if (event.target !== el) return;
  const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = el;
  const inside = event.clientX >= left && event.clientX <= left + width && event.clientY >= top && event.clientY <= top + height;
  if (!inside) (el as HTMLDialogElement).close();
});

// `close` does not bubble, so catch it in the capture phase on the document.
document.addEventListener(
  "close",
  (event) => {
    const el = event.target as HTMLElement | null;
    if (!el?.matches?.("[data-course-drawer]")) return;
    const url = new URL(location.href);
    if (url.searchParams.has("course")) {
      url.searchParams.delete("course");
      history.replaceState(history.state, "", url);
    }
    // Focus goes back to the trigger. Its node can be gone (a ClientRouter swap),
    // so fall back to a lookup by slug.
    const back =
      opener && document.contains(opener)
        ? opener
        : openSlug
          ? document.querySelector<HTMLElement>(`[data-course="${CSS.escape(openSlug)}"]`)
          : null;
    back?.focus({ preventScroll: true });
    opener = null;
    openSlug = null;
    el.querySelector("[data-course-slot]")?.replaceChildren();
  },
  true,
);

document.addEventListener("astro:before-swap", () => dialog()?.close());

island("[data-course-drawer]", () => {
  // Deep link: /golf?course=prescott opens it on load.
  const slug = new URL(location.href).searchParams.get("course");
  if (slug) openCourse(slug);
});

// --- Courses scroller -------------------------------------------------------

island("[data-courses]", (root) => {
  const track = root.querySelector<HTMLElement>("[data-courses-track]");
  const prev = root.querySelector<HTMLButtonElement>("[data-courses-prev]");
  const next = root.querySelector<HTMLButtonElement>("[data-courses-next]");
  const controls = root.querySelector<HTMLElement>("[data-courses-controls]");
  if (!track || !prev || !next || !controls) return;

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    controls.hidden = max <= 1;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };
  const step = (dir: 1 | -1) => {
    const card = track.querySelector<HTMLElement>("li");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * ((card?.offsetWidth ?? 254) + gap), behavior: reduced() ? "auto" : "smooth" });
  };
  const onPrev = () => step(-1);
  const onNext = () => step(1);

  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  track.addEventListener("scroll", update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(track);
  update();

  return () => {
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    track.removeEventListener("scroll", update);
    observer.disconnect();
  };
});
