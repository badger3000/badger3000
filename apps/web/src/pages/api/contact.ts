/**
 * POST /api/contact — the contact form's endpoint, ported from the Next route
 * (`apps/legacy-next/app/api/contact/route.ts`, the PR #215 version).
 *
 *   validate → reCAPTCHA v3 siteverify (action + score) → Proton Mail SMTP submission: owner, then an auto-reply
 *
 * Runs on the Worker. Mail goes out over one SMTP session (`worker-mailer`,
 * Workers TCP sockets) authenticated with a Proton SMTP token, from the
 * custom-domain address the token belongs to. Every failure is logged with `console.error`, which Workers observability keeps:
 * the Next incident was a stripped `console.error` hiding a misconfiguration.
 *
 *   200  { success: true }
 *   400  { error, errorCode? } — bad body, failed reCAPTCHA, low score
 *   405  { error } + Allow: POST
 *   413  { error } — body over MAX_BODY
 *   429  { error } + Retry-After — rate limited (CONTACT_LIMITER)
 *   502  { error } — Google or the email send failed
 *   503  { error, errorCode: "config" } — a required secret is not set
 *
 * There is no form on the Astro site yet; this keeps the endpoint ready.
 */
import type { APIRoute } from "astro";
import {
  OWNER_EMAIL,
  RECAPTCHA_MIN_SCORE,
  RECAPTCHA_SECRET_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_TOKEN,
  SMTP_USER,
} from "astro:env/server";
import type { WorkerMailer } from "worker-mailer";
import { TIMELINES, TOPICS } from "../../lib/contact-content.ts";
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
  from: { email: string; name?: string };
  to: string;
  reply?: string;
  subject: string;
  text: string;
  html: string;
}

export const POST: APIRoute = async ({ request }) => {
  // Configuration first, so a missing secret is the logged reason, not a
  // confusing reCAPTCHA or SMTP error further down.
  if (!RECAPTCHA_SECRET_KEY || !OWNER_EMAIL || !SMTP_USER || !SMTP_TOKEN) {
    const missing = [
      !RECAPTCHA_SECRET_KEY && "RECAPTCHA_SECRET_KEY",
      !OWNER_EMAIL && "OWNER_EMAIL",
      !SMTP_USER && "SMTP_USER",
      !SMTP_TOKEN && "SMTP_TOKEN",
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
  // Chip choices are optional, but a value must be one the form offers.
  const topic = text(body.topic);
  const timeline = text(body.timeline);
  const includeLinks = body.includeLinks === true;

  if (!name || !email || !message) {
    return json({ error: "Name, email and message are required." }, { status: 400 });
  }
  if (!EMAIL.test(email)) return json({ error: "Please provide a valid email address." }, { status: 400 });
  if ((topic && !(TOPICS as readonly string[]).includes(topic)) || (timeline && !(TIMELINES as readonly string[]).includes(timeline))) {
    return json({ error: "Pick one of the topics offered." }, { status: 400 });
  }
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

  // A Proton SMTP token only sends as its own address, so SMTP_USER is the sender.
  const ownerFrom = { email: SMTP_USER, name: "Contact Form" };
  const replyFrom = { email: SMTP_USER, name: "Kyle Ross | Badger3000" };
  // A CR/LF in the name would otherwise reach the Subject header.
  const subjectName = name.replace(/[\r\n]+/g, " ");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  let mailer: WorkerMailer;
  try {
    const { WorkerMailer: Mailer } = await import("worker-mailer");
    mailer = await Mailer.connect({
      host: SMTP_HOST ?? "smtp.protonmail.ch",
      port: SMTP_PORT ?? 587,
      // 587 upgrades with STARTTLS; set SMTP_PORT=465 and this flips to implicit TLS.
      secure: (SMTP_PORT ?? 587) === 465,
      credentials: { username: SMTP_USER, password: SMTP_TOKEN },
      authType: "plain",
    });
  } catch (error) {
    console.error("[contact] SMTP connect/auth failed:", error);
    return json({ error: "Failed to send the message. Please try again." }, { status: 502 });
  }

  const owner = await send(mailer, {
    from: ownerFrom,
    to: OWNER_EMAIL,
    reply: email,
    subject: `New contact form submission from ${subjectName}`,
    text: `Name: ${name}\nEmail: ${email}\n${topic ? `Topic: ${topic}\n` : ""}${timeline ? `Timeline: ${timeline}\n` : ""}${includeLinks ? "Includes links to work: yes\n" : ""}Message:\n${message}\nreCAPTCHA score: ${score}\n`,
    html: `<h2>New contact form submission</h2>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
${topic ? `<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>\n` : ""}${timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>\n` : ""}${includeLinks ? "<p><strong>Includes links to work:</strong> yes</p>\n" : ""}<p><strong>Message:</strong></p>
<p>${safeMessage}</p>
<p><strong>reCAPTCHA score:</strong> ${score}</p>`,
  });
  if (!owner) {
    await mailer.close();
    return json({ error: "Failed to send the message. Please try again." }, { status: 502 });
  }

  // A soft failure: the owner already has the message.
  await send(mailer, {
    from: replyFrom,
    to: email,
    subject: "Thank you for your message",
    text: `Dear ${name},\n\nThank you for contacting me. I have received your message and will get back to you as soon as possible.\n\nBest regards,\nKyle Ross\n`,
    html: `<h2>Thank you for your message</h2>
<p>Dear ${safeName},</p>
<p>Thank you for contacting me. I have received your message and will get back to you as soon as possible.</p>
<p>Best regards,<br>Kyle Ross</p>`,
  });

  await mailer.close();
  return json({ success: true });
};

/** Anything but POST: a JSON 405, not the HTML 404 page. */
export const ALL: APIRoute = () =>
  json({ error: "POST only." }, { status: 405, headers: { allow: "POST" } });

/** One send on an open session. True on success; failures are logged, never thrown. */
async function send(mailer: WorkerMailer, email: Email): Promise<boolean> {
  try {
    await mailer.send(email);
    return true;
  } catch (error) {
    console.error(`[contact] SMTP send to ${email.to === OWNER_EMAIL ? "owner" : "visitor"} failed:`, error);
    return false;
  }
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
