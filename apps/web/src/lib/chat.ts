/**
 * The chat island.
 *
 * Owns the thread on `/`: restores it from sessionStorage, posts questions to
 * `/api/chat` (ADR 0008), and renders the answer's cards. The markup for a
 * bubble, a message and a card is defined once by the Astro components and
 * cloned from `<template data-chat-*>` here, so the design and the DOM cannot
 * drift apart.
 *
 * The thread lives in sessionStorage rather than the URL: it is a conversation,
 * not a location, and the browser back button should keep walking the site.
 */
import type { Card } from "./agent/retrieve.ts";

interface Answer {
  intent: string;
  text: string;
  cards: Card[];
  suggestions?: string[];
  composed?: "model" | "template";
}

interface Turn {
  role: "user" | "agent";
  text: string;
  cards?: Card[];
  /** A pending turn renders an ellipsis in place of a line. */
  pending?: boolean;
}

const KEY = "badger-thread";
const MAX_TURNS = 40;

const read = (): Turn[] => {
  try {
    const raw = sessionStorage.getItem(KEY);
    const turns = raw ? (JSON.parse(raw) as Turn[]) : [];
    return Array.isArray(turns) ? turns : [];
  } catch {
    return [];
  }
};

const write = (turns: Turn[]) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(turns.slice(-MAX_TURNS)));
  } catch {
    // Storage blocked: the thread still works, it just will not survive reload.
  }
};

const fill = (node: ParentNode, slot: string, value: string | undefined) => {
  const target = node.querySelector(`[data-slot="${slot}"]`);
  if (target) target.textContent = value ?? "";
};

const init = () => {
  const log = document.querySelector<HTMLElement>("[data-chat-log]");
  const form = document.querySelector<HTMLFormElement>("[data-chat-form]");
  if (!log || !form) return;

  const bubbleTemplate = document.querySelector<HTMLTemplateElement>("[data-chat-bubble]");
  const messageTemplate = document.querySelector<HTMLTemplateElement>("[data-chat-message]");
  const cardTemplate = document.querySelector<HTMLTemplateElement>("[data-chat-card]");
  const field = form.querySelector<HTMLInputElement>("[data-composer-input]");
  const root = document.querySelector<HTMLElement>("[data-chat-root]");

  let turns = read();

  const renderCards = (cards: Card[]): DocumentFragment => {
    const fragment = document.createDocumentFragment();
    for (const card of cards) {
      const node = cardTemplate?.content.cloneNode(true) as HTMLElement | undefined;
      if (!node) continue;
      node.querySelector("[data-chat-card]")?.setAttribute("data-kind", card.kind);
      fill(node, "title", card.title);
      fill(node, "subtitle", card.subtitle);
      fill(node, "body", card.body);
      fill(node, "meta", card.meta);

      // An empty slot keeps its element (CSS `:empty` hides it) so the next
      // render can fill the same shape.
      const tags = node.querySelector<HTMLElement>('[data-slot="tags"]');
      if (tags) {
        tags.textContent = "";
        for (const tag of card.tags ?? []) {
          const chip = document.createElement("span");
          chip.className = "chat-tag";
          chip.textContent = tag;
          tags.append(chip);
        }
      }

      const title = node.querySelector<HTMLAnchorElement>('[data-slot="title"]');
      if (title && card.href) {
        title.href = card.href;
        if (card.href.startsWith("http")) {
          title.target = "_blank";
          title.rel = "noopener";
        }
      }
      fragment.append(node);
    }
    return fragment;
  };

  const paint = () => {
    log.replaceChildren();
    for (const turn of turns) {
      if (turn.role === "user") {
        const node = bubbleTemplate?.content.cloneNode(true) as HTMLElement | undefined;
        if (!node) continue;
        fill(node, "content", turn.text);
        log.append(node);
        continue;
      }

      const node = messageTemplate?.content.cloneNode(true) as HTMLElement | undefined;
      if (!node) continue;
      fill(node, "line", turn.pending ? "…" : turn.text);
      const slot = node.querySelector("[data-chat-cards]");
      if (slot) {
        if (turn.cards?.length && !turn.pending) slot.replaceChildren(renderCards(turn.cards));
        else slot.remove();
      }
      log.append(node);
    }
    root?.setAttribute("data-has-thread", String(turns.length > 0));
    log.scrollIntoView?.({ block: "end" });
  };

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    if (field) field.value = "";

    turns.push({ role: "user", text: trimmed }, { role: "agent", text: "", pending: true });
    write(turns);
    paint();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: trimmed }),
      });
      const answer = (await response.json()) as Answer & { error?: string };
      const last = turns[turns.length - 1];
      if (last?.role === "agent") {
        Object.assign(last, {
          pending: false,
          text: answer.error ?? answer.text ?? "No answer came back.",
          cards: answer.cards ?? [],
        });
      }
    } catch {
      const last = turns[turns.length - 1];
      if (last?.role === "agent") {
        Object.assign(last, {
          pending: false,
          text: "I couldn't reach the agent just then. Try again in a moment.",
        });
      }
    }

    write(turns);
    paint();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void ask(field?.value ?? "");
  });

  // A re-render replaces the form, so its listener goes with it.
  turns = read();
  paint();
};

init();
document.addEventListener("astro:page-load", init);