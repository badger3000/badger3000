/**
 * The intent router (ADR 0008).
 *
 * Tier 1: keyword rules over a short message. That covers almost every real
 * question a visitor types about a portfolio. Anything unmatched falls through
 * to `suggest`, which answers with the things worth asking — never a shrug.
 *
 * Every rule is a list of whole words or phrases (matched at a word boundary at
 * both ends, so "ready" is not "read" and "pending" is not "pen"), and every rule is
 * scored: the intent with the most weight wins, ties go to the earlier rule.
 * Generic words ("about", "who", "where", "work") weigh half, so they only
 * decide a message nothing more specific claims.
 *
 * The LLM is deliberately *not* in this file. It only writes one line around
 * retrieved data (see ./compose.ts), so it can never change what is retrieved or
 * invent a fact.
 */

export const INTENTS = [
  "projects",
  "articles",
  "experiments",
  "experience",
  "education",
  "skills",
  "testimonials",
  "bookmarks",
  "golf",
  "about",
  "contact",
  "suggest",
] as const;

export type Intent = (typeof INTENTS)[number];

interface Rule {
  intent: Exclude<Intent, "suggest">;
  /** Whole words or phrases, weight 1. */
  words: string[];
  /** Whole words or phrases that only lean towards this intent, weight ½. */
  weak?: string[];
}

/** In priority order: a tie goes to the rule listed first. */
const RULES: Rule[] = [
  {
    intent: "projects",
    words: ["project", "projects", "portfolio", "built", "build", "shipped", "ship", "case study", "case studies"],
  },
  {
    intent: "articles",
    words: ["article", "articles", "writing", "wrote", "write", "written", "blog", "blogs", "post", "posts", "essay", "essays", "read"],
  },
  {
    intent: "experiments",
    words: ["experiment", "experiments", "lab", "labs", "pen", "pens", "codepen", "codepens", "sketch", "sketches", "playground", "toy", "toys", "demo", "demos"],
  },
  {
    intent: "experience",
    words: ["experience", "experienced", "job", "jobs", "worked", "working", "career", "company", "companies", "employer", "employers", "resume", "résumé", "cv", "role", "roles", "work history"],
    weak: ["work"],
  },
  {
    intent: "education",
    words: ["education", "educated", "school", "college", "university", "degree", "degrees", "study", "studied", "course", "courses", "class", "classes", "certificate", "certification", "certifications", "qualification", "qualifications"],
  },
  {
    intent: "skills",
    words: ["skill", "skills", "stack", "tool", "tools", "technology", "technologies", "tech", "good at", "proficient", "expert", "language", "languages", "framework", "frameworks"],
    weak: ["know", "knows", "can he", "can kyle", "use", "uses"],
  },
  {
    intent: "testimonials",
    words: ["testimonial", "testimonials", "reference", "references", "recommendation", "recommendations", "recommend", "recommends", "recommended", "review", "reviews", "praise", "say about him"],
  },
  {
    intent: "bookmarks",
    words: ["bookmark", "bookmarks", "bookmarked", "saved", "save", "link", "links", "resource", "resources", "reading list", "curated"],
  },
  {
    intent: "golf",
    words: ["golf", "golfing", "golfer", "round", "rounds", "par", "handicap", "putt", "putting", "18 holes", "tee", "birdie", "score", "scores"],
  },
  {
    intent: "contact",
    words: ["contact", "email", "e-mail", "reach out", "reach him", "get in touch", "hire", "hiring", "available", "availability", "message him", "dm"],
  },
  {
    intent: "about",
    words: ["who is", "who's", "bio", "biography", "yourself", "based", "live", "lives", "located", "location", "from where", "where is he"],
    weak: ["who", "about", "kyle", "where", "tell me about"],
  },
];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A word boundary at both ends; inner spaces match any run of whitespace. The
 * boundary is spelled as lookarounds because `\b` is ASCII-only and would never
 * close after "résumé".
 */
const pattern = (phrases: string[]) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${phrases.map((p) => escape(p).replace(/ /g, "\\s+")).join("|")})(?![\\p{L}\\p{N}])`,
    "giu",
  );

const COMPILED = RULES.map((rule) => ({
  intent: rule.intent,
  strong: pattern(rule.words),
  weak: rule.weak ? pattern(rule.weak) : null,
}));

export interface Classification {
  intent: Intent;
  /**
   * The visitor's own words, for retrieval to match against Sanity: stopwords
   * and the words that picked the intent are gone ("react bookmarks" →
   * ["react"]). Original casing, so a reply can quote them.
   */
  terms: string[];
  /** True when no rule matched, or a second intent scored too. */
  ambiguous: boolean;
}

/** Function words and chat filler: never worth matching against content. */
const STOP = new Set([
  "a", "about", "all", "also", "an", "and", "any", "anything", "are", "as", "at", "be", "been", "best",
  "can", "could", "did", "do", "does", "done", "else", "ever", "for", "from", "get", "give", "got",
  "has", "have", "he", "her", "here", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its",
  "just", "kyle", "kyle's", "latest", "let", "like", "list", "look", "lot", "me", "more", "most", "much",
  "my", "new", "newest", "of", "on", "one", "or", "other", "our", "out", "over", "please", "recent",
  "see", "send", "should", "show", "so", "some", "take", "taken", "tell", "than", "thanks", "that", "the", "their", "them",
  "then", "there", "these", "they", "thing", "things", "this", "those", "through", "to", "up", "us",
  "use", "used", "uses", "using", "very", "walk", "want", "was", "we", "were", "what", "what's",
  "when", "where", "which", "while", "who", "why", "will", "with", "would", "you", "your",
]);

/** At most this many terms reach GROQ, so a pasted paragraph stays one cheap query. */
const MAX_TERMS = 5;

/** Content words worth matching against Sanity, ignoring the obvious noise. */
export function keywords(message: string): string[] {
  return message
    .replace(/[^\p{L}\p{N}\s+#.'-]/gu, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^[.'-]+|[.'-]+$/g, ""))
    .filter((word) => word.length > 1 && !STOP.has(word.toLowerCase()));
}

export function classify(message: string): Classification {
  const text = message.trim();
  if (!text) return { intent: "suggest", terms: [], ambiguous: true };

  const scored = COMPILED.map((rule) => {
    const strong = text.match(rule.strong) ?? [];
    const weak = rule.weak ? (text.match(rule.weak) ?? []) : [];
    // Distinct hits, so "project project project" is not three times as sure.
    const score = new Set(strong.map((w) => w.toLowerCase())).size + new Set(weak.map((w) => w.toLowerCase())).size / 2;
    return { rule, score };
  });

  // Stable sort: equal scores keep RULES order, which is the tie-break.
  const ranked = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  if (!winner) return { intent: "suggest", terms: [], ambiguous: true };

  // Drop the words that picked the intent, then the stopwords: what is left is
  // what the visitor wants *within* it.
  let rest = text.replace(winner.rule.strong, " ");
  if (winner.rule.weak) rest = rest.replace(winner.rule.weak, " ");
  const seen = new Set<string>();
  const terms = keywords(rest)
    .filter((word) => !seen.has(word.toLowerCase()) && seen.add(word.toLowerCase()))
    .slice(0, MAX_TERMS);

  return { intent: winner.rule.intent, terms, ambiguous: ranked.length > 1 };
}
