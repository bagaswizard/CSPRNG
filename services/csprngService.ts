/**
 * CSPRNG Engine
 * Wraps Web Crypto API and handles entropy accumulation.
 */

let entropyPool: number[] = [];
const POOL_SIZE = 2048; // Store up to 2048 numbers
let poolIndex = 0;

/**
 * Adds entropy to the pool from various sources like mouse movement.
 * @param data - A series of numbers to be added to the entropy pool.
 */
export const addEntropy = (...data: number[]) => {
  // Simple mixing: just append and cap size. A real-world implementation
  // might use a more complex mixing function.
  entropyPool = [...entropyPool, ...data];
  if (entropyPool.length > POOL_SIZE) {
    entropyPool = entropyPool.slice(entropyPool.length - POOL_SIZE);
  }
};

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

// Generate cryptographically strong random values, stirred with user entropy
export const generateRandomBytes = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array); // Get cryptographically strong random values

  // If we have entropy, mix it in.
  // This is a simple XOR mixing function. It's not perfect, but it demonstrates
  // the principle of mixing entropy sources.
  if (entropyPool.length > 0) {
    for (let i = 0; i < length; i++) {
      // Cycle through the entropy pool
      poolIndex = (poolIndex + 1) % entropyPool.length;
      // XOR the byte with an entropy value
      array[i] = array[i] ^ (entropyPool[poolIndex] & 0xff);
    }
  }

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