import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Play, Pause, RotateCcw, Power, Cpu, Activity, Zap,
  Brain, Terminal, Settings, BarChart3, GitBranch, Plug, Clock,
  CheckCircle, AlertCircle, ChevronRight, Sparkles, Eye, Save,
  MessageSquare, Database, Workflow, Shield, Bot
} from 'lucide-react';
import clsx from 'clsx';
import type { AgentDef } from '../agentsData';

interface Props {
  agent: AgentDef;
  onBack: () => void;
}

type DetailTab = 'overview' | 'guide' | 'workflow' | 'controls' | 'memory' | 'analytics' | 'logs' | 'prompts' | 'integrations' | 'pipeline';

const DETAIL_TABS: { id: DetailTab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'guide', label: 'How to Use', icon: CheckCircle },
  { id: 'workflow', label: 'Workflow', icon: GitBranch },
  { id: 'controls', label: 'Controls', icon: Settings },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'logs', label: 'Live Logs', icon: Terminal },
  { id: 'prompts', label: 'Prompts', icon: MessageSquare },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'pipeline', label: 'Pipeline', icon: Workflow },
];

// Simulated live logs
function useLiveLogs(agentName: string) {
  const [logs, setLogs] = useState<{time: string; msg: string; type: 'info'|'success'|'warning'|'error'}[]>([
    { time: '00:00:01', msg: `[${agentName}] System initialized. Core loaded.`, type: 'info' },
    { time: '00:00:02', msg: `[${agentName}] Neural weights loaded successfully.`, type: 'success' },
  ]);

  useEffect(() => {
    const msgs = [
      { msg: `Processing incoming request batch...`, type: 'info' as const },
      { msg: `Context memory retrieved (34 entries).`, type: 'success' as const },
      { msg: `Confidence threshold passed: 94.2%`, type: 'success' as const },
      { msg: `Rate limit approaching on endpoint /api/v2.`, type: 'warning' as const },
      { msg: `Task completed. Result dispatched to queue.`, type: 'success' as const },
      { msg: `Heartbeat ping → 12ms latency.`, type: 'info' as const },
      { msg: `New task received from coordinator.`, type: 'info' as const },
      { msg: `Data enrichment pass completed.`, type: 'success' as const },
    ];
    let i = 0;
    const iv = setInterval(() => {
      const t = new Date().toLocaleTimeString([], { hour12: false });
      setLogs(p => [...p.slice(-40), { time: t, msg: `[${agentName}] ${msgs[i % msgs.length].msg}`, type: msgs[i % msgs.length].type }]);
      i++;
    }, 3000);
    return () => clearInterval(iv);
  }, [agentName]);

  return logs;
}

export default function AgentDetailPage({ agent, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isRunning, setIsRunning] = useState(agent.status === 'online');
  const logs = useLiveLogs(agent.name);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [logs]);

  const statusColor = isRunning ? '#10B981' : agent.status === 'training' ? '#F59E0B' : '#64748B';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-200 relative overflow-x-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] blur-[140px] rounded-full mix-blend-screen" style={{ backgroundColor: agent.categoryColor + '10' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] blur-[120px] rounded-full mix-blend-screen" style={{ backgroundColor: agent.categoryColor + '08' }} />
        <div className="absolute inset-0 neural-grid opacity-40" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Agents
          </button>

          {/* Agent Header Card */}
          <div className="agent-glass p-8 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px animate-border-energy" style={{ background: `linear-gradient(90deg, transparent, ${agent.categoryColor}, transparent)` }} />
              <div className="absolute w-full h-8 top-0 left-0 animate-shimmer" style={{ background: `linear-gradient(90deg, transparent, ${agent.categoryColor}10, transparent)` }} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ backgroundColor: agent.categoryColor + '15', border: `1px solid ${agent.categoryColor}30` }}>
                  <Bot size={28} style={{ color: agent.categoryColor }} />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--bg)] flex items-center justify-center" style={{ backgroundColor: statusColor }}>
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full animate-pulse-ring" style={{ backgroundColor: statusColor }} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{agent.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ backgroundColor: agent.categoryColor + '15', color: agent.categoryColor }}>{agent.category}</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: statusColor }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                      {isRunning ? 'ONLINE' : agent.status === 'training' ? 'TRAINING' : 'STANDBY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: 'CPU', value: `${agent.cpu}%`, icon: Cpu },
                  { label: 'Confidence', value: `${agent.confidence}%`, icon: Sparkles },
                  { label: 'Speed', value: agent.speed, icon: Zap },
                  { label: 'Queue', value: `${agent.queue}`, icon: Activity },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[90px]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      <s.icon size={10} /> {s.label}
                    </div>
                    <div className="text-lg font-black text-white">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 custom-scrollbar">
          {DETAIL_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 relative",
                activeTab === tab.id ? "text-white bg-white/10 border border-white/15" : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
              )}
            >
              {activeTab === tab.id && <motion.div layoutId="detail-tab" className="absolute inset-0 rounded-xl border" style={{ borderColor: agent.categoryColor + '40', backgroundColor: agent.categoryColor + '08' }} />}
              <tab.icon size={14} style={{ color: activeTab === tab.id ? agent.categoryColor : undefined }} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="agent-glass p-8">
                  <h3 className="text-xl font-black text-white mb-4">What This Agent Does</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">{agent.description}</p>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Use Cases</h4>
                  <div className="space-y-2">
                    {['Automated lead processing & scoring', 'Real-time data synchronization', 'Intelligent workflow orchestration', 'Autonomous decision making'].map((u, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.categoryColor }} />
                        {u}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="agent-glass p-8">
                  <h3 className="text-xl font-black text-white mb-4">Business Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Time Saved', value: '40hrs/mo' },
                      { label: 'Accuracy', value: `${agent.confidence}%` },
                      { label: 'Cost Reduction', value: '65%' },
                      { label: 'Success Rate', value: `${agent.successRate}%` },
                    ].map((b, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-white">{b.value}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{b.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="agent-glass p-8">
                <h3 className="text-xl font-black text-white mb-8">Setup Guide</h3>
                <div className="space-y-6">
                  {[
                    { step: 1, title: 'Connect Integrations', desc: 'Link your services in the Integrations tab.' },
                    { step: 2, title: 'Upload Data', desc: 'Import leads or data sources the agent will process.' },
                    { step: 3, title: 'Configure Prompts', desc: 'Customize the AI instructions and persona.' },
                    { step: 4, title: 'Set Workflow Rules', desc: 'Define triggers, conditions, and actions.' },
                    { step: 5, title: 'Deploy Automation', desc: 'Start the agent and monitor initial runs.' },
                    { step: 6, title: 'Monitor Analytics', desc: 'Track performance and optimize over time.' },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-5 items-start">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0" style={{ backgroundColor: agent.categoryColor + '15', color: agent.categoryColor, border: `1px solid ${agent.categoryColor}30` }}>{s.step}</div>
                      <div>
                        <div className="font-bold text-white">{s.title}</div>
                        <div className="text-sm text-slate-400 mt-0.5">{s.desc}</div>
                      </div>
                      {i < 5 && <div className="hidden md:block absolute left-[39px] mt-12 w-px h-6 bg-white/10" />}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="agent-glass p-8 min-h-[400px] relative overflow-hidden">
                <h3 className="text-xl font-black text-white mb-6">Live Workflow Visualizer</h3>
                <div className="flex flex-col items-center gap-2 py-8">
                  {['Data Input', 'AI Processing', 'Quality Check', 'Action Dispatch', 'Result Sync'].map((node, i) => (
                    <React.Fragment key={i}>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}
                        className={clsx("px-6 py-3 rounded-xl border text-sm font-bold text-center min-w-[180px]", i === 1 ? "shadow-lg" : "")}
                        style={{ backgroundColor: i === 1 ? agent.categoryColor + '15' : 'rgba(255,255,255,0.05)', borderColor: i === 1 ? agent.categoryColor + '40' : 'rgba(255,255,255,0.1)', color: i === 1 ? agent.categoryColor : '#fff' }}>
                        {node}
                        {i === 1 && <div className="text-[10px] font-bold mt-1 opacity-60">Processing...</div>}
                      </motion.div>
                      {i < 4 && <div className="w-px h-4 bg-white/20" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="agent-glass p-8">
                <h3 className="text-xl font-black text-white mb-6">Agent Control Panel</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: isRunning ? 'Stop Agent' : 'Start Agent', icon: isRunning ? Pause : Play, color: isRunning ? '#F43F5E' : '#10B981', action: () => setIsRunning(!isRunning) },
                    { label: 'Restart', icon: RotateCcw, color: '#F59E0B', action: () => { setIsRunning(false); setTimeout(() => setIsRunning(true), 1000); } },
                    { label: 'Deploy Update', icon: Zap, color: '#3B82F6', action: () => {} },
                    { label: 'Reset Memory', icon: Brain, color: '#A855F7', action: () => {} },
                    { label: 'Pause Queue', icon: Clock, color: '#F59E0B', action: () => {} },
                    { label: 'Force Shutdown', icon: Power, color: '#F43F5E', action: () => setIsRunning(false) },
                  ].map((ctrl, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={ctrl.action}
                      className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-3 group"
                      style={{ '--btn-color': ctrl.color } as any}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: ctrl.color + '15', border: `1px solid ${ctrl.color}30` }}>
                        <ctrl.icon size={22} style={{ color: ctrl.color }} />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{ctrl.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="agent-glass p-8">
                <h3 className="text-xl font-black text-white mb-6">AI Memory System</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[{ label: 'Stored Memories', value: '12,847' }, { label: 'Context Entries', value: '3,421' }, { label: 'Learning State', value: 'Active' }].map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-white">{m.value}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="terminal-bg p-4 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 text-xs">
                  {['User preference: timezone=UTC', 'Workflow pattern: lead→qualify→outreach', 'Last successful run: 2 mins ago', 'Learned: high-intent keywords yield 3x conversion', 'Context: 34 active conversations cached'].map((mem, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5">
                      <Brain size={12} className="text-purple-400 shrink-0" />
                      <span className="text-slate-300">{mem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Success Rate', value: `${agent.successRate}%`, color: '#10B981' },
                  { label: 'Avg Response', value: agent.speed, color: '#3B82F6' },
                  { label: 'Processed', value: '24,891', color: '#A855F7' },
                  { label: 'Error Rate', value: `${100 - agent.successRate}%`, color: '#F43F5E' },
                ].map((s, i) => (
                  <div key={i} className="agent-glass p-5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{s.label}</div>
                    <div className="text-2xl font-black text-white">{s.value}</div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(parseInt(s.value) || 50, 100)}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="agent-glass overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                  <Terminal size={16} className="text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Terminal</span>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                  </div>
                </div>
                <div ref={logRef} className="p-4 h-[400px] overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1.5 bg-black/40">
                  {logs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span className={clsx(log.type === 'success' && 'text-emerald-400', log.type === 'info' && 'text-slate-300', log.type === 'warning' && 'text-yellow-400', log.type === 'error' && 'text-red-400')}>
                        {log.msg}
                      </span>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-500 mt-2">
                    <span className="w-2 h-4 bg-slate-500 animate-cursor" /> awaiting...
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="agent-glass p-8">
                <h3 className="text-xl font-black text-white mb-6">Prompt Engine</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">System Prompt</label>
                    <textarea className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono resize-none outline-none focus:border-blue-500/50 custom-scrollbar" defaultValue={`You are ${agent.name}, a specialized AI agent focused on ${agent.category} operations. Respond professionally and efficiently.`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Response Template</label>
                    <textarea className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono resize-none outline-none focus:border-blue-500/50 custom-scrollbar" defaultValue={`Hi {name}, I'm reaching out regarding {topic}. Let me know if you'd like to explore this further.`} />
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ backgroundColor: agent.categoryColor + '20', border: `1px solid ${agent.categoryColor}40` }}>
                    <Save size={16} /> Save Prompts
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['WhatsApp API', 'OpenAI', 'Google Maps', 'Instagram', 'Gmail', 'LinkedIn', 'Supabase', 'n8n', 'Stripe', 'Twilio'].map((svc, i) => {
                  const connected = agent.integrations.some(ig => svc.toLowerCase().includes(ig.toLowerCase()));
                  return (
                    <div key={i} className="agent-glass p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-lg", connected ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/5 border border-white/10")}>
                          <Plug size={18} className={connected ? "text-emerald-400" : "text-slate-500"} />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{svc}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: connected ? '#10B981' : '#64748b' }}>{connected ? 'Connected' : 'Not Connected'}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-slate-300">{connected ? 'Config' : 'Connect'}</button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="agent-glass p-8 min-h-[350px]">
                <h3 className="text-xl font-black text-white mb-6">Automation Pipeline</h3>
                <div className="flex flex-wrap items-center justify-center gap-3 py-8">
                  {['Trigger Event', 'Data Validation', 'AI Decision', 'Action Dispatch', 'Human Approval', 'Result Sync'].map((node, i) => (
                    <React.Fragment key={i}>
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.12 }}
                        className="px-5 py-3 rounded-xl border text-xs font-bold text-center"
                        style={{ backgroundColor: i === 2 ? agent.categoryColor + '15' : 'rgba(255,255,255,0.05)', borderColor: i === 2 ? agent.categoryColor + '40' : 'rgba(255,255,255,0.1)', color: i === 2 ? agent.categoryColor : '#e2e8f0' }}>
                        {node}
                      </motion.div>
                      {i < 5 && <ChevronRight size={16} className="text-slate-600 shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
