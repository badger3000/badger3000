/**
 * POST /api/contact — the contact form's endpoint, ported from the Next route
 * (`apps/legacy-next/app/api/contact/route.ts`, the PR #215 version).
 *
 *   validate → reCAPTCHA v3 siteverify (action + score) → Resend: owner, then an auto-reply
 *
 * Runs on the Worker. Resend is called with plain `fetch`, no SDK. Every
 * failure is logged with `console.error`, which Workers observability keeps:
 * the Next incident was a stripped `console.error` hiding a misconfiguration.
 *
 *   200  { success: true }
 *   400  { error, errorCode? } — bad body, failed reCAPTCHA, low score
 *   405  { error } + Allow: POST
 *   413  { error } — body over MAX_BODY
 *   429  { error } + Retry-After — rate limited (CONTACT_LIMITER)
 *   502  { error } — Google or Resend failed
 *   503  { error, errorCode: "config" } — a required secret is not set
 *
 * There is no form on the Astro site yet; this keeps the endpoint ready.
 */
import type { APIRoute } from "astro";
import {
  CONTACT_FORM_EMAIL,
  OWNER_EMAIL,
  RECAPTCHA_MIN_SCORE,
  RECAPTCHA_SECRET_KEY,
  RESEND_API_KEY,
} from "astro:env/server";
import { json, rateLimited, readBody } from "../../lib/http.ts";

export const prerender = false;

/** Must match the action the form passes to `grecaptcha.execute`. */
const RECAPTCHA_ACTION = "contact_form_submit";
const MAX_NAME = 200;
const MAX_MESSAGE = 5000;
/** Name, email, message and a reCAPTCHA token (~2 KB) fit well inside this. */
const MAX_BODY = 16 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Siteverify {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

interface Email {
  from: string;
  to: string;
  reply_to?: string;
  subject: string;
  text: string;
  html: string;
}

export const POST: APIRoute = async ({ request }) => {
  // Configuration first, so a missing secret is the logged reason, not a
  // confusing reCAPTCHA or Resend error further down.
  if (!RESEND_API_KEY || !RECAPTCHA_SECRET_KEY || !OWNER_EMAIL) {
    const missing = [
      !RESEND_API_KEY && "RESEND_API_KEY",
      !RECAPTCHA_SECRET_KEY && "RECAPTCHA_SECRET_KEY",
      !OWNER_EMAIL && "OWNER_EMAIL",
    ].filter(Boolean);
    console.error(`[contact] misconfigured, missing: ${missing.join(", ")}`);
    return json({ error: "The contact form is not configured.", errorCode: "config" }, { status: 503 });
  }

  if (await rateLimited("CONTACT_LIMITER", request)) {
    return json({ error: "Too many messages — try again in a minute." }, { status: 429, headers: { "retry-after": "60" } });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return tooLarge();
  const bytes = await readBody(request, MAX_BODY);
  if (!bytes) return tooLarge();

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Send the form as a JSON object." }, { status: 400 });
  }

  const name = text(body.name);
  const email = text(body.email);
  const message = text(body.message);
  const token = body.recaptchaToken;

  if (!name || !email || !message) {
    return json({ error: "Name, email and message are required." }, { status: 400 });
  }
  if (!EMAIL.test(email)) return json({ error: "Please provide a valid email address." }, { status: 400 });
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    return json({ error: "Name or message is too long." }, { status: 400 });
  }
  if (typeof token !== "string" || !token) {
    return json({ error: "reCAPTCHA verification failed.", errorCode: "recaptcha-failed" }, { status: 400 });
  }

  let verdict: Siteverify;
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("cf-connecting-ip") ?? "",
      }),
    });
    if (!response.ok) throw new Error(`siteverify ${response.status}`);
    verdict = (await response.json()) as Siteverify;
  } catch (error) {
    console.error("[contact] reCAPTCHA siteverify failed:", error);
    return json({ error: "Couldn't verify the form right now. Please try again." }, { status: 502 });
  }

  if (!verdict.success || verdict.action !== RECAPTCHA_ACTION) {
    console.error("[contact] reCAPTCHA rejected:", {
      success: verdict.success,
      action: verdict.action,
      hostname: verdict.hostname,
      errorCodes: verdict["error-codes"],
    });
    return json(
      {
        error: "reCAPTCHA verification failed.",
        errorCode: "recaptcha-failed",
        message: "We couldn't verify that you're a human. Please refresh the page and submit again.",
      },
      { status: 400 },
    );
  }

  const minScore = RECAPTCHA_MIN_SCORE ?? 0.5;
  const score = verdict.score ?? 0;
  if (score < minScore) {
    console.error("[contact] reCAPTCHA score below threshold:", { score, minScore, hostname: verdict.hostname });
    return json(
      {
        error: "Suspicious activity detected.",
        errorCode: "suspicious-activity",
        message: "For security reasons we couldn't process this submission. Please try again later.",
      },
      { status: 400 },
    );
  }

  // The resend.dev sender only delivers to the Resend account's own address,
  // so without a verified-domain sender the auto-reply to visitors fails.
  if (!CONTACT_FORM_EMAIL) console.warn("[contact] CONTACT_FORM_EMAIL is not set; using onboarding@resend.dev");
  const ownerFrom = CONTACT_FORM_EMAIL ?? "Contact Form <onboarding@resend.dev>";
  const replyFrom = CONTACT_FORM_EMAIL ?? "Kyle Ross | Badger3000 <onboarding@resend.dev>";

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const owner = await send(RESEND_API_KEY, {
    from: ownerFrom,
    to: OWNER_EMAIL,
    reply_to: email,
    subject: `New contact form submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}\nreCAPTCHA score: ${score}\n`,
    html: `<h2>New contact form submission</h2>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<p><strong>Message:</strong></p>
<p>${safeMessage}</p>
<p><strong>reCAPTCHA score:</strong> ${score}</p>`,
  });
  if (!owner) return json({ error: "Failed to send the message. Please try again." }, { status: 502 });

  // A soft failure: the owner already has the message.
  await send(RESEND_API_KEY, {
    from: replyFrom,
    to: email,
    subject: "Thank you for your message",
    text: `Dear ${name},\n\nThank you for contacting me. I have received your message and will get back to you as soon as possible.\n\nBest regards,\nKyle Ross\n`,
    html: `<h2>Thank you for your message</h2>
<p>Dear ${safeName},</p>
<p>Thank you for contacting me. I have received your message and will get back to you as soon as possible.</p>
<p>Best regards,<br>Kyle Ross</p>`,
  });

  return json({ success: true });
};

/** Anything but POST: a JSON 405, not the HTML 404 page. */
export const ALL: APIRoute = () =>
  json({ error: "POST only." }, { status: 405, headers: { allow: "POST" } });

/** One Resend send. True on success; failures are logged, never thrown. */
async function send(apiKey: string, email: Email): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify(email),
    });
    if (response.ok) return true;
    console.error(`[contact] Resend ${response.status} sending to ${email.to === OWNER_EMAIL ? "owner" : "visitor"}:`, await response.text());
  } catch (error) {
    console.error("[contact] Resend request failed:", error);
  }
  return false;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** User input goes into HTML email bodies. */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const tooLarge = () => json({ error: "That message is too long." }, { status: 413 });
