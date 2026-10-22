---
slug: adr/badger3000-contact-form
title: badger3000 — contact form through Resend with reCAPTCHA v3
status: accepted
date: 2025-03-07
---

# Contact form through Resend with reCAPTCHA v3

## Context

The site needs a contact form that emails Kyle and keeps out spam bots.

## Decision

- `components/Contact.tsx` gets a reCAPTCHA v3 token (`react-google-recaptcha-v3`) and posts to `app/api/contact/route.ts`.
- The route verifies the token with Google's `siteverify` API, rejects scores below 0.5, and sends email with Resend.
- Settings: `RESEND_API_KEY`, `OWNER_EMAIL`, `CONTACT_FORM_EMAIL`, `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.

## Options rejected

- **Netlify Forms**: replaced by Resend on 2025-03-07 (commit `89d6f21`). The reason is not recorded.

## Consequences

- Sending depends on the badger3000.com domain staying verified in Resend, and on the site's domains being allowed in the reCAPTCHA admin.
- The form is failing in production as of October 2026; see the [incident](../incidents/2026-10-11-contact-form-failing.md). PR #215 adds env checks, logging, input escaping and validation, and a configurable `RECAPTCHA_MIN_SCORE`.

## Links

affects:: [[repo/badger3000]]
uses:: [[service/resend]] [[service/recaptcha]]
implements:: [[prd/badger3000-personal-site]]
