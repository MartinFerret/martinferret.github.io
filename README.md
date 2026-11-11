# martinferret.github.io

Astro site, light theme. Design tokens in `src/styles/tokens.css`, the shared UI kit (spacing system, panels, buttons,
cards, charts layout) in `src/styles/kit.css`, base styles in `src/styles/global.css`.

```bash
npm install
npm run dev       # drafts visible
npm run build     # statuses refreshed from the GitHub API (set GITHUB_TOKEN to avoid rate limits, OFFLINE=1 to skip)
npm run preview
```

## Where the content lives
- `src/data/contributions.ts`: open source PRs (projects you don't own). Status is refreshed from GitHub at build.
- `src/data/events.ts`: talks, podcasts, milestones. Future-dated entries show in the "Next up" band.
- `src/data/lab.json`: copy of `typescript-performance-lab/docs/data.json`. Refresh with
  `cp ../typescript-performance-lab/docs/data.json src/data/lab.json`.
- `src/content/writing/*.md`: articles (`draft: true` = dev only).
- `src/data/site.ts`: identity, links, `labRepo` and `contactEmail` (both TODO).

## Pages
Home, Work (`/work/`, was `/open-source/`), Lab, Speaking, Invite me (`/speak/`, for organizers), Writing, About,
Timeline (`/timeline/`, was `/track-record/`, linked from About and the footer). Old URLs redirect (Astro redirect pages,
plus `public/_redirects` for a real 301 on hosts that read it). Cmd+K / Ctrl+K or `/` opens the site search; its index is `/search.json`, built from the same data.

## Exports
`/timeline.json` is built from the same data as the pages. A CSV of the same rows is a local developer tool only:
`/dev/timeline.csv` while `npm run dev` runs; it is never built for production.

## Writing
Local articles live in `src/content/writing/` (`draft: true` = dev only). Medium articles appear only when their URL is
listed in `src/data/writing.ts` (`featuredMedium`, empty by default).

## Sharing previews
Each page gets a 1200x630 Open Graph image generated at build (`src/pages/og/[...slug].png.ts`).

## Tests
`npm test` builds the site, then checks `dist/`: Home, Work, Timeline and JSON show identical numbers; the
activity strip matches the ledger; the nav has at most five items; every PR is searchable by number; "Paris" only as a
time zone; no old meetup name, no placeholder photo, no em or en dashes; PR #2578 is "Part of" #2566.
`npm run test:only` skips the build.

## Single source of numbers
`src/lib/record.ts` builds the ledger. Metrics, activity strip, exports and every page read it. Do not count anywhere else.
