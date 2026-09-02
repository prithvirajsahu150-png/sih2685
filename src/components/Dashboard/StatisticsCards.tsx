"use client";

import React, { useMemo } from 'react';
import { useMapStore } from '@/lib/store';
import { Droplets, Waves, AlertOctagon, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatisticsCards() {
  const { predictionGeoJSON, currentTimestamp } = useMapStore();
  
  const stats = useMemo(() => {
    const s = { maxDepth: 0, highAreas: 0, criticalAreas: 0 };
    if (!predictionGeoJSON) return s;

    predictionGeoJSON.features.forEach((feature: any) => {
      const depth = feature.properties.predicted_depth_meters || 0;
      const risk = feature.properties.risk_level?.toUpperCase();
      
      if (depth > s.maxDepth) s.maxDepth = depth;
      if (risk === 'HIGH') s.highAreas++;
      if (risk === 'CRITICAL') s.criticalAreas++;
    });

    s.maxDepth = parseFloat(s.maxDepth.toFixed(2));
    return s;
  }, [predictionGeoJSON]);

  const mockRainfall = [10, 15, 20, 30, 45, 50, 60, 70, 80, 75, 60, 40, 20];
  const idx = Math.min(Math.floor(currentTimestamp / 15), mockRainfall.length - 1);
  const currentRain = mockRainfall[idx] || 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-72 pointer-events-none grid grid-cols-2 gap-3"
    >
      <StatCard icon={<Droplets className="text-blue-400" size={18} />} title="Rainfall" value={`${currentRain} mm/hr`} />
      <StatCard icon={<Waves className="text-cyan-400" size={18} />} title="Max Depth" value={`${stats.maxDepth} m`} />
      <StatCard icon={<AlertOctagon className="text-orange-400" size={18} />} title="High Risk" value={stats.highAreas.toString()} />
      <StatCard icon={<Flame className="text-red-500" size={18} />} title="Critical" value={stats.criticalAreas.toString()} />
    </motion.div>
  );
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <motion.div 
      variants={item}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-slate-900/80 backdrop-blur-md rounded-2xl px-3 py-3 shadow-2xl border border-slate-700/50 pointer-events-auto flex flex-col items-center gap-2 text-center"
    >
      <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/50">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{title}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </motion.div>
  );
}
