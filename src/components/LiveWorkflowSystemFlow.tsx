import React, { useEffect, useRef } from 'react';
import { Activity, CheckCircle2, Circle, AlertCircle, Terminal, Copy, Loader2, Cpu, Zap, Search, Fingerprint, Database, Send, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  time: string;
}

interface LiveWorkflowProps {
  logs: LogEntry[];
  status: 'idle' | 'running' | 'completed' | 'error';
}

const STAGES = [
  { id: 'api_key', label: 'API Key Check', match: ['Checking API key configuration'], agent: 'Security Agent', icon: Fingerprint },
  { id: 'query_build', label: 'Query Builder', match: ['Validating input'], agent: 'Core Logic Agent', icon: Cpu },
  { id: 'search', label: 'Google Places Search', match: ['Searching Google Places page'], agent: 'Search Agent', icon: Search },
  { id: 'pagination', label: 'Pagination Scan', match: ['Page 1 fetched successfully'], agent: 'Search Agent', icon: Search },
  { id: 'details', label: 'Business Details Fetch', match: ['Fetching details for businesses'], agent: 'Data Agent', icon: Database },
  { id: 'dedupe', label: 'Deduplication', match: ['Filtering by quality floor and cleaning duplicates'], agent: 'Cleaning Agent', icon: ShieldAlert },
  { id: 'quality', label: 'Quality Filter', match: ['Filtering by quality floor and cleaning duplicates'], agent: 'Scoring Agent', icon: CheckCircle2 },
  { id: 'website', label: 'Website Enrichment', match: ['Enriching leads with website data'], agent: 'Enrichment Agent', icon: Zap },
  { id: 'scoring', label: 'Lead Scoring', match: ['Enriching leads with website data'], agent: 'Scoring Agent', icon: CheckCircle2 }, // Proxy for scoring
  { id: 'db_save', label: 'Database Save', match: ['Saving extracted leads to Data Vault'], agent: 'Data Agent', icon: Database },
  { id: 'export', label: 'Export Ready', match: ['Vault updated successfully', 'Extraction completed'], agent: 'Export Agent', icon: Send },
  { id: 'outreach', label: 'Outreach Ready', match: ['Extraction completed'], agent: 'Outreach Agent', icon: Zap },
];

export default function LiveWorkflowSystemFlow({ logs, status }: LiveWorkflowProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Derive stage status from logs
  const getStageStatus = (stage: typeof STAGES[0], index: number) => {
    if (status === 'idle') return 'waiting';
    
    const hasStarted = logs.some(l => stage.match.some(m => l.message.includes(m)));
    const hasError = logs.some(l => l.type === 'error');
    const isCompleteLog = logs.some(l => l.message.includes('Extraction completed') || l.message.includes('Real data extraction failed'));

    let currentActiveStageIndex = -1;
    for (let i = logs.length - 1; i >= 0; i--) {
      const matchedStageIndex = STAGES.findIndex(s => s.match.some(m => logs[i].message.includes(m)));
      if (matchedStageIndex !== -1) {
        currentActiveStageIndex = matchedStageIndex;
        break;
      }
    }

    if (hasError && status === 'error') {
       if (index === currentActiveStageIndex) return 'error';
       if (index < currentActiveStageIndex) return 'success';
       return 'waiting';
    }

    if (status === 'completed' || isCompleteLog) {
       if (hasStarted || index <= STAGES.findIndex(s => s.id === 'outreach')) return 'success';
    }

    if (hasStarted) {
      if (index === currentActiveStageIndex && status === 'running') return 'running';
      if (index < currentActiveStageIndex) return 'success';
    }
    
    if (currentActiveStageIndex > index) return 'success';

    return 'waiting';
  };

  const copyLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const lastError = logs.slice().reverse().find(l => l.type === 'error');
  
  // Calculate progress and current agent
  let currentActiveStageIndex = -1;
  for (let i = logs.length - 1; i >= 0; i--) {
    const matchedStageIndex = STAGES.findIndex(s => s.match.some(m => logs[i].message.includes(m)));
    if (matchedStageIndex !== -1) {
      currentActiveStageIndex = matchedStageIndex;
      break;
    }
  }
  
  let currentAgent = 'Idle';
  if (status === 'running' && currentActiveStageIndex !== -1) {
    currentAgent = STAGES[currentActiveStageIndex].agent;
  } else if (status === 'completed') {
    currentAgent = 'All Agents Complete';
  } else if (status === 'error') {
    currentAgent = 'Agent Error Detetcted';
  }
  
  let progress = 0;
  if (status === 'completed') progress = 100;
  else if (status === 'running' && currentActiveStageIndex !== -1) {
    progress = Math.round(((currentActiveStageIndex + 1) / STAGES.length) * 100);
  }

  // Count leads from logs (dummy count extraction logic if available, else derive)
  let leadsFound = 0;
  const leadLog = logs.slice().reverse().find(l => l.message.includes('Total validated leads:'));
  if (leadLog) {
    const match = leadLog.message.match(/\d+/);
    if (match) leadsFound = parseInt(match[0], 10);
  }

  return (
    <div className={clsx(
      "glass-card flex flex-col rounded-2xl border backdrop-blur-xl h-full overflow-hidden transition-all duration-700 relative",
      status === 'running' ? "border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.05)]" : 
      status === 'error' ? "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]" : 
      status === 'completed' ? "border-neon-green/30 shadow-[0_0_30px_rgba(37,211,102,0.05)]" : 
      "border-white/8"
    )}>
      {/* Animated gradient border for active state */}
      {status === 'running' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 w-[200%] animate-[scan_3s_linear_infinite] pointer-events-none -z-10" />
      )}
      {status === 'completed' && (
        <div className="absolute inset-0 bg-gradient-to-r from-neon-green/0 via-neon-green/5 to-neon-green/0 w-[200%] animate-[scan_4s_linear_infinite] pointer-events-none -z-10" />
      )}
      
      {/* Tiny particle dots background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none -z-10" />

      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-white/5 bg-black/40 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              {status === 'running' && <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-50" />}
              {status === 'completed' && <div className="absolute inset-0 bg-neon-green/20 rounded-full animate-ping opacity-50" />}
              <div className={clsx(
                "w-12 h-12 border rounded-full flex items-center justify-center transition-colors relative z-10",
                status === 'idle' ? "bg-white/5 border-white/10" :
                status === 'running' ? "bg-[#050505] border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" :
                status === 'completed' ? "bg-[#050505] border-neon-green/30 shadow-[0_0_15px_rgba(37,211,102,0.2)]" :
                "bg-[#050505] border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              )}>
                <Activity size={20} className={clsx(
                  status === 'idle' ? "text-slate-500" :
                  status === 'running' ? "text-blue-400" :
                  status === 'completed' ? "text-neon-green" :
                  "text-red-500"
                )} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black tracking-tight text-white">Live Workflow System Flow</h2>
                <span className={clsx(
                  "px-2 py-0.5 text-[9px] font-bold rounded-full tracking-widest uppercase border",
                  status === 'idle' && "bg-slate-500/10 text-slate-400 border-slate-500/20",
                  status === 'running' && "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
                  status === 'completed' && "bg-neon-green/10 text-neon-green border-neon-green/30 shadow-[0_0_10px_rgba(37,211,102,0.2)]",
                  status === 'error' && "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                )}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Real-time extraction pipeline and console stream.</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Matrix Status</div>
            <div className="text-xs text-blue-400/80 font-mono flex items-center gap-1 justify-end">
              <Cpu size={10} /> {status === 'idle' ? 'Agents Standby' : 'Autonomous Agents Online'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative z-10">
        {/* ZONE 1: Agent Flow Map */}
        <div className="w-full lg:w-[45%] border-r border-white/5 p-6 overflow-y-auto custom-scrollbar bg-black/20 relative">
          {/* Subtle scanning line over the flow map */}
          {status === 'running' && (
            <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-blue-500/0 via-blue-500/5 to-blue-500/0 animate-[scan_3s_linear_infinite] pointer-events-none" />
          )}
          
          <div className="space-y-4">
            {STAGES.map((stage, i) => {
              const stageStatus = getStageStatus(stage, i);
              const StageIcon = stage.icon;
              return (
                <div key={stage.id} className="flex gap-4 relative group">
                  {i !== STAGES.length - 1 && (
                    <div className={clsx(
                      "absolute left-[11px] top-7 bottom-[-16px] w-0.5 transition-colors duration-500",
                      stageStatus === 'success' ? "bg-neon-green/50 shadow-[0_0_5px_rgba(37,211,102,0.5)]" : 
                      stageStatus === 'running' ? "bg-blue-500/50 shadow-[0_0_5px_rgba(59,130,246,0.5)]" : 
                      "bg-white/10"
                    )} />
                  )}
                  <div className="relative z-10 shrink-0 mt-1">
                    {/* Orb glow behind active node */}
                    {stageStatus === 'running' && <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full" />}
                    {stageStatus === 'success' && <div className="absolute inset-0 bg-neon-green/20 blur-sm rounded-full" />}
                    
                    {stageStatus === 'success' && <CheckCircle2 size={24} className="text-neon-green bg-black rounded-full relative z-10" />}
                    {stageStatus === 'running' && <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin bg-black relative z-10 flex items-center justify-center" />}
                    {stageStatus === 'waiting' && <Circle size={24} className="text-slate-600 bg-[#050505] rounded-full relative z-10" />}
                    {stageStatus === 'error' && <AlertCircle size={24} className="text-red-500 bg-black rounded-full relative z-10" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className={clsx(
                      "text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors duration-300",
                      stageStatus === 'success' && "text-white",
                      stageStatus === 'running' && "text-blue-400",
                      stageStatus === 'waiting' && "text-slate-500 group-hover:text-slate-400",
                      stageStatus === 'error' && "text-red-400"
                    )}>
                      {stage.label}
                      <StageIcon size={12} className={clsx("opacity-50", stageStatus === 'running' && "animate-pulse")} />
                    </div>
                    {stageStatus === 'running' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-blue-400/70 mt-1 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.5)]" /> Processing...
                      </motion.div>
                    )}
                    {stageStatus === 'success' && (
                      <div className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-widest">Completed</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ZONE 2: Live Terminal Stream */}
        <div className="w-full lg:w-[55%] flex flex-col bg-[#020202] relative">
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                Live Terminal Stream
                {status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1.5 mr-4 items-center opacity-50">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <button onClick={copyLogs} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors" title="Copy Logs">
                <Copy size={12} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed space-y-1.5 relative">
            {/* Scanline overlay for terminal */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-0" />
            
            <div className="relative z-10">
              {logs.length === 0 ? (
                <div className="text-slate-600">
                  <div className="text-blue-400">» Lead Engine initialized...</div>
                  <div>» Ready for new extraction request.</div>
                  <div className="animate-pulse mt-2">_</div>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-3 hover:bg-white/[0.03] px-2 py-0.5 rounded transition-colors group">
                    <span className="text-slate-600/70 shrink-0 select-none group-hover:text-slate-500 transition-colors">[{log.time}]</span>
                    <span className={clsx(
                      "break-words flex-1",
                      log.type === 'success' && 'text-neon-green shadow-neon-green/20 drop-shadow-sm',
                      log.type === 'info' && 'text-blue-400/90',
                      log.type === 'warning' && 'text-yellow-400',
                      log.type === 'error' && 'text-red-400 font-bold',
                    )}>
                      {log.type === 'success' ? '✓' : log.type === 'error' ? '!' : '»'} {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 3: Agent Status Summary */}
      <div className="p-4 lg:p-6 border-t border-white/5 bg-black/60 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Agent</div>
            <div className={clsx(
              "text-xs font-bold font-mono truncate",
              status === 'running' ? "text-blue-400" :
              status === 'completed' ? "text-neon-green" :
              status === 'error' ? "text-red-400" :
              "text-slate-400"
            )}>
              {currentAgent}
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-white/5 transition-all duration-500" style={{ width: `${progress}%` }} />
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 relative z-10">Matrix Progress</div>
            <div className="text-xs font-bold text-white relative z-10 flex items-center gap-2">
              {progress}% {status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Leads Extracted</div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Database size={12} className="text-neon-green" /> {leadsFound} Validated
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">System State</div>
            <div className={clsx(
              "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
              status === 'running' ? "text-blue-400" :
              status === 'completed' ? "text-neon-green" :
              status === 'error' ? "text-red-400" :
              "text-slate-400"
            )}>
              {status === 'running' && <Loader2 size={12} className="animate-spin" />}
              {status === 'completed' && <CheckCircle2 size={12} />}
              {status === 'error' && <AlertCircle size={12} />}
              {status === 'idle' && <Circle size={12} />}
              {status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Error Block - Slides down if error */}
        <AnimatePresence>
          {status === 'error' && lastError && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldAlert size={64} className="text-red-500" />
                </div>
                <div className="flex items-center gap-2 text-red-400 font-bold mb-2 relative z-10">
                  <AlertCircle size={16} /> No real results returned
                </div>
                <div className="text-xs text-red-400/80 mb-3 relative z-10 font-mono">{lastError.message}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black relative z-10 mb-1">Troubleshooting Hints:</div>
                <ul className="text-xs text-slate-500 list-disc list-inside space-y-1 relative z-10">
                  <li>Try a broader business category</li>
                  <li>Try a bigger city or nearby region</li>
                  <li>Lower the quality floor</li>
                  <li>Increase max results</li>
                  <li>Check Google Places API key</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
