import React from 'react';
import { Target, Search, MapPin, Star, Play, CheckCircle2, FileDown, Layers, Crosshair } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import BusinessTypeSelect from './BusinessTypeSelect';
import LocationSelect from './LocationSelect';

interface Props {
  businessType: string;
  setBusinessType: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  maxResults: number;
  setMaxResults: (v: number) => void;
  qualityFloor: string;
  setQualityFloor: (v: string) => void;
  onRunExtraction: () => void;
  isRunning: boolean;
}

export default function WorkflowConfig({
  businessType,
  setBusinessType,
  location,
  setLocation,
  maxResults,
  setMaxResults,
  qualityFloor,
  setQualityFloor,
  onRunExtraction,
  isRunning,
}: Props) {
  return (
    <div className={clsx(
      "glass-card p-6 lg:p-8 rounded-2xl border backdrop-blur-xl h-full flex flex-col relative transition-all duration-700",
      isRunning ? "border-neon-green/30 shadow-[0_0_30px_rgba(57,255,20,0.05)]" : "border-white/8"
    )}>
      {/* Backgrounds container with overflow-hidden to preserve rounded corners */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none -z-10">
        {/* Animated gradient border for active state */}
        {isRunning && (
          <div className="absolute inset-0 bg-gradient-to-r from-neon-green/0 via-neon-green/10 to-neon-green/0 w-[200%] animate-[scan_2s_linear_infinite]" />
        )}
        
        {/* Tiny particle dots background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
      </div>

      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-green/20 rounded-full animate-ping opacity-50" />
              <div className="w-12 h-12 bg-[#050505] border border-neon-green/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                <Target size={20} className="text-neon-green" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black tracking-tight text-white">Workflow Config</h2>
                <span className="px-2 py-0.5 text-[9px] font-bold text-neon-green bg-neon-green/10 border border-neon-green/20 rounded-full tracking-widest uppercase shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Configure business search intelligence</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">System Node</div>
            <div className="text-xs text-neon-green/80 font-mono flex items-center gap-1">
              <Crosshair size={10} /> Agent Input Core
            </div>
          </div>
        </div>
        
        {/* Animated Green Glow Line */}
        <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-neon-green/50 to-transparent animate-[shimmer_3s_infinite]" />
        </div>
      </div>

      {/* Tiles */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Business Type */}
        <div className="group p-5 bg-black/40 border border-white/5 hover:border-neon-green/30 rounded-xl transition-colors relative z-20">
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={14} className="text-slate-500 group-hover:text-neon-green transition-colors" /> Business Type
            </label>
          </div>
          <div className="relative z-10">
            <BusinessTypeSelect value={businessType} onChange={setBusinessType} />
          </div>
          <p className="mt-2 text-[10px] font-medium text-slate-500 relative z-10">Choose a Google Maps business category to extract</p>
        </div>

        {/* Location */}
        <div className="group p-5 bg-black/40 border border-white/5 hover:border-neon-green/30 rounded-xl transition-colors relative z-10">
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-slate-500 group-hover:text-neon-green transition-colors" /> Target Location
            </label>
          </div>
          <div className="relative z-10">
            <LocationSelect value={location} onChange={setLocation} />
          </div>
          <p className="mt-2 text-[10px] font-medium text-slate-500 relative z-10">Select city, region, country or custom area</p>
        </div>

        {/* Max Results & Quality Floor */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group p-4 bg-black/40 border border-white/5 hover:border-white/20 rounded-xl flex flex-col relative overflow-hidden">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Layers size={12} className="text-slate-500" /> Max Results
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="bg-transparent border-b border-white/10 focus:border-neon-green outline-none text-white text-lg font-mono w-16 transition-colors"
                value={maxResults}
                onChange={e => setMaxResults(Number(e.target.value))}
                min={1}
                max={500}
              />
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-green rounded-full" 
                  style={{ width: `${Math.min((maxResults / 100) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <p className="mt-2 text-[9px] font-medium text-slate-500 uppercase tracking-widest">Extraction limit per run</p>
          </div>
          
          <div className="group p-4 bg-black/40 border border-white/5 hover:border-white/20 rounded-xl flex flex-col relative overflow-hidden">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Star size={12} className="text-slate-500" /> Quality Floor
            </label>
            <div className="relative">
              <select
                className="bg-transparent border-b border-white/10 focus:border-yellow-400 outline-none text-white text-sm font-bold w-full pb-1 transition-colors appearance-none cursor-pointer"
                value={qualityFloor}
                onChange={e => setQualityFloor(e.target.value)}
              >
                <option className="bg-[#0a0a0c]">4.0+ Stars</option>
                <option className="bg-[#0a0a0c]">4.5+ Stars</option>
                <option className="bg-[#0a0a0c]">Top Rated Only</option>
              </select>
            </div>
            <p className="mt-2 text-[9px] font-medium text-slate-500 uppercase tracking-widest">Minimum rating threshold</p>
          </div>
        </div>

        {/* Run Extraction Button */}
        <div className="mt-auto pt-4 relative">
          {isRunning && (
            <div className="absolute inset-0 bg-neon-green/20 blur-xl rounded-full" />
          )}
          <button
            disabled={isRunning || !businessType || !location}
            onClick={(e) => { e.preventDefault(); onRunExtraction(); }}
            className={clsx(
              "w-full relative group overflow-hidden flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 border",
              isRunning 
                ? "bg-[#050505] text-neon-green border-neon-green cursor-wait" 
                : (!businessType || !location)
                  ? "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed"
                  : "bg-neon-green text-black border-neon-green hover:bg-[#1fbf55] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]"
            )}
          >
            {/* Shimmer effect */}
            {(!isRunning && businessType && location) && (
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
            )}
            
            {isRunning ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Target size={18} className="text-neon-green" />
              </motion.div>
            ) : (
              <Play size={18} className="fill-current" />
            )}
            <span className="relative z-10">{isRunning ? 'Running Extraction...' : 'Run Extraction'}</span>
          </button>
        </div>

        {/* Bottom Strip */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
          <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-neon-green/70" /> Mission Ready</div>
          <div className="flex items-center gap-1.5"><MapPin size={10} className="text-blue-400/70" /> Google Places</div>
          <div className="flex items-center gap-1.5"><FileDown size={10} className="text-purple-400/70" /> CSV Output</div>
        </div>
      </div>
    </div>
  );
}
