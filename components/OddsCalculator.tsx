
import React, { useState, useMemo } from 'react';

const OddsCalculator: React.FC = () => {
  // State for Real-world inputs
  const [avgWinPercent, setAvgWinPercent] = useState<number>(20); // e.g., Take Profit 20%
  const [avgLossPercent, setAvgLossPercent] = useState<number>(10); // e.g., Stop Loss 10%
  
  // Calculate b (Odds)
  const calculatedOdds = useMemo(() => {
    if (avgLossPercent === 0) return 0;
    return avgWinPercent / avgLossPercent;
  }, [avgWinPercent, avgLossPercent]);

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧮</span>
        <h3 className="text-white font-bold">现实交易赔率转换器</h3>
      </div>
      
      <p className="text-xs text-slate-400 mb-4">
        现实中不是简单的“赢一倍”或“输光”。<br/>
        请输入你的交易计划，计算等效赔率 ($b$)。
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-emerald-400 mb-1 font-semibold">平均盈利 (止盈 %)</label>
          <div className="relative">
            <input
              type="number"
              value={avgWinPercent}
              onChange={(e) => setAvgWinPercent(Math.max(0, parseFloat(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white focus:border-emerald-500 outline-none"
            />
            <span className="absolute right-2 top-1 text-slate-500">%</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-red-400 mb-1 font-semibold">平均亏损 (止损 %)</label>
          <div className="relative">
            <input
              type="number"
              value={avgLossPercent}
              onChange={(e) => setAvgLossPercent(Math.max(0.1, parseFloat(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white focus:border-red-500 outline-none"
            />
            <span className="absolute right-2 top-1 text-slate-500">%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-3 rounded border border-slate-700 flex justify-between items-center">
        <div className="text-sm text-slate-400">
          等效赔率 (<span className="italic text-amber-400">b</span>):
        </div>
        <div className="text-xl font-mono font-bold text-amber-400">
          {calculatedOdds.toFixed(2)} : 1
        </div>
      </div>
      
      <div className="mt-3 text-xs text-slate-500 leading-relaxed">
        <p>
          <strong>解读：</strong> 如果你设定的止盈是 {avgWinPercent}%，止损是 {avgLossPercent}%。
          这意味着你每冒 ${avgLossPercent} 的风险，试图赚取 ${avgWinPercent} 的利润。
          你的盈亏比 (P/L Ratio) 是 {calculatedOdds.toFixed(1)}。
          <br/><br/>
          <span className="text-slate-400 underline decoration-dotted" title="将此值输入上方的'小数赔率'滑块中（注意：这里算出的是净赔率 b，上方滑块是总赔率 Odds = b + 1）">
            👉 请将上方滑块调整为 {(calculatedOdds + 1).toFixed(2)}x 以匹配此策略。
          </span>
        </p>
      </div>
    </div>
  );
};

export default OddsCalculator;
