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
import { CHAT_MODEL_TIER } from "astro:env/server";
import { bindings } from "./bindings.ts";

/** The Tier-1 phrasing. Always works, needs no model, costs nothing. */
export function fallback(intent: Intent, count: number, facts: string[]): string {
  switch (intent) {
    case "projects":
      return count
        ? `He's shipped ${count} of them — here's the short list.`
        : "There are no published projects in the dataset yet.";
    case "articles":
      return count
        ? `${count} of his articles, most recent first.`
        : "No articles are published yet.";
    case "experiments":
      return count
        ? `${count} experiments — code sketches rather than finished work.`
        : "No experiments yet.";
    case "experience":
      return count
        ? `${count} roles on the record, newest first.`
        : "Nothing in the experience dataset yet.";
    case "education":
      return count
        ? `${count} qualification${count === 1 ? "" : "s"} on file.`
        : "Nothing in the education dataset yet.";
    case "skills":
      return facts[0]
        ? `${facts[0]}, grouped by category.`
        : "No skills in the dataset yet.";
    case "testimonials":
      return count
        ? `${count} testimonial${count === 1 ? "" : "s"} from people he's worked with.`
        : "No testimonials published yet.";
    case "bookmarks":
      return count
        ? `A slice of what he's saved — the full set is browsable.`
        : "No bookmarks yet.";
    case "golf":
      return facts.length
        ? `His golf card: ${facts.join(", ")}. Lower is better.`
        : "No rounds logged yet.";
    case "contact":
      return "Email is the surest way to reach him.";
    case "about":
      return facts[0]
        ? `${facts[0]}. Everything on this site comes out of his own Sanity data.`
        : "The bio document hasn't been filled in yet.";
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

interface AiBinding {
  run(model: string, input: { messages: { role: string; content: string }[] }): Promise<{ response?: string }>;
}

/**
 * Returns the model's line, or null to fall back. Bounded by a timeout: a slow
 * model must not make the chat feel broken.
 */
export async function compose(
  intent: Intent,
  facts: string[],
): Promise<string | null> {
  if (!facts.length) return null;

  // Off by default — see the note above and on CHAT_MODEL_TIER in astro.config.
  if (CHAT_MODEL_TIER !== "on") return null;

  const env = await bindings();
  const ai = env?.AI as AiBinding | undefined;
  if (!ai) {
    console.info("[chat] no AI binding — using deterministic phrasing");
    return null;
  }

  try {
    const result = await Promise.race([
      ai.run(MODEL, {
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Facts to introduce:\n- ${facts.slice(0, 8).join("\n- ")}\n\nOne sentence, addressed to the visitor.`,
          },
        ],
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
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
  }
}