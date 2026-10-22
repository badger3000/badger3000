---
slug: incident/badger3000-contact-form-failing
title: badger3000 — contact form failing in production
status: open
date: 2026-10-11
---

# Contact form failing in production

## Summary

Submissions on the live contact form fail. The `/api/contact` function runs and reaches reCAPTCHA, so the failure is either in reCAPTCHA scoring or in the Resend send. It isn't known which.

## Impact

Messages from the site don't arrive.

## Cause

Not yet known. It couldn't be diagnosed because `compiler.removeConsole` in `next.config.mjs` strips every `console.error` from production builds, leaving the Netlify function logs empty.

Separately, `components/Contact.tsx` had a stale-closure bug that replaced the specific reCAPTCHA errors with a generic one, hiding the cause from the visitor too.

## Fix

PR #215 (`fix/contact-form-resend`, opened 2026-10-12) does the following:

- keeps `console.error` and `console.warn` in production;
- checks required env vars and returns a clear error when one is missing;
- logs Resend errors and the reCAPTCHA result (score, action, hostname, error codes);
- URL-encodes the siteverify request and checks the reCAPTCHA action;
- adds an optional `RECAPTCHA_MIN_SCORE`;
- escapes user input in the emails and validates input;
- fixes the stale closure;
- stops bundling `.env.local` into Netlify functions (`netlify.toml` `included_files`).

## Follow-ups

- Merge PR #215, submit the form on the deploy preview, read the function logs, and record the real cause here.
- Confirm the badger3000.com domain is verified in Resend, the API key can send, and both badger3000.com and www.badger3000.com are allowed in the reCAPTCHA admin.

## Links

affects:: [[repo/badger3000]]
caused:: [[adr/badger3000-contact-form]]
