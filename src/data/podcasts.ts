// Podcasts Martin hosts or co-hosts. Every field comes from the show's public Spotify page
// (https://open.spotify.com/show/3pyyu2nY7TuCSHr2L982HA), read on 2026-11-11. Leave a field out rather than guess.

export interface PodcastEpisode {
  title: string;
  url: string;
  date?: string; // ISO date, only when shown on the page
}

export interface HostedPodcast {
  slug: string;
  name: string;
  url: string; // public Spotify show page
  role: string;
  cohost: { name: string; url: string };
  language: 'French' | 'English';
  inLanguage: string; // BCP 47, for structured data
  status: 'active' | 'past';
  /** One factual sentence, in English, for this site. */
  summary: string;
  /** The show's own description, verbatim, in its language. */
  description: string;
  episodes: PodcastEpisode[];
}

export const podcasts: HostedPodcast[] = [
  {
    slug: 'devpreneur',
    name: 'Devpreneur',
    url: 'https://open.spotify.com/show/3pyyu2nY7TuCSHr2L982HA',
    role: 'Co-host, with Alain Chautard',
    cohost: { name: 'Alain Chautard', url: 'https://www.angulartraining.com/' },
    language: 'French',
    inLanguage: 'fr',
    // The page shows no years, so recency cannot be established: kept as 'past', the default asked for.
    status: 'past',
    summary: 'A French-language podcast about entrepreneurship for developers, co-hosted by Martin Ferret and Alain Chautard.',
    description:
      "Tu codes. Tu veux travailler pour toi. Par où tu commences ? Devpreneur, c'est le podcast des développeurs et pros de l'IT qui passent ou veulent passer en solo.",
    // The 6 episodes listed on the public show page on 2026-11-11, in its order (newest first; the last one is
    // introduced as the first episode). Spotify shows a day and month but no year, so no date is recorded.
    episodes: [
      { title: 'Taux horaire, journalier ou forfait : lequel vous rapporte vraiment plus ?', url: 'https://open.spotify.com/episode/266vMilkJqVh0Nr6BSbrEi' },
      { title: "Automatiser son business avec l'IA et l'intelligence collective d'un Mastermind", url: 'https://open.spotify.com/episode/6I92OtdbFypqQ04lOo4dMk' },
      { title: 'Portfolio freelance : comment convaincre des clients sans CV classique', url: 'https://open.spotify.com/episode/0czy2SEUPVCWA4bBnawHab' },
      { title: 'Pourquoi être un bon développeur ne suffit pas pour réussir en freelance', url: 'https://open.spotify.com/episode/3QccpIqpXp8s6ZsvMgHQaU' },
      { title: 'Positionnement freelance : les leviers pour arrêter de se battre sur le prix', url: 'https://open.spotify.com/episode/5EGlswGXbHENNWXXjJhSdC' },
      { title: 'Qui sommes nous ? Comment monétisons nous nos services ?', url: 'https://open.spotify.com/episode/7DIvC00XXzTUqTbPxfFV9j' },
    ],
  },
];
