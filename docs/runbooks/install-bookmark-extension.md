---
slug: runbook/badger3000-install-bookmark-extension
title: badger3000 — install the Badger Bookmarks extension
status: active
date: 2026-03-18
---

# Install the Badger Bookmarks extension

## When to use

Setting up bookmark saving in a new Chrome profile.

## Prerequisites

- A Sanity API token with **Editor** permission (Viewer tokens can only read), from sanity.io/manage → API → Tokens.
- The Sanity project ID and dataset.

## Steps

1. Open `chrome://extensions` and turn on Developer mode.
2. Choose **Load unpacked** and select `extensions/bookmark-saver`.
3. Open the extension's options. Enter the project ID, dataset and token, and save.
   - The project ID and dataset sync across Chrome profiles; the token stays on this machine.
4. On any page, click the extension icon to save it.

## Verify

The bookmark appears in Studio (`/studio`) and, within an hour, on `/bookmarks`.

## Troubleshooting

- **"Permission denied"**: the token is a Viewer token; create an Editor token.
- **CORS error**: the `rules.json` rule that removes the `Origin` header isn't active. Reload the extension.

## Links

documents:: [[repo/badger3000]]
documents:: [[adr/badger3000-bookmarks]]
