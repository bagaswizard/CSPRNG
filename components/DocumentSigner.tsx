import React, { useState } from 'react';
import { RSAKeyPair, SignedDocument } from '../types';
import { hashFile, signDocumentHash } from '../services/rsaService';
import { generateSalt } from '../services/csprngService';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  keys: RSAKeyPair[];
}

const DocumentSigner: React.FC<Props> = ({ keys }) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string>(keys[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [signedDoc, setSignedDoc] = useState<SignedDocument | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSignedDoc(null);
    }
  };

  const handleSign = async () => {
    if (!file || !selectedKeyId) return;
    
    setIsSigning(true);
    try {
        const keyPair = keys.find(k => k.id === selectedKeyId);
        if (!keyPair) throw new Error("Key not found");

        // 1. Hash File
        const fileHash = await hashFile(file);
        
        // 2. Generate CSPRNG Salt (Nonce)
        const salt = generateSalt();

        // 3. Sign (Hash + Salt)
        const signature = await signDocumentHash(keyPair.privateKey, fileHash, salt);

        const doc: SignedDocument = {
            id: window.crypto.randomUUID(),
            fileName: file.name,
            fileHash,
            salt,
            signature,
            timestamp: Date.now(),
            publicKeyFingerprint: keyPair.id
        };

        setSignedDoc(doc);
    } catch (err) {
        console.error("Signing failed", err);
        alert("Signing failed. See console.");
    } finally {
        setIsSigning(false);
    }
  };

  // Prepare QR Data: Minimal JSON to fit in QR
  // We include Hash, Salt, and Signature. The verifier needs the original file to re-hash.
  const qrData = signedDoc ? JSON.stringify({
      h: signedDoc.fileHash.substring(0, 16) + '...', // Truncated visually in QR content? No, needs full data for verify.
      // Full signature is too big for standard QR often.
      // For this demo, we will encode a structured string: 
      // V1|Salt|Signature(truncated for visual, usually you'd verify against a DB or full sig)
      // Actually, let's put the essential verification data.
      // If the signature is 256 bytes (hex = 512 chars), it fits in a QR.
      // Format: HASH|SALT|SIG
      d: `${signedDoc.fileHash}|${signedDoc.salt}|${signedDoc.signature}`
  }) : '';

  if (keys.length === 0) {
      return (
          <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-xl border border-slate-700 text-center text-slate-400">
              Please generate a key pair first.
          </div>
      )
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-brand-400">03.</span> Sign Document
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Select Signing Key</label>
                    <select 
                        value={selectedKeyId}
                        onChange={(e) => setSelectedKeyId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                        {keys.map(k => (
                            <option key={k.id} value={k.id}>ID: {k.id} (Created: {new Date(k.createdAt).toLocaleDateString()})</option>
                        ))}
                    </select>
                </div>

                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
                    <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <span className="text-brand-400 font-medium">{file ? file.name : "Choose a file to sign"}</span>
                        <span className="text-xs text-slate-500 mt-1">{file ? `${(file.size / 1024).toFixed(2)} KB` : "Supports any file type"}</span>
                    </label>
                </div>

                <button 
                    onClick={handleSign}
                    disabled={!file || isSigning}
                    className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-brand-900/50 transition-all"
                >
                    {isSigning ? 'Signing...' : 'Cryptographically Sign Document'}
                </button>
            </div>
        </div>

        {/* Right: Output */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
             {!signedDoc ? (
                 <div className="text-center text-slate-600">
                     <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                     <p>Signed artifact will appear here</p>
                 </div>
             ) : (
                 <div className="w-full space-y-4 animate-fade-in">
                     <div className="bg-white p-4 rounded-lg mx-auto w-fit shadow-2xl">
                         {/* QR Code contains raw string: HASH|SALT|SIG */}
                         <QRCodeSVG value={`${signedDoc.fileHash}|${signedDoc.salt}|${signedDoc.signature}`} size={200} level="L" />
                     </div>
                     
                     <div className="space-y-2 text-xs font-mono">
                         <div className="bg-slate-800 p-2 rounded border border-slate-700">
                             <span className="text-slate-500 block mb-1">Document Hash (SHA-256)</span>
                             <span className="text-green-400 break-all">{signedDoc.fileHash}</span>
                         </div>
                         <div className="bg-slate-800 p-2 rounded border border-slate-700">
                             <span className="text-slate-500 block mb-1">CSPRNG Salt (Unique Nonce)</span>
                             <span className="text-purple-400 break-all">{signedDoc.salt}</span>
                         </div>
                         <div className="bg-slate-800 p-2 rounded border border-slate-700">
                             <span className="text-slate-500 block mb-1">Digital Signature (RSA-PSS)</span>
                             <span className="text-brand-400 break-all line-clamp-2">{signedDoc.signature}</span>
                         </div>
                     </div>
                     <div className="text-center">
                        <p className="text-xs text-slate-500">Scan QR to Verify</p>
                     </div>
                 </div>
             )}
        </div>
    </div>
  );
};

export default DocumentSigner;