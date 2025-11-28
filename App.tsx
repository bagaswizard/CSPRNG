import React, { useState } from 'react';
import EntropyCollector from './components/EntropyCollector';
import KeyGenerator from './components/KeyGenerator';
import DocumentSigner from './components/DocumentSigner';
import DocumentVerifier from './components/DocumentVerifier';
import { RSAKeyPair, AppStep } from './types';

const App: React.FC = () => {
  // State
  const [activeStep, setActiveStep] = useState<AppStep>(AppStep.ENTROPY);
  const [isEntropyCollected, setIsEntropyCollected] = useState(false);
  const [keys, setKeys] = useState<RSAKeyPair[]>([]);

  // Navigation handlers
  const canAccess = (step: AppStep) => {
    if (step === AppStep.ENTROPY) return true;
    if (!isEntropyCollected) return false;
    return true;
  };

  const handleNav = (step: AppStep) => {
    if (canAccess(step)) setActiveStep(step);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
             </div>
             <h1 className="text-xl font-bold tracking-tight text-white">
               SDDS <span className="text-brand-400 font-light hidden sm:inline">| Secure Digital Document Signing</span>
             </h1>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
             <span className={isEntropyCollected ? "text-green-500" : "text-yellow-500"}>
               CSPRNG: {isEntropyCollected ? "SEEDED" : "WAITING"}
             </span>
             <span className="hidden sm:block">v1.0.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 justify-center md:justify-start">
           {[
             { id: AppStep.ENTROPY, label: '01. Entropy' },
             { id: AppStep.KEYS, label: '02. Key Management' },
             { id: AppStep.SIGN, label: '03. Sign Document' },
             { id: AppStep.VERIFY, label: '04. Verification' },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => handleNav(tab.id)}
               disabled={!canAccess(tab.id)}
               className={`
                 px-4 py-2 rounded-full text-sm font-medium transition-all
                 ${activeStep === tab.id 
                   ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                   : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                 }
                 ${!canAccess(tab.id) && 'opacity-50 cursor-not-allowed hover:bg-slate-800'}
               `}
             >
               {tab.label}
             </button>
           ))}
        </nav>

        {/* Views */}
        <div className="animate-fade-in-up">
           {activeStep === AppStep.ENTROPY && (
             <EntropyCollector 
               isComplete={isEntropyCollected} 
               onComplete={() => {
                   setIsEntropyCollected(true);
                   // Auto advance after slight delay
                   setTimeout(() => setActiveStep(AppStep.KEYS), 1000);
               }} 
             />
           )}

           {activeStep === AppStep.KEYS && (
             <KeyGenerator 
                existingKeys={keys}
                onKeyPairGenerated={(newKey) => setKeys(prev => [newKey, ...prev])}
             />
           )}

           {activeStep === AppStep.SIGN && (
             <DocumentSigner keys={keys} />
           )}

           {activeStep === AppStep.VERIFY && (
             <DocumentVerifier />
           )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        <p>Powered by Web Crypto API & CSPRNG • Client-Side Security Only</p>
      </footer>
    </div>
  );
};

export default App;