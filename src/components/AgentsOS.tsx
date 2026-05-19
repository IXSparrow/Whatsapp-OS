import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Filter, Zap, Bot, Activity, Cpu, ChevronRight,
  Settings, Play, BookOpen, Rocket, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import { ALL_AGENTS, AGENT_CATEGORIES, type AgentDef } from '../agentsData';
import AgentDetailPage from './AgentDetailPage';

// Live-tick metric simulation
function useLiveMetrics(agents: AgentDef[]) {
  const [metrics, setMetrics] = useState<Record<string, { cpu: number; queue: number; confidence: number }>>({});

  useEffect(() => {
    const init: Record<string, { cpu: number; queue: number; confidence: number }> = {};
    agents.forEach(a => {
      init[a.id] = { cpu: a.cpu, queue: a.queue, confidence: a.confidence };
    });
    setMetrics(init);

    const interval = setInterval(() => {
      setMetrics(prev => {
        const next = { ...prev };
        agents.forEach(a => {
          if (a.status === 'online') {
            next[a.id] = {
              cpu: Math.max(5, Math.min(99, (prev[a.id]?.cpu ?? a.cpu) + (Math.random() * 10 - 5))),
              queue: Math.max(0, (prev[a.id]?.queue ?? a.queue) + Math.floor(Math.random() * 5 - 2)),
              confidence: Math.max(70, Math.min(99, (prev[a.id]?.confidence ?? a.confidence) + (Math.random() * 4 - 2))),
            };
          }
        });
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [agents]);

  return metrics;
}

// Animated activity bars
function ActivityBars({ color, active }: { color: string; active: boolean }) {
  const [heights, setHeights] = useState([30, 60, 45, 80, 35]);
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setHeights([
        Math.random() * 70 + 20,
        Math.random() * 70 + 20,
        Math.random() * 70 + 20,
        Math.random() * 70 + 20,
        Math.random() * 70 + 20,
      ]);
    }, 800);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div className="flex items-end gap-0.5 h-5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm transition-all duration-700"
          style={{ height: `${active ? h : 15}%`, backgroundColor: color, opacity: active ? 0.8 : 0.3 }}
        />
      ))}
    </div>
  );
}

// Status pill
function StatusPill({ status }: { status: AgentDef['status'] }) {
  const config = {
    online: { color: '#10B981', label: 'ONLINE' },
    standby: { color: '#F59E0B', label: 'STANDBY' },
    training: { color: '#A855F7', label: 'TRAINING' },
    offline: { color: '#64748B', label: 'OFFLINE' },
  }[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
      <span className="text-[9px] font-black tracking-widest" style={{ color: config.color }}>{config.label}</span>
    </div>
  );
}

// Single agent card
function AgentCard({ agent, metrics, onOpen, onTrain, onDeploy, index }: {
  agent: AgentDef;
  metrics: { cpu: number; queue: number; confidence: number };
  onOpen: () => void;
  onTrain: () => void;
  onDeploy: () => void;
  index: number;
}) {
  const isActive = agent.status === 'online';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="agent-glass group relative cursor-pointer overflow-hidden"
      style={{ animationDelay: `${index * 0.5}s` }}
    >
      {/* Animated top border energy */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-energy"
        style={{ background: `linear-gradient(90deg, transparent, ${agent.categoryColor}, transparent)` }}
      />

      {/* Shimmer sweep on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-3xl"
      >
        <div
          className="absolute top-0 bottom-0 w-[40%] animate-shimmer"
          style={{ background: `linear-gradient(90deg, transparent, ${agent.categoryColor}08, transparent)` }}
        />
      </div>

      {/* Glow bg */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: agent.categoryColor }}
      />

      <div className="relative z-10 p-5">
        {/* Top row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center relative"
              style={{ backgroundColor: agent.categoryColor + '15', border: `1px solid ${agent.categoryColor}25` }}
            >
              <Bot size={20} style={{ color: agent.categoryColor }} />
              {/* Pulse ring */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl animate-pulse-ring"
                  style={{ backgroundColor: agent.categoryColor + '30' }}
                />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">{agent.name}</h3>
              <span
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: agent.categoryColor }}
              >
                {agent.category}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusPill status={agent.status} />
            <button
              onClick={e => { e.stopPropagation(); }}
              className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Settings size={12} />
            </button>
          </div>
        </div>

        {/* Current task */}
        <div className="text-[10px] text-slate-500 font-mono mb-4 truncate">{agent.currentTask}</div>

        {/* Live metrics row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">CPU</div>
            <div className="text-xs font-black text-white">{Math.round(metrics?.cpu ?? agent.cpu)}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Conf</div>
            <div className="text-xs font-black text-white">{Math.round(metrics?.confidence ?? agent.confidence)}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Queue</div>
            <div className="text-xs font-black text-white">{metrics?.queue ?? agent.queue}</div>
          </div>
        </div>

        {/* Success rate bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Success Rate</span>
            <span className="text-[10px] font-black text-white">{agent.successRate}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agent.successRate}%` }}
              transition={{ duration: 1.2, delay: index * 0.04 + 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ backgroundColor: agent.categoryColor }}
            />
          </div>
        </div>

        {/* Activity bars + integrations */}
        <div className="flex items-center justify-between mb-4">
          <ActivityBars color={agent.categoryColor} active={isActive} />
          <div className="flex gap-1">
            {agent.integrations.slice(0, 3).map((ig, i) => (
              <div key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-slate-500 border border-white/5">
                {ig.split(' ')[0].substring(0, 4)}
              </div>
            ))}
          </div>
        </div>

        {/* Speed badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <Zap size={10} style={{ color: agent.categoryColor }} />
          <span className="text-[9px] font-bold text-slate-500">Speed:</span>
          <span className="text-[9px] font-black text-white">{agent.speed}</span>
          {isActive && (
            <span className="ml-auto flex items-center gap-1 text-[9px] text-emerald-400">
              <Wifi size={9} /> Live
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-white/5">
          <button
            onClick={e => { e.stopPropagation(); onTrain(); }}
            className="py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5"
          >
            Train
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDeploy(); }}
            className="py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border"
            style={{ backgroundColor: agent.categoryColor + '15', color: agent.categoryColor, borderColor: agent.categoryColor + '30' }}
          >
            Deploy
          </button>
          <button
            onClick={onOpen}
            className="py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all bg-white hover:bg-white/90 text-black"
          >
            Open
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Deploy Modal
function DeployModal({ onClose, categoryColor }: { onClose: () => void; categoryColor: string }) {
  const [step, setStep] = useState(0);
  const templates = ['WhatsApp Campaign', 'Email Blast', 'Lead Enrichment', 'CRM Sync', 'Content Pipeline'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="agent-glass w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-black text-white">Deploy New Agent</h3>
          <p className="text-xs text-slate-500 mt-1">Select a template to initialize your AI agent</p>
        </div>
        <div className="p-6 space-y-3">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => setStep(1)}
              className={clsx(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                step === 1 && i === 0
                  ? "bg-white/10 border-white/20"
                  : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: categoryColor + '20' }}>
                  <Rocket size={16} style={{ color: categoryColor }} />
                </div>
                <span className="font-bold text-white text-sm">{t}</span>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button className="flex-1 py-3 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all" style={{ backgroundColor: categoryColor }}>
            Initialize Agent
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main export
export default function AgentsOS() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAgent, setActiveAgent] = useState<AgentDef | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const metrics = useLiveMetrics(ALL_AGENTS);

  useEffect(() => {
    setOnlineCount(ALL_AGENTS.filter(a => a.status === 'online').length);
  }, []);

  const filtered = ALL_AGENTS.filter(a => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // If viewing an agent detail page
  if (activeAgent) {
    return (
      <motion.div
        key="detail"
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.4 }}
        className="h-full overflow-y-auto custom-scrollbar"
      >
        <AgentDetailPage agent={activeAgent} onBack={() => setActiveAgent(null)} />
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 relative">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 neural-grid opacity-30 pointer-events-none rounded-3xl" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Autonomous AI Workforce</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-slate-500">{ALL_AGENTS.length} agents deployed</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {onlineCount} Online
              </span>
              <span className="text-xs text-slate-600">{ALL_AGENTS.filter(a => a.status === 'standby').length} Standby</span>
              <span className="flex items-center gap-1 text-xs text-purple-400">
                <RefreshCw size={10} className="animate-spin" />
                {ALL_AGENTS.filter(a => a.status === 'training').length} Training
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all text-white shadow-lg"
            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 25px var(--accent-glow)' }}
          >
            <Plus size={16} /> Deploy New Agent
          </button>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search agents, capabilities, integrations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <Filter size={14} className="text-slate-500 shrink-0" />
            {AGENT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  "shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  selectedCategory === cat.id
                    ? "text-white border-white/20 bg-white/10"
                    : "text-slate-500 border-transparent hover:border-white/10 hover:text-slate-300"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Agents', value: ALL_AGENTS.length, icon: Bot, color: 'var(--accent)' },
          { label: 'Active Now', value: onlineCount, icon: Activity, color: '#10B981' },
          { label: 'Avg Confidence', value: `${Math.round(ALL_AGENTS.reduce((s, a) => s + a.confidence, 0) / ALL_AGENTS.length)}%`, icon: Cpu, color: '#A855F7' },
          { label: 'Tasks Queued', value: ALL_AGENTS.reduce((s, a) => s + a.queue, 0), icon: Zap, color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="agent-glass p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-lg font-black text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Agent Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory + searchQuery}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.length > 0 ? (
            filtered.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                metrics={metrics[agent.id] ?? { cpu: agent.cpu, queue: agent.queue, confidence: agent.confidence }}
                onOpen={() => setActiveAgent(agent)}
                onTrain={() => {}}
                onDeploy={() => setShowDeployModal(true)}
                index={i}
              />
            ))
          ) : (
            <div className="col-span-4 py-20 text-center text-slate-500">
              <Bot size={40} className="mx-auto mb-3 opacity-20" />
              <div className="text-sm font-bold">No agents match your search</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Deploy Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <DeployModal onClose={() => setShowDeployModal(false)} categoryColor="var(--accent)" />
        )}
      </AnimatePresence>
    </div>
  );
}
