"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMapStore } from '@/lib/store';
import { Activity, X } from 'lucide-react';

export default function AnalyticsPanel({ onClose }: { onClose: () => void }) {
  const { currentTimestamp } = useMapStore();

  // Generate synthetic chart data based on the current timestamp
  const chartData = useMemo(() => {
    const data = [];
    const mockRainfall = [10, 15, 20, 30, 45, 50, 60, 70, 80, 75, 60, 40, 20];
    for (let t = 0; t <= 180; t += 15) {
      const idx = Math.min(Math.floor(t / 15), mockRainfall.length - 1);
      const rain = mockRainfall[idx] || 0;
      
      // Simple mock formula correlating time, rain to avg depth
      const avgDepth = (rain / 50.0) * (t / 120.0) + (t === currentTimestamp ? 0.2 : 0);
      
      data.push({
        time: `T+${t}`,
        rainfall: rain,
        depth: parseFloat(avgDepth.toFixed(2))
      });
    }
    return data;
  }, [currentTimestamp]);

  return (
    <div className="absolute right-4 top-24 bottom-4 w-96 bg-[#0a0f1a]/95 backdrop-blur-2xl border border-slate-800/80 shadow-[0_0_60px_rgba(0,0,0,0.6)] z-[900] rounded-3xl flex flex-col p-5 animate-slide-left">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-slate-200 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Activity size={16} className="text-blue-400" /> Real-Time Analytics
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        
        {/* Rainfall Chart */}
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
          <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-4">Rainfall Trend (mm/hr)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Depth Chart */}
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
          <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-4">Avg City Flood Depth (m)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <Line type="monotone" dataKey="depth" stroke="#14b8a6" strokeWidth={3} dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
