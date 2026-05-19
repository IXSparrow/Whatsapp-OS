import React from 'react';
import { motion } from 'motion/react';
import { MapPin, FileText, Eraser, Star, MessageSquare, Instagram, Bot, Database, Search, Activity, Users, CheckCircle, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

// --- SUB-COMPONENTS ---

const GlowOrb = ({ className, color }: { className?: string, color: string }) => (
  <motion.div 
    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    className={clsx("absolute rounded-full blur-[100px] pointer-events-none -z-10", color, className)}
  />
);

const Node = ({ icon: Icon, label, color, x, y, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="absolute flex flex-col items-center gap-1.5 z-20"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
  >
    <motion.div 
      animate={{ y: [-3, 3, -3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay % 2 }}
      className={clsx(
        "w-10 h-10 rounded-xl border backdrop-blur-md flex items-center justify-center shadow-lg relative",
        color.bg, color.border, color.shadow
      )}
    >
      <Icon size={16} className={color.text} />
      <motion.div 
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay }}
        className={clsx("absolute inset-0 rounded-xl border blur-[2px] pointer-events-none", color.border)}
      />
    </motion.div>
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-white/5 backdrop-blur-sm shadow-md">
      {label}
    </span>
  </motion.div>
);

const LeadRadar = () => (
  <motion.div 
    className="absolute w-24 h-24 rounded-full border border-neon-green/10 overflow-hidden shadow-[inset_0_0_15px_rgba(57,255,20,0.05)] z-20"
    style={{ top: '6%', left: '4%' }}
  >
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border border-neon-green/5" />
      <div className="absolute w-full h-px bg-neon-green/5" />
      <div className="absolute h-full w-px bg-neon-green/5" />
      <Search size={10} className="text-neon-green/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0"
      style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(57,255,20,0.2) 100%)' }}
    />
  </motion.div>
);

const AnalyticsMiniCards = () => (
  <div className="absolute top-[4%] right-[4%] bottom-[4%] flex flex-col justify-center gap-2.5 z-30 pointer-events-none w-44">
    {[
      { label: 'Leads Found', val: '12,450', icon: Users, color: 'text-blue-400' },
      { label: 'Valid Numbers', val: '9,820', icon: CheckCircle, color: 'text-emerald-400' },
      { label: 'Outreach Sent', val: '8,400', icon: Activity, color: 'text-purple-400' },
      { label: 'Replies', val: '1,240', icon: MessageSquare, color: 'text-yellow-400' },
      { label: 'Conversion %', val: '14.8%', icon: BarChart3, color: 'text-neon-green' },
    ].map((stat, i) => (
      <motion.div 
        key={i}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card bg-black/60 border border-white/5 backdrop-blur-xl rounded-xl p-2.5 flex items-center gap-3 shadow-2xl hover:border-white/10 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <stat.icon size={12} className={stat.color} />
        </div>
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
          <div className="text-xs font-black text-white leading-none">{stat.val}</div>
        </div>
      </motion.div>
    ))}
  </div>
);

const OutreachMessageFlow = () => (
  <div className="absolute bottom-[20%] left-[45%] w-40 h-24 overflow-hidden z-20 pointer-events-none">
    {[0, 1].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40, scale: 0.8 }}
        animate={{ opacity: [0, 1, 0], y: -40, scale: [0.8, 1, 0.8] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: i * 2.2, ease: "linear" }}
        className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[9px] font-bold rounded-xl rounded-tr-sm backdrop-blur-md shadow-lg flex items-center gap-1.5"
      >
        <Bot size={10} className="shrink-0" />
        <span className="truncate">"Hi, noticed your profile..."</span>
      </motion.div>
    ))}
  </div>
);

const PipelineTimeline = () => {
  const steps = ['Discover', 'Verify', 'Personalize', 'Send', 'Track', 'Convert'];
  return (
    <div className="absolute bottom-[4%] left-[34%] -translate-x-1/2 flex items-center gap-1.5 z-30 bg-black/60 border border-white/5 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <motion.div
            animate={{ color: ['#64748b', '#39ff14', '#64748b'] }}
            transition={{ duration: steps.length * 0.8, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
            className="text-[8px] font-black uppercase tracking-widest text-slate-500"
          >
            {step}
          </motion.div>
          {i < steps.length - 1 && <span className="text-slate-700 text-[8px]">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- MAIN SCENE ---

export default function HeroAutomationScene() {
  // Optimized positioning to completely avoid overlapping the Analytics cards on the right
  const nodes = [
    { id: 'maps', label: 'Google Maps Leads', icon: MapPin, color: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]', text: 'text-emerald-400' }, x: 8, y: 30, delay: 0 },
    { id: 'csv', label: 'CSV Import', icon: FileText, color: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]', text: 'text-blue-400' }, x: 8, y: 70, delay: 0.2 },
    { id: 'cleaner', label: 'AI Cleaner', icon: Eraser, color: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]', text: 'text-purple-400' }, x: 22, y: 50, delay: 0.4 },
    { id: 'scoring', label: 'Lead Scoring', icon: Star, color: { bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]', text: 'text-yellow-400' }, x: 36, y: 50, delay: 0.6 },
    { id: 'wa', label: 'WhatsApp', icon: MessageSquare, color: { bg: 'bg-neon-green/5', border: 'border-neon-green/20', shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.1)]', text: 'text-neon-green' }, x: 50, y: 30, delay: 0.8 },
    { id: 'ig', label: 'Instagram DM', icon: Instagram, color: { bg: 'bg-pink-500/5', border: 'border-pink-500/20', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.1)]', text: 'text-pink-400' }, x: 50, y: 50, delay: 1.0 },
    { id: 'followup', label: 'Follow-up', icon: Bot, color: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]', text: 'text-blue-400' }, x: 50, y: 70, delay: 1.2 },
    { id: 'crm', label: 'CRM Saved', icon: Database, color: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.1)]', text: 'text-indigo-400' }, x: 64, y: 50, delay: 1.4 },
  ];

  return (
    <div className="relative w-full h-full min-h-[480px] overflow-hidden flex items-center justify-center">
      <GlowOrb className="w-[350px] h-[350px] bg-blue-500/5 top-[10%] left-[10%]" color="bg-blue-500/5" />
      <GlowOrb className="w-[280px] h-[280px] bg-neon-green/5 bottom-[10%] left-[40%]" color="bg-neon-green/5" />
      <GlowOrb className="w-[300px] h-[300px] bg-purple-500/5 top-[30%] right-[30%]" color="bg-purple-500/5" />

      <LeadRadar />
      
      {/* Node & SVG Connection Container */}
      <div className="absolute inset-0 z-10 w-full h-full">
        {nodes.map(n => <Node key={n.id} {...n} />)}

        {/* Data Particle Lines - Beautiful flowing lines */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none">
          {/* maps to cleaner */}
          <path d="M 8 30 C 15 30, 15 50, 22 50" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="0.15" />
          <motion.path d="M 8 30 C 15 30, 15 50, 22 50" fill="none" stroke="#10b981" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} style={{ filter: 'drop-shadow(0 0 2px #10b981)' }} />
          
          {/* csv to cleaner */}
          <path d="M 8 70 C 15 70, 15 50, 22 50" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.15" />
          <motion.path d="M 8 70 C 15 70, 15 50, 22 50" fill="none" stroke="#3b82f6" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 0.4 }} style={{ filter: 'drop-shadow(0 0 2px #3b82f6)' }} />

          {/* cleaner to scoring */}
          <path d="M 22 50 L 36 50" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="0.15" />
          <motion.path d="M 22 50 L 36 50" fill="none" stroke="#a855f7" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 0.8 }} style={{ filter: 'drop-shadow(0 0 2px #a855f7)' }} />

          {/* scoring to wa */}
          <path d="M 36 50 C 43 50, 43 30, 50 30" fill="none" stroke="rgba(234,179,8,0.1)" strokeWidth="0.15" />
          <motion.path d="M 36 50 C 43 50, 43 30, 50 30" fill="none" stroke="#eab308" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.2 }} style={{ filter: 'drop-shadow(0 0 2px #eab308)' }} />

          {/* scoring to ig */}
          <path d="M 36 50 L 50 50" fill="none" stroke="rgba(234,179,8,0.1)" strokeWidth="0.15" />
          <motion.path d="M 36 50 L 50 50" fill="none" stroke="#eab308" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 1.4 }} style={{ filter: 'drop-shadow(0 0 2px #eab308)' }} />

          {/* scoring to followup */}
          <path d="M 36 50 C 43 50, 43 70, 50 70" fill="none" stroke="rgba(234,179,8,0.1)" strokeWidth="0.15" />
          <motion.path d="M 36 50 C 43 50, 43 70, 50 70" fill="none" stroke="#eab308" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.6 }} style={{ filter: 'drop-shadow(0 0 2px #eab308)' }} />

          {/* wa to crm */}
          <path d="M 50 30 C 57 30, 57 50, 64 50" fill="none" stroke="rgba(57,255,20,0.1)" strokeWidth="0.15" />
          <motion.path d="M 50 30 C 57 30, 57 50, 64 50" fill="none" stroke="#39ff14" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 2.0 }} style={{ filter: 'drop-shadow(0 0 2px #39ff14)' }} />

          {/* ig to crm */}
          <path d="M 50 50 L 64 50" fill="none" stroke="rgba(236,72,153,0.1)" strokeWidth="0.15" />
          <motion.path d="M 50 50 L 64 50" fill="none" stroke="#ec4899" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 2.2 }} style={{ filter: 'drop-shadow(0 0 2px #ec4899)' }} />

          {/* followup to crm */}
          <path d="M 50 70 C 57 70, 57 50, 64 50" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.15" />
          <motion.path d="M 50 70 C 57 70, 57 50, 64 50" fill="none" stroke="#3b82f6" strokeWidth="0.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 2.4 }} style={{ filter: 'drop-shadow(0 0 2px #3b82f6)' }} />
        </svg>
      </div>

      <AnalyticsMiniCards />
      <OutreachMessageFlow />
      <PipelineTimeline />
    </div>
  );
}
