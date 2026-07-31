const test = require('node:test');
const assert = require('node:assert/strict');

let sortHelpers;

test.before(async () => {
  sortHelpers = await import('../src/utils/sortHelpers.js');
});

test('sorts numeric fields numerically, not lexically', () => {
  // Regression guard: comparing as strings would put 9 after 10 and 30
  // (since '10' < '9' < '30' lexically) — a real bug for updatedAt
  // timestamps, which are exactly this kind of large number.
  const items = [{ n: 9 }, { n: 30 }, { n: 10 }];
  const asc = sortHelpers.sortByField(items, 'n', 'asc').map((i) => i.n);
  assert.deepEqual(asc, [9, 10, 30]);
});

test('sorts descending by default', () => {
  const items = [{ updatedAt: 100 }, { updatedAt: 300 }, { updatedAt: 200 }];
  const result = sortHelpers.sortByField(items).map((i) => i.updatedAt);
  assert.deepEqual(result, [300, 200, 100]);
});

test('sorts string fields with locale comparison', () => {
  // Thai alphabetical order is ก, ค, บ (not code-point order).
  const items = [{ title: 'บ' }, { title: 'ก' }, { title: 'ค' }];
  const result = sortHelpers.sortByField(items, 'title', 'asc').map((i) => i.title);
  assert.deepEqual(result, ['ก', 'ค', 'บ']);
});

test('treats missing values as empty rather than throwing', () => {
  const items = [{ title: 'b' }, {}, { title: 'a' }];
  assert.doesNotThrow(() => sortHelpers.sortByField(items, 'title', 'asc'));
});

test('does not mutate the input array', () => {
  const items = [{ n: 2 }, { n: 1 }];
  const original = [...items];
  sortHelpers.sortByField(items, 'n', 'asc');
  assert.deepEqual(items, original);
});
