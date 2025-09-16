// utils/sanitize.ts

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

/**
 * Strip HTML and truncate to a word count.
 * @param html HTML string
 * @param wordCount Number of words to keep (default 25)
 */
export function getSnippet(html: string, wordCount: number = 16): string {
  const plainText = stripHtml(html);
  const words = plainText.split(/\s+/);
  let snippet = words.slice(0, wordCount).join(' ');
  if (words.length > wordCount) snippet += '...';
  return snippet;
}
