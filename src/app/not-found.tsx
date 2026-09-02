"use client";

import { motion } from "framer-motion";
import { AlertOctagon, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0f1a] font-sans overflow-hidden">
      
      {/* Background Error Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,15,26,0.9),rgba(10,15,26,0.9)),url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center max-w-lg text-center"
      >
        <motion.div
          initial={{ y: -20, rotate: -10 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="relative"
        >
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-4 bg-red-500/20 rounded-full blur-2xl"
          />
          <div className="relative p-6 bg-red-500/10 rounded-3xl border border-red-500/30 mb-8 backdrop-blur-xl">
            <AlertOctagon size={64} className="text-red-500" />
          </div>
        </motion.div>

        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">Unmapped Territory</h2>
        <p className="text-slate-400 mb-10 text-sm leading-relaxed">
          The coordinates you entered are outside our sensor network. This region is either not mapped for flood prediction or the connection was lost in the storm.
        </p>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors shadow-[0_0_40px_rgba(37,99,235,0.3)] border border-blue-500/50 pointer-events-auto"
          >
            <Home size={20} /> Return to Dashboard
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
