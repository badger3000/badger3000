---
slug: adr/badger3000-agent-chat-grounded
title: badger3000 — grounded agent chat without a vendor AI key
status: accepted
date: 2026-10-22
---

# Grounded agent chat without a vendor AI key

## Context

The redesign makes the site an "AI agent" the visitor talks to ([PRD](../prd/astro-conversion.md)). Constraints: no personal OpenAI/Anthropic API key to manage or pay per call; answers must have real context about Kyle; nothing sensitive should leave the stack. A portfolio agent mostly surfaces existing structured content (projects, articles, experience, golf…) already in Sanity, so a general LLM is optional, not the core.

## Decision

Build the chat **intent-first and grounded**, with a thin, optional LLM layer:

1. **Intent router** — classify the message to an intent (projects, articles, experiments, experience, skills, testimonials, bookmarks, golf, about, contact) with keyword/regex rules. The LLM is consulted only when the match is ambiguous.
2. **Retrieve** — run a GROQ query for that intent against **Sanity**, plus a small curated **bio/persona doc** (one Sanity document) for "about me" grounding.
3. **Compose (optional, grounded)** — **Cloudflare Workers AI** (an open model, e.g. Llama 3.x, on the project's own Cloudflare account — no personal API key) writes a one-line intro around **only** the retrieved data (RAG), so it cannot hallucinate facts.
4. **Respond** — `{ intent, text, cards[] }`; the client renders the card components. If Workers AI is unavailable, fall back to deterministic template phrasing — chat never breaks.

Knowledge source is **Sanity + the bio doc**. No Obsidian vault or vector database.

## Options rejected

- **Hosted vendor LLM (OpenAI/Anthropic)** — the key, cost-per-call and data-egress the user explicitly wants to avoid.
- **Self-hosted LLM (Ollama) + Obsidian/vector RAG** — needs a GPU/server and a note corpus to justify; a public inference endpoint invites abuse. Reconsider only if a large personal-knowledge corpus is wanted.
- **Browser LLM (WebLLM/transformers.js)** — large download, WebGPU-only, weaker quality; fine as a future progressive enhancement, not the primary path.

## Consequences

- Deterministic, free, private by default; the LLM is a thin enhancement, not a dependency.
- Requires a new Sanity `bio`/persona document and an intent→GROQ map maintained alongside the content model.
- Ties hosting to **Cloudflare** (Workers AI binding), reinforcing [ADR 0006](./0006-migrate-to-astro.md).
- The endpoint lives at `apps/web` `/api/chat` as an Astro endpoint on a Worker; the intent/retrieval logic can later move to a `packages/agent`.

## Links

affects:: [[repo/badger3000]]
uses:: [[service/cloudflare]] [[tech/sanity]] [[tech/astro]]
