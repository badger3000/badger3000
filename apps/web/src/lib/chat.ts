/**
 * The chat island.
 *
 * Owns the thread: restores it from sessionStorage, posts questions to
 * `/api/chat` (ADR 0008), and renders the answer's cards. The markup for a
 * bubble, a message, a card and a suggestion is defined once by the Astro
 * components and cloned from `<template data-chat-*>` here, so the design and
 * the DOM cannot drift apart.
 *
 * The thread lives in sessionStorage rather than the URL: it is a conversation,
 * not a location, and the browser back button should keep walking the site.
 *
 * The thread is held at module scope, not inside the page's setup, so there is
 * exactly one copy per document. `shell.ts` imports `reset()` for "New
 * conversation", which is why this module loads on every page — the island
 * itself only mounts where `[data-chat-root]` exists.
 */
import type { Card } from "./agent/retrieve.ts";
import { island } from "./island.ts";

interface Answer {
  intent: string;
  text: string;
  cards: Card[];
  suggestions?: string[];
  composed?: "model" | "template";
  /** 503: the content source failed; `text` is still safe to show. */
  degraded?: boolean;
}

interface Turn {
  id: string;
  role: "user" | "agent";
  text: string;
  cards?: Card[];
  suggestions?: string[];
  /** A pending turn renders an ellipsis in place of a line. */
  pending?: boolean;
  /** Set when the answer failed in a way worth retrying: the question to re-ask. */
  retry?: string;
}

const KEY = "badger-thread";
const MAX_TURNS = 40;

const COPY = {
  thinking: "Badger3000 is thinking…",
  interrupted: "That answer was interrupted — ask again.",
  unreachable: "I couldn't reach the agent just then. Try again in a moment.",
  failed: "Something went wrong on my side. Try again in a moment.",
  limited: "You're asking quickly — give it a minute.",
  empty: "No answer came back.",
};

let sequence = 0;
const nextId = () => `t${Date.now().toString(36)}${(sequence++).toString(36)}`;

const read = (): Turn[] => {
  try {
    const raw = sessionStorage.getItem(KEY);
    const turns = raw ? (JSON.parse(raw) as Partial<Turn>[]) : [];
    return Array.isArray(turns) ? turns.map((turn) => ({ ...turn, id: turn.id ?? nextId() }) as Turn) : [];
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
 * The one thread for this document. A turn still `pending` when it is read
 * from storage belongs to a request a previous document started and can never
 * finish, so it settles as interrupted instead of showing dots forever.
 */
let thread: Turn[] = read().map((turn) =>
  turn.pending ? { ...turn, pending: false, text: COPY.interrupted, cards: [] } : turn,
);
/** The id of the agent turn whose request is in flight, if any. */
let inFlight: string | null = null;
/** The mounted view's repaint, while `/` is on screen. */
let view: { paint: (enter?: string[]) => void } | null = null;

/** "New conversation": forget the thread here and in storage. */
export function reset(): void {
  thread = [];
  // An answer still in flight resolves into nothing: its turn id is gone.
  inFlight = null;
  write(thread);
  view?.paint();
}

const settle = (id: string, patch: Partial<Turn>) => {
  if (inFlight === id) inFlight = null;
  const turn = thread.find((candidate) => candidate.id === id);
  if (!turn) return; // reset while in flight
  Object.assign(turn, { pending: false, cards: [], suggestions: undefined, retry: undefined }, patch);
  write(thread);
  view?.paint([id]);
};

const request = async (id: string, question: string) => {
  inFlight = id;
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: question }),
    });
  } catch {
    settle(id, { text: COPY.unreachable, retry: question });
    return;
  }

  const body = (await response.json().catch(() => null)) as (Partial<Answer> & { error?: string }) | null;

  // A 503 with `degraded` is a real, visitor-facing answer, not an error.
  if (response.ok || (response.status === 503 && body?.degraded)) {
    settle(id, {
      text: body?.text || COPY.empty,
      cards: body?.cards ?? [],
      suggestions: body?.suggestions,
    });
  } else if (response.status === 429) {
    settle(id, { text: COPY.limited });
  } else if (response.status >= 500) {
    settle(id, { text: COPY.failed, retry: question });
  } else {
    settle(id, { text: body?.error || COPY.failed });
  }
};

const ask = (question: string) => {
  const trimmed = question.trim();
  if (!trimmed || inFlight) return false;
  const user: Turn = { id: nextId(), role: "user", text: trimmed };
  const agent: Turn = { id: nextId(), role: "agent", text: "", pending: true };
  thread.push(user, agent);
  write(thread);
  void request(agent.id, trimmed);
  view?.paint([user.id, agent.id]);
  return true;
};

/** "Try again": the failed turn goes back to pending and re-asks its question. */
const retry = (id: string) => {
  const turn = thread.find((candidate) => candidate.id === id);
  if (!turn?.retry || inFlight) return;
  const question = turn.retry;
  Object.assign(turn, { pending: true, text: "", retry: undefined });
  write(thread);
  void request(id, question);
  view?.paint([id]);
};

const fill = (node: ParentNode, slot: string, value: string | undefined) => {
  const target = node.querySelector(`[data-slot="${slot}"]`);
  if (target) target.textContent = value ?? "";
};

/**
 * `template.content.cloneNode(true)` hands back a **DocumentFragment**, not an
 * element — it has `querySelector` but no `style` and no `setAttribute`. These
 * are deliberately typed as fragments so the compiler catches that; casting
 * them to HTMLElement is exactly what let this break at runtime.
 */
const clone = (template: HTMLTemplateElement | null | undefined): DocumentFragment | null =>
  template ? (template.content.cloneNode(true) as DocumentFragment) : null;

/** The component's root element inside a cloned fragment. */
const rootOf = (fragment: DocumentFragment): HTMLElement | null =>
  fragment.firstElementChild as HTMLElement | null;

island("[data-chat-root]", (root) => {
  const log = root.querySelector<HTMLElement>("[data-chat-log]");
  const status = root.querySelector<HTMLElement>("[data-chat-status]");
  const form = root.querySelector<HTMLFormElement>("[data-chat-form]");
  if (!log || !form) return;

  const template = (name: string) =>
    document.querySelector<HTMLTemplateElement>(`template[data-chat-${name}]`);
  const field = form.querySelector<HTMLInputElement>("[data-composer-input]");
  const send = form.querySelector<HTMLButtonElement>('[type="submit"]');

  const renderCards = (cards: Card[], animate: boolean): DocumentFragment => {
    const fragment = document.createDocumentFragment();
    for (const card of cards) {
      const index = fragment.childElementCount;
      const node = clone(template("card"));
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

      const title = node.querySelector<HTMLAnchorElement>("[data-title-link]");
      if (title && card.href) {
        title.href = card.href;
        if (card.href.startsWith("http")) {
          title.target = "_blank";
          title.rel = "noopener noreferrer";
          title.querySelector<HTMLElement>("[data-external]")?.removeAttribute("hidden");
        }
      }
      // Cards stagger inside the turn, one token apart.
      const shell = node.querySelector<HTMLElement>("[data-chat-card]");
      if (animate) shell?.setAttribute("data-enter", "");
      shell?.style.setProperty("--i", String(index));
      fragment.append(node);
    }
    return fragment;
  };

  /** SuggestionChips: `shell.ts` fills the composer when one is clicked. */
  const renderSuggestions = (suggestions: string[]): DocumentFragment => {
    const fragment = document.createDocumentFragment();
    for (const suggestion of suggestions) {
      const node = clone(template("suggestion"));
      const chip = node && rootOf(node);
      if (!node || !chip) continue;
      chip.dataset.suggestion = suggestion;
      fill(node, "label", suggestion);
      fragment.append(node);
    }
    return fragment;
  };

  /** Mirrors `inFlight` onto Send. Submits are ignored meanwhile, not queued. */
  const sync = () => {
    if (inFlight) send?.setAttribute("aria-disabled", "true");
    else send?.removeAttribute("aria-disabled");
  };

  /**
   * Says the newest agent turn, and only that, through the status region. A
   * restored thread or a reset says nothing. The text is cleared first so the
   * same answer twice is still announced twice.
   */
  const announce = (turn: Turn | undefined) => {
    if (!status) return;
    status.textContent = "";
    if (!turn) return;
    const cards = turn.cards?.length ?? 0;
    const text = turn.pending
      ? COPY.thinking
      : [turn.text, cards ? `${cards} ${cards === 1 ? "result" : "results"} below.` : ""].filter(Boolean).join(" ");
    requestAnimationFrame(() => (status.textContent = text));
  };

  /**
   * Repaints the thread. Only the turns named in `enter` animate, so a
   * restored thread arrives settled and a re-render never re-animates what is
   * already on screen; the last of them is scrolled into view.
   */
  const paint = (enter: string[] = []) => {
    let focus: HTMLElement | null = null;
    let said: Turn | undefined;
    log.replaceChildren();
    for (const turn of thread) {
      const isNew = enter.includes(turn.id);
      const node = clone(template(turn.role === "user" ? "bubble" : "message"));
      if (!node) continue;
      const element = rootOf(node);
      element?.setAttribute("data-turn", turn.id);
      if (isNew) element?.setAttribute("data-enter", "");

      if (turn.role === "user") {
        fill(node, "content", turn.text);
      } else {
        fill(node, "line", turn.pending ? "" : turn.text);
        if (turn.pending) {
          element?.setAttribute("data-pending", "");
          element?.setAttribute("aria-busy", "true");
        }
        const cards = node.querySelector("[data-chat-cards]");
        if (cards) {
          if (turn.cards?.length && !turn.pending) cards.replaceChildren(renderCards(turn.cards, isNew));
          else cards.remove();
        }
        const suggestions = node.querySelector("[data-chat-suggestions]");
        if (suggestions) {
          if (turn.suggestions?.length && !turn.pending) {
            suggestions.replaceChildren(renderSuggestions(turn.suggestions));
          } else suggestions.remove();
        }
        const again = node.querySelector<HTMLElement>("[data-chat-retry]");
        if (again) {
          if (turn.retry && !turn.pending) again.hidden = false;
          else again.remove();
        }
      }

      if (isNew && turn.role === "agent") {
        focus = element;
        said = turn;
      }
      log.append(node);
    }
    root.setAttribute("data-has-thread", String(thread.length > 0));
    sync();
    announce(said);
    focus?.scrollIntoView?.({ block: "nearest" });
  };

  const controller = new AbortController();
  const { signal } = controller;

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      if (ask(field?.value ?? "") && field) field.value = "";
      field?.focus();
    },
    { signal },
  );

  log.addEventListener(
    "click",
    (event) => {
      const button = (event.target as Element).closest("[data-chat-retry]");
      const id = button?.closest<HTMLElement>("[data-turn]")?.dataset.turn;
      if (id) retry(id);
    },
    { signal },
  );

  view = { paint };
  paint();

  return () => {
    controller.abort();
    if (view?.paint === paint) view = null;
  };
});
