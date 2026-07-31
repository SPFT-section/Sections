import LZString from 'lz-string';

// SECTiON is local-first: there's no server to host a "read this novel"
// endpoint. Instead, a share link carries the whole novel — compressed —
// inside the URL's hash fragment (#d=...). The fragment never leaves the
// browser (it isn't sent to the server on request), survives the GitHub
// Pages 404.html SPA-redirect trick unchanged (see public/404.html and
// public/index.html), and isn't subject to the "+  becomes space" decoding
// quirk that URLSearchParams applies to query strings — because we parse
// it ourselves rather than through the query-string APIs.
const SHARE_VERSION = 1;

// Strip fields that only make sense on the *sharing* device (local ids
// aren't reused; the read-only copy gets fresh ones on import) and keep
// the payload as small as possible.
const buildPayload = (novel, sharedByName) => ({
  v: SHARE_VERSION,
  sourceId: novel.id,
  sharedBy: sharedByName || novel.author || 'Anonymous',
  novel: {
    title: novel.title,
    author: novel.author,
    synopsis: novel.synopsis,
    coverImage: novel.coverImage,
    genre: novel.genre,
    chapters: (novel.chapters || []).map((c) => ({
      title: c.title,
      content: c.content,
      order: c.order,
    })),
  },
});

/**
 * Build a shareable, read-only link for a novel.
 * @returns {string} an absolute URL the recipient can open to import the novel
 */
export const createShareLink = (novel, sharedByName) => {
  const payload = buildPayload(novel, sharedByName);
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));

  const { origin, pathname } = window.location;
  // pathname already includes the deployment sub-path (e.g. /Sections/);
  // keep everything up to and including the trailing slash, then append
  // the "import" route.
  const base = pathname.endsWith('/') ? pathname : pathname.replace(/[^/]*$/, '');
  return `${origin}${base}import#d=${compressed}`;
};

/**
 * Decode a share payload from a raw hash string (e.g. "#d=...", or the
 * value already stripped of "#d=").
 * @returns {{sourceId:string, sharedBy:string, novel:object}|null}
 */
export const decodeShareHash = (rawHash) => {
  if (!rawHash) return null;
  const cleaned = rawHash.replace(/^#/, '');
  const match = cleaned.match(/(?:^|&)d=([^&]+)/);
  const encoded = match ? match[1] : null;
  if (!encoded) return null;

  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload = JSON.parse(json);
    if (!payload || payload.v !== SHARE_VERSION || !payload.novel) return null;
    return payload;
  } catch {
    return null;
  }
};

export default { createShareLink, decodeShareHash };
