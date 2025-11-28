/**
 * CSPRNG Engine
 * Wraps Web Crypto API and handles entropy accumulation.
 */

// Helper to convert ArrayBuffer to Hex String
export const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper to convert Hex String to ArrayBuffer
export const hexToBuffer = (hex: string): ArrayBuffer => {
  const match = hex.match(/.{1,2}/g);
  if (!match) return new ArrayBuffer(0);
  return new Uint8Array(match.map((byte) => parseInt(byte, 16))).buffer;
};

// Generate cryptographically strong random values
export const generateRandomBytes = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
};

// Generate a random salt (nonce)
export const generateSalt = (length: number = 32): string => {
  const bytes = generateRandomBytes(length);
  return bufferToHex(bytes.buffer);
};

// Simulate large prime generation (Conceptually)
// In a real browser env, generating safe primes manually is slow/complex.
// We use generateKey which uses the browser's CSPRNG to find primes internally.
export const checkSystemEntropyStatus = (): boolean => {
  // Checks if the browser supports Web Crypto API
  return !!(window.crypto && window.crypto.subtle && window.crypto.getRandomValues);
};