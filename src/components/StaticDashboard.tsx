import React from 'react';
import { motion } from 'motion/react';
import {
  User, // placeholder for profile icon if needed
  ShieldCheck,
  Server,
  Zap,
  Database,
  Globe,
  Workflow,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  BarChart3,
  BarChart2,
  BarChart,
  Radar,
  PieChart,
} from 'lucide-react';

export default function StaticDashboard() {
  // No state – purely visual
  return (
    <div className="relative min-h-screen bg-[#020304] text-slate-200 overflow-hidden font-sans">
      {/* ---------- Background Grid + Particles ---------- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* vertical grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,153,0.07)_1px,_transparent_2px)] bg-[size:40px_40px]" />
        {/* subtle moving particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#00e5ff] opacity-30"
              initial={{ opacity: 0.2, x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000 }}
              animate={{ opacity: 0.2, x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000 }}
              transition={{ repeat: Infinity, duration: 30 + Math.random() * 20, ease: 'linear' }}
            />
          ))}
        </div>
        {/* vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020304cc] to-[#020304] pointer-events-none" />
      </div>

      {/* ---------- Top Header ---------- */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center px-6 z-20">
        {/* Left System Text */}
        <div className="text-xs font-mono uppercase tracking-widest text-[#00ff99] opacity-80">
          NEXUS CORE OS // SYSTEM COMMAND // TIER V
        </div>
        {/* Right Shell Bar */}
        <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md border border-[#00ff99]/20 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse" />
          <span className="text-[10px] font-mono text-[#00ff99] opacity-90">
            SHELL: [0A4FC5] // DECRYPT: Block #9029 decrypted with tok…
          </span>
        </div>
      </div>

      {/* ---------- Main Grid ---------- */}
      <div className="grid grid-cols-12 gap-4 pt-20 px-6 pb-24 relative z-10 min-h-full">
        {/* Left Profile Column */}
        <div className="col-span-3 flex flex-col space-y-4">
          {/* Profile Card */}
          <div className="glass-card p-6 flex flex-col items-center space-y-4 bg-[rgba(8,8,12,0.85)] border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#00ff99] opacity-70 mb-2">
              VERIFICATION // SECURE AUTH
            </div>
            {/* Radar */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="rgba(0,255,153,0.1)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="36" stroke="rgba(0,255,153,0.04)" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-[spin_30s_linear_infinite]" />
                <circle cx="50" cy="50" r="42" stroke="#00ff99" strokeWidth="8" strokeDasharray="264" strokeDashoffset="0" fill="none" className="drop-shadow-[0_0_8px_rgba(0,255,153,0.6)]" />
                {/* scanning line */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,255,153,0.3)" strokeWidth="2" className="animate-[scan-line_3s_ease-in-out_infinite]" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="text-[#00ff99] w-6 h-6" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Guest Developer</h2>
            <div className="px-3 py-1 bg-[#00ff9910] border border-[#00ff99]/30 rounded-full text-xs font-mono uppercase tracking-widest text-[#00ff99]">
              SYSTEM ARCHITECT // TIER 1
            </div>
            {/* Mini Stat Cards */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              <div className="p-2 bg-[#00ff9910] border border-[#00ff99]/20 rounded-lg text-[9px] text-[#00ff99] text-center">
                BIOMETRIC SYNC — AUTHENTICATED
              </div>
              <div className="p-2 bg-[#00ff9910] border border-[#00ff99]/20 rounded-lg text-[9px] text-[#00ff99] text-center">
                GATE LOCKOUT — SECURE // ON
              </div>
            </div>
            {/* Node Location Card */}
            <div className="mt-4 w-full p-3 bg-[#00ff9910] border border-[#00ff99]/30 rounded-lg flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#00ff99]" />
              <div className="flex-1 text-sm font-mono text-[#00ff99]">SERVER_NODE_NEXUS</div>
              <div className="w-2 h-2 bg-[#00ff99] rounded-full animate-pulse" />
              <span className="text-xs text-[#00ff99]">SECURE TUNNEL ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Center Monitoring Panel */}
        <div className="col-span-6 flex flex-col space-y-4">
          {/* Quantum Ports Header */}
          <div className="flex items-center justify-between bg-black/50 backdrop-blur-md border border-[#00ff99]/20 rounded-xl px-4 py-2">
            <div className="text-sm font-mono uppercase tracking-widest text-[#00ff99]">CONNECTED QUANTUM PORTS</div>
            <div className="text-xs text-[#00ff99]">4 nodes online</div>
          </div>
          {/* 2x2 Integration Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card Template */}
            {[
              { name: 'Salesforce Core', icon: Database, color: '#7c3aed' },
              { name: 'WhatsApp API', icon: Zap, color: '#00ff99' },
              { name: 'n8n Workflow', icon: Workflow, color: '#00e5ff' },
              { name: 'Instagram API', icon: Globe, color: '#7c3aed' },
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-4 bg-[rgba(8,8,12,0.85)] border border-[#00ff99]/20 rounded-xl flex flex-col justify-between" style={{ borderColor: `${item.color}33` }}>
                <div className="flex items-center space-x-2">
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  <span className="text-sm font-medium text-white">{item.name}</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 bg-[#00ff99] rounded-full animate-pulse mr-2" />
                  <span className="text-xs text-[#00ff99] uppercase">ONLINE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 flex flex-col space-y-4">
          {/* Telemetry Ring */}
          <div className="glass-card p-6 flex flex-col items-center bg-[rgba(8,8,12,0.85)] border border-[#00ff99]/20 rounded-xl">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="#00ff99" strokeWidth="8" strokeDasharray="264" strokeDashoffset="16" fill="none" className="drop-shadow-[0_0_12px_rgba(0,255,153,0.5)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-white">98.4%</div>
                <div className="text-xs text-[#00ff99] uppercase mt-1">VAL RATE</div>
              </div>
            </div>
          </div>
          {/* Progress Bars */}
          <div className="glass-card p-4 space-y-3 bg-[rgba(8,8,12,0.85)] border border-[#00ff99]/20 rounded-xl">
            {[
              { label: 'SCRAPED PROSPECT LEADS', pct: 52 },
              { label: 'WHATSAPP OUTREACH LOGS', pct: 56 },
            ].map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#00ff99]">{b.label}</span>
                  <span className="text-white">{b.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden border border-[#00ff99]/10">
                  <div className="h-full bg-[#00ff99]" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          {/* Histogram Card */}
          <div className="glass-card p-4 bg-[rgba(8,8,12,0.85)] border border-[#00ff99]/20 rounded-xl">
            <div className="text-sm font-mono text-[#00ff99] mb-2">AI SCORING HISTOGRAM</div>
            <div className="relative h-20">
              <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="lg1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 40 L 300 80 L 0 80 Z" fill="url(#lg1)" />
                <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 40" stroke="#7c3aed" strokeWidth="1.5" fill="none" />
                <circle cx="200" cy="20" r="3" fill="#7c3aed" className="animate-pulse" />
                <circle cx="200" cy="20" r="2" fill="#7c3aed" />
              </svg>
            </div>
          </div>
          {/* Bottom Metric Cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'UPTIME', value: '99.9%' },
              { label: 'LATENCY', value: '12ms' },
            ].map((c, i) => (
              <div key={i} className="glass-card p-3 bg-[rgba(8,8,12,0.85)] border border-[#00ff99]/20 rounded-lg flex flex-col items-center">
                <span className="text-xs text-[#00ff99] uppercase mb-1">{c.label}</span>
                <span className="text-lg font-bold text-white">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Log Panel */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-10">
        <div className="glass-card p-4 bg-[rgba(8,8,12,0.85)] border border-[#00ff99]/20 rounded-xl max-w-6xl mx-auto">
          <div className="text-sm font-mono uppercase tracking-widest text-[#00ff99] mb-2">ADMINISTRATIVE AUDIT LOGS</div>
          <div className="space-y-3">
            {[
              { time: '09:42:01', action: 'CRM database sync complete', agent: 'CRM_AGENT' },
              { time: '09:21:40', action: 'Normalized B2B prospect data', agent: 'CLEAN_AGENT' },
              { time: '08:45:11', action: 'Assigned cognitive confidence scores', agent: 'SCORE_AGENT' },
              { time: '07:11:04', action: 'WhatsApp broadcast pipeline initiated', agent: 'OUTREACH_AGENT' },
            ].map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00ff99] rounded-full" />
                <span className="text-xs text-[#00ff99] w-20">{log.time}</span>
                <span className="text-sm text-white flex-1">{log.action}</span>
                <span className="text-xs bg-[#00ff9910] border border-[#00ff99]/30 rounded px-1 text-[#00ff99] uppercase">{log.agent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
