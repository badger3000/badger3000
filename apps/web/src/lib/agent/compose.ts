/**
 * Compose (ADR 0008, step 3): one grounded line on top of retrieved data.
 *
 * The model never sees the visitor's question as free scope — it sees the facts
 * that came back from Sanity and is asked to introduce *those*.
 *
 * **Measured, not assumed:** the ADR's claim that a model limited to retrieved
 * facts "cannot hallucinate" does not hold at this model size. Asked to
 * introduce a list of project names, the 3B model wrote "partnered with
 * Headspace to promote mindfulness" — nothing in the facts. So grounding is
 * checked (`isGrounded`), not trusted, and the tier is opt-in: off by default,
 * because every line it produced was caught and discarded.
 *
 * If the tier is off, the binding is missing, the model errors, or it takes too
 * long, the deterministic phrasing is used instead. Chat never breaks.
 */
import type { Intent } from "./intents.ts";
import type { Retrieved } from "./retrieve.ts";

/** What the template needs from retrieval. */
export type Found = Pick<Retrieved, "cards" | "facts" | "total" | "matched" | "narrowedBy" | "known">;

/** Nothing retrieved: the `suggest` answer, and the empty case. */
export const NOTHING: Found = { cards: [], facts: [], total: 0, matched: 0, narrowedBy: [] };

/** What the list intents call one item and many. */
const NOUN: Partial<Record<Intent, [string, string]>> = {
  projects: ["project", "projects"],
  articles: ["article", "articles"],
  experiments: ["experiment", "experiments"],
  experience: ["role", "roles"],
  education: ["qualification", "qualifications"],
  skills: ["skill group", "skill groups"],
  testimonials: ["testimonial", "testimonials"],
  bookmarks: ["bookmark", "bookmarks"],
  golf: ["round", "rounds"],
};

const plural = (n: number, [one, many]: [string, string]) => (n === 1 ? one : many);
const quote = (terms: string[]) => `“${terms.join(" ")}”`;

/**
 * "2 of his 28 experiments match “canvas”." Every count comes from the same
 * query as the cards, and the first number is the number of cards shown.
 */
function narrowed(intent: Intent, { cards, matched, total, narrowedBy }: Found): string {
  const noun = NOUN[intent] ?? ["result", "results"];
  const shown = cards.length;
  if (matched > shown) return `Here are ${shown} of the ${matched} ${noun[1]} that match ${quote(narrowedBy)}.`;
  return `${shown} of his ${total} ${plural(total, noun)} ${shown === 1 ? "matches" : "match"} ${quote(narrowedBy)}.`;
}

/** "6 of his 28 experiments" when the cap cut the list, "6 experiments" when it didn't. */
function some(intent: Intent, { cards, total }: Found): string {
  const noun = NOUN[intent] ?? ["result", "results"];
  const shown = cards.length;
  return shown < total ? `${shown} of his ${total} ${noun[1]}` : `${shown} ${plural(shown, noun)}`;
}

/**
 * The Tier-1 phrasing. Always works, needs no model, costs nothing. `terms` are
 * the visitor's words; when they matched nothing, the reply says so rather than
 * passing the unfiltered list off as an answer to them.
 */
export function fallback(intent: Intent, found: Found, terms: string[] = []): string {
  const { cards, facts, narrowedBy } = found;
  const shown = cards.length;
  const missed = terms.length && !narrowedBy.length ? ` Nothing matched ${quote(terms)}.` : "";
  const isNarrowed = narrowedBy.length > 0;

  switch (intent) {
    case "projects":
      if (!shown) return "There are no published projects in the dataset yet.";
      if (isNarrowed) return narrowed(intent, found);
      return (shown < found.total
        ? `${some(intent, found)} — here's the short list.`
        : `He's shipped ${shown} — here's the list.`) + missed;
    case "articles":
      if (!shown) return "No articles are published yet.";
      if (isNarrowed) return narrowed(intent, found);
      return `${some(intent, found)}, most recent first.${missed}`;
    case "experiments":
      if (!shown) return "No experiments yet.";
      if (isNarrowed) return narrowed(intent, found);
      return `${some(intent, found)} — code sketches rather than finished work.${missed}`;
    case "experience":
      if (!shown) return "Nothing in the experience dataset yet.";
      if (isNarrowed) return narrowed(intent, found);
      return `${some(intent, found)} on the record, newest first.${missed}`;
    case "education":
      if (!shown) return "Nothing in the education dataset yet.";
      if (isNarrowed) return narrowed(intent, found);
      return `${some(intent, found)} on file.${missed}`;
    case "skills": {
      if (!facts[0]) return "No skills in the dataset yet.";
      // A skill asked about by name gets a yes or no, not just a list.
      if (found.known?.length) {
        const where = found.known.map(({ skill, category }) => `${skill} is under ${category}`);
        return `Yes — ${where.join("; ")}.`;
      }
      if (isNarrowed) return narrowed(intent, found);
      if (terms.length) return `No — ${quote(terms)} isn't on his skills list. ${facts[0]}, grouped by category.`;
      return `${facts[0]}, grouped by category.`;
    }
    case "testimonials":
      if (!shown) return "No testimonials published yet.";
      if (isNarrowed) return narrowed(intent, found);
      return `${some(intent, found)}, in their own words.${missed}`;
    case "bookmarks":
      if (!shown) return "No bookmarks yet.";
      if (isNarrowed) return narrowed(intent, found);
      return `${shown} of the ${found.total} links he's saved — the full set is browsable.${missed}`;
    case "golf":
      if (!facts.length) return "No rounds logged yet.";
      if (isNarrowed) return `${narrowed(intent, found)} ${facts.join(", ")}. Lower is better.`;
      return `His golf card: ${facts.join(", ")}. Lower is better.`;
    case "contact":
      return "Email is the surest way to reach him.";
    case "about": {
      if (!facts[0]) return "The bio document hasn't been filled in yet.";
      const based = facts.find((fact) => fact.startsWith("based in "));
      return `${facts[0]}${based ? `, ${based}` : ""}. Everything on this site comes out of his own Sanity data.`;
    }
    default:
      return "I know his projects, writing, experiments, experience, skills, testimonials, bookmarks and golf scores. Try one of those.";
  }
}

/**
 * One sentence about a short list of facts — small and fast is the right trade.
 *
 * Model ids go stale: `@cf/meta/llama-3.1-8b-instruct` was deprecated on
 * 2026-05-30 and every call started failing (error 5028). The catalog is the
 * source of truth:
 *
 *   GET /accounts/:id/ai/models/search  → pick a `text-generation` model
 *
 * A 3B instruct model is plenty here and stays cheap at the edge. If it is ever
 * deprecated the endpoint does not break — it falls back to the template tier.
 */
const MODEL = "@cf/meta/llama-3.2-3b-instruct";

const SYSTEM = [
  "You are Badger3000, the assistant on Kyle Ross's portfolio site.",
  "You talk *about* Kyle in the third person. Never speak as if you were Kyle, and never say you are an AI.",
  "Given a few facts, reply with ONE sentence of at most 16 words that leads into them.",
  "Use only words that appear in the facts, plus everyday connecting words. Do not add adjectives, praise, or detail the facts do not state.",
  "Never say 'the portfolio', 'the facts', 'this list', or describe what you were given.",
  "No preamble, no quotes, no lists.",
].join(" ");

/**
 * Observed failure modes, refused rather than passed on. A model that claims a
 * role ("I'm a golfer…") or narrates its input ("The portfolio includes…") has
 * stopped being a grounded assistant, and this is someone's real portfolio.
 */
const REJECT = [
  /\b(i am|i'm|my|me)\b/i, // no first person: the agent is not Kyle
  /\bthe portfolio\b/i,
  /\b(the facts|this list|the list|these items|this data)\b/i,
  /\b(as an ai|as a language model|ai assistant)\b/i,
];

/**
 * Words that carry no checkable claim and so need no backing in the facts:
 * function words, the site's own subject, verbs of *existence* ("his skills span
 * four categories"), and intensifiers.
 *
 * Verbs and adjectives of *accomplishment* are deliberately absent — "built",
 * "created", "worked with", "partnered with" are where embellishment shows up,
 * and they assert something a reader could check.
 */
const ALLOWED = new Set(
  `a an the and or but so if of in on at by for to from with without across over under into
   his her their its this that these those there here it he she they them we you your
   is are was were be been being has have had having do does did done
   many several various few more most less than some any each both either neither
   as up down out about around between within among while when where which who what how why
   not no yes also just only still able us one two three
   kyle ross badger badger3000 site website
   include includes included listing lists listed show shows showed span spans spanned
   cover covers covered feature features featured contain contains contained
   range ranges ranged run runs running
   broad wide deep extensive diverse comprehensive solid strong notable impressive
   valuable impressive key main multiple consistent genuine practical active current
   growing serious hands useful current broad`.split(/\s+/).filter(Boolean),
);

/**
 * Checkable grounding: every content word in the model's sentence must appear in
 * the facts it was given.
 *
 * ADR 0008 assumes a model limited to retrieved facts "cannot hallucinate". A
 * 3B model does not honour that by instruction — observed output invented
 * "guided meditations" for a project called Headspace, and a year nobody
 * supplied. So the claim is checked instead of trusted: a word with no backing
 * in the facts means the line is not grounded, and the deterministic phrasing
 * answers instead.
 */
export function isGrounded(line: string, facts: string[]): boolean {
  const haystack = facts.join(" ").toLowerCase();
  const words = line
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const word of words) {
    if (ALLOWED.has(word) || word.length < 3) continue;
    // Accept a plural or an inflection of a supplied word ("rounds" / "round").
    const stem = word.replace(/(s|es|ed|ing)$/, "");
    if (haystack.includes(word) || haystack.includes(stem)) continue;
    return false;
  }
  return true;
}

export interface AiBinding {
  run(
    model: string,
    input: { messages: { role: string; content: string }[] },
    options?: { signal?: AbortSignal },
  ): Promise<{ response?: string }>;
}

/**
 * What the model tier needs, passed in by the endpoint (env and bindings stay
 * out of the agent): `tier` is CHAT_MODEL_TIER, `ai` the Workers AI binding if
 * there is one.
 */
export interface Model {
  tier?: "off" | "on";
  ai?: AiBinding | null;
}

/** The template answers in ~0 ms; the model gets this long to beat it. */
const TIMEOUT_MS = 2500;

/**
 * Returns the model's line, or null to fall back. Bounded by a timeout: a slow
 * model must not make the chat feel broken. The timeout aborts the call, so a
 * late answer stops running (and billing) instead of finishing unseen.
 */
export async function compose(
  intent: Intent,
  facts: string[],
  { tier, ai }: Model,
): Promise<string | null> {
  if (!facts.length) return null;

  // Off by default — see the note above and on CHAT_MODEL_TIER in astro.config.
  if (tier !== "on") return null;

  if (!ai) {
    console.info("[chat] no AI binding — using deterministic phrasing");
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const result = await Promise.race([
      ai.run(
        MODEL,
        {
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `Facts to introduce:\n- ${facts.slice(0, 8).join("\n- ")}\n\nOne sentence, addressed to the visitor.`,
            },
          ],
        },
        { signal: controller.signal },
      ),
      // Still raced on the same signal, in case a binding ignores it.
      new Promise<null>((resolve) => controller.signal.addEventListener("abort", () => resolve(null))),
    ]);

    const text = result && "response" in result ? (result as { response?: string }).response : null;
    // Take the first real sentence, without the quotes models like to add.
    const line = text
      ?.replace(/^["'`\s]+|["'`\s.]+$/g, "")
      .split(/(?<=[.!?])\s+/)[0]
      ?.trim();

    if (!line) {
      console.info("[chat] model returned no text — using deterministic phrasing");
      return null;
    }
    if (REJECT.some((pattern) => pattern.test(line))) {
      console.info("[chat] model line was not grounded — using deterministic phrasing:", line);
      return null;
    }
    if (!isGrounded(line, facts)) {
      console.info("[chat] model line added detail — using deterministic phrasing:", line);
      return null;
    }

    // One sentence, bounded length — anything longer is the model ignoring the
    // instruction, and this is not the place for a paragraph.
    return line.length > 160 ? `${line.slice(0, 157)}…` : line;
  } catch (error) {
    // Workers AI needs a paid plan; a free account lands here every time, and so
    // does any model outage. Either way the deterministic line answers.
    console.info("[chat] model unavailable — using deterministic phrasing:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}