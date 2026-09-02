"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0f1a] font-sans overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Radar / Wave rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-blue-500/30"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 500, height: 500, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 1,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6 bg-[#0a0f1a]/80 backdrop-blur-2xl p-10 rounded-3xl border border-slate-800/80 shadow-[0_0_80px_rgba(59,130,246,0.15)]"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30"
        >
          <Activity size={40} className="text-blue-400" />
        </motion.div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Initializing Simulation</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide uppercase">Connecting to Sensor Network...</p>
        </div>

        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
