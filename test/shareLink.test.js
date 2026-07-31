const test = require('node:test');
const assert = require('node:assert/strict');

let shareLink;

test.before(async () => {
  // shareLink.js reads window.location to build an absolute URL. Node has
  // no `window`, so provide the minimal stub it actually touches — this
  // mirrors a GitHub Pages project deployment at a sub-path.
  global.window = {
    location: { origin: 'https://spft-section.github.io', pathname: '/Sections/library' },
  };
  shareLink = await import('../src/utils/shareLink.js');
});

const sampleNovel = {
  id: 'novel-1',
  title: 'เรื่องทดสอบ',
  author: 'ผู้เขียน',
  synopsis: 'เรื่องย่อ',
  coverImage: '',
  genre: ['Fantasy'],
  chapters: [{ title: 'ตอนที่ 1', content: 'เนื้อหา\nบรรทัดสอง', order: 1 }],
};

test('createShareLink + decodeShareHash round-trips the novel', () => {
  const link = shareLink.createShareLink(sampleNovel, 'ผู้แชร์');
  assert.ok(link.startsWith('https://spft-section.github.io/Sections/import#d='));

  const hash = link.split('#')[1];
  const decoded = shareLink.decodeShareHash(`#${hash}`);

  assert.ok(decoded);
  assert.equal(decoded.sourceId, sampleNovel.id);
  assert.equal(decoded.sharedBy, 'ผู้แชร์');
  assert.equal(decoded.novel.title, sampleNovel.title);
  assert.equal(decoded.novel.chapters.length, 1);
  assert.equal(decoded.novel.chapters[0].content, 'เนื้อหา\nบรรทัดสอง');
});

test('decodeShareHash returns null for missing/empty input', () => {
  assert.equal(shareLink.decodeShareHash(''), null);
  assert.equal(shareLink.decodeShareHash(null), null);
  assert.equal(shareLink.decodeShareHash('#'), null);
});

test('decodeShareHash returns null for garbage that is not a valid payload', () => {
  assert.equal(shareLink.decodeShareHash('#d=not-real-compressed-data'), null);
});

test('decodeShareHash rejects a payload with no version field', () => {
  const fakeEncoded = require('lz-string').compressToEncodedURIComponent(
    JSON.stringify({ novel: { title: 'x' } }) // missing v
  );
  assert.equal(shareLink.decodeShareHash(`#d=${fakeEncoded}`), null);
});
