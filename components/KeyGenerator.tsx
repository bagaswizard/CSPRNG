import React, { useState } from 'react';
import { generateRSAKeyPair } from '../services/rsaService';
import { RSAKeyPair } from '../types';

interface Props {
  onKeyPairGenerated: (pair: RSAKeyPair) => void;
  existingKeys: RSAKeyPair[];
}

const KeyGenerator: React.FC<Props> = ({ onKeyPairGenerated, existingKeys }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        // Simulate a slight delay to show the "computation"
        await new Promise(r => setTimeout(r, 500)); 
        const pair = await generateRSAKeyPair();
        onKeyPairGenerated(pair);
    } catch (e) {
        console.error("Key gen failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-brand-400">02.</span> Key Management
                </h2>
                <p className="text-slate-400 text-sm mt-1">Generate 2048-bit RSA Key Pairs secured by browser CSPRNG.</p>
            </div>
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-brand-600 hover:bg-brand-500 text-white font-medium py-2 px-6 rounded-lg shadow-lg shadow-brand-900/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                    </>
                ) : (
                    <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                    Generate New Key Pair
                    </>
                )}
            </button>
          </div>

          {existingKeys.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                  <p className="text-slate-500">No keys generated yet. Create one to start signing documents.</p>
              </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {existingKeys.map((key) => (
                    <div key={key.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-slate-800 rounded-bl-lg text-xs font-mono text-slate-400 border-b border-l border-slate-700">
                            ID: {key.id}
                        </div>
                        <h3 className="text-brand-400 font-bold mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                            RSA-2048
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Created: {new Date(key.createdAt).toLocaleString()}
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Public Key (Safe to Share)</label>
                                <textarea 
                                    readOnly 
                                    value={key.publicKeyPem} 
                                    className="w-full h-20 bg-slate-800 text-xs text-slate-300 p-2 rounded border border-slate-700 font-mono resize-none focus:outline-none focus:border-brand-500"
                                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                                />
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Private Key</label>
                                    <button 
                                        onClick={() => setShowPrivateKey(showPrivateKey === key.id ? null : key.id)}
                                        className="text-[10px] text-brand-500 hover:text-brand-400"
                                    >
                                        {showPrivateKey === key.id ? 'Hide' : 'Show (Unsafe)'}
                                    </button>
                                </div>
                                {showPrivateKey === key.id ? (
                                    <div className="w-full bg-red-900/20 border border-red-500/30 text-red-200 text-xs p-2 rounded font-mono">
                                        Private Key is stored in memory via CryptoKey object. Not exportable in this demo for security simulation.
                                    </div>
                                ) : (
                                    <div className="w-full bg-slate-800 h-8 rounded border border-slate-700 flex items-center justify-center">
                                        <span className="text-slate-600 text-xs">••••••••••••••••••••••••</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
       </div>
    </div>
  );
};

export default KeyGenerator;