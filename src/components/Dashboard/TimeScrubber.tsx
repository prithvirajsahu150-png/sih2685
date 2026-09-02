"use client";

import React, { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function TimeScrubber() {
  const { currentTimestamp, setCurrentTimestamp, isPlaying, setIsPlaying, playbackSpeed } = useMapStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const prev = useMapStore.getState().currentTimestamp;
        if (prev >= 180) {
          setIsPlaying(false);
          setCurrentTimestamp(180);
        } else {
          setCurrentTimestamp(prev + 15);
        }
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, setCurrentTimestamp, setIsPlaying]);

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6 z-[1000] pointer-events-none">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-slate-700/50 pointer-events-auto flex flex-col gap-4 transition-all">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg group"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" /> : <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />}
            </button>
            <button
              onClick={() => { setIsPlaying(false); setCurrentTimestamp(0); }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <RotateCcw size={20} />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <div className="flex justify-between text-xs text-slate-400 font-medium mb-3 relative px-1">
              <span>▶ T=0 min</span>
              <span className="absolute left-1/4 -translate-x-1/2">T=45 min</span>
              <span className="absolute left-1/2 -translate-x-1/2">T=90 min</span>
              <span className="absolute left-3/4 -translate-x-1/2">T=135 min</span>
              <span>T=180 min</span>
            </div>
            
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={currentTimestamp}
                onChange={(e) => setCurrentTimestamp(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${(currentTimestamp / 180) * 100}%, #334155 ${(currentTimestamp / 180) * 100}%)`
                }}
              />
              <style dangerouslySetInnerHTML={{__html: `
                input[type=range]::-webkit-slider-thumb {
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #fff;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                  cursor: pointer;
                  transition: transform 0.1s;
                }
                input[type=range]::-webkit-slider-thumb:hover {
                  transform: scale(1.2);
                }
              `}} />
            </div>
            
            <div 
              className="absolute top-7 transform -translate-x-1/2 pointer-events-none flex flex-col items-center transition-all duration-300"
              style={{ left: `calc(${(currentTimestamp / 180) * 100}% + 4px)` }}
            >
              <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap mt-2">
                T = {currentTimestamp} min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
