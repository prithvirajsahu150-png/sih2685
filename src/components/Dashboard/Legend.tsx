"use client";

import React from 'react';

export default function Legend() {
  return (
    <div className="absolute bottom-40 right-4 z-[1000] pointer-events-none flex flex-col gap-2 w-48">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/50 pointer-events-auto">
        <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Legend</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium text-slate-300">Drainage Network</span>
          </div>
        </div>

        <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Flood Risk</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-xs font-medium text-slate-300">LOW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            <span className="text-xs font-medium text-slate-300">MEDIUM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
            <span className="text-xs font-medium text-slate-300">HIGH</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-xs font-medium text-slate-300">CRITICAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
