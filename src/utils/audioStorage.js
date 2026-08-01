// IndexedDB-backed storage for uploaded chapter-music audio files.
//
// Audio files (unlike cover images) are routinely several MB each, and
// localStorage's ~5-10MB per-origin quota is shared with every novel's
// text content. Storing audio blobs there the way cover images are stored
// (base64 in localStorage, see utils/image.js) would blow the quota after
// a single song. IndexedDB has no comparable size ceiling and can store
// Blobs natively (no base64 inflation), so uploaded audio lives here.
// localStorage (via the novel/chapter data) only ever holds a small
// reference id pointing into this database, never the audio bytes
// themselves.

const DB_NAME = 'section-audio-store';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

let dbPromise = null;

const openDb = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open audio database'));
  });

  return dbPromise;
};

/**
 * Store an audio File/Blob under the given id, replacing any existing
 * entry with that id. Returns the id on success.
 */
export const saveAudioFile = async (id, file) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id,
      blob: file,
      name: file.name || 'audio',
      type: file.type || 'audio/mpeg',
      size: file.size || 0,
      savedAt: Date.now(),
    });
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error || new Error('Could not save audio file'));
  });
};

/**
 * Retrieve a stored audio record ({ id, blob, name, type, size }) or null.
 */
export const getAudioFile = async (id) => {
  if (!id) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error('Could not read audio file'));
  });
};

/**
 * Build a temporary object URL for a stored audio file, for use in an
 * <audio> element's src. Caller is responsible for revoking it
 * (URL.revokeObjectURL) when no longer needed, e.g. on unmount or when
 * swapping tracks.
 */
export const getAudioObjectUrl = async (id) => {
  const record = await getAudioFile(id);
  if (!record?.blob) return null;
  return URL.createObjectURL(record.blob);
};

/**
 * Delete a stored audio file by id. Safe to call even if it doesn't exist.
 */
export const deleteAudioFile = async (id) => {
  if (!id) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Could not delete audio file'));
  });
};

/**
 * Validate an uploaded audio file before storing it.
 */
export const validateAudioFile = (file, maxSizeMB = 25) => {
  if (!file) return 'ไม่ได้เลือกไฟล์';
  if (!file.type.startsWith('audio/')) return 'ไฟล์ต้องเป็นไฟล์เสียงเท่านั้น';
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `ไฟล์เสียงต้องมีขนาดไม่เกิน ${maxSizeMB}MB`;
  }
  return null;
};

export default {
  saveAudioFile,
  getAudioFile,
  getAudioObjectUrl,
  deleteAudioFile,
  validateAudioFile,
};
