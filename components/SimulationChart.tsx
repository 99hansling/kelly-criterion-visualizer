import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { SimulationStep } from '../types';

interface SimulationChartProps {
  data: SimulationStep[];
  currentStep?: number; // Optional step for highlight
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
};

const SimulationChart: React.FC<SimulationChartProps> = ({ data, currentStep }) => {
  
  const lastPoint = data[data.length - 1];

  return (
    <div className="w-full h-[400px] bg-slate-900 rounded-xl border border-slate-700 p-4 relative">
      <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">
        财富增长轨迹 (对数坐标)
        {currentStep !== undefined && <span className="ml-2 text-emerald-500 text-xs normal-case">当前第 {currentStep} 轮</span>}
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="round" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={{ stroke: '#94a3b8' }}
            label={{ value: '轮次', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={formatCurrency}
            domain={['auto', 'auto']}
            scale="log" 
            allowDataOverflow={true}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
            formatter={(value: number) => [formatCurrency(value), '']}
            labelFormatter={(label) => `第 ${label} 轮`}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Line 
            type="monotone" 
            dataKey="fullKelly" 
            name="全凯利 (最优策略)" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={false} 
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="halfKelly" 
            name="半凯利 (稳健策略)" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false} 
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="doubleKelly" 
            name="2倍凯利 (激进/危险)" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false} 
            isAnimationActive={false}
          />

          {/* Add glowing dots for the latest point if in step mode */}
          {lastPoint && (
             <ReferenceDot x={lastPoint.round} y={lastPoint.fullKelly} r={6} fill="#10b981" stroke="white" />
          )}
           {lastPoint && (
             <ReferenceDot x={lastPoint.round} y={lastPoint.doubleKelly} r={4} fill="#ef4444" stroke="white" />
          )}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 text-center mt-2">
        *注：采用对数刻度。垂直距离代表增长百分比，能更直观展示复利效果。
      </p>
    </div>
  );
};

export default SimulationChart;