import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, Database, CheckCircle2, AlertTriangle, ShieldAlert, UploadCloud, 
  Search, RefreshCw, Send, Users, Cpu, FileText, ChevronRight, X, Sparkles, MessageSquare,
  Activity, MapPin, Building, Info, Download, Filter, ArrowUpRight, ArrowRight, Play, Pause, FastForward, CheckSquare
} from 'lucide-react';
import clsx from 'clsx';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Papa from 'papaparse';

interface OperativeLead {
  id: string;
  name: string;
  businessName: string;
  originalPhone: string;
  normalizedPhone: string;
  country: string;
  state: string;
  city: string;
  category: string;
  source: string;
  whatsappStatus: 'verified_whatsapp' | 'not_whatsapp' | 'unknown' | 'invalid_number' | 'unverified_api_not_connected' | 'consent_required' | 'pending';
  consentStatus: 'consented' | 'missing' | 'opt_out';
  contactSaveStatus: 'saved' | 'pending';
  messageStatus: 'ready' | 'missing' | 'sent' | 'failed' | 'queued';
  replyStatus?: 'received' | 'pending' | 'none';
  generatedMessage: string;
  score: number;
  lastChecked: string;
  rawData: any;
  blockerReason?: string;
  logs: string[];
}

type AgentStatus = 'idle' | 'running' | 'completed' | 'blocked' | 'error';

interface AgentState {
  id: string;
  name: string;
  count: number;
  status: AgentStatus;
  progress: number;
  lastRun: string;
  description: string;
  inputData: string;
  outputData: string;
}

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------
const resolveLeadBusinessName = (raw: any): string => {
  if (!raw) return 'Unknown Business';
  const possibleNames = [raw.business_name, raw.businessName, raw.title, raw.name, raw.company_name, raw.companyName, raw.company, raw.place_name, raw.google_place_name, raw.source_title, raw.raw_data?.title, raw.raw_data?.name, raw.raw_data?.businessName, raw.contactPerson, raw.contact_name];
  for (const n of possibleNames) {
    if (n && typeof n === 'string' && n.trim() !== '') return n.trim();
  }
  return 'Unknown Business';
};

const resolveLeadPersonName = (raw: any): string => {
  if (!raw) return 'Lead';
  const names = [raw.contactPerson, raw.contact_name, raw.first_name, raw.firstName];
  for (const n of names) {
    if (n && typeof n === 'string' && n.trim() !== '') return n.trim();
  }
  return 'Lead';
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------
const mapBackendLeadsToOperativeLeads = (backendLeads: any[]): OperativeLead[] => {
  return backendLeads.map((l: any) => {
    let blockerReason: string | undefined = undefined;
    if (!l.phone || l.phone.trim() === '') {
      blockerReason = 'Missing Phone';
    } else if (!l.isValidPhone) {
      blockerReason = 'Invalid Number';
    } else if (!l.whatsappReady && l.messageStatus !== 'sent' && l.messageStatus !== 'replied' && l.messageStatus !== 'delivered') {
      blockerReason = 'API Not Connected';
    }

    let whatsappStatus: OperativeLead['whatsappStatus'] = 'pending';
    if (!l.phone) whatsappStatus = 'invalid_number';
    else if (!l.isValidPhone) whatsappStatus = 'invalid_number';
    else if (l.whatsappReady) whatsappStatus = 'verified_whatsapp';
    else whatsappStatus = 'unverified_api_not_connected';

    let consentStatus: OperativeLead['consentStatus'] = 'missing';
    if (l.messageStatus === 'sent' || l.messageStatus === 'replied' || l.messageStatus === 'delivered' || l.messageStatus === 'seen') {
      consentStatus = 'consented';
    }

    let replyStatus: OperativeLead['replyStatus'] = 'none';
    if (l.messageStatus === 'replied') {
      replyStatus = 'received';
    }

    return {
      id: l.id,
      name: l.name || 'Lead',
      businessName: l.businessName || 'Unknown Business',
      originalPhone: l.phone || '',
      normalizedPhone: l.phone || '',
      country: l.country || 'Unknown',
      state: l.city || 'Unknown',
      city: l.city || 'Unknown',
      category: l.category || 'Lead',
      source: 'Data Vault',
      whatsappStatus,
      consentStatus,
      contactSaveStatus: l.phone ? 'saved' : 'pending',
      messageStatus: l.messageStatus === 'sent' || l.messageStatus === 'replied' ? 'sent' : (l.messageStatus === 'queued' ? 'queued' : 'ready'),
      replyStatus,
      generatedMessage: l.generatedMessage || '',
      score: l.score || 50,
      lastChecked: new Date().toISOString(),
      rawData: l,
      blockerReason,
      logs: [
        `Lead imported from Data Vault/CRM`,
        l.isValidPhone ? `Phone E.164 verified` : `Phone check failed`,
        l.whatsappReady ? `WhatsApp network verified` : `WhatsApp verification offline`
      ]
    };
  });
};

export function WhatsAppOperativeOS() {
  const [leads, setLeads] = useState<OperativeLead[]>([]);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [selectedLead, setSelectedLead] = useState<OperativeLead | null>(null);
  const [activePopover, setActivePopover] = useState<{type: string, rect: DOMRect} | null>(null);

  const initialAgents: Record<string, AgentState> = {
    total_leads: { id: 'total_leads', name: 'Total Leads', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Fetches clean unique leads from CRM & Vault.', inputData: 'CRM/Vault DB', outputData: 'Deduplicated Leads' },
    phones_found: { id: 'phones_found', name: 'Phone Found', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Scans all fields for contact numbers.', inputData: 'Lead Records', outputData: 'Leads with Phone' },
    missing_phone: { id: 'missing_phone', name: 'Missing Phone', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Identifies leads needing enrichment.', inputData: 'Lead Records', outputData: 'Leads without Phone' },
    invalid_numbers: { id: 'invalid_numbers', name: 'Invalid Number', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Validates length and format logic.', inputData: 'Raw Phones', outputData: 'Bad Format Numbers' },
    country_code_fixed: { id: 'country_code_fixed', name: 'Country Code', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Applies E.164 normalization.', inputData: 'Valid Phones', outputData: 'Normalized Phones' },
    wa_verified: { id: 'wa_verified', name: 'WhatsApp Verification', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Checks API for WhatsApp network availability.', inputData: 'E.164 Phones', outputData: 'Verification Status' },
    consent_missing: { id: 'consent_missing', name: 'Consent', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Enforces strict opt-in compliance.', inputData: 'Verified Leads', outputData: 'Consent Status' },
    contacts_saved: { id: 'contacts_saved', name: 'Contact Save', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Stores safe eligible contacts in Vault.', inputData: 'Consented Leads', outputData: 'Saved Contacts' },
    message_ready: { id: 'message_ready', name: 'Message Ready', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Generates context-aware personalized pitches.', inputData: 'Saved Contacts', outputData: 'Ready Pitches' },
    queued: { id: 'queued', name: 'Queue', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Batches and queues ready leads for sending.', inputData: 'Ready Pitches', outputData: 'Queued Jobs' },
    sent_success: { id: 'sent_success', name: 'Sent Success', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Tracks provider webhooks for delivery.', inputData: 'Queued Jobs', outputData: 'Delivery Confirmations' },
    reply_received: { id: 'reply_received', name: 'Reply Received', count: 0, status: 'idle', progress: 0, lastRun: 'Never', description: 'Tracks inbound WhatsApp replies and updates CRM.', inputData: 'Webhook Payload', outputData: 'CRM Reply Logs' },
  };

  const [agents, setAgents] = useState<Record<string, AgentState>>(initialAgents);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 1. Instantly load from localStorage to prevent any screen blank/lag
    const stored = localStorage.getItem('whatsapp_operative_leads');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLeads(parsed);
        updateAgentCounts(parsed);
      } catch (err) {
        console.warn("Silent fallback parsing stored operative leads:", err);
      }
    }

    // 2. Perform background fetch to keep data fresh/real
    try {
      const res = await fetch('/api/outreach/leads');
      if (!res.ok) throw new Error('Failed to load real backend leads');
      const backendLeads = await res.json();
      if (backendLeads && Array.isArray(backendLeads)) {
        const mapped = mapBackendLeadsToOperativeLeads(backendLeads);
        setLeads(mapped);
        updateAgentCounts(mapped);
        localStorage.setItem('whatsapp_operative_leads', JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn("Silent fallback loading real backend leads:", e);
    }
  };

  const updateAgentCounts = (currentLeads: OperativeLead[]) => {
    setAgents(prev => {
      const copy = { ...prev };
      copy.total_leads.count = currentLeads.length;
      copy.phones_found.count = currentLeads.filter(l => l.originalPhone).length;
      copy.missing_phone.count = currentLeads.filter(l => !l.originalPhone).length;
      copy.invalid_numbers.count = currentLeads.filter(l => l.whatsappStatus === 'invalid_number').length;
      copy.country_code_fixed.count = currentLeads.filter(l => l.normalizedPhone !== l.originalPhone && l.normalizedPhone && l.whatsappStatus !== 'invalid_number').length;
      copy.wa_verified.count = currentLeads.filter(l => l.whatsappStatus === 'verified_whatsapp').length;
      // We also track unverified specifically, but we map wa_verified as requested.
      copy.consent_missing.count = currentLeads.filter(l => l.consentStatus === 'missing').length;
      copy.contacts_saved.count = currentLeads.filter(l => l.contactSaveStatus === 'saved').length;
      copy.message_ready.count = currentLeads.filter(l => l.messageStatus === 'ready').length;
      copy.queued.count = currentLeads.filter(l => l.messageStatus === 'queued').length;
      copy.sent_success.count = currentLeads.filter(l => l.messageStatus === 'sent').length;
      copy.reply_received.count = currentLeads.filter(l => l.replyStatus === 'received').length;
      return copy;
    });
  };

  // --------------------------------------------------
  // ORCHESTRATION ENGINE
  // --------------------------------------------------
  const updateAgentState = (id: string, updates: Partial<AgentState>) => {
    setAgents(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const runWorkflowStep = async (stepId: string) => {
    updateAgentState(stepId, { status: 'running', progress: 30 });
    try {
      const res = await fetch('/api/outreach/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: 'Friendly' })
      });
      const data = await res.json();
      if (data && data.success) {
        await loadData();
        updateAgentState(stepId, { 
          status: 'completed', 
          progress: 100,
          lastRun: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
      } else {
        updateAgentState(stepId, { status: 'error', progress: 100 });
      }
    } catch (e) {
      updateAgentState(stepId, { status: 'error', progress: 100 });
    }
  };

  const runFullWorkflow = async () => {
    setIsWorkflowRunning(true);
    
    // Set all agents to running simulation/pipeline
    const order = ['total_leads', 'phones_found', 'missing_phone', 'invalid_numbers', 'country_code_fixed', 'wa_verified', 'consent_missing', 'message_ready', 'reply_received'];
    for (const step of order) {
      updateAgentState(step, { status: 'running', progress: 30 });
    }

    try {
      const res = await fetch('/api/outreach/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: 'Friendly' })
      });
      const data = await res.json();
      
      if (data && data.success) {
        // Fetch fresh leads list
        await loadData();
        
        // Mark all agents completed
        for (const step of order) {
          updateAgentState(step, { status: 'completed', progress: 100, lastRun: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        }
      } else {
        throw new Error(data?.error || 'Pipeline run failed');
      }
    } catch (e: any) {
      console.error("Pipeline run error:", e);
      for (const step of order) {
        updateAgentState(step, { status: 'error', progress: 100 });
      }
      alert(`Pipeline execution encountered an error: ${e.message}`);
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  // Direct actions for specific leads
  const handleVerifyWA = (leadId: string) => {
    setLeads(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(l => l.id === leadId);
      if (idx > -1) {
        copy[idx].whatsappStatus = 'unverified_api_not_connected';
        copy[idx].logs.push('Manual Verify Attempt: API Not Connected');
        copy[idx].lastChecked = new Date().toISOString();
      }
      localStorage.setItem('whatsapp_operative_leads', JSON.stringify(copy));
      updateAgentCounts(copy);
      return copy;
    });
  };

  const markConsent = (leadId: string) => {
    setLeads(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(l => l.id === leadId);
      if (idx > -1) {
        copy[idx].consentStatus = 'consented';
        copy[idx].logs.push('Consent marked manually.');
        if (copy[idx].blockerReason === 'Consent Required') copy[idx].blockerReason = undefined;
      }
      localStorage.setItem('whatsapp_operative_leads', JSON.stringify(copy));
      updateAgentCounts(copy);
      return copy;
    });
  };

  const handleQueue = (leadId: string) => {
    setLeads(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(l => l.id === leadId);
      if (idx > -1) {
        if (copy[idx].consentStatus !== 'consented') {
           alert("Compliance Alert: Consent missing. Cannot add to active send queue.");
           return copy;
         }
        copy[idx].messageStatus = 'queued';
        copy[idx].logs.push('Added to dispatch queue.');
      }
      localStorage.setItem('whatsapp_operative_leads', JSON.stringify(copy));
      updateAgentCounts(copy);
      return copy;
    });
  };


  return (
    <div className="flex flex-col bg-[#020202] text-slate-200 relative rounded-xl shadow-2xl border border-white/5 pb-12">
      
      {/* HEADER */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-black/40 shrink-0 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Cpu className="text-neon-green" size={24} /> Agentic WhatsApp
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Neural-style pipeline orchestrating automated WhatsApp number validation, consent management, and compliant sending.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={runFullWorkflow} 
            disabled={isWorkflowRunning}
            className={clsx(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]",
              isWorkflowRunning ? "bg-neon-green/50 text-black cursor-wait" : "bg-neon-green text-black hover:bg-neon-green/90 hover:scale-105"
            )}
          >
            {isWorkflowRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            {isWorkflowRunning ? 'Executing Pipeline...' : 'Run Full Workflow'}
          </button>
        </div>
      </div>

      {/* WORKFLOW AGENT CARDS */}
      <div className="p-6 shrink-0 relative z-10 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4 w-full">
          {Object.values(agents).map(agent => (
            <AgentCard 
              key={agent.id}
              agent={agent}
              isActive={activePopover?.type === agent.id}
              onRun={() => runWorkflowStep(agent.id)}
              onView={(rect) => {
                if (activePopover?.type === agent.id) {
                  setActivePopover(null);
                } else {
                  setActivePopover({ type: agent.id, rect });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* LEAD INTELLIGENCE TABLE */}
      <div className="flex flex-col p-6 pt-0 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Database size={14} /> Pipeline Operation Grid
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search operations..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-neon-green/50 text-white w-64 shadow-inner" />
          </div>
        </div>

        <div className="border border-white/5 rounded-xl bg-black/40 shadow-2xl relative">
          
          <div className="max-h-[600px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-[#050505] sticky top-0 z-10 text-[9px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                <tr>
                  <th className="p-4 font-bold">Target</th>
                  <th className="p-4 font-bold">Original Phone</th>
                  <th className="p-4 font-bold">Normalized E.164</th>
                  <th className="p-4 font-bold">Status Blockers</th>
                  <th className="p-4 font-bold">WhatsApp API</th>
                  <th className="p-4 font-bold">Consent</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-16 text-center text-slate-500">
                      <div className="flex justify-center mb-4"><ShieldAlert size={40} className="opacity-20" /></div>
                      <div className="font-black uppercase tracking-widest text-sm text-slate-400">No real CRM leads found</div>
                      <div className="mt-2 text-xs">Run the Total Leads Agent to fetch real pipeline records.</div>
                    </td>
                  </tr>
                )}
                {leads.map(lead => (
                  <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-white/[0.02] cursor-pointer transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white truncate max-w-[200px]" title={lead.businessName}>
                        {lead.businessName}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate max-w-[200px] mt-0.5">
                        {lead.businessName === 'Unknown Business' ? (
                           <span className="text-amber-500/70 border border-amber-500/20 px-1 py-0.5 rounded text-[8px] mr-1">Needs Name Resolution</span>
                        ) : null}
                        {lead.name} • <span className="text-purple-400/70">{lead.source}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{lead.originalPhone || <span className="text-rose-500/50">Missing</span>}</td>
                    <td className="p-4 font-mono">
                      {lead.whatsappStatus === 'invalid_number' ? (
                        <span className="text-rose-400">{lead.normalizedPhone || 'N/A'}</span>
                      ) : (
                        <span className="text-cyan-400">{lead.normalizedPhone || 'N/A'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {lead.blockerReason ? (
                        <span className="text-[9px] px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">{lead.blockerReason}</span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1 w-max"><CheckCircle2 size={10}/> Clear</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusChip type="whatsapp" status={lead.whatsappStatus} />
                    </td>
                    <td className="p-4">
                      <StatusChip type="consent" status={lead.consentStatus} />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-slate-300 uppercase tracking-widest border border-white/5 transition-colors">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FLOATING DETAIL POPOVER FOR AGENTS */}
      <AnimatePresence>
        {activePopover && (
          <AgentFloatingPopover 
            type={activePopover.type}
            anchorRect={activePopover.rect}
            agent={agents[activePopover.type]}
            leads={leads}
            onClose={() => setActivePopover(null)}
            onVerify={handleVerifyWA}
            onConsent={markConsent}
            onRun={() => runWorkflowStep(activePopover.type)}
          />
        )}
      </AnimatePresence>
      
      {/* LEAD DETAIL POPUP (UNCHANGED logic mostly, just layout if needed) */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#050608] border border-white/10 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
               {/* Fixed Header */}
              <div className="p-5 border-b border-white/5 bg-gradient-to-r from-neon-green/5 to-transparent flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-white">{selectedLead.businessName}</h2>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1 font-medium">
                    <span className="flex items-center gap-1"><Users size={12}/> {selectedLead.name}</span>
                    <span className="flex items-center gap-1"><MapPin size={12}/> {selectedLead.city}, {selectedLead.country}</span>
                    <span className="flex items-center gap-1"><Building size={12}/> {selectedLead.category}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><X size={16} /></button>
              </div>

              {/* Logs & Actions */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#050608] relative">
                <div className="space-y-4">
                  <div className="glass-card bg-black/50 p-4 border border-white/5 rounded-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Workflow Execution Logs</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                       {selectedLead.logs.map((log, i) => (
                         <div key={i} className="text-xs text-slate-300 font-mono border-l-2 border-neon-green/50 pl-2 py-0.5">
                           {log}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="glass-card bg-black/50 p-4 border border-white/5 rounded-xl flex items-center justify-between">
                     <div>
                       <div className="text-xs font-bold text-white mb-0.5">Send Queue Integration</div>
                       <div className="text-[10px] text-slate-500 font-mono">Status: <span className="text-white">{selectedLead.messageStatus.toUpperCase()}</span></div>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => handleQueue(selectedLead.id)}
                         disabled={selectedLead.whatsappStatus === 'verified_whatsapp' || !selectedLead.generatedMessage || selectedLead.messageStatus === 'queued' || selectedLead.consentStatus !== 'consented'}
                         className="px-6 py-2 bg-neon-green hover:bg-neon-green/90 disabled:opacity-20 disabled:grayscale text-black rounded text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all"
                       >
                         <Send size={14} /> Queue Lead
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --------------------------------------------------
// AGENT CARD
// --------------------------------------------------

function AgentCard({ agent, isActive, onRun, onView }: { agent: AgentState, isActive: boolean, onRun: () => void, onView: (rect: DOMRect) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Hover Tooltip Position Logic
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (isActive) return;
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos({ 
        top: rect.top - 10,
        left: rect.left + (rect.width / 2)
      });
    }
    setIsHovered(true);
  };

  const getStatusColor = () => {
    if (agent.status === 'running') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (agent.status === 'completed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (agent.status === 'blocked') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (agent.status === 'error') return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-slate-400 bg-white/5 border-white/10';
  };

  return (
    <>
      <div 
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          "stat-card w-full min-w-0 border rounded-[16px] p-3 flex flex-col justify-between shadow-inner transition-all relative group",
          isActive ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "bg-[rgba(10,10,10,0.6)] border-white/5 hover:border-white/10 hover:bg-[rgba(20,20,20,0.8)]"
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-white leading-tight flex-1 pr-2">{agent.name}</span>
          <span className={clsx("w-2 h-2 rounded-full mt-1 shrink-0", agent.status === 'running' ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" : agent.status === 'completed' ? "bg-emerald-500" : "bg-slate-700")}></span>
        </div>
        
        <div className="flex items-end justify-between mb-3">
          <span className="text-3xl font-black font-mono leading-none text-white">{agent.count}</span>
          <span className={clsx("text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border", getStatusColor())}>
            {agent.status}
          </span>
        </div>

        <div className="w-full h-1 bg-black rounded-full overflow-hidden mb-3">
          <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${agent.progress}%` }}></div>
        </div>

        <div className="flex gap-2">
           <button 
             onClick={() => onRun()}
             disabled={agent.status === 'running'}
             className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-slate-300 uppercase tracking-widest flex justify-center items-center gap-1 disabled:opacity-50 transition-colors"
           >
             {agent.status === 'running' ? <RefreshCw size={10} className="animate-spin" /> : <Play size={10} />} Run
           </button>
           <button 
             onClick={() => {
               setIsHovered(false);
               if (cardRef.current) onView(cardRef.current.getBoundingClientRect());
             }}
             className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-slate-300 uppercase tracking-widest flex justify-center items-center gap-1 transition-colors"
           >
             <Filter size={10} /> View
           </button>
        </div>
      </div>

      {isHovered && !isActive && (
        <AgentHoverTooltip pos={tooltipPos} agent={agent} />
      )}
    </>
  );
}

function AgentHoverTooltip({ pos, agent }: { pos: any, agent: AgentState }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: 'auto',
        bottom: window.innerHeight - pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 99999
      }}
      className="w-64 bg-[#050608]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-none"
    >
      <div className="p-3 border-b border-white/5 bg-white/[0.02]">
        <div className="text-[10px] font-black uppercase tracking-widest text-white mb-1">{agent.name}</div>
        <p className="text-[10px] text-slate-400 leading-tight">{agent.description}</p>
      </div>
      <div className="p-3 space-y-2 bg-black/40 text-[10px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-500 font-bold">Input:</span>
          <span className="text-cyan-400 font-mono">{agent.inputData}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-bold">Output:</span>
          <span className="text-emerald-400 font-mono">{agent.outputData}</span>
        </div>
      </div>
      <div className="p-2 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
        <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Last Run: {agent.lastRun}</span>
      </div>
    </motion.div>,
    document.body
  );
}

// --------------------------------------------------
// AGENT POPOVER
// --------------------------------------------------

function AgentFloatingPopover({ 
  type, anchorRect, agent, leads, onClose, onVerify, onConsent, onRun 
}: { 
  type: string; anchorRect: DOMRect; agent: AgentState; leads: OperativeLead[]; onClose: () => void; onVerify: (id: string) => void; onConsent: (id: string) => void; onRun: () => void;
}) {
  const [style, setStyle] = useState<any>({});
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        if (!(e.target as Element).closest('.stat-card')) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const popupWidth = 380;
    const estimatedHeight = Math.min(620, window.innerHeight - 120);
    const gap = 14;
    const margin = 24;

    let left = anchorRect.right + gap;
    if (left + popupWidth > window.innerWidth - margin) {
      left = anchorRect.left - popupWidth - gap;
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));

    let top = anchorRect.top;
    if (top + estimatedHeight > window.innerHeight - margin) {
      top = window.innerHeight - estimatedHeight - margin;
    }
    top = Math.max(margin, top);

    if (window.innerWidth < 768) {
      setStyle({
        top: '90px',
        left: '12px',
        width: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 120px)'
      });
    } else {
      setStyle({
        top: `${top}px`,
        left: `${left}px`,
        width: `${popupWidth}px`,
        maxHeight: `min(620px, calc(100vh - 120px))`
      });
    }
  }, [anchorRect]);

  const filtered = leads.filter(l => {
    switch(type) {
      case 'total_leads': return true;
      case 'phones_found': return !!l.originalPhone;
      case 'missing_phone': return !l.originalPhone;
      case 'invalid_numbers': return l.whatsappStatus === 'invalid_number';
      case 'country_code_fixed': return l.normalizedPhone !== l.originalPhone && !!l.normalizedPhone && l.whatsappStatus !== 'invalid_number';
      case 'wa_verified': return l.whatsappStatus === 'verified_whatsapp' || l.whatsappStatus === 'unverified_api_not_connected';
      case 'consent_missing': return l.consentStatus === 'missing';
      case 'contacts_saved': return l.contactSaveStatus === 'saved';
      case 'message_ready': return l.messageStatus === 'ready';
      case 'queued': return l.messageStatus === 'queued'; 
      case 'sent_success': return l.messageStatus === 'sent';
      case 'reply_received': return l.replyStatus === 'received';
      default: return true;
    }
  });

  return createPortal(
    <motion.div 
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
      style={{ ...style, position: 'fixed', zIndex: 101 }}
      className="bg-[rgba(5,12,14,0.85)] backdrop-blur-[24px] border border-[rgba(0,255,200,0.25)] shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(0,255,200,0.1)] rounded-[18px] flex flex-col overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* Fixed Header */}
      <div className="p-4 border-b border-white/5 bg-[rgba(5,12,14,0.9)] backdrop-blur-[18px] sticky top-0 z-10 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              {agent.name}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{agent.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"><X size={14} /></button>
        </div>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
           <span className="text-xs font-mono font-bold text-neon-green">{filtered.length} Matching Records</span>
           <button onClick={onRun} className="text-[9px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 hover:bg-cyan-500/20 flex items-center gap-1">
             <Play size={10} /> Run Action
           </button>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2" style={{ maxHeight: 'calc(min(620px, calc(100vh - 120px)) - 120px)' }}>
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center">
            <CheckSquare size={24} className="mb-2 opacity-20" />
            <div className="text-[10px] font-bold uppercase tracking-widest">No matching records</div>
            <div className="text-[9px] mt-1">Queue is empty.</div>
          </div>
        ) : (
          filtered.slice(0, 20).map(l => (
            <div key={l.id} className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col gap-2 hover:bg-white/[0.05] transition-colors group">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight truncate max-w-[220px]">{l.businessName}</span>
                  <span className="text-[9px] text-slate-500 truncate mt-0.5">{l.city}, {l.country}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
                <span className="font-mono text-[10px] text-cyan-400/80 group-hover:text-cyan-400 transition-colors">
                  {l.normalizedPhone || l.originalPhone || 'No Phone'}
                </span>
                <div className="flex gap-1.5">
                  <StatusChip type="whatsapp" status={l.whatsappStatus} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>,
    document.body
  );
}

function StatusChip({ type, status }: { type: 'whatsapp' | 'consent', status: string }) {
  let bg = 'bg-white/5 text-slate-400 border-white/10';
  let label = status.replace(/_/g, ' ').toUpperCase();

  if (type === 'whatsapp') {
    if (status === 'verified_whatsapp') bg = 'bg-neon-green/10 text-neon-green border-neon-green/20 shadow-[0_0_10px_rgba(57,255,20,0.1)]';
    if (status === 'not_whatsapp') bg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (status === 'invalid_number') bg = 'bg-red-500/20 text-red-500 border-red-500/30';
    if (status === 'unknown') bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (status === 'unverified_api_not_connected') bg = 'bg-amber-500/5 text-amber-500/80 border-amber-500/20';
  } else {
    if (status === 'consented') bg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    if (status === 'missing') bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (status === 'opt_out') bg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }

  return (
    <span className={clsx("px-1.5 py-0.5 rounded text-[7px] font-black tracking-widest border whitespace-nowrap inline-block", bg)}>
      {label}
    </span>
  );
}
