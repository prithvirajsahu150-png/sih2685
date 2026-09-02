"use client";

import React, { useMemo } from 'react';
import { useMapStore } from '@/lib/store';
import { AlertTriangle } from 'lucide-react';

export default function RiskPanel() {
  const { predictionGeoJSON, isLoading } = useMapStore();

  const riskCounts = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    if (!predictionGeoJSON) return counts;

    predictionGeoJSON.features.forEach((feature: any) => {
      const risk = feature.properties.risk_level?.toUpperCase();
      if (risk === 'LOW') counts.LOW++;
      if (risk === 'MEDIUM') counts.MEDIUM++;
      if (risk === 'HIGH') counts.HIGH++;
      if (risk === 'CRITICAL') counts.CRITICAL++;
    });
    return counts;
  }, [predictionGeoJSON]);

  return (
    <div className="w-72 pointer-events-none flex flex-col gap-4">
      <div className="w-full transition-all">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-slate-200 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} className={`text-orange-400 ${riskCounts.CRITICAL > 0 ? 'animate-pulse text-red-500' : ''}`} /> Flood Risk
          </h2>
          {isLoading && <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>}
        </div>

        <div className="space-y-3">
          <RiskRow label="LOW" count={riskCounts.LOW} color="bg-green-500" />
          <RiskRow label="MEDIUM" count={riskCounts.MEDIUM} color="bg-yellow-500" />
          <RiskRow label="HIGH" count={riskCounts.HIGH} color="bg-orange-500" />
          <RiskRow label="CRITICAL" count={riskCounts.CRITICAL} color="bg-red-500" />
        </div>
      </div>
    </div>
  );
}

function RiskRow({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125`}></div>
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <span className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50 min-w-[2rem] text-center transition-colors group-hover:bg-slate-700">
        {count}
      </span>
    </div>
  );
}
