"use client";

import React from 'react';
import { useMapStore } from '@/lib/store';
import { Layers } from 'lucide-react';

export default function LayerControl() {
  const { showDrainage, setShowDrainage, showFloodRisk, setShowFloodRisk } = useMapStore();

  return (
    <div className="w-72 pointer-events-none">
      <div className="w-full">
        <h3 className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <Layers size={14} /> Map Layers
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group pointer-events-auto">
            <input 
              type="checkbox" 
              checked={showDrainage}
              onChange={(e) => setShowDrainage(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Drainage Network</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group pointer-events-auto">
            <input 
              type="checkbox" 
              checked={showFloodRisk}
              onChange={(e) => setShowFloodRisk(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Flood Risk</span>
          </label>
        </div>
      </div>
    </div>
  );
}
