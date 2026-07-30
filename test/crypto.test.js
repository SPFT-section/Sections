const test = require('node:test');
const assert = require('node:assert/strict');

// src/utils/crypto.js is plain ESM using the global Web Crypto API (no
// React, no bundler-only syntax), so we can import and exercise the real
// module directly with Node's native test runner via dynamic import.
let cryptoUtils;

test.before(async () => {
  cryptoUtils = await import('../src/utils/crypto.js');
});

test('hashValue produces a hash and salt of expected shape', async () => {
  const { hash, salt } = await cryptoUtils.hashValue('correct-horse-battery-staple');
  assert.equal(typeof hash, 'string');
  assert.equal(typeof salt, 'string');
  assert.match(hash, /^[0-9a-f]+$/);
  assert.match(salt, /^[0-9a-f]+$/);
});

test('verifyValue accepts the correct password', async () => {
  const { hash, salt } = await cryptoUtils.hashValue('my-secret-password');
  const ok = await cryptoUtils.verifyValue('my-secret-password', hash, salt);
  assert.equal(ok, true);
});

test('verifyValue rejects an incorrect password', async () => {
  const { hash, salt } = await cryptoUtils.hashValue('my-secret-password');
  const ok = await cryptoUtils.verifyValue('wrong-password', hash, salt);
  assert.equal(ok, false);
});

test('verifyValue is false when hash/salt are missing', async () => {
  assert.equal(await cryptoUtils.verifyValue('anything', null, null), false);
  assert.equal(await cryptoUtils.verifyValue('anything', 'abc', undefined), false);
});

test('two hashes of the same password use different salts', async () => {
  const a = await cryptoUtils.hashValue('same-password');
  const b = await cryptoUtils.hashValue('same-password');
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
});

test('generateSalt returns unique hex strings', () => {
  const s1 = cryptoUtils.generateSalt();
  const s2 = cryptoUtils.generateSalt();
  assert.notEqual(s1, s2);
  assert.match(s1, /^[0-9a-f]{32}$/); // 16 bytes -> 32 hex chars
});

test('generateRandomCode returns a code of the requested length', () => {
  const code = cryptoUtils.generateRandomCode(10);
  assert.equal(code.length, 10);
  assert.match(code, /^[A-Z0-9]+$/);
});
