import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Sliders, 
  ShieldCheck, 
  Key, 
  CreditCard, 
  CheckCircle, 
  Sun, 
  Moon, 
  Copy, 
  Check, 
  Sparkles,
  Mail,
  Lock,
  Cpu,
  Compass,
  Activity,
  Server,
  Terminal as TerminalIcon,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

type TabId = 'account' | 'theme' | 'automation' | 'privacy' | 'api' | 'billing';

// Isometric holographic rotating 3D OS Core Logo symbol
function NeuralCoreLogo() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0 group">
      {/* Outer spinning dash rings */}
      <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_8s_linear_infinite]" />
      <div className="absolute inset-1.5 rounded-full border border-[var(--accent)]/10 animate-[spin_12s_linear_infinite_reverse]" style={{ borderColor: 'var(--accent-soft)' }} />
      <div className="absolute inset-3 rounded-full border-2 border-dashed border-[var(--accent)] animate-[spin_6s_linear_infinite]" style={{ borderColor: 'var(--accent)' }} />
      
      {/* Floating 3D Isometric Cube skeletal icon */}
      <svg className="w-5 h-5 animate-pulse relative z-10" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" strokeWidth="1.8">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" strokeLinejoin="round" />
        <path d="M2 7v10" />
        <path d="M12 12v10" />
        <path d="M22 7v10" />
      </svg>
    </div>
  );
}

// Interactive Premium Magnet Save Button
interface MagnetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

function MagnetButton({ children, className, ...props }: MagnetButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 120, damping: 12 });
  const springY = useSpring(y, { stiffness: 120, damping: 12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX * 0.25);
    y.set(mouseY * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "relative overflow-hidden group transition-all duration-300 outline-none select-none cursor-pointer border rounded-2xl font-mono font-black uppercase tracking-widest text-[9.5px] py-4 px-8",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

// Live updating Server Telemetry SVG Wave Graph
function LiveTelemetryGraph() {
  const [points, setPoints] = useState<number[]>([40, 50, 35, 60, 45, 70, 55, 65, 50, 60]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPoints(prev => {
        const next = [...prev.slice(1)];
        const rand = 30 + Math.floor(Math.random() * 45);
        next.push(rand);
        return next;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 30} ${80 - p}`).join(' ');
  const areaD = `${pathD} L 270 80 L 0 80 Z`;

  return (
    <div className="relative mt-2 overflow-hidden w-full h-16">
      <svg viewBox="0 0 270 80" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path 
          d={areaD} 
          fill="url(#waveGrad)"
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
        <motion.path 
          d={pathD} 
          stroke="var(--accent)" 
          strokeWidth="1.5" 
          fill="none"
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
        <circle cx="270" cy={80 - points[points.length - 1]} r="3.5" style={{ fill: 'var(--accent)' }} className="animate-ping" />
        <circle cx="270" cy={80 - points[points.length - 1]} r="2" style={{ fill: 'var(--accent)' }} />
      </svg>
    </div>
  );
}

// Concentric target sweep AI Radar scanner widget
function CyberRadarWidget() {
  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-[var(--accent)]/15 transition-colors">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
        <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Compass size={12} className="animate-[spin_4s_linear_infinite]" style={{ color: 'var(--accent)' }} /> RADAR SCANNER // TARGET GATE
        </span>
        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }} />
      </div>

      <div className="h-32 flex items-center justify-center relative">
        {/* Radar Concentric Rings */}
        <div className="absolute w-28 h-28 rounded-full border border-white/5 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-white/5" />
          </div>
        </div>

        {/* Radar Crosshairs */}
        <div className="absolute w-28 h-px bg-white/5" />
        <div className="absolute h-28 w-px bg-white/5" />

        {/* Rotating sweep cone beam */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-28 rounded-full origin-center pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 65%, var(--accent-glow) 100%)'
          }}
        />

        {/* Interactive pulsing targets */}
        <div className="absolute top-[25%] left-[30%] w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
        <div className="absolute bottom-[30%] right-[25%] w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }} />
        <div className="absolute top-[55%] right-[40%] w-1 h-1 rounded-full bg-slate-600" />
      </div>

      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mt-2 border-t border-white/5 pt-2">
        <span>SWEEP ANGLE: <span className="text-white font-bold">294.5°</span></span>
        <span>OBJECTS DETECTED: <span className="text-white font-bold">2 ACTIVE</span></span>
      </div>
    </div>
  );
}

// Live Online cognitive agent statuses
function LiveAgentActivityWidget() {
  const agents = [
    { name: 'LEAD_SCRAPER_CORE', role: 'Scraping B2B', status: 'active', speed: '24 l/s' },
    { name: 'COGNITIVE_CLEANER', role: 'Normalizing', status: 'standby', speed: '0 l/s' },
    { name: 'WHATSAPP_BROADCAST', role: 'Sending API', status: 'active', speed: '1 msg/s' }
  ];

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-[var(--accent)]/15 transition-colors">
      <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block border-b border-white/5 pb-2">
        NEURAL AGENT FLOWS
      </span>

      <div className="space-y-2.5">
        {agents.map((agent, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", agent.status === 'active' ? "bg-emerald-400" : "bg-slate-500")} />
                <span className={clsx("relative inline-flex rounded-full h-2 w-2", agent.status === 'active' ? "bg-emerald-500" : "bg-slate-600")} />
              </span>
              <div>
                <div className="text-[9px] font-mono font-black text-white">{agent.name}</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-wide mt-0.5">{agent.role}</div>
              </div>
            </div>
            <span className="text-[8px] font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 shrink-0">{agent.speed}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme: themeMode, accent: accentColor, customAccent, setTheme: setThemeMode, setAccent: setAccentColor, setCustomAccent, saveThemeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem('nexus_settings_active_tab');
    return (saved as TabId) || 'account';
  });
  const [isSaved, setIsSaved] = useState(false);
  const [hexInput, setHexInput] = useState(customAccent);
  const [hexError, setHexError] = useState('');
  const [aiConfidence, setAiConfidence] = useState(85);
  const [notifications, setNotifications] = useState({ email: true, push: true, webhook: false });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Mouse Reactive Spotlight Coordinates
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem('nexus_settings_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setHexInput(customAccent);
  }, [customAccent]);

  const mockApiKey = 'sk_live_51NxOS_neural_auth_9029a8f4c1e283b1029c';

  const tabs = [
    { id: 'account', label: 'Identity Node', icon: User, desc: 'Personal details & authentication' },
    { id: 'theme', label: 'Theme Engine', icon: Sliders, desc: 'Color palettes & workspace glow' },
    { id: 'automation', label: 'AI Gate Control', icon: Sparkles, desc: 'Confidence slider thresholds' },
    { id: 'privacy', label: 'Security Matrix', icon: ShieldCheck, desc: '2FA rules & credentials' },
    { id: 'api', label: 'API Credentials', icon: Key, desc: 'Secret keys & webhooks' },
    { id: 'billing', label: 'System Licensing', icon: CreditCard, desc: 'Quota limit details' },
  ];

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleSaveChanges = () => {
    saveThemeConfig();
    setIsSaved(true);
    setShowToast(true);
    setTimeout(() => {
      setIsSaved(false);
      setShowToast(false);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-[#020204] text-slate-200 py-24 px-6 lg:px-12 z-20 relative select-none overflow-x-hidden transition-colors duration-300">
      
      {/* CINEMATIC AI BACKGROUND SYSTEM */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 select-none">
        {/* Spot ambient glows linked to selected accents */}
        <div className="absolute top-[-10%] left-[20%] w-[65vw] h-[55vh] blur-[120px] rounded-full animate-[pulse_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[55vw] h-[50vh] blur-[110px] rounded-full animate-[pulse_14s_ease-in-out_infinite_2s]" style={{ background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 60%)' }} />

        {/* Dynamic mouse reactive spotlight */}
        <div 
          className="absolute inset-0 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--accent-soft), transparent 80%)`
          }}
        />

        {/* Subtle Animated Hex Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(to right, var(--accent) 1px, transparent 1px), linear-gradient(to bottom, var(--accent) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Success Save Alert Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-3xl px-5.5 py-3 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.25)] flex items-center gap-3.5"
          >
            <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={14} />
            </div>
            <div>
              <div className="text-[10px] font-black text-white leading-none tracking-[0.15em] uppercase">SYSTEM SETTINGS SAVED</div>
              <div className="text-[7.5px] text-emerald-400 mt-1 font-bold uppercase tracking-wider">All active credentials synchronized with firewall gateways</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col gap-10 mt-6">
        
        {/* Floating Glass Top Navbar redesign */}
        <div className="w-full bg-[#050508]/85 border border-white/5 rounded-3xl p-5.5 backdrop-blur-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_20px_45px_rgba(0,0,0,0.65)] relative overflow-hidden group">
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.015] to-transparent -translate-x-full group-hover:animate-[shimmer_5s_infinite] pointer-events-none" />
          <div className="flex items-center gap-4">
            <NeuralCoreLogo />
            <div className="flex flex-col">
              <span className="text-[9px] font-black tracking-[0.35em] leading-none uppercase" style={{ color: 'var(--accent)' }}>
                NEXUS OS // AUTOMATION COMMAND CENTRE
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tighter leading-none mt-1.5">Settings</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Shield Compliant System chip */}
            <div className="bg-[#09090d]/80 rounded-2xl px-4 py-2.5 text-[8.5px] font-mono shadow-[0_0_20px_rgba(0,0,0,0.4)] flex items-center gap-3 border" style={{ borderColor: 'var(--accent-border)' }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="text-slate-500 font-bold uppercase tracking-wider">SECURE:</span>
              <span className="font-black uppercase" style={{ color: 'var(--accent)' }}>COMPLIANT</span>
            </div>
          </div>
        </div>

        {/* Massive 3-Column Immersive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: LEFT SIDE - Floating Holographic Navigation Dock */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex flex-col gap-3 bg-[#050508]/85 border border-white/5 rounded-3xl p-3.5 backdrop-blur-3xl shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
              <span className="text-[7.5px] font-black text-slate-500 tracking-widest uppercase block border-b border-white/5 pb-2 px-2.5">
                IDENTITY NAVIGATION RAIL
              </span>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={clsx(
                      "w-full text-left p-4 rounded-2xl transition-all duration-300 border flex flex-col gap-1.5 group select-none cursor-pointer outline-none relative overflow-hidden",
                      isActive 
                        ? "text-white shadow-[inset_0_1px_12px_rgba(255,255,255,0.02)] scale-[1.02]" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
                    )}
                    style={{
                      borderColor: isActive ? 'var(--accent-border)' : undefined,
                      background: isActive ? 'var(--accent-soft)' : undefined
                    }}
                  >
                    {/* Morphing active energy glow capsule */}
                    {isActive && (
                      <div className="absolute top-0 bottom-0 left-0 w-[2px]" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                    )}

                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        isActive ? "text-white" : "bg-white/5 border-white/5 text-slate-500 group-hover:text-slate-300"
                      )}
                      style={{
                        backgroundColor: isActive ? 'var(--accent-soft)' : undefined,
                        borderColor: isActive ? 'var(--accent-border)' : undefined
                      }}>
                        <Icon size={12.5} style={{ color: isActive ? 'var(--accent)' : undefined }} />
                      </div>
                      <span className="text-[9.5px] font-black uppercase tracking-wider leading-none">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Left sidebar minor system health details */}
            <div className="bg-[#050508]/85 border border-white/5 rounded-3xl p-4.5 flex flex-col gap-3.5 backdrop-blur-3xl">
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none border-b border-white/5 pb-2">
                HUD COGNITIVE DATA
              </span>
              <div className="flex items-center justify-between text-[7px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><Cpu size={10} className="animate-pulse" style={{ color: 'var(--accent)' }} /> NETWORK SYNC:</span>
                <span className="font-black" style={{ color: 'var(--accent)' }}>12ms // STABLE</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTER - Immersive Control Interface Console */}
          <div className="lg:col-span-6">
            <div className="rounded-[2.4rem] border border-white/5 bg-[#050508]/85 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.75)] p-6 lg:p-8 min-h-[520px] flex flex-col justify-between relative overflow-hidden group hover:border-[var(--accent)]/10 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.003] to-white/[0.025] pointer-events-none" />
              
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  
                  {/* 1. Account Profile Tab */}
                  {activeTab === 'account' && (
                    <motion.div 
                      key="account"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-white leading-none">Account Profile</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5">Update personal metadata and administrative authorization credentials.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2 relative">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                            <User size={10} style={{ color: 'var(--accent)' }} /> Administrative User
                          </label>
                          <input 
                            type="text" 
                            defaultValue="Guest Developer" 
                            className="bg-black/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all font-medium font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-2 relative">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                            <Mail size={10} style={{ color: 'var(--accent)' }} /> Email Address
                          </label>
                          <input 
                            type="email" 
                            defaultValue="developer@nexus-core.io" 
                            className="bg-black/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all font-medium font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2 relative">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                            <Lock size={10} style={{ color: 'var(--accent)' }} /> Password Credentials
                          </label>
                          <input 
                            type="password" 
                            defaultValue="supersecretdevpassword" 
                            placeholder="Enter new credentials" 
                            className="bg-black/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all font-medium font-mono"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Theme & Accent Settings Tab */}
                  {activeTab === 'theme' && (
                    <motion.div 
                      key="theme"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-white leading-none">Theme & UI Palette</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5">Customize workspace visual rendering and micro-accentuation glows.</p>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Workspace Theme Mode</span>
                        <div className="flex gap-4">
                          {[
                            { id: 'dark', label: 'Dark Obsidian', icon: Moon, desc: 'Pure black deep luxury workspace' },
                            { id: 'light', label: 'Light Quartz', icon: Sun, desc: 'Clean white glassmorphic aesthetic' }
                          ].map((m) => {
                            const Icon = m.icon;
                            const isActive = themeMode === m.id;
                            return (
                              <button
                                key={m.id}
                                onClick={() => setThemeMode(m.id as 'dark' | 'light')}
                                style={{
                                  borderColor: isActive ? 'var(--accent)' : undefined,
                                  boxShadow: isActive ? '0 0 15px var(--accent-glow)' : undefined
                                }}
                                className={clsx(
                                  "flex-1 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer outline-none relative",
                                  isActive 
                                    ? "bg-white/5" 
                                    : "bg-black/40 border-white/5 hover:bg-black/80"
                                )}
                              >
                                {isActive && <Check size={11} className="absolute top-4 right-4" style={{ color: 'var(--accent)' }} />}
                                <div className="flex items-center gap-2.5 mb-1.5">
                                  <Icon size={14} className={clsx(isActive && "animate-pulse")} style={{ color: isActive ? 'var(--accent)' : '#64748b' }} />
                                  <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">{m.label}</span>
                                </div>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{m.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Holographic Accent Glow</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { id: 'blue', label: 'Blue Neon', color: '#3B82F6' },
                            { id: 'cyan', label: 'Cyan Matrix', color: '#06B6D4' },
                            { id: 'violet', label: 'Violet Aura', color: '#A855F7' },
                            { id: 'emerald', label: 'Emerald Flow', color: '#10B981' },
                            { id: 'rose', label: 'Rose Nebulae', color: '#F43F5E' },
                            { id: 'amber', label: 'Amber Flare', color: '#F59E0B' },
                            { id: 'lime', label: 'Lime Cyber', color: '#84CC16' },
                            { id: 'custom', label: 'Custom Hex', color: customAccent }
                          ].map((acc) => {
                            const isAccentActive = accentColor === acc.id;
                            return (
                              <button
                                key={acc.id}
                                onClick={() => setAccentColor(acc.id as any)}
                                style={{
                                  borderColor: isAccentActive ? 'var(--accent)' : undefined,
                                  boxShadow: isAccentActive ? '0 0 15px var(--accent-glow)' : undefined
                                }}
                                className={clsx(
                                  "p-3 rounded-xl border flex flex-col items-center gap-2.5 transition-all duration-300 cursor-pointer outline-none relative",
                                  isAccentActive 
                                    ? "bg-white/5 scale-[1.03] shadow-lg opacity-100" 
                                    : "bg-[#09090b]/40 border-white/5 hover:bg-[#09090b]/80 opacity-75"
                                )}
                              >
                                {isAccentActive && <Check size={10} className="absolute top-2 right-2" style={{ color: 'var(--accent)' }} />}
                                <span 
                                  className="w-4 h-4 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.1)] block transition-transform duration-300 hover:scale-110" 
                                  style={{ backgroundColor: acc.id === 'custom' ? customAccent : acc.color }}
                                />
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">{acc.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Custom Hex Color Panel */}
                        <AnimatePresence>
                          {accentColor === 'custom' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border border-white/5 bg-black/40 rounded-2xl p-4 mt-2 flex flex-col sm:flex-row items-center gap-4"
                            >
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-8 h-8 rounded-lg border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                  <input 
                                    type="color" 
                                    value={customAccent} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setHexInput(val);
                                      setHexError('');
                                      setCustomAccent(val);
                                    }}
                                    className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
                                  />
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Color Picker</span>
                              </div>

                              <div className="flex-1 w-full relative">
                                <input 
                                  type="text" 
                                  value={hexInput}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setHexInput(val);
                                    const clean = val.trim();
                                    const reg = /^#?([0-9A-F]{3}){1,2}$/i;
                                    if (reg.test(clean)) {
                                      setHexError('');
                                      const formatted = clean.startsWith('#') ? clean : `#${clean}`;
                                      setCustomAccent(formatted);
                                    } else {
                                      setHexError('Invalid HEX');
                                    }
                                  }}
                                  placeholder="#EC4899"
                                  className="w-full bg-[#020204]/80 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-mono text-white outline-none focus:border-[var(--accent)]/50"
                                />
                                {hexError && (
                                  <span className="text-[7.5px] font-bold text-red-500 uppercase tracking-wider absolute right-4 top-1/2 -translate-y-1/2">
                                    {hexError}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. AI Automation Preferences Tab */}
                  {activeTab === 'automation' && (
                    <motion.div 
                      key="automation"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-white leading-none">AI Preference Gates</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5">Tune scoring neural confidence limits and messaging outreach timers.</p>
                      </div>

                      <div className="flex flex-col gap-3 bg-[#09090b]/60 border border-white/5 rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scoring Confidence Threshold</span>
                          <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>{aiConfidence}% Confidence</span>
                        </div>
                        <input 
                          type="range" 
                          min="50" 
                          max="98" 
                          value={aiConfidence} 
                          onChange={(e) => setAiConfidence(Number(e.target.value))}
                          className="w-full bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer outline-none"
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <p className="text-[7.5px] text-slate-500 uppercase tracking-widest font-black leading-tight">
                          Leads with cognitive values beneath this threshold will be bypassed by Outreach Agents for manual inspection.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Administrative Alert Channels</span>
                        <div className="space-y-2.5">
                          {[
                            { id: 'email', label: 'Email summaries', desc: 'Recieve daily B2B extraction logs in inbox' },
                            { id: 'push', label: 'Browser push popups', desc: 'Ping when AI scores hit above 95%' },
                          ].map((notif) => (
                            <div 
                              key={notif.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#09090b]/40"
                            >
                              <div>
                                <div className="text-[9px] font-black text-white uppercase tracking-widest leading-none">{notif.label}</div>
                                <div className="text-[7.5px] text-slate-500 mt-1 uppercase font-bold">{notif.desc}</div>
                              </div>
                              <button
                                onClick={() => setNotifications(prev => ({ ...prev, [notif.id]: !((prev as any)[notif.id]) }))}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer outline-none rounded-lg"
                              >
                                <div className={clsx(
                                  "w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center",
                                  (notifications as any)[notif.id] ? "justify-end" : "bg-white/10 justify-start"
                                )}
                                style={{
                                  backgroundColor: (notifications as any)[notif.id] ? 'var(--accent)' : undefined
                                }}>
                                  <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 4. Security Matrix Tab */}
                  {activeTab === 'privacy' && (
                    <motion.div 
                      key="privacy"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-white leading-none">Security Matrix Management</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5">Configure authentication constraints, encrypted routing protocols, and active SSH locks.</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#09090b]/40">
                          <div>
                            <div className="text-[9px] font-black text-white uppercase tracking-widest leading-none flex items-center gap-1.5">
                              <ShieldCheck size={11} style={{ color: 'var(--accent)' }} /> Two-Factor Authentication (2FA)
                            </div>
                            <div className="text-[7.5px] text-slate-500 mt-1 uppercase font-bold">Secure auth prompts on mobile device</div>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#09090b]/40">
                          <div>
                            <div className="text-[9px] font-black text-white uppercase tracking-widest leading-none flex items-center gap-1.5">
                              <ShieldCheck size={11} style={{ color: 'var(--accent)' }} /> API Secret key Lockout
                            </div>
                            <div className="text-[7.5px] text-slate-500 mt-1 uppercase font-bold">Instantly lock active keys on threat detection</div>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 5. API Credentials Tab */}
                  {activeTab === 'api' && (
                    <motion.div 
                      key="api"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-white leading-none">API Credentials Vault</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5">Manage B2B maps search connection secrets and webhooks.</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                          <Key size={10} style={{ color: 'var(--accent)' }} /> Secret API Key
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-black/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono flex items-center justify-between overflow-hidden shadow-[inset_0_1px_8px_rgba(0,0,0,0.4)]">
                            <span className="truncate">{showApiKey ? mockApiKey : '••••••••••••••••••••••••••••••••••••••••'}</span>
                            <button 
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="text-[8px] font-black uppercase hover:text-white ml-2 select-none cursor-pointer outline-none rounded px-1.5 py-0.5 border"
                              style={{
                                color: 'var(--accent)',
                                borderColor: 'var(--accent-border)',
                                backgroundColor: 'var(--accent-soft)'
                              }}
                            >
                              {showApiKey ? 'Hide' : 'Reveal'}
                            </button>
                          </div>
                          <button 
                            onClick={handleCopyApiKey}
                            className="h-10 w-10 shrink-0 bg-[#09090b]/80 hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer outline-none"
                            aria-label="Copy secret token to clipboard"
                          >
                            {apiKeyCopied ? <Check size={14} className="text-emerald-400 animate-pulse" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 6. System Licensing Tab */}
                  {activeTab === 'billing' && (
                    <motion.div 
                      key="billing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-white leading-none">System Licensing</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5">Review current corporate quota allocations and transaction logs.</p>
                      </div>

                      <div className="p-5 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                           style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}>
                        <div>
                          <span className="text-[7px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--accent)' }}>Active Plan Tier</span>
                          <div className="text-sm font-black text-white mt-1.5">Enterprise Developer Suite</div>
                          <p className="text-[8.5px] text-slate-400 mt-1 font-medium leading-relaxed">Unlimited scraping queues, Whatsapp workflows, and CRM database integrations.</p>
                        </div>
                        <div className="text-right shrink-0 bg-[#09090b]/80 border border-white/5 px-4 py-2.5 rounded-xl">
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Renewal Date</span>
                          <div className="text-[10px] font-black text-white mt-1">Jan 01, 2027</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Save Changes Footer */}
              <div className="border-t border-white/5 pt-6 mt-8 flex justify-end">
                <MagnetButton 
                  onClick={handleSaveChanges}
                  className="transition-all duration-300 text-black border-white/10"
                  style={{
                    background: isSaved ? 'linear-gradient(to right, #10b981, #14b8a6)' : 'var(--accent-gradient)',
                    boxShadow: isSaved ? '0 0 25px rgba(16,185,129,0.5)' : '0 0 25px var(--accent-glow)'
                  }}
                >
                  {isSaved ? "Saved Successfully" : "Save Configuration"}
                </MagnetButton>
              </div>

            </div>
          </div>

          {/* COLUMN 3: RIGHT SIDE - Live AI Telemetry & Pulse Monitor */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Live Threat Radar Screen */}
            <CyberRadarWidget />

            {/* Active AI Core Agents */}
            <LiveAgentActivityWidget />

            {/* Server Telemetry Monitor */}
            <div className="bg-[#09090d]/80 border border-white/5 rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-[var(--accent)]/15 transition-colors">
              <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block border-b border-white/5 pb-2">
                GPU // SERVER TELEMETRY
              </span>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[8.5px] font-mono">
                  <span className="text-slate-400">CORE TEMPERATURE:</span>
                  <span className="font-black" style={{ color: 'var(--accent)' }}>42°C // OK</span>
                </div>
                <div className="flex items-center justify-between text-[8.5px] font-mono">
                  <span className="text-slate-400">MEMORY ALLOCATION:</span>
                  <span className="font-black" style={{ color: 'var(--accent)' }}>78% // UT</span>
                </div>
              </div>

              {/* SVG Live telemetry waveform */}
              <LiveTelemetryGraph />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
