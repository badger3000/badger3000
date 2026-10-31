/**
 * Google Tag Manager loader (ADR 0014).
 *
 * The standard snippet is an inline script in <head>: it would need a second CSP
 * hash and starts the download before the page has painted. This module is a
 * normal bundled script instead, so the CSP stays `'self'` plus one host, and
 * gtm.js is requested after `load`, in idle time, off the critical path.
 *
 * - Consent Mode v2 defaults: ad signals denied (the site runs no ads), analytics
 *   granted. Change the `default` call below if a consent banner is added.
 * - Global Privacy Control or Do Not Track on → nothing is loaded.
 * - `<ClientRouter />` navigations are not page loads, so each one pushes a
 *   `virtual_page_view` event (the first load is counted by GTM itself).
 *   GTM-side: a Custom Event trigger on `virtual_page_view` firing the GA4
 *   `page_view` event tag, and GA4's "page changes based on browser history
 *   events" turned off, or every navigation counts twice.
 */
export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const id = document.querySelector<HTMLMetaElement>('meta[name="gtm-id"]')?.content ?? "";
const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
const optedOut = nav.globalPrivacyControl === true || nav.doNotTrack === "1";

if (/^GTM-[A-Z0-9]+$/.test(id) && !optedOut) start(id);

function start(containerId: string): void {
  const layer = (window.dataLayer ??= []);
  // GTM's command queue wants `arguments` objects, not arrays.
  function gtag(..._args: unknown[]): void {
    layer.push(arguments);
  }
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });

  const load = () => {
    layer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
    document.head.append(script);
  };
  const schedule = () => {
    if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 3000 });
    else setTimeout(load, 2000);
  };
  if (document.readyState === "complete") schedule();
  else addEventListener("load", schedule, { once: true });

  let first = true;
  let previous = document.referrer;
  document.addEventListener("astro:page-load", () => {
    const from = previous;
    previous = location.href;
    if (first) {
      first = false;
      return;
    }
    layer.push({
      event: "virtual_page_view",
      page_location: location.href,
      page_path: location.pathname,
      page_title: document.title,
      page_referrer: from,
    });
  });
}
