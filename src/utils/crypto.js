// Password hashing utilities built on the browser's native Web Crypto API.
// Uses PBKDF2 with a random salt per password — nothing is ever stored
// or transmitted in plain text, only the derived hash + salt.
//
// NOTE: This app is local-first (no server). "Accounts" here are stored
// in this browser's localStorage only. They are a convenience/identity
// layer, not a security boundary against someone with access to this
// device — that matches the rest of the app's storage model.

const PBKDF2_ITERATIONS = 100000;
const HASH_ALGORITHM = 'SHA-256';
const KEY_LENGTH_BITS = 256;

const textEncoder = new TextEncoder();

const bufferToHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hexToBuffer = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

// Generate a random salt as a hex string.
export const generateSalt = (byteLength = 16) => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
};

// Derive a PBKDF2 hash (hex string) for a given plaintext + salt.
export const deriveHash = async (plainText, saltHex) => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(plainText),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBuffer(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH_BITS
  );

  return bufferToHex(derivedBits);
};

// Hash a fresh plaintext value, generating a new salt. Returns { hash, salt }.
export const hashValue = async (plainText) => {
  const salt = generateSalt();
  const hash = await deriveHash(plainText, salt);
  return { hash, salt };
};

// Verify a plaintext value against a previously stored hash + salt.
export const verifyValue = async (plainText, hash, salt) => {
  if (!hash || !salt) return false;
  const candidate = await deriveHash(plainText, salt);
  return candidate === hash;
};

// Generate a short, human-typeable random code (for future use, e.g. recovery codes).
export const generateRandomCode = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};
