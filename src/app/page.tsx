"use client";

import FloodMap from "@/components/map/FloodMap";
import Header from "@/components/Dashboard/Header";
import ControlPanel from "@/components/Dashboard/ControlPanel";
import RiskPanel from "@/components/Dashboard/RiskPanel";
import StatisticsCards from "@/components/Dashboard/StatisticsCards";
import Legend from "@/components/Dashboard/Legend";
import LayerControl from "@/components/Dashboard/LayerControl";
import MaintenancePanel from "@/components/Dashboard/MaintenancePanel";
import TimeScrubber from "@/components/Dashboard/TimeScrubber";
import AnalyticsPanel from "@/components/Dashboard/AnalyticsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { useMapStore } from "@/lib/store";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const { showAnalytics, setShowAnalytics } = useMapStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds loading screen
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex flex-col md:flex-row h-[100dvh] w-screen bg-[#0a0f1a] overflow-hidden font-sans text-slate-200">
      
      {/* Loading Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="absolute inset-0 z-[9999] flex items-center justify-center bg-[#0a0f1a]"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-blue-500/30"
                  initial={{ width: 0, height: 0, opacity: 1 }}
                  animate={{ width: 600, height: 600, opacity: 0 }}
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
              className="relative z-10 flex flex-col items-center gap-6 bg-[#0a0f1a]/80 backdrop-blur-2xl p-10 rounded-3xl border border-slate-800/80 shadow-[0_0_80px_rgba(59,130,246,0.15)] pointer-events-none"
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
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar - Bottom sheet on mobile, Left Sidebar on Desktop */}
      <aside className="w-full md:w-[22rem] h-[45vh] md:h-full bg-[#0a0f1a]/95 backdrop-blur-2xl md:border-r border-t md:border-t-0 border-slate-800/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[30px_0_60px_rgba(0,0,0,0.6)] z-[900] flex flex-col flex-shrink-0 animate-slide-up md:animate-slide-right order-2 md:order-1">
        
        {/* Title Area */}
        <div className="p-4 md:p-7 pb-4 md:pb-6 pointer-events-auto flex justify-between items-center md:items-start md:flex-col">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">Jal-<br className="hidden md:block"/><span className="text-blue-500 md:ml-0 ml-1">Drishti</span></h1>
            <p className="text-slate-400 text-[10px] md:text-xs mt-1 md:mt-2 font-medium tracking-wide uppercase">Real-Time Monitoring</p>
          </div>
        </div>
        
        {/* Scrollable Panels */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-7 flex flex-col gap-4 md:gap-6 pb-6 md:pb-8 pointer-events-auto">
          <StatisticsCards />
          <div className="w-full h-px bg-slate-800/60" />
          <ControlPanel />
          <div className="w-full h-px bg-slate-800/60" />
          <RiskPanel />
          <div className="w-full h-px bg-slate-800/60" />
          <MaintenancePanel />
          <div className="w-full h-px bg-slate-800/60" />
          <LayerControl />
        </div>
      </aside>

      {/* Main Content Area - Map */}
      <section className="flex-1 relative h-[55vh] md:h-full p-2 md:p-4 flex flex-col order-1 md:order-2 z-10">
        {/* Map Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
          className="w-full h-full rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.15)] border border-slate-700/60 relative z-10 transition-all duration-500"
        >
          <FloodMap />
        </motion.div>
        
        {/* Floating UI Elements OVER the map */}
        <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
          <Header />
          <Legend />
          <TimeScrubber />
          
          <AnimatePresence>
            {showAnalytics && <AnalyticsPanel onClose={() => setShowAnalytics(false)} />}
          </AnimatePresence>
        </div>
      </section>

    </main>
  );
}
