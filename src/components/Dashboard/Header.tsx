"use client";

import React, { useEffect, useState } from 'react';
import { useMapStore } from '@/lib/store';
import { Activity, Database, Map, LineChart } from 'lucide-react';

export default function Header() {
  const { apiError, showAnalytics, setShowAnalytics } = useMapStore();
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/py/health');
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const int = setInterval(checkHealth, 5000);
    return () => clearInterval(int);
  }, []);

  const isError = apiError || !backendOnline;

  return (
    <div className="absolute top-8 right-8 bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex gap-6 pointer-events-auto z-[1000] animate-slide-up">
      <div className="flex items-center gap-2">
        <Activity size={16} className={`${isError ? "text-red-500" : "text-emerald-500"} animate-pulse`} />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Backend</span>
          <span className="text-sm font-medium text-white">{isError ? 'ERROR' : 'ONLINE'}</span>
        </div>
      </div>
      <div className="w-px bg-slate-700/50 h-8 self-center"></div>
      <div className="flex items-center gap-2">
        <Database size={16} className="text-emerald-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Database</span>
          <span className="text-sm font-medium text-white">CONNECTED</span>
        </div>
      </div>
      <div className="w-px bg-slate-700/50 h-8 self-center"></div>
      <div className="flex items-center gap-2">
        <Map size={16} className="text-emerald-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Map</span>
          <span className="text-sm font-medium text-white">ACTIVE</span>
        </div>
      </div>
      <div className="w-px bg-slate-700/50 h-8 self-center"></div>
      <button 
        onClick={() => setShowAnalytics(!showAnalytics)}
        className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all ${showAnalytics ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
      >
        <LineChart size={16} />
        <span className="text-[10px] uppercase tracking-wider font-semibold">Analytics</span>
      </button>
    </div>
  );
}
