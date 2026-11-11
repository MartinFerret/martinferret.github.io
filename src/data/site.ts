// Identity and links. Everything here is public.
export const site = {
  name: 'Martin Ferret',
  role: 'TypeScript expert, type-checking performance',
  bio: 'TypeScript expert focused on type-checking performance. Contributor to TypeScript’s DOM types. Lead Content Owner for the JavaScript and TypeScript certifications at Certificates.dev.',
  location: 'France, working remotely across Europe',
  country: 'FR',
  githubUser: 'MartinFerret',
  links: {
    github: 'https://github.com/MartinFerret',
    linkedin: 'https://linkedin.com/in/martin-ferret',
    x: 'https://x.com/FerretMartin1',
    medium: 'https://medium.com/@ferretmartin91',
    sessionize: 'https://sessionize.com/martin-ferret',
    // The repository keeps its original slug; only the meetup's display name changed.
    meetup: 'https://github.com/MartinFerret/rendez-vous-typescript',
  },
  meetup: {
    name: "What's up TypeScript France",
    callForTalks: 'https://tally.so/r/o9D2pN',
    // Attendee registration (Luma). Primary button wherever the meetup is shown.
    registration: 'https://luma.com/1lxnf7nd' as string | null,
    callForTalksCloses: '2026-12-15',
    codeOfConduct: 'https://github.com/MartinFerret/rendez-vous-typescript/blob/main/CODE_OF_CONDUCT.md',
  },
  mediumFeed: 'https://medium.com/feed/@ferretmartin91',
  // The public lab repository. Proof chips link to it.
  labRepo: 'https://github.com/MartinFerret/typescript-performance-lab' as string | null,
  contactEmail: 'mferret.pro@gmail.com',
  // Original portrait offered for download on /speak/. Replace with a larger original when available.
  photo: { src: '/martin-ferret.webp', width: 512, height: 512 },
};

export const socialLinks = [
  { label: 'GitHub', href: site.links.github },
  { label: 'LinkedIn', href: site.links.linkedin },
  { label: 'X', href: site.links.x },
  { label: 'Medium', href: site.links.medium },
  { label: 'Sessionize', href: site.links.sessionize },
  { label: site.meetup.name, href: site.links.meetup },
];

export const mailto = `mailto:${site.contactEmail}?subject=${encodeURIComponent('Speaking invitation')}`;
/** "Book an intro call" on /hire. */
export const hireMailto = `mailto:${site.contactEmail}?subject=${encodeURIComponent('TypeScript performance project')}`;

// Main navigation, at most six items. Timeline, Invite me and the meetup live in the footer and in page content.
export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/lab/', label: 'Lab' },
  { href: '/speaking/', label: 'Speaking' },
  { href: '/writing/', label: 'Writing' },
  { href: '/about/', label: 'About' },
  { href: '/hire/', label: 'Work with me' },
] as const;

// "Invite me to speak" buttons lead to the page for organizers, which has the email.
export const contactHref = '/speak/';

// Build date, injected once per build. Used for "Last updated" and "As of" labels.
export const buildDate = new Date();
