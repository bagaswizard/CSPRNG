export interface RSAKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string; // Exported for display/sharing
  id: string;
  createdAt: number;
}

export interface SignedDocument {
  id: string;
  fileName: string;
  fileHash: string; // SHA-256 of original file
  salt: string; // Hex string from CSPRNG
  signature: string; // Hex string of the signature
  timestamp: number;
  publicKeyFingerprint: string; // Short ID of key used
}

export enum AppStep {
  ENTROPY = 'ENTROPY',
  KEYS = 'KEYS',
  SIGN = 'SIGN',
  VERIFY = 'VERIFY',
}

export interface EntropyData {
  timestamp: number;
  value: number;
}