---
slug: adr/badger3000-contact-form-turnstile
title: badger3000 — contact form bot check moves from reCAPTCHA v3 to Cloudflare Turnstile
status: accepted
date: 2026-11-09
---

# Contact form bot check moves from reCAPTCHA v3 to Cloudflare Turnstile

## Context

The Astro contact form (`apps/web`) verified a Google reCAPTCHA v3 score ([ADR 0003](0003-contact-form-resend-recaptcha.md), [ADR 0012](0012-contact-email-proton-smtp.md)). The site is moving to Cloudflare Workers, and reCAPTCHA adds a Google script, a third-party privacy notice and a score threshold to tune.

## Decision

- `apps/web` uses Cloudflare Turnstile in managed mode, rendered in the form (`lib/contact.ts` renders it explicitly; the token is sent as `turnstileToken`).
- `/api/contact` verifies the token at `https://challenges.cloudflare.com/turnstile/v0/siteverify`. The result is pass or fail: there is no score, so `RECAPTCHA_MIN_SCORE`, the `suspicious-activity` error and the score in the owner email are removed. A failed check returns 400 `captcha-failed`.
- Env: `PUBLIC_TURNSTILE_SITE_KEY` (build variable) and `TURNSTILE_SECRET_KEY` (Worker secret) replace `PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`.
- The site-wide CSP allows `https://challenges.cloudflare.com` for scripts and frames instead of the google.com and gstatic.com recaptcha hosts. It is site-wide, not `/contact`-only, because a CSP belongs to the document and `<ClientRouter />` keeps the entry page's document: a `/contact`-only policy blocked Turnstile on any client-side navigation to the form.
- `apps/legacy-next` stays on reCAPTCHA: it is frozen and deleted at cutover.

## Alternatives rejected

- Keep reCAPTCHA v3: leaves the Google dependency and score tuning.
- Invisible Turnstile: closest to v3, but a visitor who fails the check gets no way to recover.
- Honeypot and rate limit only: the rate limit stays, but it does not stop distributed bots.

## Consequences

- A visitor may see a Cloudflare checkbox; the form asks them to complete it before sending.
- The widget needs hostnames `badger3000.com`, `www.badger3000.com` and `localhost` in the Cloudflare dashboard.
- Tokens are single-use, so the widget resets after every send attempt.

## Links

affects:: [[repo/badger3000]]
affects:: [[adr/badger3000-contact-form]] [[adr/badger3000-contact-email-proton-smtp]]
uses:: [[service/cloudflare]]
