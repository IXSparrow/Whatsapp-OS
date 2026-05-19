import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  FileText, 
  Eraser, 
  Star, 
  MessageSquare, 
  Instagram, 
  Bot, 
  Database, 
  Search, 
  Activity, 
  Users, 
  CheckCircle, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Globe, 
  Terminal, 
  Radio 
} from 'lucide-react';
import clsx from 'clsx';

// --- SUB-COMPONENTS ---

const GlowOrb = ({ className, color }: { className?: string, color: string }) => (
  <motion.div 
    animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className={clsx("absolute rounded-full blur-[100px] pointer-events-none -z-10", color, className)}
  />
);

interface NodeProps {
  icon: any;
  label: string;
  color: any;
  x: number;
  y: number;
  delay: number;
  isActive: boolean;
  mousePos: { x: number, y: number };
  onClick?: (e: React.MouseEvent) => void;
}

const Node = ({ icon: Icon, label, color, x, y, delay, isActive, mousePos, onClick }: NodeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="absolute flex flex-col items-center gap-1.5 z-20 cursor-pointer"
    style={{ 
      left: `${x}%`, 
      top: `${y}%`, 
      transform: 'translate(-50%, -50%)',
      x: mousePos.x * 0.8,
      y: mousePos.y * 0.8,
      transition: 'transform 0.1s ease-out'
    }}
    onClick={onClick}
  >
    <motion.div 
      animate={{ y: isActive ? [-4, 4, -4] : [-2, 2, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay % 2 }}
      className={clsx(
        "w-12 h-12 rounded-2xl border backdrop-blur-md flex items-center justify-center shadow-lg relative transition-all duration-500",
        isActive 
          ? "bg-white/10 border-white/30 scale-110 shadow-[0_0_25px_rgba(255,255,255,0.15)]" 
          : "bg-black/60 border-white/5 shadow-black/40",
        color.bg, color.border, color.shadow
      )}
    >
      <Icon size={18} className={clsx("transition-colors duration-500", isActive ? "text-white" : color.text)} />
      
      {/* Dynamic Pulse Ring around active nodes */}
      {isActive && (
        <motion.div 
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={clsx("absolute inset-[-4px] rounded-2xl border blur-[2px] pointer-events-none", color.border)}
        />
      )}
      
      <motion.div 
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay }}
        className={clsx("absolute inset-0 rounded-2xl border blur-[3px] pointer-events-none", color.border)}
      />
    </motion.div>
    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-black/90 px-2 py-0.5 rounded-lg border border-white/5 backdrop-blur-sm shadow-md">
      {label}
    </span>
  </motion.div>
);

interface HeroAutomationDashboardProps {
  onLaunch?: (mode: 'lead_engine' | 'ai_whatsapp' | 'crm') => void;
}

export default function HeroAutomationDashboard({ onLaunch }: HeroAutomationDashboardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const logsIndex = useRef(0);

  const goToCRM = () => {
    if (onLaunch) onLaunch('crm');
  };

  const logsPool = [
    'SYSTEM INITIALIZATION ACTIVE...',
    'LEAD_AGENT: Scraping Maps: 242/sec',
    'CLEAN_AGENT: Removing invalid leads',
    'CLEAN_AGENT: Normalized +45 numbers',
    'AI_SCORE_AGENT: Assigning cognitive scores',
    'AI_SCORE_AGENT: High scoring confidence verified',
    'OUTREACH_AGENT: Queueing WhatsApp outreach',
    'OUTREACH_AGENT: Personalized segment built',
    'REPLY_AGENT: Parsing customer reply...',
    'REPLY_AGENT: Booking match found, syncing...',
    'CRM_AGENT: Hubspot sync complete [Secure Tunnel]',
    'GLOBAL PIPELINE RUNNING: 100% OK'
  ];

  // Mouse Reactive Parallax Depth Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x: x * 12, y: y * 12 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Autonomous Scene Evolution: Cycle active step every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 8);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Futuristic Terminal Typewriter Feed
  useEffect(() => {
    const logInterval = setInterval(() => {
      setTerminalLogs((prev) => {
        const nextLog = logsPool[logsIndex.current];
        logsIndex.current = (logsIndex.current + 1) % logsPool.length;
        const newLogs = [...prev, nextLog];
        if (newLogs.length > 5) newLogs.shift();
        return newLogs;
      });
    }, 2800);
    return () => clearInterval(logInterval);
  }, []);

  const nodes = [
    { id: 'maps', label: 'Lead Find', icon: MapPin, color: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', text: 'text-emerald-400' }, x: 6, y: 32, delay: 0 },
    { id: 'csv', label: 'CSV Import', icon: FileText, color: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', text: 'text-blue-400' }, x: 6, y: 68, delay: 0.2 },
    { id: 'cleaner', label: 'AI Clean', icon: Eraser, color: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', text: 'text-purple-400' }, x: 19, y: 50, delay: 0.4 },
    { id: 'scoring', label: 'Score', icon: Star, color: { bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]', text: 'text-yellow-400' }, x: 32, y: 50, delay: 0.6 },
    { id: 'wa', label: 'WhatsApp', icon: MessageSquare, color: { bg: 'bg-neon-green/5', border: 'border-neon-green/20', shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.15)]', text: 'text-neon-green' }, x: 45, y: 32, delay: 0.8 },
    { id: 'ig', label: 'Instagram DM', icon: Instagram, color: { bg: 'bg-pink-500/5', border: 'border-pink-500/20', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]', text: 'text-pink-400' }, x: 45, y: 50, delay: 1.0 },
    { id: 'followup', label: 'Reply', icon: Bot, color: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', text: 'text-blue-400' }, x: 45, y: 68, delay: 1.2 },
    { id: 'crm', label: 'CRM Sync', icon: Database, color: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]', text: 'text-indigo-400' }, x: 58, y: 50, delay: 1.4 },
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={goToCRM}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToCRM();
      }}
      aria-label="Open CRM Dashboard"
      title="Click anywhere to open CRM Dashboard"
      className="lower-neural-workflow-section"
    >
      {/* Slowly translating and sliding animated background grid */}
      <div 
        className="absolute inset-0 bg-grid opacity-[0.25] pointer-events-none"
        style={{ 
          transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0)`,
          transition: 'transform 0.15s ease-out'
        }}
      />

      {/* Luxury Atmos fog spot mesh */}
      <GlowOrb className="w-[500px] h-[500px] bg-blue-500/5 top-[-10%] left-[-5%]" color="bg-blue-500/5" />
      <GlowOrb className="w-[450px] h-[450px] bg-neon-green/5 bottom-[-10%] left-[20%]" color="bg-neon-green/5" />
      <GlowOrb className="w-[400px] h-[400px] bg-purple-500/5 top-[15%] right-[20%]" color="bg-purple-500/5" />

      {/* Global geographic network visualization paths */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0">
        <circle cx="20%" cy="15%" r="1" fill="#fff" />
        <circle cx="80%" cy="20%" r="1" fill="#fff" />
        <circle cx="90%" cy="75%" r="1" fill="#fff" />
        <circle cx="15%" cy="85%" r="1" fill="#fff" />
        <path d="M 20% 15% Q 50% 10% 80% 20%" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3 3" />
        <path d="M 80% 20% Q 85% 50% 90% 75%" fill="none" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="3 3" />
        <path d="M 15% 85% Q 35% 80% 58% 50%" fill="none" stroke="#25D366" strokeWidth="0.5" strokeDasharray="3 3" />
      </svg>

      {/* 2. CENTRAL HOLOGRAPHIC AI CORE */}
      <motion.div 
        className="absolute z-10 p-5 rounded-full border border-white/10 backdrop-blur-2xl bg-black/60 shadow-[0_0_50px_rgba(59,130,246,0.25)] flex flex-col items-center justify-center cursor-pointer"
        style={{ 
          left: '32%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)',
          x: mousePos.x * 0.9,
          y: mousePos.y * 0.9,
          transition: 'transform 0.1s ease-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        <div className="w-16 h-16 rounded-full relative flex items-center justify-center overflow-hidden">
          {/* Rotating AI Core gradients */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #60a5fa 0%, #a855f7 35%, #25d366 70%, #60a5fa 100%)' }}
          />
          <div className="absolute inset-1.5 bg-black rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={22} className="text-white animate-pulse" />
          </div>
        </div>
        {/* Soft breathing ring */}
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-10px] rounded-full border border-blue-500/20 blur-[2px] pointer-events-none"
        />
        <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest mt-2 whitespace-nowrap">AI Neural Core</span>
      </motion.div>

      {/* Mini Radar Scanning Sweep */}
      <div 
        className="absolute w-24 h-24 rounded-full border border-neon-green/10 overflow-hidden shadow-[inset_0_0_20px_rgba(57,255,20,0.05)] z-20 pointer-events-none"
        style={{ top: '8%', left: '4%' }}
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
          style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(57,255,20,0.25) 100%)' }}
        />
      </div>

      {/* Realtime AI Activity Ticker */}
      <div 
        className="absolute top-[6%] left-[28%] -translate-x-1/2 w-52 bg-black/75 border border-white/5 backdrop-blur-xl rounded-2xl p-3 z-20 shadow-2xl cursor-pointer"
        style={{
          x: mousePos.x * 0.7,
          y: mousePos.y * 0.7,
          transition: 'transform 0.12s ease-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Automation Stream</span>
          </div>
          <Sparkles size={9} className="text-purple-400 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          {logsPool.slice(activeStep, activeStep + 2).map((act, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[8px] font-black text-slate-300 leading-normal flex items-start gap-1"
            >
              <span className="shrink-0 text-neon-green">›</span>
              <span className="truncate">{act}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Assistant Wave Orb */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[8%] left-[45%] -translate-x-1/2 p-2.5 rounded-xl border border-white/5 backdrop-blur-xl bg-black/70 flex items-center gap-2 z-20 cursor-pointer shadow-2xl"
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 relative flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500 rounded-full"
          />
        </div>
        <div className="flex gap-0.5 items-end h-3">
          {[0, 1, 2, 1, 0, 2, 0].map((h, i) => (
            <motion.div 
              key={i}
              animate={{ height: ['2px', `${h * 4 + 2}px`, '2px'] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              className="w-[2px] bg-blue-400 rounded-full"
            />
          ))}
        </div>
        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Nexus AI</span>
      </motion.div>

      {/* Node Connection SVG */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        {nodes.map((n, idx) => (
          <Node 
            key={n.id} 
            {...n} 
            isActive={idx === activeStep}
            mousePos={mousePos}
            onClick={(e) => {
              e.stopPropagation();
              goToCRM();
            }}
          />
        ))}

        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none">
          {/* maps to cleaner */}
          <path d="M 6 32 C 12 32, 12 50, 19 50" fill="none" stroke="rgba(16,185,129,0.05)" strokeWidth="0.15" />
          <motion.path d="M 6 32 C 12 32, 12 50, 19 50" fill="none" stroke="#10b981" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} style={{ filter: 'drop-shadow(0 0 2px #10b981)' }} />
          
          {/* csv to cleaner */}
          <path d="M 6 68 C 12 68, 12 50, 19 50" fill="none" stroke="rgba(59,130,246,0.05)" strokeWidth="0.15" />
          <motion.path d="M 6 68 C 12 68, 12 50, 19 50" fill="none" stroke="#3b82f6" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 0.4 }} style={{ filter: 'drop-shadow(0 0 2px #3b82f6)' }} />

          {/* cleaner to scoring */}
          <path d="M 19 50 L 32 50" fill="none" stroke="rgba(168,85,247,0.05)" strokeWidth="0.15" />
          <motion.path d="M 19 50 L 32 50" fill="none" stroke="#a855f7" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 0.8 }} style={{ filter: 'drop-shadow(0 0 2px #a855f7)' }} />

          {/* Core fiber connections leading outwards to Outreach Nodes */}
          <path d="M 32 50 C 39 50, 39 32, 45 32" fill="none" stroke="rgba(234,179,8,0.05)" strokeWidth="0.15" />
          <motion.path d="M 32 50 C 39 50, 39 32, 45 32" fill="none" stroke="#eab308" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.2 }} style={{ filter: 'drop-shadow(0 0 2px #eab308)' }} />

          <path d="M 32 50 L 45 50" fill="none" stroke="rgba(234,179,8,0.05)" strokeWidth="0.15" />
          <motion.path d="M 32 50 L 45 50" fill="none" stroke="#eab308" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 1.4 }} style={{ filter: 'drop-shadow(0 0 2px #eab308)' }} />

          <path d="M 32 50 C 39 50, 39 68, 45 68" fill="none" stroke="rgba(234,179,8,0.05)" strokeWidth="0.15" />
          <motion.path d="M 32 50 C 39 50, 39 68, 45 68" fill="none" stroke="#eab308" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.6 }} style={{ filter: 'drop-shadow(0 0 2px #eab308)' }} />

          {/* Outreach to CRM (WhatsApp path) */}
          <path d="M 45 32 C 51 32, 51 50, 58 50" fill="none" stroke="rgba(57,255,20,0.05)" strokeWidth="0.15" />
          <motion.path d="M 45 32 C 51 32, 51 50, 58 50" fill="none" stroke="#39ff14" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 2.0 }} style={{ filter: 'drop-shadow(0 0 2px #39ff14)' }} />

          {/* Outreach to CRM (Instagram path) */}
          <path d="M 45 50 L 58 50" fill="none" stroke="rgba(236,72,153,0.05)" strokeWidth="0.15" />
          <motion.path d="M 45 50 L 58 50" fill="none" stroke="#ec4899" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.15, pathOffset: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 2.2 }} style={{ filter: 'drop-shadow(0 0 2px #ec4899)' }} />

          {/* Secure Encrypted Tunnel to CRM */}
          <path d="M 45 68 C 51 68, 51 50, 58 50" fill="none" stroke="rgba(59,130,246,0.05)" strokeWidth="0.15" />
          <motion.path d="M 45 68 C 51 68, 51 50, 58 50" fill="none" stroke="#3b82f6" strokeWidth="0.45" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 0.1, pathOffset: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 2.4 }} style={{ filter: 'drop-shadow(0 0 2px #3b82f6)' }} />
        </svg>
      </div>

      {/* 3. REALTIME STATS / ANALYTICS MINI WINDOWS */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 right-[4%] flex flex-col gap-3 z-30 pointer-events-none w-44"
        style={{
          transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)`,
          transition: 'transform 0.12s ease-out'
        }}
      >
        {[
          { label: 'Leads Found', val: '12,450', icon: Users, color: 'text-blue-400' },
          { label: 'Valid Leads', val: '9,820', icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Messages Sent', val: '8,400', icon: Activity, color: 'text-purple-400' },
          { label: 'Conversion', val: '14.8%', icon: BarChart3, color: 'text-neon-green' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card bg-black/85 border border-white/5 backdrop-blur-xl rounded-xl p-2.5 flex items-center gap-3 shadow-2xl cursor-pointer pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              goToCRM();
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <stat.icon size={12} className={stat.color} />
            </div>
            <div>
              <div className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
              <div className="text-xs font-black text-white leading-none">{stat.val}</div>
            </div>
          </motion.div>
        ))}

        {/* Small floating SVG graph */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card bg-black/85 border border-white/5 backdrop-blur-xl rounded-xl p-2.5 shadow-2xl h-16 w-full cursor-pointer pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            goToCRM();
          }}
        >
          <div className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Outreach Curve</div>
          <svg className="w-full h-8 pointer-events-none">
            <motion.path 
              d="M0,28 Q10,10 25,22 T55,5 T80,20 L120,5" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Floating Lead Profile Preview Card */}
      <motion.div 
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[8%] right-[22%] p-3 rounded-xl border border-white/5 bg-black/80 backdrop-blur-xl shadow-2xl z-20 w-48 cursor-pointer"
        style={{
          transform: `translate3d(${mousePos.x * 1.1}px, ${mousePos.y * 1.1}px, 0)`,
          transition: 'transform 0.1s ease-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[6.5px] font-black text-blue-400 uppercase tracking-widest">Lead Profile Stream</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
        </div>
        <div className="text-[10px] font-black text-white truncate">Sarah Jenkins</div>
        <div className="text-[8px] text-slate-400 leading-tight truncate">CEO @ CloudScale Dynamics</div>
        <div className="flex items-center gap-1.5 mt-2 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[7px] text-emerald-400 font-bold w-max">
          <CheckCircle size={8} /> Verified Phone
        </div>
      </motion.div>

      {/* Floating Hubspot CRM Sync Card */}
      <motion.div 
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[8%] right-[22%] p-3 rounded-xl border border-white/5 bg-black/80 backdrop-blur-xl shadow-2xl z-20 w-48 cursor-pointer"
        style={{
          transform: `translate3d(${mousePos.x * 1.15}px, ${mousePos.y * 1.15}px, 0)`,
          transition: 'transform 0.15s ease-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[6.5px] font-black text-indigo-400 uppercase tracking-widest">Enterprise CRM integration</span>
          <Lock size={8} className="text-slate-500" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <ShieldCheck size={12} />
          </div>
          <div>
            <div className="text-[9px] font-black text-white leading-none">Hubspot Synced</div>
            <div className="text-[7px] text-slate-500 mt-0.5">Encrypted tunnel live</div>
          </div>
        </div>
      </motion.div>

      {/* Floating Outreach Chat Bubbles */}
      <div className="absolute bottom-[20%] left-[36%] w-40 h-20 overflow-hidden z-20 pointer-events-none">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], y: -40, scale: [0.8, 1, 0.8] }}
            transition={{ duration: 5, repeat: Infinity, delay: i * 2.5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[8.5px] font-bold rounded-2xl rounded-tr-sm backdrop-blur-md shadow-lg flex items-center gap-1"
          >
            <Bot size={10} className="shrink-0 animate-pulse" />
            <span className="truncate">"Hi Jenkins, love your tech stack..."</span>
          </motion.div>
        ))}
      </div>

      {/* Terminal System Exec Logs (Bottom-Left Widescreen Console) */}
      <div 
        className="absolute bottom-[6%] left-[4%] w-60 bg-black/85 border border-white/5 backdrop-blur-xl rounded-2xl p-3 shadow-2xl z-20 cursor-pointer"
        style={{
          transform: `translate3d(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px, 0)`,
          transition: 'transform 0.12s ease-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Terminal size={10} className="text-blue-400" />
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Neural OS Shell</span>
          </div>
          <span className="text-[6.5px] text-slate-500 font-mono">dev@nexus-core</span>
        </div>
        <div className="space-y-1 font-mono text-[7px] text-slate-400 leading-tight">
          {terminalLogs.map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }}
              className="truncate"
            >
              <span className="text-blue-500">$</span> {log}
            </motion.div>
          ))}
          <div className="flex items-center gap-0.5">
            <span className="text-blue-500">$</span>
            <span className="w-1 h-2 bg-blue-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Pipeline Status Flow Timeline */}
      <div 
        className="absolute bottom-[4%] left-[30%] -translate-x-1/2 flex items-center gap-1.5 z-30 bg-black/80 border border-white/5 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
      >
        {['Find', 'Clean', 'Score', 'Outreach', 'Reply', 'CRM'].map((step, i) => (
          <React.Fragment key={i}>
            <motion.div
              animate={{ color: i === activeStep % 6 ? '#39ff14' : '#64748b' }}
              transition={{ duration: 0.5 }}
              className="text-[8px] font-black uppercase tracking-widest"
            >
              {step}
            </motion.div>
            {i < 5 && <span className="text-slate-700 text-[8px]">→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Floating interactive tooltip hint */}
      <div className="crm-floating-hint">
        Click anywhere to open CRM Dashboard
      </div>

      {/* Premium Centered 3D CRM Agent Button */}
      <button
        className="crm-agent-cta"
        onClick={(e) => {
          e.stopPropagation();
          goToCRM();
        }}
        aria-label="Open CRM Dashboard"
        title="Open CRM Dashboard"
      >
        <span className="crm-agent-orb"></span>
        <span>CRM Agent</span>
        <span>→</span>
      </button>
    </div>
  );
}
