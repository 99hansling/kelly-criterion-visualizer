
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CrashGameHistory } from '../types';

const MemeCrashGame: React.FC = () => {
  // Game State
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(50);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CRASHED' | 'CASHED'>('IDLE');
  const [history, setHistory] = useState<CrashGameHistory[]>([]);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const crashPointRef = useRef<number>(0);

  // --- Kelly Math for Crash Game ---
  // In a fair crash game (1% house edge), P(win) = 0.99 / Target
  // Odds (b) = Target - 1
  const kellyAnalysis = useMemo(() => {
    const houseEdgeFactor = 0.99; // 1% house edge
    const p = houseEdgeFactor / targetMultiplier;
    const q = 1 - p;
    const b = targetMultiplier - 1;
    
    const fStar = (p * b - q) / b;
    const suggestedBet = Math.max(0, balance * fStar);
    
    return { fStar, suggestedBet, p, b };
  }, [targetMultiplier, balance]);

  const startGame = () => {
    if (balance < betAmount) return;
    
    setBalance(prev => prev - betAmount);
    setGameState('RUNNING');
    setCurrentMultiplier(1.00);
    
    // Generate Crash Point (Inverse distribution usually used in these games)
    // Simple visual version: weighted random
    // Real crash math: X = 0.99 / (1-Math.random())
    const random = Math.random();
    const calculatedCrash = Math.max(1.00, 0.99 / (1 - random));
    crashPointRef.current = calculatedCrash;

    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    if (!startTimeRef.current) return;
    
    const elapsed = Date.now() - startTimeRef.current;
    // Exponential growth curve for visual excitement
    const nextMult = 1 + Math.pow(elapsed / 1000, 2) * 0.1 + (elapsed/2000);
    
    if (nextMult >= crashPointRef.current) {
      // CRASH!
      setGameState('CRASHED');
      setCurrentMultiplier(crashPointRef.current);
      addToHistory('CRASHED', crashPointRef.current, -betAmount);
    } else if (nextMult >= targetMultiplier) {
      // Auto Cashout (Win)
      setGameState('CASHED');
      setCurrentMultiplier(targetMultiplier);
      const profit = betAmount * targetMultiplier;
      setBalance(prev => prev + profit);
      addToHistory('CASHED', crashPointRef.current, profit - betAmount);
    } else {
      setCurrentMultiplier(nextMult);
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const addToHistory = (result: 'CRASHED' | 'CASHED', crashPoint: number, profit: number) => {
    setHistory(prev => [{
      id: Date.now(),
      crashPoint,
      target: targetMultiplier,
      bet: betAmount,
      profit,
      result
    }, ...prev].slice(0, 10));
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Game View */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-1 relative overflow-hidden min-h-[400px] flex flex-col justify-center items-center">
            
            {/* Background Grid Effect */}
            <div className="absolute inset-0 opacity-10" 
                 style={{backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>

            {/* The Rocket/Multiplier */}
            <div className="relative z-10 text-center">
                <div className={`text-6xl md:text-8xl font-mono font-black tracking-tighter transition-colors duration-100 
                    ${gameState === 'CRASHED' ? 'text-red-500' : 
                      gameState === 'CASHED' ? 'text-emerald-400' : 'text-white'}`}>
                    {currentMultiplier.toFixed(2)}x
                </div>
                <div className="mt-4 h-8">
                    {gameState === 'RUNNING' && <span className="text-yellow-400 font-bold animate-pulse">🚀 冲向月球 (TO THE MOON!)</span>}
                    {gameState === 'CRASHED' && <span className="text-red-500 font-bold">💥 崩盘跑路 (RUG PULL!)</span>}
                    {gameState === 'CASHED' && <span className="text-emerald-400 font-bold">💰 落袋为安 (SECURED!)</span>}
                </div>
            </div>

            {/* Visual Graph Line (Simplified) */}
            {gameState === 'RUNNING' && (
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500 animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.5)]"></div>
            )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative group">
                <div className="absolute -top-3 left-4 bg-slate-700 px-2 text-xs text-white rounded shadow border border-slate-600 hidden group-hover:block w-64 z-20 p-2">
                   在这个游戏中:
                   <br/>• 胜 (Win): 火箭超过目标倍数。
                   <br/>• 输 (Loss): 火箭在目标前坠毁，本金归零。
                   <br/>• 赔率 (b) = 目标倍数 - 1。
                </div>
                <label className="block text-xs text-slate-400 uppercase font-bold mb-2 flex items-center gap-1 cursor-help">
                    目标倍数 (自动止盈)
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </label>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        step="0.1"
                        min="1.01"
                        value={targetMultiplier}
                        onChange={(e) => setTargetMultiplier(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono"
                    />
                    <span className="text-slate-400">x</span>
                </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <label className="block text-xs text-slate-400 uppercase font-bold mb-2">下注金额</label>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">$</span>
                    <input 
                        type="number" 
                        step="10"
                        value={betAmount}
                        onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono"
                    />
                </div>
            </div>
        </div>

        <button 
            onClick={startGame}
            disabled={gameState === 'RUNNING' || balance < betAmount}
            className={`w-full py-4 rounded-xl font-bold text-xl tracking-widest transition-all
                ${gameState === 'RUNNING' 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'}`}
        >
            {gameState === 'RUNNING' ? '持有中...' : '梭哈 (买入)'}
        </button>
      </div>

      {/* Analysis View */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-end mb-4">
                <h3 className="text-xl font-bold text-white">钱包余额</h3>
                <span className="text-2xl font-mono text-emerald-400">${balance.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{width: `${Math.min(100, (balance/1000)*100)}%`}}></div>
            </div>
        </div>

        {/* Dynamic Kelly Analysis */}
        <div className="bg-slate-900/80 p-6 rounded-xl border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🧮</div>
            <h3 className="text-lg font-bold text-indigo-300 mb-4">实时凯利分析 (Kelly)</h3>
            
            <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">目标止盈</span>
                    <span className="font-mono text-white">{targetMultiplier}x</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">胜率 (隐含)</span>
                    <span className="font-mono text-blue-400">{(kellyAnalysis.p * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">净赔率 (b)</span>
                    <span className="font-mono text-amber-400">{kellyAnalysis.b.toFixed(2)} : 1</span>
                </div>
                
                <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-600">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-300 font-bold">最优凯利下注:</span>
                        <span className={`font-mono font-bold ${kellyAnalysis.fStar > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {(kellyAnalysis.fStar * 100).toFixed(2)}% (${kellyAnalysis.suggestedBet.toFixed(0)})
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {kellyAnalysis.fStar <= 0 
                            ? "⚠️ 数学建议：不要下注。在公平的崩盘游戏中（含庄家优势），风险大于回报，除非你有内幕消息。"
                            : "✅ 如果你真的有优势，这是理论上的最大下注仓位。"}
                        <br/>
                        <span className="italic opacity-75">当前下注: 占本金的 {((betAmount/balance)*100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* History */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">最近记录</h4>
            <div className="space-y-2">
                {history.map(h => (
                    <div key={h.id} className="flex justify-between items-center text-sm p-2 rounded bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${h.result === 'CASHED' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className="text-slate-300 font-mono">{h.crashPoint.toFixed(2)}x</span>
                        </div>
                        <div className={`font-mono ${h.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {h.profit > 0 ? '+' : ''}{h.profit.toFixed(0)}
                        </div>
                    </div>
                ))}
                {history.length === 0 && <div className="text-center text-slate-600 italic text-xs">暂无游戏记录</div>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default MemeCrashGame;
