const test = require('node:test');
const assert = require('node:assert/strict');

let textUtils;

test.before(async () => {
  textUtils = await import('../src/utils/textUtils.js');
});

test('splits content into one entry per non-blank line', () => {
  const result = textUtils.splitIntoParagraphs('line one\nline two\n\nline three');
  assert.deepEqual(result, ['line one', 'line two', 'line three']);
});

test('drops blank and whitespace-only lines', () => {
  const result = textUtils.splitIntoParagraphs('a\n\n   \nb');
  assert.deepEqual(result, ['a', 'b']);
});

test('returns an empty array for empty/missing content', () => {
  assert.deepEqual(textUtils.splitIntoParagraphs(''), []);
  assert.deepEqual(textUtils.splitIntoParagraphs(undefined), []);
  assert.deepEqual(textUtils.splitIntoParagraphs(null), []);
});

test('never turns markup into HTML — it stays plain text data', () => {
  // Regression guard for the stored-XSS fix: this function must only ever
  // produce plain strings for React to render as text. If a chapter body
  // contains something that looks like a tag, it must survive as literal
  // text here — any HTML interpretation happens (or rather, no longer
  // happens) only at render time, where React now escapes it.
  const result = textUtils.splitIntoParagraphs('<img src=x onerror="alert(1)">');
  assert.deepEqual(result, ['<img src=x onerror="alert(1)">']);
});
