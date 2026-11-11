// Martin's articles on the Certificates.dev blog. They belong to Certificates.dev: this site lists and links them,
// it never copies them. Data: src/data/certificates-articles.json (source and check date inside).
import data from '../data/certificates-articles.json';

export interface CertArticle { title: string; date: string; summary: string; url: string; typescript: boolean }

/** TypeScript articles first, then newest first. */
export const certificatesArticles: CertArticle[] = (data.articles as CertArticle[])
  .slice()
  .sort((a, b) => Number(b.typescript) - Number(a.typescript) || b.date.localeCompare(a.date));

export const certificatesSource = data.source as string;
export const certificatesCheckedOn = data.checkedOn as string;
