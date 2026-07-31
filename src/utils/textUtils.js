// Plain-text helpers for turning stored chapter content into paragraphs.
//
// IMPORTANT: this deliberately returns an array of plain strings, never an
// HTML string. Chapter content can come from two places — the user's own
// editor, or a share link decoded from a URL fragment (see shareLink.js) —
// and a share link can be crafted by anyone, not just the person who wrote
// it. Earlier versions of the reader built raw `<p>${line}</p>` HTML and
// rendered it via dangerouslySetInnerHTML, which meant a chapter body
// containing e.g. `<img src=x onerror=...>` would execute as real HTML/JS
// in the reader's browser (stored XSS via /import). Rendering paragraphs
// as React children instead lets React escape the text for us, with no
// loss of functionality — the content was always meant to be plain text
// split on newlines, never markup.
export const splitIntoParagraphs = (content) =>
  (content || '')
    .split('\n')
    .filter((line) => line.trim());
