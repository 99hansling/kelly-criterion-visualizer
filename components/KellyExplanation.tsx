import React from 'react';
import { KellyMetrics } from '../types';

interface KellyExplanationProps {
  metrics: KellyMetrics;
  winRate: number;
  odds: number;
}

const KellyExplanation: React.FC<KellyExplanationProps> = ({ metrics, winRate, odds }) => {
  const { fStar, edge, oddsB } = metrics;
  
  // p * (b + 1) - 1
  const numerator = winRate * (oddsB + 1) - 1;
  const percentDisplay = (fStar * 100).toFixed(2);
  const isPositive = fStar > 0;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 2v20M2 4h20M6 12h4m-2-2v4M18 18l-4-4"/></svg>
        数学原理 (The Math)
      </h2>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
        {/* The Formula Visual */}
        <div className="font-mono text-2xl md:text-3xl text-slate-300 flex items-center bg-slate-900 p-6 rounded-lg border border-slate-700">
          <span className="mr-4 text-indigo-400 italic">f*</span>
          <span className="mr-4">=</span>
          <div className="flex flex-col items-center">
            <div className="border-b border-slate-500 px-2 pb-1 mb-1">
              <span className="text-emerald-400">p</span>(<span className="text-amber-400">b</span> + 1) - 1
            </div>
            <div className="text-amber-400 italic">b</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:block text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>

        {/* The Plugged-in Values */}
        <div className="font-mono text-lg text-slate-400">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald-400 font-bold">p (胜率)</span> = {winRate.toFixed(2)}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 font-bold">b (净赔率)</span> = {oddsB.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
             f* = ({winRate.toFixed(2)} × {(oddsB + 1).toFixed(2)} - 1) / {oddsB.toFixed(2)}
             <div className="mt-2 text-xl text-white font-bold">
               = {isPositive ? <span className="text-emerald-400">{percentDisplay}% (仓位)</span> : <span className="text-red-400">不要下注! ({percentDisplay}%)</span>}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className={`p-4 rounded-lg border ${edge > 0 ? 'bg-emerald-950/30 border-emerald-900' : 'bg-red-950/30 border-red-900'}`}>
          <h4 className="font-semibold mb-1 text-slate-200">数学期望 (Edge/优势)</h4>
          <p className="text-slate-400">
            每投入 $1.00，你的{edge > 0 ? '期望收益是' : '期望亏损是'} <span className={edge > 0 ? 'text-emerald-400' : 'text-red-400'}>${Math.abs(edge).toFixed(3)}</span>。
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
          <h4 className="font-semibold mb-1 text-slate-200">为什么是凯利公式？</h4>
          <p className="text-slate-400">
             它是数学上的最佳平衡点。下注太多？长期波动会导致破产。下注太少？资产增长速度太慢。
          </p>
        </div>
      </div>
    </div>
  );
};

export default KellyExplanation;