---
slug: adr/badger3000-contact-email-proton-smtp
title: badger3000 — contact form mail through Proton SMTP submission
status: accepted
date: 2026-10-27
---

# Contact form mail through Proton SMTP submission

## Context

ADR 0003 sent contact mail with Resend. The Astro site runs on a Cloudflare Worker (ADR 0009), and the form was never set up there. The domain's mail is already on Proton, with SPF, DKIM and DMARC published for it. Cloudflare Email Service was considered and rejected: it needs its own SPF/DKIM records, and a domain may publish only one SPF record, so the two would have to be merged by hand.

## Decision

- `/api/contact` opens one SMTP session with `worker-mailer` (Workers TCP sockets, `nodejs_compat`) to `smtp.protonmail.ch:587` (STARTTLS) and sends the owner notification and the visitor auto-reply on it.
- Auth is a Proton SMTP token. `SMTP_USER` is the custom-domain address the token belongs to and is also the From address. `SMTP_TOKEN` is a Worker secret; `SMTP_HOST` and `SMTP_PORT` are optional overrides.
- `RESEND_API_KEY` and `CONTACT_FORM_EMAIL` are gone. reCAPTCHA v3 verification is unchanged.
- The endpoint answers 503 until `RECAPTCHA_SECRET_KEY`, `OWNER_EMAIL`, `SMTP_USER` and `SMTP_TOKEN` are set.

## Consequences

- Sending is bound by Proton's SMTP submission limits and the token must be rotated if leaked; the contact form's rate limit (5 a minute per IP) and reCAPTCHA keep volume low.
- An SMTP handshake adds a second or two to the request.
- `apps/legacy-next` still uses Resend (ADR 0003) until the cutover deletes it, so ADR 0003 is not superseded yet.

## Links

affects:: [[repo/badger3000]]
uses:: [[service/cloudflare]] [[service/proton-mail]] [[service/recaptcha]]
affects:: [[adr/badger3000-contact-form]]
