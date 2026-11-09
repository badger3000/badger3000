import { island } from "./island.ts";

/**
 * Mobile only: the top bar and the tab bar slide out of the way while the reader
 * is dragging or scrolling `.body`, and slide back once the finger lifts and
 * scrolling settles.
 *
 * The bars are laid over `.main` (see AppShell) and `.body` is padded by their
 * measured heights (`--bar-top`, `--bar-bottom`), so hiding them never reflows
 * the content. The state is `data-bars="hidden"` on `.main`; the slide itself is
 * CSS. `.main` is re-rendered on every navigation, so the attribute resets with
 * the page and the listeners here are rebound per page (`island`).
 */
const SETTLE_MS = 150;
const DRAG_PX = 6;

const mobile = () => matchMedia("(max-width: 720px)");
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)");

/** Typing (keyboard up) or the drawer being open keeps the bars where they are. */
const pinned = () =>
  !!document.querySelector("dialog[open]") ||
  !!document.activeElement?.matches("input, textarea, select, [contenteditable]");

island(".body", (body) => {
  const main = body.closest<HTMLElement>(".main");
  if (!main) return;

  const top = main.querySelector<HTMLElement>(".m-topbar");
  const bottom = main.querySelector<HTMLElement>(".tabbar");

  const measure = () => {
    const on = mobile().matches;
    main.style.setProperty("--bar-top", `${on && top ? top.offsetHeight : 0}px`);
    main.style.setProperty("--bar-bottom", `${on && bottom ? bottom.offsetHeight : 0}px`);
  };
  const observer = new ResizeObserver(measure);
  for (const bar of [top, bottom]) if (bar) observer.observe(bar);
  measure();

  let timer: ReturnType<typeof setTimeout> | undefined;
  let touching = false;
  let startY = 0;

  const show = () => delete main.dataset.bars;
  const hide = () => {
    if (!mobile().matches || reduced().matches || pinned() || body.scrollTop <= 0) return;
    main.dataset.bars = "hidden";
  };
  /** Bring the bars back once nothing is touching or scrolling. */
  const settle = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!touching) show();
    }, SETTLE_MS);
  };

  const onScroll = () => {
    if (body.scrollTop <= 0) {
      show();
      return;
    }
    hide();
    settle();
  };
  const onTouchStart = (event: TouchEvent) => {
    touching = true;
    startY = event.touches[0]?.clientY ?? 0;
    clearTimeout(timer);
  };
  const onTouchMove = (event: TouchEvent) => {
    const y = event.touches[0]?.clientY ?? startY;
    if (Math.abs(y - startY) > DRAG_PX) hide();
  };
  const onTouchEnd = () => {
    touching = false;
    settle();
  };

  body.addEventListener("scroll", onScroll, { passive: true });
  body.addEventListener("touchstart", onTouchStart, { passive: true });
  body.addEventListener("touchmove", onTouchMove, { passive: true });
  body.addEventListener("touchend", onTouchEnd, { passive: true });
  body.addEventListener("touchcancel", onTouchEnd, { passive: true });
  const onFocus = () => show();
  document.addEventListener("focusin", onFocus);
  const query = mobile();
  query.addEventListener("change", measure);

  return () => {
    clearTimeout(timer);
    observer.disconnect();
    body.removeEventListener("scroll", onScroll);
    body.removeEventListener("touchstart", onTouchStart);
    body.removeEventListener("touchmove", onTouchMove);
    body.removeEventListener("touchend", onTouchEnd);
    body.removeEventListener("touchcancel", onTouchEnd);
    document.removeEventListener("focusin", onFocus);
    query.removeEventListener("change", measure);
  };
});
