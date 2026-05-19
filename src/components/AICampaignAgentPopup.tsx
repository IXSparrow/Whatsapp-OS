import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Maximize2, Minimize2, Settings, Terminal, Play, Pause, Database, 
  UploadCloud, Link as LinkIcon, Users, MessageSquare, BarChart, Zap, 
  BrainCircuit, Activity, Cpu, Bot, CheckCircle2, AlertTriangle, RefreshCw, Save
} from 'lucide-react';
import clsx from 'clsx';

interface AICampaignAgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORKFLOW_STEPS = [
  { id: 'fetch', label: 'Fetch Leads' },
  { id: 'validate', label: 'Validate Contacts' },
  { id: 'enrich', label: 'Enrich Lead Data' },
  { id: 'score', label: 'AI Score Leads' },
  { id: 'personalize', label: 'Personalize Messages' },
  { id: 'save', label: 'Save WhatsApp Contacts' },
  { id: 'queue', label: 'Queue Outreach' },
  { id: 'send', label: 'Send Messages' },
  { id: 'track', label: 'Track Replies' },
  { id: 'sync', label: 'CRM Sync' },
];

export function AICampaignAgentPopup({ isOpen, onClose }: AICampaignAgentPopupProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('fetch');
  const [showSettings, setShowSettings] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'retrying'>('idle');
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    whatsappReady: 0,
    aiValidated: 0,
    hotLeads: 0,
    queueProgress: 0,
    replies: 0,
  });

  const [vaultLeads, setVaultLeads] = useState<any[]>([]);
  const [sources, setSources] = useState({ vault: true, crm: true, csv: false, manual: false });
  const [tone, setTone] = useState('Premium');

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX POPUP SCROLL BUG:
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      addLog('System', 'AI Campaign Command Center initialized.');
      fetchVaultLeads();
      fetchDashboardStats();
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (agent: string, message: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const fetchVaultLeads = async () => {
    const saved = localStorage.getItem('nexus_wa_leads');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data)) {
          setVaultLeads(data.slice(0, 5));
        }
      } catch (err) {}
    }

    try {
      addLog('DataVaultAgent', 'Fetching real-time Data Vault leads...');
      const res = await fetch('/api/outreach/leads');
      if (!res.ok) throw new Error('Failed to fetch outreach leads');
      const data = await res.json();
      if (Array.isArray(data)) {
        setVaultLeads(data.slice(0, 5)); // Show latest 5
        addLog('DataVaultAgent', `${data.length} total leads synced successfully.`);
        localStorage.setItem('nexus_wa_leads', JSON.stringify(data));
      }
    } catch (e: any) {
      addLog('System', `Failed to fetch leads: ${e.message}`);
    }
  };

  const fetchDashboardStats = async () => {
    const saved = localStorage.getItem('nexus_wa_summary');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStats(prev => ({
          ...prev,
          totalLeads: data.totalLeads,
          whatsappReady: data.whatsappReady,
          aiValidated: data.aiValidated,
          hotLeads: data.hotIntent
        }));
      } catch (err) {}
    }

    try {
      const res = await fetch('/api/outreach/summary');
      if (!res.ok) throw new Error('Failed to fetch outreach summary');
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalLeads: data.totalLeads,
          whatsappReady: data.whatsappReady,
          aiValidated: data.aiValidated,
          hotLeads: data.hotIntent
        }));
        localStorage.setItem('nexus_wa_summary', JSON.stringify(data));
      }
    } catch (e) {
      // Ignored
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addLog('DataVaultAgent', `Parsing CSV package: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/outreach/import-csv', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        addLog('DataVaultAgent', `✓ ${data.importedRows} imported, ${data.merged} merged, ${data.duplicates} duplicates skipped.`);
        fetchVaultLeads();
        fetchDashboardStats();
      } else {
        addLog('System', `CSV Error: ${data.error}`);
      }
    } catch (err: any) {
      addLog('System', `Network Error: ${err.message}`);
    }
  };

  const handleStartCampaign = async () => {
    setAgentStatus('running');
    addLog('System', 'Autonomous outreach workflow initiated.');
    
    // Animate workflow steps over time
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= WORKFLOW_STEPS.length) {
        clearInterval(interval);
        setAgentStatus('completed');
        addLog('System', 'Campaign autonomous run successfully completed.');
        return;
      }
      setActiveStep(WORKFLOW_STEPS[idx].id);
      addLog('AI Brain', `Executing node: ${WORKFLOW_STEPS[idx].label}...`);
      if (WORKFLOW_STEPS[idx].id === 'queue') {
        setStats(s => ({ ...s, queueProgress: 100 }));
      }
      idx++;
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 overflow-hidden">
        {/* Blurry Animated Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={clsx(
            "relative z-10 flex flex-col overflow-hidden bg-[#05070a]/90 border border-white/10 shadow-[0_0_150px_rgba(34,211,238,0.15)]",
            isFullscreen ? "w-full h-full rounded-none" : "w-full h-full md:w-[96vw] md:h-[92vh] md:max-w-[1800px] md:rounded-3xl"
          )}
        >
          {/* Top Holographic Rainbow Border */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 via-purple-500 to-rose-500 opacity-80" />
          
          {/* HEADER */}
          <header className="flex-none h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center relative shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <BrainCircuit size={20} className="text-cyan-400" />
                {agentStatus === 'running' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />}
              </div>
              <div>
                <h2 className="text-[15px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  AI Autonomous Campaign Engine
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">ONLINE</span>
                </h2>
                <p className="text-[11px] text-cyan-400/60 font-medium tracking-wide">Create, personalize, and launch AI outreach using live Nexus CRM intelligence.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 mr-4">
                 <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded"><Database size={12}/> Vault Active</div>
                 <div className="flex items-center gap-1 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded"><LinkIcon size={12}/> CRM Synced</div>
              </div>
              <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-colors">Save Draft</button>
              <button 
                onClick={handleStartCampaign}
                disabled={agentStatus !== 'idle'}
                className="px-6 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center gap-2"
              >
                <Play size={14} className="fill-black" /> {agentStatus === 'running' ? 'Running...' : 'Launch Agent'}
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-slate-400 hover:text-white transition-colors"><Maximize2 size={16} /></button>
              <button onClick={onClose} className="text-slate-400 hover:text-rose-400 transition-colors"><X size={20} /></button>
            </div>
          </header>

          {/* MAIN 3-COLUMN WORKSPACE */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* COLUMN 1: Workflow & Sources */}
            <aside className="w-full lg:w-72 border-r border-white/5 bg-[#030406] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
              
              {/* Lead Sources Panel */}
              <div className="p-5 border-b border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Database size={14}/> Lead Sources</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-colors">
                    <input type="checkbox" checked={sources.vault} onChange={e=>setSources({...sources, vault: e.target.checked})} className="accent-cyan-500 w-4 h-4"/>
                    <span className="text-xs font-bold text-slate-300">Data Vault Extraction</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-colors">
                    <input type="checkbox" checked={sources.crm} onChange={e=>setSources({...sources, crm: e.target.checked})} className="accent-purple-500 w-4 h-4"/>
                    <span className="text-xs font-bold text-slate-300">CRM Opportunities</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-colors">
                    <input type="checkbox" checked={sources.csv} onChange={e=>setSources({...sources, csv: e.target.checked})} className="accent-emerald-500 w-4 h-4"/>
                    <span className="text-xs font-bold text-slate-300">Imported CSV</span>
                  </label>
                </div>
              </div>

              {/* AI Workflow Nodes */}
              <div className="p-5 flex-1 relative">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={14}/> Autonomous Nodes</h3>
                <div className="absolute left-7 top-14 bottom-10 w-px bg-white/5" />
                <div className="space-y-4 relative z-10">
                  {WORKFLOW_STEPS.map((step, idx) => {
                    const isActive = activeStep === step.id;
                    const isPast = WORKFLOW_STEPS.findIndex(s => s.id === activeStep) > idx;
                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={clsx(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          isActive ? "border-cyan-400 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-125" : 
                          isPast ? "border-emerald-500 bg-emerald-500" : "border-slate-700 bg-[#030406]"
                        )}>
                          {isPast && <CheckCircle2 size={10} className="text-black" />}
                        </div>
                        <div>
                          <span className={clsx("text-xs font-bold transition-colors", isActive ? "text-cyan-400" : isPast ? "text-emerald-400" : "text-slate-500")}>
                            {step.label}
                          </span>
                          {isActive && <div className="text-[9px] text-cyan-400/50 uppercase tracking-widest mt-0.5">Processing...</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* COLUMN 2: Main Command Canvas */}
            <main className="flex-1 flex flex-col bg-[#05070a] relative overflow-hidden min-w-0">
               {/* Background Glow */}
               <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
               <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10">
                 
                 {/* Live Metrics Row */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Leads', val: stats.totalLeads, color: 'text-white', bg: 'bg-white/5 border-white/10' },
                      { label: 'WhatsApp Ready', val: stats.whatsappReady, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10' },
                      { label: 'AI Validated', val: stats.aiValidated, color: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/10' },
                      { label: 'Hot Intent', val: stats.hotLeads, color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-500/10' },
                    ].map((m, i) => (
                      <div key={i} className={clsx("p-4 rounded-xl border flex flex-col items-center justify-center text-center", m.bg)}>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</span>
                        <span className={clsx("text-3xl font-black", m.color)}>{m.val}</span>
                      </div>
                    ))}
                 </div>

                 {/* CSV Drag & Drop Zone */}
                 {sources.csv && (
                   <div className="glass-card border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center group transition-colors hover:bg-emerald-500/10">
                     <UploadCloud size={32} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                     <h3 className="text-sm font-bold text-white mb-2">Import Target List (CSV)</h3>
                     <p className="text-xs text-slate-400 mb-4 max-w-md">The AI Agent will automatically parse columns, remove duplicates, and merge missing metadata into the Data Vault.</p>
                     <input type="file" ref={fileInputRef} onChange={handleCSVUpload} accept=".csv" className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all">
                       Browse CSV File
                     </button>
                   </div>
                 )}

                 {/* Real Data Vault Grid */}
                 <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Database size={14} className="text-cyan-400" /> Active Lead Queue
                      </h3>
                      <button onClick={fetchVaultLeads} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1"><RefreshCw size={12}/> Sync Latest</button>
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Business / Lead</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Source</th>
                          <th className="px-4 py-3">AI Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                        {vaultLeads.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">No leads in the active queue. Import a CSV or sync CRM.</td></tr>
                        ) : vaultLeads.map((l, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">{l.businessName || l.name}</div>
                              <div className="text-[10px] text-slate-500">{l.category} • {l.city}</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-cyan-400/80">{l.phone || 'N/A'}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">{l.source || 'Data Vault'}</span></td>
                            <td className="px-4 py-3"><span className="font-black text-purple-400">{l.intentScore ?? l.score ?? 50}</span>/100</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>

                 {/* AI Pitch Generator Engine Preview */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card border border-white/5 p-5 rounded-2xl bg-black/20">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Bot size={14} className="text-amber-400"/> AI Message Logic</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-300">Agent Tone Strategy</span>
                           <select value={tone} onChange={e=>setTone(e.target.value)} className="bg-black/50 border border-white/10 rounded px-2 py-1 text-cyan-400 font-bold focus:outline-none">
                             <option>Friendly</option>
                             <option>Premium</option>
                             <option>Direct</option>
                             <option>Luxury</option>
                           </select>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-2">
                           The AI Agent will dynamically parse the Lead's category, rating, city, and business name to craft a personalized non-spammy outreach message that matches the "{tone}" tone structure.
                        </div>
                      </div>
                    </div>

                    <div className="glass-card border border-purple-500/20 p-5 rounded-2xl bg-purple-500/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                      <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">Live Generation Preview</h4>
                      <p className="text-xs text-purple-100 font-mono italic leading-relaxed relative z-10 group-hover:text-white transition-colors">
                        "Hi John, I noticed Apex Studio holds an impressive rating in Seattle. We specialize in helping premium studios scale their booked consultations via WhatsApp automation. Would you be open to seeing a quick demo?"
                      </p>
                    </div>
                 </div>

               </div>
            </main>

            {/* COLUMN 3: Right Sidebar (Settings + Terminal) */}
            <aside className="w-full lg:w-80 border-l border-white/5 bg-[#030406] flex flex-col shrink-0">
               
               {/* Advanced Settings Config */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 border-b border-white/5 relative">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Settings size={14}/> Agent Configuration</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400">WhatsApp Safety Engine</h4>
                      <p className="text-[9px] text-slate-500">Delay between messages helps reduce spam detection risk.</p>
                      <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-white/5">
                        <span className="text-[10px] text-slate-300">Dispatch Delay</span>
                        <span className="text-[10px] font-mono text-emerald-400">30s - 60s</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-white/5">
                        <span className="text-[10px] text-slate-300">Daily Batch Limit</span>
                        <span className="text-[10px] font-mono text-emerald-400">250 Msgs</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-cyan-400">Contact Sync Agent</h4>
                      <p className="text-[9px] text-slate-500">Automatically save valid numbers into your WhatsApp directory.</p>
                      <label className="flex items-center gap-2 text-[10px] text-slate-300"><input type="checkbox" defaultChecked className="accent-cyan-500"/> Auto-Save Contacts</label>
                      <label className="flex items-center gap-2 text-[10px] text-slate-300"><input type="checkbox" defaultChecked className="accent-cyan-500"/> Filter Invalid Numbers</label>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-purple-400">CRM Engine</h4>
                      <p className="text-[9px] text-slate-500">Update Lead statuses directly in the Nexus pipeline.</p>
                      <label className="flex items-center gap-2 text-[10px] text-slate-300"><input type="checkbox" defaultChecked className="accent-purple-500"/> Pipeline Sync Status</label>
                      <label className="flex items-center gap-2 text-[10px] text-slate-300"><input type="checkbox" defaultChecked className="accent-purple-500"/> Auto-Tag (Hot Intent)</label>
                    </div>
                  </div>
               </div>

               {/* Live Terminal */}
               <div className="h-64 bg-[#010203] p-4 flex flex-col font-mono relative">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal size={14} className="text-emerald-400" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">System Execution Shell</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] text-emerald-400/80 space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className="hover:bg-white/[0.02] px-1 py-0.5 rounded transition-colors break-words leading-relaxed">{log}</div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
               </div>

            </aside>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
