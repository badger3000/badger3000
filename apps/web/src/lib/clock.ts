/**
 * A live clock for one IANA zone (`[data-clock="America/Denver"]` wrapping a
 * `<time>`). The markup ships hidden, so the static page never shows a stale
 * time; it appears once the first tick has run.
 */
import { island } from "./island.ts";

island("[data-clock]", (root) => {
  const zone = root.dataset.clock!;
  const time = root.querySelector("time")!;
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const tick = () => {
    const now = new Date();
    time.textContent = format.format(now);
    time.dateTime = now.toISOString();
  };
  tick();
  root.hidden = false;
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
});
