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

const bold = (text: string) => text.replace(BOLD, "<strong>$1</strong>");

/**
 * Links are found first; bold is then applied only to the text between them and to link labels,
 * never to an href.
 */
export function renderInline(text: string): string {
  const escaped = escapeHtml(text);
  let out = "";
  let last = 0;
  for (const match of escaped.matchAll(LINK)) {
    const [whole, label = "", href = ""] = match;
    out += bold(escaped.slice(last, match.index));
    out += `<a href="${href}">${bold(label)}</a>`;
    last = match.index + whole.length;
  }
  return out + bold(escaped.slice(last));
}
