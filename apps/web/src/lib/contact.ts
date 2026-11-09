/**
 * The contact form island (`components/ContactForm.astro`).
 *
 * Turnstile widget (managed, rendered in the form) -> validate -> POST JSON
 * with the widget's token -> status line. api.js is loaded the first time a
 * form is on the page, never on other routes. A token is single-use, so the
 * widget resets after every send attempt.
 */
import { island } from "./island.ts";

// Domain labels exclude "." so each dot can only match one way (no polynomial backtracking).
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const MAX_EMAIL_LENGTH = 254;

interface TurnstileOptions {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}
interface Turnstile {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}
const turnstile = () => (window as unknown as { turnstile?: Turnstile }).turnstile;

let loading: Promise<Turnstile> | undefined;
function loadTurnstile(): Promise<Turnstile> {
  const ready = turnstile();
  if (ready) return Promise.resolve(ready);
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      const api = turnstile();
      if (api) resolve(api);
      else {
        loading = undefined;
        reject(new Error("Turnstile unavailable"));
      }
    };
    script.onerror = () => {
      loading = undefined;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.append(script);
  });
  return loading;
}

island("[data-contact-form]", (root) => {
  const form = root as HTMLFormElement;
  const siteKey = form.dataset.siteKey ?? "";
  const status = form.querySelector<HTMLElement>("[data-contact-status]")!;
  const send = form.querySelector<HTMLButtonElement>("[data-contact-send]")!;
  const sent = form.parentElement?.querySelector<HTMLElement>("[data-contact-success]") ?? null;

  /** Swap the form for the success card (pen `x7QM0G`), filled with what was sent. */
  const showSuccess = (name: string, topic: string, timeline: string) => {
    if (!sent) return;
    const first = name.split(/\s+/)[0] ?? "";
    sent.querySelector("[data-contact-ack]")!.textContent = first
      ? sent.dataset.ack!.replace("{name}", first)
      : sent.dataset.ackAnonymous!;
    for (const [selector, value] of [
      ["[data-contact-sent-topic]", topic],
      ["[data-contact-sent-timeline]", timeline],
    ] as const) {
      const row = sent.querySelector<HTMLElement>(selector)!;
      row.hidden = !value;
      row.querySelector("dd")!.textContent = value;
    }
    form.hidden = true;
    sent.hidden = false;
    sent.querySelector<HTMLElement>("h2")?.focus();
  };
  const again = sent?.querySelector<HTMLButtonElement>("[data-contact-again]");
  const onAgain = () => {
    sent!.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLElement>("[name=name]")?.focus();
  };
  again?.addEventListener("click", onAgain);
  const say = (text: string, state: "info" | "error" = "info") => {
    status.textContent = text;
    status.dataset.state = state;
  };

  if (!siteKey) {
    say("The contact form isn't set up yet. Please email instead.", "error");
    send.disabled = true;
    return;
  }

  let token = "";
  let widgetId: string | undefined;
  let api: Turnstile | undefined;
  let gone = false;
  const container = form.querySelector<HTMLElement>("[data-turnstile]");
  const resetWidget = () => {
    token = "";
    if (api && widgetId !== undefined) api.reset(widgetId);
  };
  loadTurnstile().then(
    (loaded) => {
      // The island may have been torn down (navigation) while the script loaded.
      if (gone || !container) return;
      api = loaded;
      widgetId = loaded.render(container, {
        sitekey: siteKey,
        theme: "auto",
        callback: (value) => {
          token = value;
        },
        "expired-callback": () => {
          token = "";
        },
        "error-callback": () => {
          token = "";
          say("The security check failed to load. Please refresh the page.", "error");
        },
      });
    },
    () => say("The security check failed to load. Please refresh the page.", "error"),
  );

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
    const bad = !name ? "name" : email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email) ? "email" : !message ? "message" : null;
    if (bad) {
      const field = form.querySelector<HTMLElement>(`[name="${bad}"]`)!;
      field.setAttribute("aria-invalid", "true");
      field.focus();
      say(bad === "email" ? "Please enter a valid email address." : `Please fill in your ${bad}.`, "error");
      return;
    }

    if (!token) {
      say("Please complete the security check, then send again.", "error");
      return;
    }

    send.disabled = true;
    say("Sending…");
    const turnstileToken = token;
    try {
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
          turnstileToken,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!response.ok) {
        say(body.message ?? body.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      const topic = String(data.get("topic") ?? "");
      const timeline = timelineShown ? String(data.get("timeline") ?? "") : "";
      form.reset();
      say("");
      if (sent) showSuccess(name, topic, timeline);
      else say("Thanks — your message is on its way. I'll get back to you soon.");
    } catch {
      say("Couldn't send the message. Check your connection and try again.", "error");
    } finally {
      resetWidget();
      send.disabled = false;
    }
  };

  form.addEventListener("submit", onSubmit);
  return () => {
    gone = true;
    if (api && widgetId !== undefined) api.remove(widgetId);
    form.removeEventListener("submit", onSubmit);
    again?.removeEventListener("click", onAgain);
  };
});
