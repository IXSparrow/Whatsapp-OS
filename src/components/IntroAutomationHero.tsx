import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Search, 
  Sparkles, 
  Target, 
  MessageSquare, 
  Database, 
  Cpu, 
  ArrowRight, 
  ChevronDown, 
  Bot, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import clsx from 'clsx';

// Shared Glow Orb
const GlowOrb = ({ className, color }: { className?: string, color: string }) => (
  <motion.div 
    animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className={clsx("absolute rounded-full blur-3xl pointer-events-none -z-10", color, className)}
  />
);

export default function IntroAutomationHero() {
  const pipelineSteps = [
    { id: 'search', label: 'Lead Search', icon: Search, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]', x: '10%', y: '15%' },
    { id: 'clean', label: 'Data Clean', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-[0_0_20px_rgba(96,165,250,0.15)]', x: '35%', y: '10%' },
    { id: 'score', label: 'AI Score', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.15)]', x: '60%', y: '25%' },
    { id: 'personalize', label: 'Personalize', icon: Cpu, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.15)]', x: '45%', y: '50%' },
    { id: 'outreach', label: 'Outreach', icon: MessageSquare, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20', glow: 'shadow-[0_0_20px_rgba(37,211,102,0.15)]', x: '75%', y: '55%' },
    { id: 'replies', label: 'Replies', icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]', x: '55%', y: '80%' },
    { id: 'crm', label: 'CRM Sync', icon: Database, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.15)]', x: '25%', y: '75%' },
  ];

  return (
    <section className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden z-40 py-20 px-6 lg:px-20 border-b border-white/5">
      {/* Background Ambience Orbs */}
      <GlowOrb className="w-[500px] h-[500px] top-[-10%] right-[10%] bg-blue-500/5" color="bg-blue-500/5" />
      <GlowOrb className="w-[450px] h-[450px] bottom-[-10%] left-[5%] bg-neon-green/5" color="bg-neon-green/5" />
      <GlowOrb className="w-[400px] h-[400px] top-[30%] left-[40%] bg-purple-500/5" color="bg-purple-500/5" />

      {/* Subtle Background Grid overlay */}
      <div 
        className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" 
        style={{ 
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)' 
        }} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto w-full items-center z-10 relative">
        {/* Left Column: Typography, Tagline, CTAs */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <Zap size={14} className="text-neon-green fill-neon-green animate-pulse" />
              <span className="text-[10px] font-black text-slate-300 tracking-[0.25em] uppercase">Enterprise Autonomous Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tighter">
              The Autonomous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-neon-green">
                Pipeline OS
              </span>
            </h1>

            <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-xl">
              Orchestrate prospect discovery, intelligent cleaning, predictive lead scoring, and automated WhatsApp outreach with conversational AI in a unified luxury operating canvas.
            </p>
          </motion.div>

          {/* Core Interactive Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={() => {
                document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl overflow-hidden hover:scale-105 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-neon-green opacity-0 group-hover:opacity-10 transition-opacity" />
              Launch Workspace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white/5 text-white font-bold uppercase tracking-widest text-xs rounded-2xl border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
            >
              Explore Pipeline
            </button>
          </motion.div>
        </div>

        {/* Right Column: Live Cinematic Flow & Story Map */}
        <div className="lg:col-span-7 w-full h-[500px] lg:h-[620px] relative rounded-3xl border border-white/5 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
          {/* Radar Scan overlaying the search node background */}
          <div className="absolute top-[8%] left-[5%] w-36 h-36 border border-emerald-500/10 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-emerald-500/5" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 origin-center"
              style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(52,211,153,0.15) 100%)' }}
            />
          </div>

          {/* Connecting SVG Flow lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="intro-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="30%" stopColor="#60a5fa" />
                <stop offset="60%" stopColor="#c084fc" />
                <stop offset="85%" stopColor="#25D366" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            {/* Background connection line path */}
            <motion.path 
              d="M 60,95 Q 110,70 215,65 T 375,150 T 285,310 T 475,340 T 345,495 T 160,465"
              fill="none" 
              stroke="rgba(255, 255, 255, 0.05)" 
              strokeWidth="2.5" 
            />
            {/* Animated glowing particles path */}
            <motion.path 
              d="M 60,95 Q 110,70 215,65 T 375,150 T 285,310 T 475,340 T 345,495 T 160,465"
              fill="none" 
              stroke="url(#intro-flow-grad)" 
              strokeWidth="3.5" 
              strokeDasharray="15 60"
              animate={{ strokeDashoffset: -200 }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Floating Live Pipeline Nodes */}
          {pipelineSteps.map((node, index) => {
            const IconComponent = node.icon;
            return (
              <motion.div
                key={node.id}
                className={clsx(
                  "absolute z-10 p-3.5 rounded-2xl bg-black/80 backdrop-blur-xl border flex flex-col items-center gap-1.5 cursor-pointer group transition-all duration-300",
                  node.border,
                  node.glow
                )}
                style={{ left: node.x, top: node.y }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -6, scale: 1.05, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", node.bg, node.color)}>
                  <IconComponent size={20} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                  {node.label}
                </span>
              </motion.div>
            );
          })}

          {/* Floating Premium Analytics Cards */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] right-[6%] p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl z-20 shadow-2xl w-40"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Cognitive Score</span>
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            </div>
            <div className="text-xl font-black text-white">99.4%</div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" style={{ width: '99.4%' }} />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[35%] left-[4%] p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl z-20 shadow-2xl w-40"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Activity size={12} className="text-blue-400" />
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Active Scan Rate</span>
            </div>
            <div className="text-lg font-black text-white">242 leads<span className="text-xs text-blue-400 font-normal">/sec</span></div>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[5%] right-[8%] p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl z-20 shadow-2xl w-48"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={12} className="text-neon-green" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Agent Conversions</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>Leads Replied</span>
                <span className="text-white font-black">1,842</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>Auto-Booked</span>
                <span className="text-neon-green font-black">+23%</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Message Bubbles next to Outreach/Replies */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], y: [-15, -45], scale: [0.8, 1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
            className="absolute top-[48%] right-[22%] px-3 py-1.5 bg-neon-green/10 border border-neon-green/20 text-neon-green text-[8px] font-black uppercase tracking-wider rounded-xl rounded-tr-sm backdrop-blur-md shadow-2xl z-30"
          >
            Hi! Interested...
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], y: [-15, -45], scale: [0.8, 1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[32%] px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-wider rounded-xl rounded-tl-sm backdrop-blur-md shadow-2xl z-30"
          >
            Agent booking...
          </motion.div>
        </div>
      </div>

      {/* Cinematic scroll down prompt at the absolute bottom */}
      <motion.div 
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer z-10"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Scroll to Explore</span>
        <ChevronDown size={14} className="text-slate-500" />
      </motion.div>
    </section>
  );
}
