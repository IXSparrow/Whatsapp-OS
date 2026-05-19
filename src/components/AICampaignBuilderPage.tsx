import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Database, UploadCloud, Link as LinkIcon, RefreshCw, 
  Settings, Play, Terminal, Users, CheckCircle2, AlertTriangle, 
  Bot, Save, MessageSquare, Zap, Activity, BrainCircuit, X, ChevronRight, Phone
} from 'lucide-react';
import clsx from 'clsx';
import Papa from 'papaparse';

const WORKFLOW_STEPS = [
  { id: 'source', label: 'Source Selection' },
  { id: 'fetch_vault', label: 'Data Vault Fetch' },
  { id: 'fetch_crm', label: 'CRM Opportunities Fetch' },
  { id: 'import_csv', label: 'CSV Import' },
  { id: 'dedupe', label: 'Deduplication' },
  { id: 'validate', label: 'Phone Validation' },
  { id: 'save', label: 'Contact Save' },
  { id: 'pitch', label: 'AI Pitch Generation' },
  { id: 'queue', label: 'WhatsApp Queue' },
  { id: 'launch', label: 'Campaign Launch' },
  { id: 'sync', label: 'CRM Sync' },
  { id: 'track', label: 'Performance Tracking' }
];

interface Lead {
  id: string;
  name?: string;
  businessName?: string;
  phone?: string;
  category?: string;
  city?: string;
  website?: string;
  rating?: string | number;
  score?: number;
  source: string;
  aiMessage?: string;
  status?: string;
}

export function AICampaignBuilderPage({ onBack }: { onBack: () => void }) {
  const [activeStep, setActiveStep] = useState<string>('source');
  const [vaultBatch, setVaultBatch] = useState<any[]>([]);
  const [targetList, setTargetList] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<string[]>([
    '[System] AI Campaign Agent Builder initialized.',
    '[System] Awaiting data source selection...'
  ]);
  
  const [tone, setTone] = useState('Premium');
  const [offer, setOffer] = useState('review boosting');
  const [template, setTemplate] = useState("Hi {name}, hope you are doing great! I noticed {businessName} has awesome customer ratings in {city}. We can help boost reviews even more using automated channels. Can we chat?");
  
  const [campaignStatus, setCampaignStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    selected: 0,
    waReady: 0,
    missing: 0,
    duplicates: 0,
    generated: 0,
    saved: 0,
    queue: 0,
    replies: 0
  });

  // Settings
  const [settings, setSettings] = useState({
    waProvider: 'cloud_api',
    speed: 'medium',
    dailyLimit: 250,
    retryFailed: true,
    saveCrm: true,
    saveVault: true,
    aiEnabled: true,
    strictDedupe: true
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    // Fetch latest vault leads for preview
    fetchLatestVault();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (agent: string, message: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] [${agent}] ${message}`]);
  };

  const updateStats = (list: Lead[]) => {
    let waReady = 0;
    let missing = 0;
    let generated = 0;
    
    list.forEach(l => {
      if (l.phone && l.phone.length > 5) waReady++;
      else missing++;
      
      if (l.aiMessage) generated++;
    });

    setStats(s => ({
      ...s,
      selected: list.length,
      waReady,
      missing,
      generated
    }));
  };

  const dedupeAndAdd = (newLeads: Lead[], sourceName: string) => {
    addLog('Agent', `Validating and deduping ${newLeads.length} leads from ${sourceName}...`);
    let added = 0;
    let dupes = 0;
    
    setTargetList(prev => {
      const updated = [...prev];
      newLeads.forEach(nl => {
        // Simple dedupe by phone or name
        const isDupe = updated.find(el => (el.phone && el.phone === nl.phone) || (el.businessName && el.businessName === nl.businessName));
        if (isDupe) {
          dupes++;
        } else {
          updated.push({ ...nl, id: nl.id || Math.random().toString(36).substring(7), source: sourceName, status: nl.phone ? 'Valid' : 'Missing Phone' });
          added++;
        }
      });
      updateStats(updated);
      return updated;
    });
    
    setStats(s => ({ ...s, duplicates: s.duplicates + dupes }));
    addLog('Agent', `Added ${added} leads. Skipped ${dupes} duplicates.`);
  };

  const fetchLatestVault = async () => {
    try {
       // In real app, this hits GET /api/data-vault/latest
       const saved = localStorage.getItem('nexus-lead-vault');
       if (saved) {
         const parsed = JSON.parse(saved);
         if (Array.isArray(parsed) && parsed.length > 0) {
           setVaultBatch(parsed.slice(-10).reverse()); // Last 10
         }
       }
    } catch(e) {
      console.error(e);
    }
  };

  const handleFetchVault = () => {
    setActiveStep('fetch_vault');
    addLog('Agent', 'Fetching all latest leads from Data Vault...');
    try {
       const saved = localStorage.getItem('nexus-lead-vault');
       if (saved) {
         const parsed = JSON.parse(saved);
         if (Array.isArray(parsed)) {
            dedupeAndAdd(parsed, 'Data Vault');
         }
       } else {
         addLog('Agent', 'Data Vault is empty.');
       }
    } catch(e) {
      addLog('Error', 'Failed to read Data Vault');
    }
  };

  const handleFetchCRM = () => {
    setActiveStep('fetch_crm');
    addLog('Agent', 'Fetching real opportunities from Nexus CRM...');
    try {
      const saved = localStorage.getItem('nexus_crm_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
           // Filter to just hot/warm or all
           dedupeAndAdd(parsed, 'CRM Opps');
        }
      } else {
        addLog('Agent', 'No opportunities found in CRM.');
      }
    } catch(e) {
      addLog('Error', 'Failed to read CRM');
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setActiveStep('import_csv');
    addLog('Agent', `Parsing CSV upload: ${file.name}`);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        addLog('Agent', `CSV parsed successfully. Found ${results.data.length} rows.`);
        const mapped: Lead[] = results.data.map((row: any) => ({
          id: Math.random().toString(36).substring(7),
          name: row.name || row.Name || row.contact || '',
          businessName: row.businessName || row.company || row.Company || row.name || 'Unknown',
          phone: row.phone || row.Phone || row.mobile || '',
          category: row.category || row.industry || 'Unknown',
          city: row.city || row.location || row.City || 'Unknown',
          website: row.website || '',
          rating: row.rating || row.score || '',
          source: 'CSV Upload'
        }));
        dedupeAndAdd(mapped, 'CSV');
      },
      error: (error: Error) => {
        addLog('Error', `CSV Parsing failed: ${error.message}`);
      }
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateMessages = () => {
    if (targetList.length === 0) {
      addLog('Error', 'No leads selected to generate messages for.');
      return;
    }
    setActiveStep('pitch');
    addLog('Agent', `Initiating AI Pitch Studio for ${targetList.length} leads...`);
    
    setTargetList(prev => {
      const updated = prev.map(l => {
        let msg = template
          .replace('{name}', l.name || l.businessName || 'there')
          .replace('{businessName}', l.businessName || 'your business')
          .replace('{city}', l.city || 'your area')
          .replace('{rating}', String(l.rating || '4.5'));
        return { ...l, aiMessage: msg, status: 'Ready' };
      });
      updateStats(updated);
      return updated;
    });
    addLog('Agent', 'AI Messages generated successfully.');
  };

  const handleSaveContacts = () => {
    if (stats.waReady === 0) return;
    setActiveStep('save');
    addLog('Agent', `Normalizing and saving ${stats.waReady} valid contacts...`);
    setTimeout(() => {
      setStats(s => ({ ...s, saved: s.waReady }));
      addLog('Agent', 'Contacts saved and synced to directory.');
    }, 1000);
  };

  const handleStartCampaign = () => {
    if (stats.waReady === 0 || stats.generated === 0) return;
    
    setCampaignStatus('running');
    addLog('System', 'Autonomous campaign execution initiated.');
    
    // Animate workflow visually
    let idx = WORKFLOW_STEPS.findIndex(s => s.id === 'queue');
    const interval = setInterval(() => {
      if (idx >= WORKFLOW_STEPS.length) {
        clearInterval(interval);
        setCampaignStatus('completed');
        addLog('System', 'Campaign successfully orchestrated.');
        return;
      }
      setActiveStep(WORKFLOW_STEPS[idx].id);
      addLog('AI Node', `Executing: ${WORKFLOW_STEPS[idx].label}...`);
      
      if (WORKFLOW_STEPS[idx].id === 'queue') {
         setStats(s => ({ ...s, queue: s.waReady }));
      }
      if (WORKFLOW_STEPS[idx].id === 'track') {
         setStats(s => ({ ...s, replies: Math.floor(s.queue * 0.15) })); // fake estimate
      }
      
      idx++;
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#030406] text-slate-200 overflow-hidden font-sans">
      
      {/* 1. TOP HEADER */}
      <header className="flex-none h-20 border-b border-white/10 bg-[#05070a]/90 backdrop-blur-md px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>
          
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              AI Campaign Agent Builder
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">READY</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Create, validate, personalize, and launch automated WhatsApp campaigns from real CRM and Data Vault leads.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 mr-2 bg-black/40 rounded-xl p-1.5 border border-white/5">
             <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold px-2 py-1"><Database size={12}/> Vault Connected</div>
             <div className="w-px h-3 bg-white/10" />
             <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-bold px-2 py-1"><LinkIcon size={12}/> CRM Linked</div>
             <div className="w-px h-3 bg-white/10" />
             <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold px-2 py-1"><MessageSquare size={12}/> WA Active</div>
          </div>
          
          <button onClick={() => setShowSettings(!showSettings)} className={clsx("p-2.5 rounded-xl border transition-colors", showSettings ? "bg-white/10 border-white/20 text-white" : "text-slate-400 hover:text-white bg-white/5 border-white/10 hover:bg-white/10")}>
            <Settings size={16} className={showSettings ? "animate-spin-slow" : ""} />
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE GRID */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SETTINGS PANEL (Absolute Overlay on right if open) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-[#06080d] border-l border-white/10 shadow-2xl z-40 flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Campaign Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp Engine</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Sending Speed</span>
                    <select value={settings.speed} onChange={e=>setSettings({...settings, speed: e.target.value})} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none">
                      <option value="slow">Slow & Safe</option>
                      <option value="medium">Medium</option>
                      <option value="fast">Fast (Risky)</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Daily Limit</span>
                    <input type="number" value={settings.dailyLimit} onChange={e=>setSettings({...settings, dailyLimit: parseInt(e.target.value)})} className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none text-right" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Management</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.saveCrm} onChange={e=>setSettings({...settings, saveCrm: e.target.checked})} className="accent-emerald-500" />
                    <span className="text-xs text-slate-300">Save leads to CRM</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.strictDedupe} onChange={e=>setSettings({...settings, strictDedupe: e.target.checked})} className="accent-emerald-500" />
                    <span className="text-xs text-slate-300">Strict Deduplication</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.aiEnabled} onChange={e=>setSettings({...settings, aiEnabled: e.target.checked})} className="accent-emerald-500" />
                    <span className="text-xs text-slate-300">AI Personalization Enabled</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. LEFT AGENT WORKFLOW */}
        <aside className="w-64 border-r border-white/5 bg-[#020305] flex flex-col shrink-0 overflow-y-auto custom-scrollbar relative z-10">
          <div className="p-5 border-b border-white/5 sticky top-0 bg-[#020305]/90 backdrop-blur-md z-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent Workflow Steps</h3>
          </div>
          <div className="p-5 flex-1 relative">
            <div className="absolute left-7 top-6 bottom-6 w-px bg-white/5" />
            <div className="space-y-4 relative z-10">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = activeStep === step.id;
                const isPast = WORKFLOW_STEPS.findIndex(s => s.id === activeStep) > idx || campaignStatus === 'completed';
                
                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={clsx(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      isActive ? "border-cyan-400 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-125" : 
                      isPast ? "border-emerald-500 bg-emerald-500" : "border-slate-800 bg-[#020305]"
                    )}>
                      {isPast && <CheckCircle2 size={10} className="text-black" />}
                    </div>
                    <div>
                      <span className={clsx("text-xs font-bold transition-colors", isActive ? "text-cyan-400" : isPast ? "text-emerald-400" : "text-slate-600")}>
                        {step.label}
                      </span>
                      {isActive && <div className="text-[9px] text-cyan-400/50 uppercase tracking-widest mt-0.5">Running...</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 3. CENTER PANEL (Lead Sources & Builder) */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#06080d] overflow-y-auto custom-scrollbar relative">
          
          {/* Neural Background */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] mix-blend-screen" />
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="p-8 space-y-10 relative z-10 max-w-6xl mx-auto w-full pb-32">
            
            {/* SOURCE SELECTION ENGINE */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Database size={16} className="text-cyan-400"/> Lead Source Engine
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Data Vault Fetch */}
                <div className="glass-card border border-white/10 p-6 rounded-2xl bg-[#030406]/80 flex flex-col hover:border-emerald-500/30 transition-all group">
                  <Database size={24} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-white mb-2">Latest Data Vault Leads</h3>
                  <p className="text-xs text-slate-400 mb-6 flex-1 leading-relaxed">Pull the most recently extracted or validated records stored persistently.</p>
                  <button onClick={handleFetchVault} className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-500/20 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    Fetch Latest Vault
                  </button>
                </div>

                {/* CRM Opportunities Fetch */}
                <div className="glass-card border border-white/10 p-6 rounded-2xl bg-[#030406]/80 flex flex-col hover:border-purple-500/30 transition-all group">
                  <LinkIcon size={24} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-white mb-2">CRM Opportunities</h3>
                  <p className="text-xs text-slate-400 mb-6 flex-1 leading-relaxed">Import hot leads directly from your active Nexus CRM sales pipeline.</p>
                  <button onClick={handleFetchCRM} className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-wider rounded-xl border border-purple-500/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    Import from CRM
                  </button>
                </div>

                {/* CSV Upload */}
                <div className="glass-card border border-dashed border-cyan-500/30 bg-cyan-500/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all">
                  <UploadCloud size={32} className="text-cyan-400 mb-4 group-hover:-translate-y-2 transition-transform" />
                  <h3 className="text-sm font-bold text-white mb-2">CSV Upload</h3>
                  <p className="text-xs text-slate-400 mb-6">Drag and drop target list or click to browse.</p>
                  <input type="file" accept=".csv" onChange={handleCSVUpload} ref={fileInputRef} className="hidden" />
                  <button onClick={()=>fileInputRef.current?.click()} className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider rounded-xl border border-cyan-500/30 transition-colors">
                    Upload CSV
                  </button>
                </div>
              </div>
            </div>

            {/* RECENT VAULT PREVIEW */}
            {vaultBatch.length > 0 && (
              <div className="glass-card border border-white/5 rounded-2xl overflow-hidden bg-black/40">
                 <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                   <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Activity size={14} className="text-emerald-400" /> Recently Generated Vault Leads
                   </h3>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Preview (Last {vaultBatch.length})</span>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                       <tr>
                         <th className="px-5 py-3">Business</th>
                         <th className="px-5 py-3">Category</th>
                         <th className="px-5 py-3">City</th>
                         <th className="px-5 py-3">Source</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                       {vaultBatch.map((l, i) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-5 py-3 font-bold text-white">{l.businessName || l.name || 'Unknown'}</td>
                           <td className="px-5 py-3">{l.category || 'N/A'}</td>
                           <td className="px-5 py-3">{l.city || 'N/A'}</td>
                           <td className="px-5 py-3"><span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px]">{l.source || 'Vault'}</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 <div className="p-4 border-t border-white/5 flex justify-end bg-black/20">
                   <button onClick={() => dedupeAndAdd(vaultBatch, 'Recent Batch')} className="text-xs font-black text-emerald-400 flex items-center gap-2 hover:text-emerald-300 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 transition-all hover:scale-105">
                     Use This Batch <ArrowLeft size={14} className="rotate-180"/>
                   </button>
                 </div>
              </div>
            )}

            {/* AI PITCH STUDIO */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Bot size={16} className="text-amber-400"/> AI Pitch Studio
              </h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {/* Input configuration */}
                 <div className="glass-card border border-white/10 p-6 rounded-2xl bg-[#030406]/60 space-y-5 shadow-xl">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tone</label>
                        <select value={tone} onChange={e=>setTone(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors appearance-none">
                          <option>Friendly</option>
                          <option>Premium</option>
                          <option>Short human-like</option>
                          <option>Local business</option>
                          <option>Luxury agency</option>
                          <option>Direct sales</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Offer / CTA</label>
                        <input type="text" value={offer} onChange={e=>setOffer(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"/>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Base Prompt Structure</label>
                        <div className="flex gap-1">
                          {['{name}', '{businessName}', '{city}'].map(v => (
                            <button key={v} onClick={() => setTemplate(prev => prev + ' ' + v)} className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10">{v}</button>
                          ))}
                        </div>
                      </div>
                      <textarea rows={4} value={template} onChange={e=>setTemplate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none font-mono transition-colors resize-none"/>
                    </div>
                 </div>

                 {/* Preview */}
                 <div className="glass-card border border-amber-500/20 p-6 rounded-2xl bg-amber-500/5 relative flex flex-col justify-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none rounded-2xl" />
                   <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 relative z-10">Live Generation Preview</h3>
                   <div className="bg-black/60 border border-amber-500/20 rounded-xl p-5 relative z-10 shadow-inner">
                     <p className="text-sm text-amber-100/90 leading-relaxed font-mono">
                       {template
                         .replace('{name}', 'John')
                         .replace('{businessName}', 'Apex Studio')
                         .replace('{city}', 'Seattle')
                         .replace('{rating}', '4.8')}
                     </p>
                   </div>
                 </div>
              </div>
            </div>

            {/* TARGET LIST TABLE */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Campaign Target List
              </h2>
              <div className="glass-card border border-white/10 rounded-2xl overflow-hidden bg-[#030406]/80 shadow-2xl">
                 <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{targetList.length} Leads Selected</span>
                   {targetList.length > 0 && (
                     <button onClick={() => setTargetList([])} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest">Clear List</button>
                   )}
                 </div>
                 <div className="max-h-96 overflow-y-auto custom-scrollbar">
                   <table className="w-full text-left">
                     <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-[#020305] sticky top-0 z-10">
                       <tr>
                         <th className="px-5 py-4 border-b border-white/10">Lead</th>
                         <th className="px-5 py-4 border-b border-white/10">Phone</th>
                         <th className="px-5 py-4 border-b border-white/10">Source</th>
                         <th className="px-5 py-4 border-b border-white/10 w-1/3">AI Message</th>
                         <th className="px-5 py-4 border-b border-white/10">Status</th>
                         <th className="px-5 py-4 border-b border-white/10 text-right">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                       {targetList.length === 0 ? (
                         <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500 italic text-sm">No real leads found. Import CSV or fetch from Data Vault.</td></tr>
                       ) : (
                         targetList.map((lead, i) => (
                           <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-5 py-4">
                               <div className="font-bold text-white truncate max-w-[150px]">{lead.name || lead.businessName}</div>
                               <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate max-w-[150px]">{lead.category || 'Lead'} • {lead.city || 'Unknown'}</div>
                             </td>
                             <td className="px-5 py-4 font-mono text-cyan-400 text-xs">
                               <div className="flex items-center gap-1.5">
                                 {lead.phone ? <Phone size={10} className="text-cyan-500/50" /> : <AlertTriangle size={10} className="text-rose-500/50" />}
                                 {lead.phone || 'Missing'}
                               </div>
                             </td>
                             <td className="px-5 py-4"><span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] whitespace-nowrap">{lead.source}</span></td>
                             <td className="px-5 py-4">
                               {lead.aiMessage ? (
                                 <div className="text-[11px] text-slate-400 truncate max-w-[250px] italic border-l-2 border-amber-500/50 pl-2">"{lead.aiMessage}"</div>
                               ) : (
                                 <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Pending Generation</span>
                               )}
                             </td>
                             <td className="px-5 py-4">
                               <span className={clsx("text-[10px] font-black uppercase tracking-widest", 
                                 lead.status === 'Valid' || lead.status === 'Ready' ? "text-emerald-400" : "text-rose-400"
                               )}>
                                 {lead.status}
                               </span>
                             </td>
                             <td className="px-5 py-4 text-right">
                               <button onClick={() => {
                                 setTargetList(prev => {
                                   const n = prev.filter(p => p.id !== lead.id);
                                   updateStats(n);
                                   return n;
                                 });
                               }} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                                 <X size={16} />
                               </button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
              </div>
            </div>
            
          </div>
        </main>

        {/* 4. RIGHT PANEL (Metrics & Actions) */}
        <aside className="w-80 border-l border-white/5 bg-[#020305] flex flex-col shrink-0 relative overflow-hidden z-10">
           
           <div className="p-5 border-b border-white/5 sticky top-0 bg-[#020305]/90 backdrop-blur-md z-10">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Live Metrics</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 pb-24">
              
              <div className="grid grid-cols-2 gap-3">
                 <MetricCard label="Selected" val={stats.selected} color="text-white" />
                 <MetricCard label="WA Ready" val={stats.waReady} color="text-emerald-400" />
                 <MetricCard label="Missing Phone" val={stats.missing} color="text-rose-400" />
                 <MetricCard label="Duplicates" val={stats.duplicates} color="text-amber-400" />
                 <MetricCard label="AI Generated" val={stats.generated} color="text-amber-400" />
                 <MetricCard label="Contacts Saved" val={stats.saved} color="text-cyan-400" />
                 <MetricCard label="Queue Ready" val={stats.queue} color="text-purple-400" />
                 <MetricCard label="Est. Replies" val={stats.replies} color="text-emerald-400" />
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex justify-between items-center">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CRM Sync Status</div>
                   <div className="text-[9px] text-purple-400 font-bold">Auto-sync Active</div>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 w-full animate-pulse" />
                 </div>
              </div>

              {/* LIVE AGENT LOG */}
              <div className="bg-[#010102] rounded-2xl border border-white/5 p-4 flex flex-col h-[300px] mt-4 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Terminal size={12}/> Agent Terminal</h4>
                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] text-cyan-500/80 space-y-2 leading-relaxed">
                   {logs.map((log, i) => (
                     <div key={i} className="break-words border-b border-cyan-500/10 pb-1">{log}</div>
                   ))}
                   <div ref={logsEndRef} />
                </div>
              </div>
           </div>
        </aside>

      </div>

      {/* 5. BOTTOM CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#030406]/90 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-8 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         <div className="flex gap-4">
           <button onClick={onBack} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 transition-colors">Cancel</button>
           <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 transition-colors flex items-center gap-2"><Save size={16}/> Save Draft</button>
         </div>

         <div className="flex items-center gap-5">
           <button 
             onClick={handleSaveContacts}
             disabled={stats.waReady === 0}
             className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-30 disabled:hover:bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-xl border border-cyan-500/30 transition-colors"
           >
             Save Contacts
           </button>
           <button 
             onClick={handleGenerateMessages}
             disabled={stats.waReady === 0}
             className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-widest rounded-xl border border-amber-500/30 transition-colors"
           >
             Generate Messages
           </button>
           <div className="w-px h-8 bg-white/10 mx-2" />
           <button 
             onClick={handleStartCampaign}
             disabled={stats.waReady === 0 || stats.generated === 0 || campaignStatus !== 'idle'}
             className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:grayscale text-black font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all flex items-center gap-3"
           >
             <Play size={20} className="fill-black" /> {campaignStatus === 'running' ? 'Agent Processing...' : 'Start WhatsApp Campaign'}
           </button>
         </div>
      </div>

    </div>
  );
}

function MetricCard({ label, val, color }: { label: string, val: number, color: string }) {
  return (
    <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner hover:border-white/10 transition-colors">
      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 mb-2">{label}</span>
      <span className={clsx("text-3xl font-black", color)}>{val}</span>
    </div>
  );
}
