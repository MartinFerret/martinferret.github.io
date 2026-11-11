/** Reading time in minutes at 230 words per minute, at least 1. */
export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 230));
