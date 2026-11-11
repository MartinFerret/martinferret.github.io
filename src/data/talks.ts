// Talks Martin offers to organizers (used on /speak/ and /talks/<slug>/). Abstracts are Martin's own copy, verbatim.
// Appearances (talks, workshops, guest podcasts that happened or are scheduled) live in events.ts;
// lib/talks.ts merges both into one list of talk pages.

export interface BookableTalk {
  slug: string;
  title: string;
  level: string;
  format: string;
  tone: 'blue' | 'violet' | 'coral';
  abstract: string;
}

export const bookableTalks: BookableTalk[] = [
  {
    slug: 'the-dom-is-lying-to-your-types',
    title: 'The DOM Is Lying to Your Types',
    level: 'Expert',
    format: '30 to 45 min',
    tone: 'blue',
    abstract:
      "Every TypeScript project trusts lib.dom.d.ts, but it isn't written by hand: a generator turns web specifications into types, and that translation is where bugs hide. Optional parameters that throw, iterables typed as arrays, return types lost on the way. I fix these bugs upstream in Microsoft's generator. In this talk, I show how WebIDL becomes TypeScript, why the spec and not MDN is the source of truth, how to prove a DOM type is wrong, and how a fix travels from a pull request to your editor.",
  },
  {
    slug: 'your-types-have-a-performance-budget',
    title: "Your Types Have a Performance Budget. You're Just Not Measuring It.",
    level: 'Expert',
    format: '30 to 45 min, also as a half-day workshop',
    tone: 'violet',
    abstract:
      "A one-line type change can multiply type-checking cost by ten without breaking a test: real projects shipped 23 times more instantiations and CI jobs that crashed. We budget bundle size and page speed, so why not types? TypeScript 6's counters are deterministic: same code, same numbers on any machine. With TypeScript 7, I measured small variations on large test suites, and I'm investigating how much tolerance a CI budget needs. I show how to measure the cost of your types, find the generic that dominates it, and fail a pull request before your build slows down.",
  },
  {
    slug: 'your-ai-agent-is-slowing-down-your-compiler',
    title: 'Your AI Agent Is Slowing Down Your Compiler',
    level: 'Intermediate to expert',
    format: '30 to 45 min',
    tone: 'coral',
    abstract:
      "Typed AI agents are everywhere: tools described with schemas, structured outputs inferred into TypeScript types, SDKs built on deeply generic APIs. Great for safety, but they can quietly crush your type-checker. I'm measuring what schemas, tool definitions and AI SDK types cost the TypeScript compiler as an agent grows from 1 to 50 tools, and which ways of writing them stay fast. You'll see the numbers, why some patterns explode, and how to keep agents fully typed and fast to build.",
  },
];
