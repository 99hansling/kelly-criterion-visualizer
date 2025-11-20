
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SimulationStep, KellyMetrics } from './types';
import SimulationChart from './components/SimulationChart';
import KellyExplanation from './components/KellyExplanation';
import MemeCrashGame from './components/MemeCrashGame';
import OddsCalculator from './components/OddsCalculator';
import { analyzeSimulation } from './services/geminiService';

const App: React.FC = () => {
  // --- App Mode State ---
  const [activeTab, setActiveTab] = useState<'classic' | 'meme'>('classic');

  // --- Classic Simulation State ---
  const [winRate, setWinRate] = useState<number>(0.60);
  const [odds, setOdds] = useState<number>(2.0);
  const [totalRounds, setTotalRounds] = useState<number>(100);
  const [allSimulationData, setAllSimulationData] = useState<SimulationStep[]>([]);
  
  // Step-by-Step State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Use number for browser compatibility instead of NodeJS.Timeout
  const timerRef = useRef<number | null>(null);
  
  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // --- Calculations ---
  const metrics: KellyMetrics = useMemo(() => {
    const p = winRate;
    const b = odds - 1; 
    const q = 1 - p;
    const fStar = (b * p - q) / b;
    const edge = p * b - q;
    return { fStar, edge, oddsB: b };
  }, [winRate, odds]);

  // --- Simulation Logic (Pre-calculates the whole path) ---
  const runSimulation = useCallback(() => {
    const initialWealth = 1000;
    const steps: SimulationStep[] = [];
    
    let wFull = initialWealth;
    let wHalf = initialWealth;
    let wDouble = initialWealth;
    let wFixed = initialWealth;
    
    const f = metrics.fStar;
    const effectiveF = Math.max(0, f);
    const fixedBetAmount = initialWealth * 0.05;

    steps.push({ 
        round: 0, 
        fullKelly: wFull, 
        halfKelly: wHalf, 
        doubleKelly: wDouble, 
        fixedBet: wFixed 
    });
    
    for (let i = 1; i <= totalRounds; i++) {
        const isWin = Math.random() < winRate;

        // Logic helper
        const updateWealth = (current: number, fraction: number) => {
            if (current < 0.01) return current; // Ruin
            // Kelly Formula assumes loss = 100% of bet. 
            // In real trading, 'bet' is the 'risk amount' (e.g., stop loss amount).
            const bet = current * fraction;
            return current + (isWin ? bet * metrics.oddsB : -bet);
        };

        wFull = updateWealth(wFull, effectiveF);
        wHalf = updateWealth(wHalf, effectiveF * 0.5);
        wDouble = updateWealth(wDouble, Math.min(1, effectiveF * 2)); // Cap at 100% leverage

        // Fixed
        if (wFixed > 0.01) {
            const bet = Math.min(wFixed, fixedBetAmount);
            wFixed += isWin ? bet * metrics.oddsB : -bet;
        }

        steps.push({
            round: i,
            fullKelly: Math.max(0, wFull),
            halfKelly: Math.max(0, wHalf),
            doubleKelly: Math.max(0, wDouble),
            fixedBet: Math.max(0, wFixed),
            outcome: isWin ? 'WIN' : 'LOSS'
        });
    }

    setAllSimulationData(steps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [winRate, odds, totalRounds, metrics]);

  // Initial Run
  useEffect(() => {
    runSimulation();
    setAiAnalysis(null);
  }, [runSimulation]);

  // --- Step Control Logic ---
  const visibleData = useMemo(() => {
    return allSimulationData.slice(0, currentStep + 1);
  }, [allSimulationData, currentStep]);

  const handleStepForward = () => {
    if (currentStep < allSimulationData.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(handleStepForward, 200); // 200ms per step
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStep, allSimulationData.length]);

  // --- Handlers ---
  const handleGetAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeSimulation(winRate, odds, metrics.fStar);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Kelly Criterion Visualizer
            </h1>
            <p className="text-slate-500 mt-1">
              资金管理的数学艺术 (The Mathematics of Capital Allocation)
            </p>
          </div>
          
          {/* Mode Switcher */}
          <div className="mt-4 md:mt-0 bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
             <button 
                onClick={() => setActiveTab('classic')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'classic' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                经典模拟
             </button>
             <button 
                onClick={() => setActiveTab('meme')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'meme' ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-500/30 shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <span>🚀</span> 土狗崩盘模式
             </button>
          </div>
        </div>

        {/* === CONTENT AREA === */}
        {activeTab === 'meme' ? (
            <MemeCrashGame />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Controls */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Controls Card */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-4">模拟配置</h2>
                
                {/* Win Rate Slider */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-slate-400">胜率 (p)</label>
                    <span className="text-emerald-400 font-mono font-bold">{(winRate * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    value={winRate}
                    onChange={(e) => { setWinRate(parseFloat(e.target.value)); setCurrentStep(0); }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="text-xs text-slate-600 mt-1">
                    {winRate > 0.5 ? "你有优势 (Edge)" : "庄家有优势"}
                  </div>
                </div>

                {/* Odds Slider */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-slate-400">
                        小数赔率 (Odds) 
                        <span className="ml-1 text-xs text-slate-600 font-normal">= 净赔率(b) + 1</span>
                    </label>
                    <span className="text-amber-400 font-mono font-bold">{odds.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.05"
                    max="10.0"
                    step="0.05"
                    value={odds}
                    onChange={(e) => { setOdds(parseFloat(e.target.value)); setCurrentStep(0); }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="text-xs text-slate-600 mt-1">
                    每下注 $1，胜利返还 ${odds.toFixed(2)} (净赚 ${(odds - 1).toFixed(2)})
                  </div>
                </div>

                <div className="flex gap-2">
                   <button 
                      onClick={runSimulation}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-300 transition-colors"
                    >
                      随机生成新数据
                    </button>
                </div>
              </div>
              
              {/* Helper Calculator */}
              <OddsCalculator />

              {/* AI Analysis */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-purple-400">✨</span> Gemini 智能分析
                  </h2>
                </div>
                
                {aiAnalysis ? (
                   <div className="prose prose-invert prose-sm text-slate-300 leading-relaxed">
                     <p>{aiAnalysis}</p>
                     <button 
                      onClick={handleGetAnalysis}
                      className="text-xs text-slate-500 underline mt-2 hover:text-slate-300"
                     >
                      刷新分析
                     </button>
                   </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm mb-3">想知道这个胜率和赔率下，应该怎么玩？</p>
                    <button 
                      onClick={handleGetAnalysis}
                      disabled={isAnalyzing}
                      className="px-4 py-2 bg-slate-800 hover:bg-purple-900/30 border border-purple-500/30 hover:border-purple-500 text-purple-300 rounded transition-all text-sm flex items-center justify-center w-full gap-2"
                    >
                      {isAnalyzing ? "思考中..." : "询问 Gemini"}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Visualization */}
            <div className="lg:col-span-8 space-y-6">
              
              <KellyExplanation metrics={metrics} winRate={winRate} odds={odds} />

              {/* Playback Controls */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={handleReset} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full" title="重置">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold min-w-[100px]">
                        {isPlaying ? '暂停' : '播放'}
                    </button>
                    <button onClick={handleStepForward} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full" title="下一步">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                 </div>
                 
                 {/* Step Info Box */}
                 <div className="flex-1 text-right">
                    <div className="text-xs text-slate-500 uppercase">当前轮次</div>
                    <div className="font-mono text-2xl text-white">{currentStep} <span className="text-slate-600 text-lg">/ {totalRounds}</span></div>
                 </div>
              </div>

              {/* Chart with Step Data */}
              <SimulationChart data={visibleData} currentStep={currentStep} />

              {/* Narrative Log */}
              {currentStep > 0 && visibleData[currentStep] && (
                <div className="bg-slate-800/50 border-l-4 border-emerald-500 p-4 rounded-r-lg animate-fade-in">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-200">第 {currentStep} 轮结果:</span>
                        <span className={`font-black px-2 py-1 rounded text-xs ${visibleData[currentStep].outcome === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {visibleData[currentStep].outcome === 'WIN' ? '胜利 (WIN)' : '失败 (LOSS)'}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                        <div>
                            <div className="text-slate-500 text-xs">全凯利 (最优)</div>
                            <div className="font-mono text-white">${visibleData[currentStep].fullKelly.toFixed(0)}</div>
                        </div>
                        <div>
                             <div className="text-slate-500 text-xs">2倍凯利 (激进)</div>
                             <div className={`font-mono ${visibleData[currentStep].doubleKelly < 10 ? 'text-red-500' : 'text-slate-300'}`}>
                                ${visibleData[currentStep].doubleKelly.toFixed(0)}
                             </div>
                        </div>
                        <div className="text-xs text-slate-400 italic flex items-center">
                           {visibleData[currentStep].outcome === 'WIN' 
                             ? "复利增长：本金 + (下注额 × 净赔率)" 
                             : "本金回撤：本金 - 下注额"}
                        </div>
                    </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
