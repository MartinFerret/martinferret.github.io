// Shared content for llms.txt and llms-full.txt: who Martin is, what he offers, and the key pages.
import { podcasts } from '../data/podcasts';

export const aboutFirst = "Martin Ferret is a French TypeScript expert focused on type-checking performance, a contributor to Microsoft's TypeScript DOM types, and Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev.";

export const services = [
  ['TypeScript performance audit', "measure type-checking time and memory on the team's real codebase, find the types and files that cost the most, deliver a prioritized fix list."],
  ['TypeScript 7 migration', "measure TypeScript 6 vs 7 on the team's project, check memory in CI, plan a safe migration."],
  ['Type-checking budget in CI', "budgets based on the compiler's counters, with a tolerance calibrated on the project, so a pull request can't silently slow the build down."],
  ['Team training and workshops', 'advanced TypeScript and type performance, for Angular, React and Node.js teams.'],
] as const;

export const keyPages = (): [string, string, string][] => [
  ['Work with me', '/hire/', 'TypeScript performance consulting for engineering teams: audits, TypeScript 7 migration, CI budgets, training.'],
  ['Invite me to speak', '/speak/', 'Bio, photo and talk abstracts for conference and podcast organizers.'],
  ['TypeScript Performance Lab', '/lab/', 'Reproducible experiments on TypeScript type-checking performance, with raw results.'],
  ['Work', '/work/', "Pull requests and issue analyses in Microsoft's TypeScript repositories and other projects, with live GitHub status."],
  ["What's up TypeScript France", '/meetup/', 'The free online TypeScript meetup in French that Martin runs.'],
  ['About', '/about/', 'Who Martin is, with links to every profile.'],
  ...podcasts.map((p) => [p.name, `/podcasts/${p.slug}/`, p.summary] as [string, string, string]),
  ['Writing', '/writing/', "Martin's articles on JavaScript and TypeScript, including those published on the Certificates.dev blog."],
];
