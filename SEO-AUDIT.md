# SEO audit, martinferret.dev

Two snapshots of the same table: "Before" (11 November 2026, the site and Lab as built from the local repositories, before this SEO pass) and "After" (at the end of this file). Screenshots of every page, desktop 1440 px and mobile 390 px, are listed at the end.

Columns: page path, `<title>`, meta description, H1, canonical URL, Open Graph image, JSON-LD types, number of other pages linking to it (internal links in the built HTML, header and footer included).

## Before

### Personal site (Astro, `dist/`)

| Path | Title | Meta description | H1 | Canonical | OG image | JSON-LD | Inbound |
|---|---|---|---|---|---|---|---|
| / | Martin Ferret: faster TypeScript for the age of AI | TypeScript expert focused on type-checking performance. Contributor to TypeScript’s DOM types. Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev. | Faster TypeScript for the age of AI. | https://martinferret.github.io/ | /og/home.png | Person | 10 |
| /404.html | Not found, Martin Ferret | TypeScript expert focused on type-checking performance. Contributor to TypeScript’s DOM types. Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev. | Page not found | https://martinferret.github.io/404/ | /og/home.png | Person | 0 |
| /about/ | About, Martin Ferret | TypeScript expert focused on type-checking performance. Contributor to TypeScript’s DOM types. Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev. | About Martin | https://martinferret.github.io/about/ | /og/about.png | Person | 9 |
| /lab/ | Lab, Martin Ferret | TypeScript Performance Lab: measured, reproducible experiments on how fast TypeScript checks your types. | TypeScript Performance Lab | https://martinferret.github.io/lab/ | /og/lab.png | Person | 9 |
| /lab/001-typed-events/ | Lab #001: Typed events: the elegant type that slowed down every call site, Martin Ferret | Yes. On an Apple M3 Pro (12 cores), inferring the event name from the generic parameter cut check time by 52% with TypeScript 6 and by 57% with TypeScript 7 (51% to 65% from the fastest and slowest runs); on a 1-core Intel Xeon, by 41% and 65%. The safety check passed on both machines, so the type safety is the same. Narrowing include to src also stopped TypeScript from reading a generated file the app never imports. | Typed events: the elegant type that slowed down every call site | https://martinferret.github.io/lab/001-typed-events/ | /og/lab--001-typed-events.png | Person | 2 |
| /lab/002-ts6-vs-ts7-type-fest/ | Lab #002: TypeScript 6 vs 7 on type-fest, Martin Ferret | On an Apple M3 Pro (12 cores), TypeScript 7.0.2 checked the type-fest sources 3.5× faster than TypeScript 6.0.3 (0.484 s vs 1.67 s): 2.6× comes from the native compiler alone (single-threaded) and 1.3× from parallel checking. On the full suite with type tests, TypeScript 6 stops at Node.js's default heap limit (4.0 GiB); with a 16 GiB heap it finishes in 74.6 s, against 14.1 s for TypeScript 7 (5.3× faster), but TypeScript 7 peaks higher in memory (11.6 GiB RSS vs 10.4 GiB). Stays open until a second machine is measured with the same protocol. | TypeScript 6 vs 7 on type-fest | https://martinferret.github.io/lab/002-ts6-vs-ts7-type-fest/ | /og/lab--002-ts6-vs-ts7-type-fest.png | Person | 2 |
| /open-source/ | redirect |  |  | https://martinferret.github.io/work/ |  | (none) | 0 |
| /speak/ | Invite me to speak, Martin Ferret | I speak about TypeScript performance, the TypeScript compiler and AI agents built in TypeScript. Talks, workshops, podcasts and meetups, in English or French, on site or online. | Invite me to speak | https://martinferret.github.io/speak/ | /og/speak.png | Person | 9 |
| /speaking/ | Speaking, Martin Ferret | Upcoming and past talks, workshops, podcasts and meetups by Martin Ferret, including What's up TypeScript France. | Speaking | https://martinferret.github.io/speaking/ | /og/speaking.png | Person | 9 |
| /timeline/ | Timeline, Martin Ferret | Martin Ferret's open source contributions, talks and Lab experiments, by date, each with its source and status. | Timeline | https://martinferret.github.io/timeline/ | /og/timeline.png | Person | 10 |
| /track-record/ | redirect |  |  | https://martinferret.github.io/timeline/ |  | (none) | 0 |
| /work/ | Work, Martin Ferret | Martin Ferret's open source work: pull requests to Microsoft's TypeScript repositories, issue analyses and answers, each with its source and live GitHub status. | Open source work | https://martinferret.github.io/work/ | /og/work.png | Person | 10 |
| /writing/ | redirect |  |  | https://martinferret.github.io/ |  | (none) | 0 |

Notes on the personal site before:
- The same meta description (the site bio) is used on About, 404, Lab experiments and several others: not written for each page's search.
- Every page carries the same `Person` JSON-LD; no `WebSite`, `BreadcrumbList`, `Article`, `Event` or `PodcastSeries`.
- Canonical and Open Graph URLs point to `https://martinferret.github.io/`.
- No `sitemap.xml`, no `robots.txt`, no Search Console verification tag.
- `/writing/` redirects to `/` when there is nothing to list (no local post or featured Medium article in production).
- The 404 page is indexable with a canonical (`/404/`) that does not exist.

### TypeScript Performance Lab (`docs/index.html`, one page)

| Path | Title | Meta description | H1 | Canonical | OG image | JSON-LD | Inbound |
|---|---|---|---|---|---|---|---|
| /typescript-performance-lab/ | TypeScript Performance Lab | Reproducible experiments on TypeScript type-checking performance, by Martin Ferret. | (none in the raw HTML) | (none) | (none) | (none) | 0: the personal site links to the GitHub repository (5 links), never to the notebook |

Notes on the Lab before:
- The page is rendered in the browser from `data.json`. The raw HTML contains only "Loading the lab notebook.": crawlers, link previews and LLMs see no question, verdict or number.
- Experiments are reached with hash URLs (`#001`, `#002`, `#method`), which search engines treat as one page.
- No canonical, no Open Graph tags, no structured data, no sitemap.

### Hard-coded domains (before)

Personal site repository:
- `astro.config.mjs:3`: comment "Served by GitHub Pages from the martinferret.github.io repository."
- `astro.config.mjs:5`: `site: 'https://martinferret.github.io'`
- `src/lib/record.ts:199`: `new URL(u, 'https://martinferret.github.io')` (CSV export, dev only)
- `README.md:1`: `# martinferret.github.io`

Lab repository:
- `experiments/001-typed-events/README.md:18`: link to `https://martinferret.github.io/typescript-performance-lab/#001`
- `experiments/002-ts6-vs-ts7-type-fest/README.md:38`: link to `https://martinferret.github.io/typescript-performance-lab/#002`
- `docs/index.html:12`: comment mentioning `martinferret.dev` (no URL)

## After

Built locally on 11 November 2026 (`npm test` for the site: build plus 23 tests; `npm run build` for the Lab). Nothing is deployed.

### Personal site (Astro, `dist/`)

| Path | Title | Meta description | H1 | Canonical | OG image | JSON-LD | Inbound |
|---|---|---|---|---|---|---|---|
| / | Martin Ferret, TypeScript Performance Expert | Martin Ferret measures and fixes TypeScript type-checking performance: fixes merged into Microsoft's TypeScript repos, a public Lab, talks and audits. | Faster TypeScript for the age of AI. | https://martinferret.dev/ | /og/home.png | Person+WebSite | 18 |
| /404.html | Not found \| Martin Ferret | TypeScript expert focused on type-checking performance. Contributor to TypeScript’s DOM types. Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev. | Page not found | (none) | /og/home.png | (none) | 0 |
| /about/ | About Martin Ferret, TypeScript Expert | Martin Ferret is a French TypeScript expert focused on type-checking performance, contributor to TypeScript's DOM types, at Certificates.dev. | About Martin Ferret | https://martinferret.dev/about/ | /og/about.png | Person+BreadcrumbList | 18 |
| /hire/ | TypeScript Performance Consultant \| Martin Ferret | Slow type-checking, CI out of memory, TypeScript 7 migration: Martin Ferret audits and fixes TypeScript performance for engineering teams. | TypeScript performance expert for engineering teams | https://martinferret.dev/hire/ | /og/hire.png | Person+ProfessionalService+BreadcrumbList | 18 |
| /lab/ | TypeScript Performance Lab \| Martin Ferret | Reproducible experiments on TypeScript type-checking speed: TypeScript 6 vs 7, memory, and type patterns that slow the checker, with raw results. | TypeScript Performance Lab | https://martinferret.dev/lab/ | /og/lab.png | BreadcrumbList | 18 |
| /lab/001-typed-events/ | Lab #001: Typed events \| Martin Ferret | Lab #001. Does a mapped type with an as clause, indexed at every call site, make type-checking measurably slower than inferring the event name from a... | Typed events: the elegant type that slowed down every call site | https://martinferret.dev/lab/001-typed-events/ | /og/lab--001-typed-events.png | Article+BreadcrumbList | 2 |
| /lab/002-ts6-vs-ts7-type-fest/ | Lab #002: TypeScript 6 vs 7 on type-fest \| Martin Ferret | Lab #002. How much faster does TypeScript 7 type-check a real, type-heavy library than TypeScript 6, and how much of the gain comes from the native... | TypeScript 6 vs 7 on type-fest | https://martinferret.dev/lab/002-ts6-vs-ts7-type-fest/ | /og/lab--002-ts6-vs-ts7-type-fest.png | Article+BreadcrumbList | 2 |
| /meetup/ | What's up TypeScript France: online TypeScript meetup | A free online TypeScript meetup in French: two 20-minute talks, live questions and TypeScript news. Next edition January 7, 2027. | What's up TypeScript France | https://martinferret.dev/meetup/ | /og/meetup.png | Event+BreadcrumbList | 18 |
| /open-source/ | redirect |  |  | https://martinferret.dev/work/ |  | (none) | 0 |
| /podcasts/devpreneur/ | Devpreneur, a podcast by Martin Ferret and Alain Chautard | A French-language podcast about entrepreneurship for developers, co-hosted by Martin Ferret and Alain Chautard. Episodes and Spotify link. | Devpreneur | https://martinferret.dev/podcasts/devpreneur/ | /og/podcasts--devpreneur.png | PodcastSeries+PodcastEpisode+BreadcrumbList | 2 |
| /speak/ | Book Martin Ferret, TypeScript Speaker | Book Martin Ferret for a talk, workshop or podcast on TypeScript performance and TypeScript 7. Bio, photo and talk abstracts, ready to copy. | Invite me to speak | https://martinferret.dev/speak/ | /og/speak.png | Person+BreadcrumbList | 18 |
| /speaking/ | TypeScript Talks, Workshops and Podcasts \| Martin Ferret | Talks, workshops and podcasts by Martin Ferret on TypeScript performance, TypeScript 7 and typed AI agents, plus the meetup he runs. | Speaking | https://martinferret.dev/speaking/ | /og/speaking.png | BreadcrumbList | 18 |
| /talks/pizzeria-del-compilator/ | Pizzeria del Compilator \| Martin Ferret | Martin Ferret gave this workshop at Frontend Nation 2026, TypeScript Day, online, on October 20, | Pizzeria del Compilator: Building a Type-Safe Configurator with TypeScript | https://martinferret.dev/talks/pizzeria-del-compilator/ | /og/talks--pizzeria-del-compilator.png | Article+BreadcrumbList | 3 |
| /talks/the-dom-is-lying-to-your-types/ | The DOM Is Lying to Your Types \| Martin Ferret | Every TypeScript project trusts lib.dom.d.ts, but it isn't written by hand: a generator turns web specifications into types, and that translation is... | The DOM Is Lying to Your Types | https://martinferret.dev/talks/the-dom-is-lying-to-your-types/ | /og/talks--the-dom-is-lying-to-your-types.png | Article+BreadcrumbList | 2 |
| /talks/what-typescript-7-really-changes-for-angular-teams/ | What TypeScript 7 Really Changes for Angular Teams | Martin Ferret is a guest on the Angular Master Podcast for this episode, planned for December 2026. The episode is not published | What TypeScript 7 Really Changes for Angular Teams | https://martinferret.dev/talks/what-typescript-7-really-changes-for-angular-teams/ | /og/talks--what-typescript-7-really-changes-for-angular-teams.png | Article+BreadcrumbList | 2 |
| /talks/your-ai-agent-is-slowing-down-your-compiler/ | Your AI Agent Is Slowing Down Your Compiler \| Martin Ferret | Typed AI agents are everywhere: tools described with schemas, structured outputs inferred into TypeScript types, SDKs built on deeply generic APIs.... | Your AI Agent Is Slowing Down Your Compiler | https://martinferret.dev/talks/your-ai-agent-is-slowing-down-your-compiler/ | /og/talks--your-ai-agent-is-slowing-down-your-compiler.png | Article+BreadcrumbList | 2 |
| /talks/your-types-have-a-performance-budget/ | Your Types Have a Performance Budget \| Martin Ferret | A one-line type change can multiply type-checking cost by ten without breaking a test: real projects shipped 23 times more instantiations and CI jobs... | Your Types Have a Performance Budget. You're Just Not Measuring It. | https://martinferret.dev/talks/your-types-have-a-performance-budget/ | /og/talks--your-types-have-a-performance-budget.png | Article+BreadcrumbList | 2 |
| /timeline/ | Timeline of Contributions and Talks \| Martin Ferret | Martin Ferret's open source contributions, talks and Lab experiments, by date, each with its source and status. | Timeline | https://martinferret.dev/timeline/ | /og/timeline.png | BreadcrumbList | 19 |
| /track-record/ | redirect |  |  | https://martinferret.dev/timeline/ |  | (none) | 0 |
| /work/ | Open Source TypeScript Contributions \| Martin Ferret | Pull requests to Microsoft's TypeScript repositories, issue analyses and answers by Martin Ferret, each with its source and live GitHub status. | Open source work | https://martinferret.dev/work/ | /og/work.png | BreadcrumbList | 19 |
| /writing/ | Articles on JavaScript and TypeScript \| Martin Ferret | Articles by Martin Ferret on JavaScript and TypeScript: 30 published on the Certificates.dev blog, each linked to the original. | Writing | https://martinferret.dev/writing/ | /og/writing.png | BreadcrumbList | 18 |

What changed on the personal site:
- New pages: `/hire/`, `/meetup/`, five `/talks/<slug>/` pages, `/podcasts/devpreneur/`. `/writing/` now lists the Certificates.dev articles instead of redirecting home.
- Every indexable page has its own title (under 60 characters), its own description (under 155), one H1, one canonical on `https://martinferret.dev` with a trailing slash (query strings such as `/work/?status=merged` canonicalize to `/work/`), its own 1200x630 Open Graph image, `og:url` and a Twitter card. Checked by `tests/seo.test.mjs`.
- Structured data: `Person` and `WebSite` on home, `Person` on About and Invite me, `ProfessionalService` on `/hire/`, `Event` on `/meetup/`, `PodcastSeries` and `PodcastEpisode` on the podcast page, `Article` on every talk and Lab page, `BreadcrumbList` everywhere except home. 0 errors and 0 warnings on validator.schema.org.
- The 404 page is `noindex` and has no canonical.
- `sitemap-index.xml`, `sitemap-site.xml` (real `lastmod` per page), `robots.txt`, `CNAME`, `llms.txt` and `llms-full.txt` are generated at build from the one site URL.
- Old paths `/open-source/` and `/track-record/` still redirect.

### TypeScript Performance Lab (`docs/`, static pages)

| Path | Title | Meta description | H1 | Canonical | OG image | JSON-LD | Inbound |
|---|---|---|---|---|---|---|---|
| /typescript-performance-lab/ | TypeScript Performance Lab: measured, not guessed | Reproducible experiments on how fast TypeScript checks your types: TypeScript 6 vs 7, memory and slow type patterns, with raw results. | Measured, not guessed. | https://martinferret.dev/typescript-performance-lab/ | /typescript-performance-lab/og/home.png | CollectionPage+BreadcrumbList | 3 |
| /typescript-performance-lab/experiments/001-typed-events/ | Lab #001 raw results: Typed events | Lab #001. Does a mapped type with an as clause, indexed at every call site, make type-checking measurably slower than inferring the event name from a... | Typed events: the elegant type that slowed down every call site | https://martinferret.dev/typescript-performance-lab/experiments/001-typed-events/ | /typescript-performance-lab/og/lab-001.png | Article+BreadcrumbList | 3 |
| /typescript-performance-lab/experiments/002-ts6-vs-ts7-type-fest/ | Lab #002 raw results: TypeScript 6 vs 7 on type-fest | Lab #002. How much faster does TypeScript 7 type-check a real, type-heavy library than TypeScript 6, and how much of the gain comes from the native... | TypeScript 6 vs 7 on type-fest | https://martinferret.dev/typescript-performance-lab/experiments/002-ts6-vs-ts7-type-fest/ | /typescript-performance-lab/og/lab-002.png | Article+BreadcrumbList | 3 |
| /typescript-performance-lab/method/ | Method: how the TypeScript Performance Lab measures | How every Lab experiment is measured: pinned versions, warm-up, interleaved runs, medians with spread, peak memory and type-safety checks. | Method | https://martinferret.dev/typescript-performance-lab/method/ | /typescript-performance-lab/og/method.png | BreadcrumbList | 3 |

What changed on the Lab:
- `tools/build-index.mjs` writes a complete HTML page per URL: the overview, one page per experiment and the method. Question, verdict, numbers and tables are in the raw HTML; JavaScript only adds interactions (copy, machine switcher, animations).
- Hash URLs (`#001`, `#002`, `#method`) redirect in the browser to the new paths.
- Each page has a canonical and `og:url` on `https://martinferret.dev/typescript-performance-lab/`, its own Open Graph image, `Article` (experiments) or `CollectionPage` (overview) and `BreadcrumbList` structured data, and a link back to the personal site.
- `docs/sitemap.xml` lists the four pages and is referenced from the personal site's `sitemap-index.xml`.
- Inbound counts only links inside the Lab. The personal site also links to every Lab page (`/lab/`, both experiment pages).

### Hard-coded domains (after)

- Personal site: none. The domain comes from `site` in `astro.config.mjs` (`SITE_URL`, default `https://martinferret.dev`), and `CNAME` is generated from it.
- Lab: none. The base URL comes from `LAB_URL` in `tools/notebook/pages.mjs` (default `https://martinferret.dev/typescript-performance-lab/`). The two experiment READMEs link to their pages on `martinferret.dev`.
- Links to GitHub repositories (`github.com/MartinFerret/...`) are unchanged, as intended.

## Screenshots

Full-page captures, desktop (1440 px wide) and mobile (390 px wide), in `review/seo-pass/` (ignored by git):
- `review/seo-pass/before/`: every page of the site before this pass, and the Lab notebook (`labsite-home-*`, one page, client-rendered).
- `review/seo-pass/after/`: every page of the site after this pass, the new pages included, and the four static Lab pages (`typescript-performance-lab*`).
