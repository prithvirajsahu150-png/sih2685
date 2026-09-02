"use client";

import React, { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import { Play, Pause, RotateCcw, CloudRain, Navigation, MapPin } from 'lucide-react';

export default function ControlPanel() {
  const { 
    currentTimestamp, isPlaying, setIsPlaying, setCurrentTimestamp, playbackSpeed, setPlaybackSpeed,
    isRoutingMode, setIsRoutingMode, routeStart, routeEnd, safeRouteGeoJSON,
    isLiveWeather, setIsLiveWeather, liveRainfall, setLiveRainfall
  } = useMapStore();
  
  const mockRainfall = [10, 15, 20, 30, 45, 50, 60, 70, 80, 75, 60, 40, 20];
  const idx = Math.min(Math.floor(currentTimestamp / 15), mockRainfall.length - 1);
  const currentRain = isLiveWeather ? liveRainfall : (mockRainfall[idx] || 0);

  useEffect(() => {
    if (isLiveWeather) {
      // Poll every 60 seconds
      const fetchWeather = async () => {
        try {
          const res = await fetch('/api/py/api/weather/current');
          const data = await res.json();
          if (data.rainfall_mm_hr !== undefined) {
            setLiveRainfall(data.rainfall_mm_hr);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchWeather();
      const interval = setInterval(fetchWeather, 60000);
      return () => clearInterval(interval);
    }
  }, [isLiveWeather, setLiveRainfall]);

  let intensity = "LOW";
  if (currentRain > 30) intensity = "MODERATE";
  if (currentRain > 60) intensity = "HIGH";
  if (currentRain > 75) intensity = "EXTREME";

  return (
    <div className="w-72 pointer-events-none flex flex-col gap-4">
      
      {/* Rainfall Control */}
      <div className="w-full pointer-events-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-200 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <CloudRain size={16} className="text-blue-400" /> Flood Simulation
          </h2>
          <button
            onClick={() => setIsLiveWeather(!isLiveWeather)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
              isLiveWeather ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {isLiveWeather ? 'LIVE' : 'MOCK'}
          </button>
        </div>
        
        <div className="mb-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Current Rainfall</div>
          <div className="text-3xl font-light text-white">{currentRain} <span className="text-base text-slate-400">mm/hr</span></div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Intensity</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              intensity === 'LOW' ? 'bg-green-500/20 text-green-400' :
              intensity === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
              intensity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>{intensity}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentRain / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="w-full pointer-events-auto mt-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white transition-all shadow-lg ${isPlaying ? 'bg-blue-600 animate-pulse-glow' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span className="font-medium text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={() => { setIsPlaying(false); setCurrentTimestamp(0); }}
            className="p-2 ml-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Reset Simulation"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Playback Speed</div>
          <div className="grid grid-cols-4 gap-1 bg-slate-800/50 p-1 rounded-lg">
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`py-1 text-xs font-medium rounded-md transition-colors ${playbackSpeed === speed ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-800/60 my-2" />

      {/* Evacuation Routing */}
      <div className="w-full pointer-events-auto">
        <h2 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Navigation size={16} className="text-emerald-400" /> Evacuation Routing
        </h2>
        <button
          onClick={() => setIsRoutingMode(!isRoutingMode)}
          className={`w-full py-2 mb-4 rounded-xl text-sm font-medium transition-colors border shadow-sm ${
            isRoutingMode 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isRoutingMode ? 'Cancel Routing' : 'Find Safe Route'}
        </button>

        {isRoutingMode && (
          <div className="space-y-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${routeStart ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600 animate-pulse'}`} />
              <span className="text-xs text-slate-300 flex-1">{routeStart ? 'Start Point Set' : 'Click map to set Start'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${routeEnd ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-600'}`} />
              <span className="text-xs text-slate-300 flex-1">{routeEnd ? 'Destination Set' : 'Click map to set End'}</span>
            </div>
            
            {safeRouteGeoJSON && (
              <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-emerald-400 flex items-center gap-2 font-medium">
                <MapPin size={12} /> Safe Route Generated
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
