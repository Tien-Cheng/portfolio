/**
 * Renders the tiny subset of Markdown that résumé bullets use: `[text](https://…)` links and
 * `**bold**`. Everything is HTML-escaped first, so the output is safe for `set:html`.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

// Runs on escaped text, so the URL cannot contain a raw quote or angle bracket.
const LINK = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
const BOLD = /\*\*(.+?)\*\*/g;

export function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(LINK, (_, label: string, href: string) => `<a href="${href}">${label}</a>`)
    .replace(BOLD, "<strong>$1</strong>");
}
