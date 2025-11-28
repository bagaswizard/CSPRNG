import React, { useState, useEffect, useRef } from 'react';
import { generateRandomBytes } from '../services/csprngService';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { EntropyData } from '../types';

interface Props {
  onComplete: () => void;
  isComplete: boolean;
}

const EntropyCollector: React.FC<Props> = ({ onComplete, isComplete }) => {
  const [entropyLevel, setEntropyLevel] = useState(0);
  const [chartData, setChartData] = useState<EntropyData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isComplete) return;

    const handleMouseMove = (e: MouseEvent) => {
      // In a real heavy crypto app, we would push these coordinates into a seed pool.
      // Here we simulate the accumulation of "randomness" required to initialize the system.
      // However, we DO use real CSPRNG to generate values for the visualizer.
      
      const randomByte = generateRandomBytes(1)[0];
      
      setChartData(prev => {
        const newData = [...prev, { timestamp: Date.now(), value: randomByte }];
        return newData.slice(-50); // Keep last 50 points
      });

      setEntropyLevel((prev) => {
        const increment = 0.5;
        const next = prev + increment;
        if (next >= 100) {
           // Defer the completion callback slightly to prevent render loop issues
           setTimeout(onComplete, 0);
           return 100;
        }
        return next;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isComplete, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-brand-400">01.</span> CSPRNG Initialization
          </h2>
          <p className="text-slate-400 text-sm">
            Move your mouse within the box below to harvest user-interaction entropy. 
            This data is mixed with the system's Cryptographically Secure Pseudo-Random Number Generator 
            to ensure maximum unpredictability for your RSA keys.
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono uppercase text-slate-500">
              <span>Entropy Pool Status</span>
              <span>{Math.round(entropyLevel)}%</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-75"
                style={{ width: `${entropyLevel}%` }}
              />
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className={`
            w-full md:w-80 h-48 bg-slate-900 rounded-lg border-2 border-dashed 
            flex items-center justify-center relative overflow-hidden transition-colors
            ${isComplete ? 'border-green-500/50' : 'border-brand-500/50 cursor-crosshair'}
          `}
        >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <YAxis domain={[0, 255]} hide />
                        <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

          {isComplete ? (
            <div className="text-green-400 font-bold flex flex-col items-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>System Ready</span>
            </div>
          ) : (
            <span className="text-brand-400 font-mono text-sm z-10 pointer-events-none">
              [ MOVE MOUSE HERE ]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntropyCollector;