/**
 * The contact form island (`components/ContactForm.astro`).
 *
 * validate -> reCAPTCHA v3 token (action `contact_form_submit`, the one
 * `/api/contact` checks) -> POST JSON -> status line. api.js is loaded the
 * first time a form is on the page, never on other routes.
 */
import { island } from "./island.ts";

const ACTION = "contact_form_submit";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Grecaptcha {
  ready(cb: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
}
const recaptcha = () => (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;

let loading: Promise<void> | undefined;
function loadRecaptcha(siteKey: string): Promise<void> {
  if (recaptcha()) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = undefined;
      reject(new Error("reCAPTCHA failed to load"));
    };
    document.head.append(script);
  });
  return loading;
}

const token = (siteKey: string) =>
  new Promise<string>((resolve, reject) => {
    const g = recaptcha();
    if (!g) return reject(new Error("reCAPTCHA unavailable"));
    g.ready(() => g.execute(siteKey, { action: ACTION }).then(resolve, reject));
  });

island("[data-contact-form]", (root) => {
  const form = root as HTMLFormElement;
  const siteKey = form.dataset.siteKey ?? "";
  const status = form.querySelector<HTMLElement>("[data-contact-status]")!;
  const send = form.querySelector<HTMLButtonElement>("[data-contact-send]")!;
  const say = (text: string, state: "info" | "error" = "info") => {
    status.textContent = text;
    status.dataset.state = state;
  };

  if (!siteKey) {
    say("The contact form isn't set up yet. Please email instead.", "error");
    send.disabled = true;
    return;
  }
  // Warm up so the click doesn't wait on the script.
  loadRecaptcha(siteKey).catch(() => {});

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    // Mobile has no Timeline (pen `jItDW`); a hidden chip's default isn't an answer.
    const timelineShown = form.querySelector<HTMLElement>("[data-contact-timeline]")?.offsetParent !== null;

    for (const field of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")) {
      field.removeAttribute("aria-invalid");
    }
    const bad = !name ? "name" : !EMAIL.test(email) ? "email" : !message ? "message" : null;
    if (bad) {
      const field = form.querySelector<HTMLElement>(`[name="${bad}"]`)!;
      field.setAttribute("aria-invalid", "true");
      field.focus();
      say(bad === "email" ? "Please enter a valid email address." : `Please fill in your ${bad}.`, "error");
      return;
    }

    send.disabled = true;
    say("Sending…");
    try {
      await loadRecaptcha(siteKey);
      const recaptchaToken = await token(siteKey);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          topic: data.get("topic") ?? "",
          timeline: timelineShown ? (data.get("timeline") ?? "") : "",
          includeLinks: data.get("includeLinks") === "on",
          recaptchaToken,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) {
        say(body.message ?? body.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      form.reset();
      say("Thanks — your message is on its way. I'll get back to you soon.");
    } catch {
      say("Couldn't send the message. Check your connection and try again.", "error");
    } finally {
      send.disabled = false;
    }
  };

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
});
