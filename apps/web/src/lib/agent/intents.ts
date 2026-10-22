/**
 * The intent router (ADR 0008).
 *
 * Tier 1: keyword and pattern rules over a short message. That covers almost
 * every real question a visitor types about a portfolio. Anything ambiguous or
 * unmatched falls through to `suggest`, which answers with the things worth
 * asking — never a shrug.
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
  intent: Intent;
  test: RegExp;
  /** Terms kept from the message to narrow the GROQ query, if any. */
  terms?: RegExp;
}

const RULES: Rule[] = [
  { intent: "projects", test: /\b(project|projects|portfolio|built|build|shipped|ship|case stud)/i },
  { intent: "articles", test: /\b(article|articles|writing|wrote|write|blog|essay|read)/i },
  {
    intent: "experiments",
    test: /\b(experiment|experiments|lab|labs|pen|codepen|sketch|playground|toys?)/i,
  },
  {
    intent: "experience",
    test: /\b(experience|experienced|job|jobs|work|worked|working|career|company|companies|employer|resume|r[ée]sum[ée]|cv|role|roles)/i,
  },
  { intent: "education", test: /\b(education|educated|school|college|university|degree|study|studied|learn)/i },
  {
    intent: "skills",
    test: /\b(skill|skills|stack|tools?|technolog|tech|know|knows|can (you|he|she|they|kyle)|good at|proficient|expert|languages?)\b/i,
  },
  {
    intent: "testimonials",
    test: /\b(testimonial|testimonials|reference|references|recommendation|recommendations|review|reviews|praise)/i,
  },
  {
    intent: "bookmarks",
    test: /\b(bookmark|bookmarks|saved|save|links?|resources?|reading list|curated)/i,
  },
  { intent: "golf", test: /\b(golf|course|courses|round|rounds|par|handicap|putt|18 holes)/i },
  {
    intent: "contact",
    test: /\b(contact|email|e-mail|reach out|get in touch|hire|hiring|available|message|dm)/i,
  },
  {
    intent: "about",
    test: /\b(who|about|about you|bio|biography|yourself|you are|kyle|he is|tell me about)\b/i,
  },
];

export interface Classification {
  intent: Intent;
  /** Free text left for retrieval to match against, when we can find it. */
  query: string;
  /** True when no rule matched and the router is guessing. */
  ambiguous: boolean;
}

const STOP = new Set([
  "a", "about", "an", "and", "any", "are", "as", "at", "be", "can", "do", "does", "for", "from",
  "give", "has", "have", "he", "her", "his", "how", "i", "in", "is", "it", "me", "my", "of", "on",
  "or", "please", "show", "some", "tell", "that", "the", "their", "them", "there", "they", "to",
  "was", "were", "what", "when", "where", "which", "who", "why", "will", "with", "would", "you",
]);

/** Content words worth matching against Sanity, ignoring the obvious noise. */
export function keywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function classify(message: string): Classification {
  const text = message.trim();
  if (!text) return { intent: "suggest", query: "", ambiguous: true };

  const hits = RULES.filter((rule) => rule.test.test(text));

  // Two different intents matching usually means the message is about one of
  // them specifically ("his golf articles"), so prefer the earlier rule but keep
  // the flag so the response can mention the alternative.
  const intent = hits[0]?.intent ?? "suggest";
  return {
    intent,
    query: keywords(text).join(" "),
    ambiguous: hits.length > 1 || hits.length === 0,
  };
}