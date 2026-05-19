import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import { Fingerprint, Network, Database, Lock, Globe, Sparkles, RefreshCw, UserCheck, TrendingUp, Server, Activity, ShieldCheck, Wifi, CheckCircle2, Zap } from 'lucide-react';
import clsx from 'clsx';

function GlassModule({ children, className = '', glow = 'green' }: { children: React.ReactNode; className?: string; glow?: string }) {
  const [hovered, setHovered] = useState(false);
  const colors: Record<string, string> = { green: 'rgba(57,255,20,0.06)', blue: 'rgba(59,130,246,0.06)', purple: 'rgba(139,92,246,0.06)', cyan: 'rgba(6,182,212,0.06)', pink: 'rgba(236,72,153,0.06)' };
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={clsx('relative rounded-2xl border border-white/[0.07] backdrop-blur-2xl overflow-hidden', className)}
      style={{ background: 'rgba(8,8,12,0.85)', boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)` : '0 10px 40px rgba(0,0,0,0.5)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      <div className="absolute inset-0 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ background: colors[glow] || colors.green, opacity: hovered ? 1 : 0 }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const [scanStep, setScanStep] = useState<'scan' | 'verify' | 'verified'>('scan');
  const [scramble, setScramble] = useState('Biometric telemetry synchronized // SYNC_OK');
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  useEffect(() => {
    const logs = ['SYS_LOCK: Secure credential cycle initialized', 'DECRYPT: Block #9029 decrypted with token 0x9f', 'AI_CORE: Scoring pipeline threshold active', 'NEURAL_NET: Port connection validated at 60fps'];
    const iv = setInterval(() => { const h = Math.random().toString(16).substring(2, 8).toUpperCase(); setScramble(`[${h}] // ${logs[Math.floor(Math.random() * logs.length)]}`); }, 4000);
    setTimeout(() => setScanStep('verify'), 2500);
    setTimeout(() => setScanStep('verified'), 5500);
    return () => clearInterval(iv);
  }, []);

  const platforms = [
    { id: 'sf', name: 'Salesforce Core', host: 'ap-west-1.cloud', schema: 'salesforce.io/graphql', icon: Database, color: 'text-blue-400', ring: 'border-blue-500/30', glow: 'rgba(59,130,246,0.15)' },
    { id: 'wa', name: 'WhatsApp API', host: 'eu-central-2.wa', schema: 'whatsapp.meta/secure', icon: Zap, color: 'text-emerald-400', ring: 'border-emerald-500/30', glow: 'rgba(52,211,153,0.15)' },
    { id: 'n8', name: 'n8n Workflow', host: 'localhost:5678', schema: 'n8n-instance.local', icon: Network, color: 'text-purple-400', ring: 'border-purple-500/30', glow: 'rgba(139,92,246,0.15)' },
    { id: 'ig', name: 'Instagram API', host: 'us-east-1.graph', schema: 'graph.instagram/auth', icon: Globe, color: 'text-pink-400', ring: 'border-pink-500/30', glow: 'rgba(236,72,153,0.15)' },
  ];

  const activities = [
    { time: '09:42:01', label: 'CRM database sync complete', agent: 'CRM_AGENT', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { time: '09:21:40', label: 'Normalized B2B prospect data', agent: 'CLEAN_AGENT', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { time: '08:45:11', label: 'Assigned cognitive confidence scores', agent: 'SCORE_AGENT', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { time: '07:11:04', label: 'WhatsApp broadcast pipeline initiated', agent: 'OUTREACH_AGENT', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  const bars = [
    { label: 'Scraped Prospect Leads', pct: 50, color: 'from-blue-500 to-cyan-400' },
    { label: 'WhatsApp Outreach Logs', pct: 56, color: 'from-emerald-500 to-teal-400' },
  ];

  return (
    <div
      className="w-full min-h-screen bg-[#050507] text-slate-300 overflow-x-hidden select-none relative"
      onMouseMove={e => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
    >
      {/* Flashlight cursor */}
      <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: useMotionTemplate`radial-gradient(800px circle at ${springX}px ${springY}px, rgba(57,255,20,0.03), transparent 55%)` }} />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 right-0 w-[50vw] h-[50vw] bg-purple-600/[0.05] blur-[160px] rounded-full animate-[pulse_14s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -left-32 w-[40vw] h-[40vw] bg-blue-600/[0.04] blur-[140px] rounded-full animate-[pulse_18s_ease-in-out_infinite_4s]" />
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 pt-28 pb-16 px-6 lg:px-12 max-w-[1500px] mx-auto">

        {/* ── TOP COMMAND DOCK ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-full min-h-[52px] flex flex-col items-center gap-1 pt-1">
              <div className="w-px flex-1 bg-gradient-to-b from-neon-green/60 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.8)] animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] font-black tracking-[0.4em] text-neon-green uppercase flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" /> Nexus Core OS // System Command // Tier V
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Profile</h1>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">Cinema-grade AI HUD mapping core B2B synchronizations, secure biometrics, and agent telemetry.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl px-5 py-3 max-w-sm shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping shrink-0" />
            <span className="text-[9px] font-mono text-slate-400 truncate"><span className="text-white font-bold">SHELL:</span> {scramble}</span>
          </div>
        </motion.div>

        {/* ── MAIN SPATIAL GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT — Biometric Identity Pillar */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <GlassModule glow="cyan" className="p-7 flex flex-col items-center text-center">
              <span className="text-[8px] font-black tracking-[0.3em] text-slate-500 uppercase mb-5">Verification // Secure Auth</span>

              {/* Identity Core */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-2">
                <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-b from-white/[0.02] to-black/30 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
                <div className="absolute inset-[-8px] rounded-full border border-dashed border-neon-green/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-cyan-500/15 border-t-transparent animate-[spin_10s_linear_infinite_reverse]" />
                <div className="absolute left-0 right-0 h-px bg-neon-green/60 shadow-[0_0_12px_rgba(57,255,20,0.8)] animate-[scan_3s_ease-in-out_infinite] z-10" />
                <AnimatePresence mode="wait">
                  {scanStep === 'scan' && (
                    <motion.div key="s" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="absolute inset-8 rounded-full bg-black/80 flex items-center justify-center border border-white/10">
                      <Fingerprint size={44} className="text-neon-green animate-pulse" />
                    </motion.div>
                  )}
                  {scanStep === 'verify' && (
                    <motion.div key="v" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="absolute inset-8 rounded-full bg-black/80 flex items-center justify-center border border-white/10">
                      <RefreshCw size={34} className="text-blue-400 animate-spin" />
                    </motion.div>
                  )}
                  {scanStep === 'verified' && (
                    <motion.div key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-8 rounded-full bg-black/80 flex items-center justify-center border border-neon-green/30 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                      <UserCheck size={44} className="text-neon-green" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mt-4">Guest Developer</h2>
              <div className="mt-2 px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded-full text-[8px] font-black text-neon-green tracking-[0.2em] uppercase">System Architect // Tier 1</div>

              <div className="w-full grid grid-cols-2 gap-3 mt-7 pt-5 border-t border-white/5">
                {[{ label: 'Biometric Sync', val: 'Authenticated', valClass: 'text-neon-green' }, { label: 'Gate Lockout', val: 'Secure // On', valClass: 'text-slate-300' }].map((r, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-left hover:border-white/15 transition-all">
                    <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-1">{r.label}</div>
                    <div className={clsx('text-[9px] font-black uppercase', r.valClass)}>{r.val}</div>
                  </div>
                ))}
              </div>
            </GlassModule>

            <GlassModule glow="blue" className="p-5">
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">Node Location</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Server size={14} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white">SERVER_NODE_NEXUS</div>
                  <div className="text-[8px] text-slate-500 uppercase mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />Secure Tunnel Active</div>
                </div>
              </div>
            </GlassModule>
          </div>

          {/* CENTER — Infrastructure + Timeline */}
          <div className="lg:col-span-6 flex flex-col gap-5">

            {/* Quantum Ports */}
            <GlassModule glow="purple" className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Connected Quantum Ports</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
                    <span className="text-[8px] text-slate-500 font-mono">4 nodes online</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platforms.map(p => {
                  const Icon = p.icon;
                  const isH = hoveredPlatform === p.id;
                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -2, scale: 1.02 }}
                      onMouseEnter={() => setHoveredPlatform(p.id)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                      className={clsx('relative p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden', isH ? 'border-white/15 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02]')}
                    >
                      {isH && <div className="absolute top-0 left-0 w-[2px] h-full bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.6)]" />}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-9 h-9 rounded-xl bg-black/60 border flex items-center justify-center', p.ring)}>
                            <Icon size={15} className={clsx(p.color, isH && 'animate-pulse')} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-white">{p.name}</div>
                            <div className="text-[8px] text-slate-500 font-mono mt-0.5">{p.host}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-black/50 border border-white/5 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
                          <span className="text-[7px] font-black text-neon-green font-mono">ONLINE</span>
                        </div>
                      </div>
                      <AnimatePresence>
                        {isH && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5 pt-3 space-y-1">
                            {[['SCHEMA', p.schema], ['DELAY', '12ms // STABLE']].map(([k, v]) => (
                              <div key={k} className="flex justify-between text-[7px] font-mono">
                                <span className="text-slate-500">{k}:</span>
                                <span className="text-white font-bold">{v}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </GlassModule>

            {/* Neural Audit Timeline */}
            <GlassModule glow="cyan" className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Audit Logs</div>
                <Activity size={13} className="text-neon-green animate-pulse" />
              </div>
              <div className="relative space-y-5">
                <div className="absolute left-3 top-3 bottom-3 w-px bg-gradient-to-b from-neon-green/30 via-white/5 to-transparent pointer-events-none" />
                {activities.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4 group cursor-pointer relative">
                    <div className="w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0 z-10 group-hover:border-neon-green/40 transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-neon-green group-hover:shadow-[0_0_8px_rgba(57,255,20,1)] transition-all" />
                    </div>
                    <div className="flex-1 bg-white/[0.01] border border-transparent group-hover:bg-white/[0.04] group-hover:border-white/10 p-3 rounded-xl transition-all">
                      <div className="text-[10px] font-bold text-white group-hover:text-neon-green transition-colors mb-1.5">{a.label}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-slate-500">{a.time}</span>
                        <span className={clsx('text-[7px] font-black font-mono uppercase px-2 py-0.5 rounded-md border', a.color)}>{a.agent}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Command actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-7 pt-6 border-t border-white/5">
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => alert('Authentication keys successfully rotated!')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  <Lock size={11} /> Cycle Encryption Keys
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => alert('Biometric profile parameters synchronized!')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-neon-green text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  <Sparkles size={11} /> Sync Cybernetic Specs
                </motion.button>
              </div>
            </GlassModule>
          </div>

          {/* RIGHT — Telemetry Tower */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <GlassModule glow="green" className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">System Telemetry</div>
                <TrendingUp size={13} className="text-neon-green" />
              </div>

              {/* Radial ring */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-[spin_30s_linear_infinite]" />
                    <circle cx="50" cy="50" r="42" stroke="#06b6d4" strokeWidth="8" strokeDasharray="264" strokeDashoffset="16" fill="none" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-3xl font-black text-white tracking-tighter" style={{ textShadow: '0 0 20px rgba(6,182,212,0.4)' }}>98.4<span className="text-base text-cyan-400">%</span></div>
                    <div className="text-[7px] text-cyan-400/70 font-black uppercase tracking-widest mt-0.5">Val Rate</div>
                  </div>
                </div>
                <div className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider mt-2">AI Scoring Reliability</div>
              </div>

              <div className="space-y-4">
                {bars.map((b, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[8px] font-mono font-black uppercase tracking-widest mb-1.5">
                      <span className="text-slate-500">{b.label}</span>
                      <span className="text-white">{b.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }} className={clsx('h-full rounded-full bg-gradient-to-r', b.color)} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassModule>

            {/* Histogram graph */}
            <GlassModule glow="blue" className="p-6">
              <div className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-[0.2em] mb-4">AI Scoring Histogram</div>
              <div className="relative h-20">
                <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="lg1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 40 L 300 80 L 0 80 Z" fill="url(#lg1)" />
                  <path d="M 0 60 Q 50 30 100 50 T 200 20 T 300 40" stroke="#8b5cf6" strokeWidth="1.5" fill="none" className="drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                  <circle cx="200" cy="20" r="3" fill="#8b5cf6" className="animate-ping" />
                  <circle cx="200" cy="20" r="2" fill="#8b5cf6" />
                </svg>
              </div>
            </GlassModule>

            {/* Quick status pods */}
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Uptime', val: '99.9%', color: 'text-neon-green', icon: CheckCircle2 }, { label: 'Latency', val: '12ms', color: 'text-blue-400', icon: Wifi }].map((s, i) => (
                <GlassModule key={i} glow={i === 0 ? 'green' : 'blue'} className="p-4 flex flex-col gap-2">
                  <s.icon size={14} className={s.color} />
                  <div className="text-[7px] text-slate-500 uppercase tracking-widest font-black">{s.label}</div>
                  <div className={clsx('text-base font-black', s.color)}>{s.val}</div>
                </GlassModule>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
