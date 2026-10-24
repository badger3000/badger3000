/**
 * The agent's test table, run offline by `agent:check` against
 * ./agent-dataset.json. Finding numbers refer to
 * docs/review/2026-10-22/content-agent.md.
 */
import type { Intent } from "../../src/lib/agent/intents.ts";

export interface Case {
  q: string;
  intent: Intent;
  /** Card titles that must all be in the answer. */
  cards?: string[];
  /** Card titles that must not be. */
  without?: string[];
  /** Exact number of cards. */
  count?: number;
  /** Patterns the reply text must match. */
  text?: RegExp[];
  why?: string;
}

export const cases: Case[] = [
  // projects
  { q: "What has Kyle shipped?", intent: "projects", count: 5 },
  { q: "Show me his projects", intent: "projects", count: 5, without: ["Unlisted draft idea"] },
  {
    q: "What has he built with React?",
    intent: "projects",
    cards: ["Badger Bookmarks", "Portfolio v2"],
    count: 2,
    why: "#3: retrieval uses the visitor's terms",
  },
  { q: "Any case studies?", intent: "projects" },
  { q: "Which projects use Astro?", intent: "projects", cards: ["Golf Tracker"], count: 1 },

  // articles
  { q: "What has he written?", intent: "articles", count: 6 },
  { q: "Show me his blog", intent: "articles" },
  {
    q: "What did he write about Astro?",
    intent: "articles",
    cards: ["Getting started with Astro"],
    count: 1,
    why: "#3: older than the 6 newest, so only a GROQ match finds it",
  },
  { q: "Show me his golf articles", intent: "articles", cards: ["Why I golf"], count: 1 },
  { q: "Is he ready to start?", intent: "suggest", why: "#4: `\\bread` matched “ready”" },

  // bookmarks
  { q: "Show me his reading list", intent: "bookmarks", why: "#4: “reading” went to articles" },
  {
    q: "react bookmarks",
    intent: "bookmarks",
    cards: ["React docs", "Zustand for React state"],
    without: ["0bin"],
    count: 2,
    why: "#3: was the first 8 alphabetically",
  },
  { q: "Any saved links about CSS?", intent: "bookmarks", cards: ["CSS Tricks flexbox guide", "Modern CSS solutions"] },
  { q: "What resources has he curated?", intent: "bookmarks", count: 8 },

  // experiments
  { q: "Show me his experiments", intent: "experiments", count: 6 },
  {
    q: "canvas experiments",
    intent: "experiments",
    cards: ["Canvas particles", "Canvas fireworks"],
    count: 2,
    text: [/\b2 of\b.*\b8\b/],
    why: "#5: a narrowed answer says so",
  },
  { q: "pending experiments", intent: "experiments", count: 6, why: "#4: “pending” is not a search term that matches" },
  { q: "Anything pending?", intent: "suggest", why: "#4: `pen` matched “pending”" },
  { q: "CodePen sketches", intent: "experiments" },
  { q: "pencil sketches", intent: "experiments" },

  // experience
  { q: "Walk me through his experience", intent: "experience", count: 4 },
  { q: "Where has he worked?", intent: "experience", count: 4 },
  {
    q: "Tell me about part of his career",
    intent: "experience",
    count: 4,
    why: "#5: said “8 roles” over 1 card",
  },
  { q: "Did he work at Globex?", intent: "experience", cards: ["Front-end Developer"], count: 1 },

  // education
  { q: "What's his education?", intent: "education", count: 2 },
  { q: "Where did he study?", intent: "education" },
  { q: "What courses has he taken?", intent: "education", why: "#4: “courses” went to golf" },

  // skills
  { q: "What are his skills?", intent: "skills", count: 3 },
  { q: "What's his tech stack?", intent: "skills" },
  {
    q: "Does he know TypeScript?",
    intent: "skills",
    cards: ["Languages"],
    count: 1,
    text: [/^Yes\b/, /TypeScript/, /Languages/],
    why: "#5: answer yes or no",
  },
  {
    q: "what does he know about TypeScript",
    intent: "skills",
    cards: ["Languages"],
    text: [/^Yes\b/],
  },
  { q: "Does he know Rust?", intent: "skills", count: 3, text: [/^No\b/, /Rust/] },

  // testimonials
  { q: "Any testimonials?", intent: "testimonials", count: 3 },
  { q: "Who recommends him?", intent: "testimonials" },
  { q: "References from Globex?", intent: "testimonials", cards: ["Sam Rivera"], count: 1 },

  // golf
  { q: "Show me his golf scores", intent: "golf", count: 4 },
  { q: "What's his best round?", intent: "golf", text: [/\b79\b/] },
  { q: "What's his handicap?", intent: "golf" },

  // contact
  { q: "How do I contact him?", intent: "contact" },
  { q: "Can I hire Kyle?", intent: "contact", why: "#4: `can … kyle` went to skills" },

  // about
  { q: "Who is Kyle?", intent: "about" },
  { q: "Where is he based?", intent: "about", text: [/Portland/], why: "#4: settings.location exists" },
  { q: "Tell me about yourself", intent: "about" },

  // suggest
  { q: "hello", intent: "suggest" },
  { q: "What's the weather like on Mars?", intent: "suggest" },
  { q: "Is he a particular fan of Paris?", intent: "suggest", why: "#4: `par` matched “particular”/“Paris”" },
];

/** `isGrounded(line, facts)` — findings #8 and #9. */
export interface GroundingCase {
  line: string;
  facts: string[];
  grounded: boolean;
  why: string;
}

const PROJECT_FACTS = ["Badger Bookmarks, Project", "Headspace, Front end", "Golf Tracker, Golf", "Smart Home dashboard"];
const GOLF_FACTS = ["best round 79", "average 83", "4 most recent rounds"];

export const grounding: GroundingCase[] = [
  { line: "His projects include Headspace and Golf Tracker", facts: PROJECT_FACTS, grounded: true, why: "names from the facts" },
  { line: "He partnered with Headspace to promote mindfulness", facts: PROJECT_FACTS, grounded: false, why: "observed: invented partnership" },
  { line: "His 12 projects include Headspace", facts: PROJECT_FACTS, grounded: false, why: "#8a: invented number" },
  { line: "An 8-round streak at Eastmoreland", facts: GOLF_FACTS, grounded: false, why: "#8a: invented number" },
  { line: "His best round is 79", facts: GOLF_FACTS, grounded: true, why: "number from the facts" },
  { line: "His best round is 7", facts: GOLF_FACTS, grounded: false, why: "#8: a digit run must match whole" },
  {
    line: "Sam Rivera worked with him at Globex",
    facts: ["Sam Rivera, Engineering Manager at Globex"],
    grounded: false,
    why: "#9: invented employer relationship",
  },
  { line: "His impressive projects include Headspace", facts: PROJECT_FACTS, grounded: false, why: "#8c: praise" },
  { line: "He has three projects", facts: PROJECT_FACTS, grounded: false, why: "#8a: a number word is a number" },
  {
    line: "His skills span four categories",
    facts: ["9 skills across 3 categories", "Languages", "Design"],
    grounded: false,
    why: "#8a: wrong number word",
  },
  {
    line: "Sam Rivera, Engineering Manager at Globex",
    facts: ["Sam Rivera, Engineering Manager at Globex"],
    grounded: true,
    why: "#9: the fact as the data states it",
  },
  { line: "His current projects include Headspace", facts: PROJECT_FACTS, grounded: false, why: "#8c: “current” is a claim" },
  {
    line: "His extensive skills span 3 categories",
    facts: ["9 skills across 3 categories", "Languages", "Design"],
    grounded: false,
    why: "#8c: praise",
  },
  {
    line: "His skills span 3 categories",
    facts: ["9 skills across 3 categories", "Languages", "Design"],
    grounded: true,
    why: "existence verb + facts",
  },
  { line: "His art includes a dashboard", facts: PROJECT_FACTS, grounded: false, why: "#8b: “art” inside “Smart”" },
  { line: "He is head of Headspace", facts: PROJECT_FACTS, grounded: false, why: "#8b: “head” inside “Headspace”" },
  { line: "He is a pro at Golf Tracker", facts: PROJECT_FACTS, grounded: false, why: "#8b: “pro” inside “projects”" },
  {
    line: "He published Why I golf in May 2026",
    facts: ["Why I golf, published May 2026"],
    grounded: true,
    why: "title and date from the facts",
  },
  {
    line: "He published Why I golf in 2025",
    facts: ["Why I golf, published May 2026"],
    grounded: false,
    why: "#8a: wrong year",
  },
];

/** `answer()` with the model tier on and a stubbed binding. */
export interface ModelCase {
  q: string;
  /** What the stub model says; `throw` and `hang` exercise the failure paths. */
  says: string | "throw" | "hang";
  composed: "model" | "template";
  why: string;
}

export const model: ModelCase[] = [
  { q: "What has Kyle shipped?", says: "His projects include Headspace and Golf Tracker.", composed: "model", why: "grounded line passes" },
  { q: "What has Kyle shipped?", says: "He partnered with Headspace to promote mindfulness.", composed: "template", why: "ungrounded → template" },
  { q: "What has Kyle shipped?", says: "He shipped 12 projects, including Headspace.", composed: "template", why: "invented number → template" },
  { q: "Any testimonials?", says: "Sam Rivera worked with him at Globex.", composed: "template", why: "#9 → template" },
  {
    q: "Any testimonials?",
    says: "Sam Rivera, Engineering Manager at Globex.",
    composed: "model",
    why: "#9: the facts quote the document",
  },
  { q: "Show me his golf scores", says: "I'm a golfer with a best round of 79.", composed: "template", why: "first person → template" },
  { q: "What has Kyle shipped?", says: "throw", composed: "template", why: "binding error → template" },
  { q: "What has Kyle shipped?", says: "hang", composed: "template", why: "timeout aborts → template" },
];
