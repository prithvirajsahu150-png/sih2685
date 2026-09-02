import React from 'react';
import { Wrench, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function MaintenancePanel() {
  const cleaningRecords = [
    { id: "DRN-402", lastCleaned: "2 days ago", status: "Clear", risk: "Low" },
    { id: "DRN-819", lastCleaned: "3 weeks ago", status: "Silt Build-up", risk: "Medium" },
    { id: "DRN-115", lastCleaned: "6 months ago", status: "Blocked", risk: "Critical" },
    { id: "DRN-773", lastCleaned: "1 week ago", status: "Clear", risk: "Low" },
  ];

  return (
    <div className="w-full pointer-events-auto">
      <h2 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
        <Wrench size={16} className="text-slate-400" /> Maintenance Records
      </h2>
      
      <div className="flex flex-col gap-3">
        {cleaningRecords.map((record, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-xl border flex flex-col gap-2 transition-all hover:bg-opacity-80 ${
              record.risk === 'Critical' ? 'bg-red-500/10 border-red-500/30' :
              record.risk === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">{record.id}</span>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                record.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                record.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {record.status}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>Cleaned: {record.lastCleaned}</span>
              </div>
              
              {record.risk === 'Critical' && (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle size={12} />
                  <span>Action Required</span>
                </div>
              )}
              {record.risk === 'Low' && (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 size={12} />
                  <span>Optimal</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
