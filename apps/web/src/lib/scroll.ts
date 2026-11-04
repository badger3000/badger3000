/**
 * Scroll an element into view by moving `.body`, the page's one scroll
 * container, and nothing else.
 *
 * `Element.scrollIntoView` also scrolls every clipped ancestor. `.shell` and
 * `.main` are `100dvh` with `overflow: hidden`, which can still be scrolled by
 * script, so the call could shove the whole app up: the top bar and footer slid
 * out of view and nothing could scroll them back.
 */
export function reveal(el: HTMLElement, block: "nearest" | "center" = "nearest"): void {
  const box = el.closest<HTMLElement>(".body");
  if (!box) return;
  const item = el.getBoundingClientRect();
  const view = box.getBoundingClientRect();
  if (block === "center") {
    box.scrollTop += item.top + item.height / 2 - (view.top + view.height / 2);
  } else if (item.bottom > view.bottom) {
    box.scrollTop += item.bottom - view.bottom;
  } else if (item.top < view.top) {
    box.scrollTop -= view.top - item.top;
  }
}
