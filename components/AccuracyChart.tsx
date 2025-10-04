import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AccuracyDataPoint } from '../types';

interface AccuracyChartProps {
  data: AccuracyDataPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700/80 backdrop-blur-sm p-2 border border-slate-600 rounded-md shadow-lg">
          <p className="text-sm text-slate-300">{`Time: ${label}s`}</p>
          <p className="text-sm text-emerald-300 font-bold">{`Accuracy: ${payload[0].value}%`}</p>
        </div>
      );
    }
  
    return null;
};

const AccuracyChart: React.FC<AccuracyChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <defs>
            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            domain={[0, 100]}
            label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="accuracy" stroke="#34d399" strokeWidth={2} fill="url(#colorAccuracy)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AccuracyChart;