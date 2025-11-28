import { RSAKeyPair } from '../types';
import { bufferToHex, hexToBuffer } from './csprngService';

const KEY_ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

const EXPORT_FORMAT = 'spki'; // Subject Public Key Info for public key

export const generateRSAKeyPair = async (): Promise<RSAKeyPair> => {
  const keyPair = await window.crypto.subtle.generateKey(
    KEY_ALGORITHM,
    true, // extractable
    ['sign', 'verify']
  );

  // Export public key to PEM format for display/sharing
  const exported = await window.crypto.subtle.exportKey(EXPORT_FORMAT, keyPair.publicKey);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = window.btoa(exportedAsString);
  const pem = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyPem: pem,
    id: window.crypto.randomUUID().slice(0, 8),
    createdAt: Date.now(),
  };
};

export const hashFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
};

export const signDocumentHash = async (
  privateKey: CryptoKey,
  fileHash: string,
  salt: string
): Promise<string> => {
  const encoder = new TextEncoder();
  // We sign the combination of the File Hash + Salt (Nonce)
  // This prevents replay attacks or identical signatures for identical files if salt varies
  const dataToSign = encoder.encode(fileHash + salt);
  
  const signatureBuffer = await window.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    dataToSign
  );

  return bufferToHex(signatureBuffer);
};

export const importPublicKey = async (pem: string): Promise<CryptoKey> => {
  // Strip headers and newlines
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  
  const binaryDerString = window.atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    EXPORT_FORMAT,
    binaryDer.buffer,
    KEY_ALGORITHM,
    true,
    ['verify']
  );
};

export const verifySignature = async (
  publicKey: CryptoKey,
  signatureHex: string,
  fileHash: string,
  salt: string
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const dataToVerify = encoder.encode(fileHash + salt);
  const signatureBuffer = hexToBuffer(signatureHex);

  return await window.crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signatureBuffer,
    dataToVerify
  );
};