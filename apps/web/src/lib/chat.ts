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
/** Set by "New conversation" when the click also has to navigate. */
const PENDING_CLEAR = "badger-thread-clear";
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

/**
 * "New conversation" must actually start a fresh session.
 *
 * The thread lives in sessionStorage, so navigating to `/` on its own brings the
 * old conversation straight back — which is what it did until this hook. Two
 * cases: on the chat page already, clear it in place without a reload; from
 * somewhere else, leave a one-shot flag for the destination page to consume.
 */
function armClear() {
  try {
    sessionStorage.setItem(PENDING_CLEAR, "1");
  } catch {
    // Nothing to do: without storage there is no thread to clear either.
  }
}

function consumeClear() {
  try {
    if (!sessionStorage.getItem(PENDING_CLEAR)) return false;
    sessionStorage.removeItem(PENDING_CLEAR);
    return true;
  } catch {
    return false;
  }
}

const fill = (node: ParentNode, slot: string, value: string | undefined) => {
  const target = node.querySelector(`[data-slot="${slot}"]`);
  if (target) target.textContent = value ?? "";
};

/** Flag a node as newly added so it animates in — and only it. */
const markEnter = (node: HTMLElement | undefined, index = 0) => {
  if (!node) return;
  node.setAttribute("data-enter", "");
  node.style.setProperty("--i", String(index));
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
  /**
   * How many turns have already been painted. Only nodes past this point get the
   * enter animation, so a restored thread does not replay every turn's motion on
   * load — and a re-render never re-animates what is already on screen.
   */
  let painted = 0;

  const renderCards = (cards: Card[], animate: boolean): DocumentFragment => {
    const fragment = document.createDocumentFragment();
    for (const card of cards) {
      const index = fragment.childElementCount;
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
      // Cards stagger inside the turn, one token apart.
      if (animate) node.querySelector("[data-chat-card]")?.setAttribute("data-enter", "");
      node.style.setProperty("--i", String(index));
      fragment.append(node);
    }
    return fragment;
  };

  const paint = () => {
    const animate = painted > 0;
    log.replaceChildren();
    for (const turn of turns) {
      if (turn.role === "user") {
        const node = bubbleTemplate?.content.cloneNode(true) as HTMLElement | undefined;
        if (!node) continue;
        fill(node, "content", turn.text);
        if (animate && turns.indexOf(turn) >= painted) markEnter(node);
        log.append(node);
        continue;
      }

      const node = messageTemplate?.content.cloneNode(true) as HTMLElement | undefined;
      if (!node) continue;
      fill(node, "line", turn.pending ? "" : turn.text);
      if (turn.pending) {
        node.setAttribute("data-pending", "");
        node.setAttribute("aria-busy", "true");
        node.querySelector("[data-typing]")?.setAttribute("aria-live", "polite");
      }
      const slot = node.querySelector("[data-chat-cards]");
      if (slot) {
        if (turn.cards?.length && !turn.pending) {
          slot.replaceChildren(renderCards(turn.cards, animate && turns.indexOf(turn) >= painted));
        } else {
          slot.remove();
        }
      }
      if (animate && turns.indexOf(turn) >= painted) markEnter(node);
      log.append(node);
    }
    painted = turns.length;
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

  // A re-render replaces the form, so its listener goes with it. `painted` resets
  // so a restored thread arrives settled rather than replaying every turn.
  turns = consumeClear() ? [] : read();
  if (!turns.length) write([]);
  painted = 0;
  paint();
};

// Wired once: the sidebar and the mobile drawer both render "New conversation",
// and on the chat page there is nothing to navigate to.
document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("[data-new-chat]");
  if (!link) return;

  const chatPath = link.pathname.replace(/\/$/, "") || "/";
  const here = location.pathname.replace(/\/$/, "") || "/";
  if (chatPath !== here) {
    armClear();
    return; // let the navigation happen; the destination clears
  }

  event.preventDefault();
  write([]);
  consumeClear();
  document.querySelector<HTMLElement>("[data-chat-log]")?.replaceChildren();
  document.querySelector("[data-chat-root]")?.setAttribute("data-has-thread", "false");
  // The mobile drawer is usually what the button lives in.
  document.querySelector<HTMLDialogElement>("[data-drawer]")?.close();
  document.querySelector<HTMLInputElement>("[data-composer-input]")?.focus();
});

init();
document.addEventListener("astro:page-load", init);