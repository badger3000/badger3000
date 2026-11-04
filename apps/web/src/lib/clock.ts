/**
 * A live clock for one IANA zone (`[data-clock="America/Denver"]` wrapping a
 * `<time>`). The static page has no time (it would be stale the moment it was
 * built); `data-live` is set after the first tick and CSS reveals the time and
 * the live dot.
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
  root.dataset.live = "";
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
});
