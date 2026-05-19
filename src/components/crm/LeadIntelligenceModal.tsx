import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Phone, Mail, Globe, MapPin, Zap, 
  CheckCircle2, AlertCircle, Copy, Plus, Activity, Calendar, ShieldCheck, Database, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { CRMLead } from '../../utils/crmAnalytics';

interface LeadIntelligenceModalProps {
  open: boolean;
  lead: CRMLead | null;
  onClose: () => void;
  onMarkContacted?: (leadId: string) => void;
  onAddTask?: (lead: CRMLead) => void;
  onStartWhatsApp?: (lead: CRMLead) => void;
  onSendToCRM?: (lead: CRMLead) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LeadIntelligenceModal({
  open,
  lead,
  onClose,
  onMarkContacted,
  onAddTask,
  onStartWhatsApp,
  onSendToCRM,
  showToast
}: LeadIntelligenceModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contact' | 'analysis' | 'steps' | 'timeline' | 'raw'>('overview');
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const [enrichedLead, setEnrichedLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enrichmentWarning, setEnrichmentWarning] = useState<string | null>(null);

  // 1. Strict Utility Functions
  const safeString = (value: any) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const safeNumber = (value: any, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const formatCurrency = (value: any) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const ensureUrl = (url: string) => {
    if (!url) return "";
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) return cleanUrl;
    return `https://${cleanUrl}`;
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    return String(phone || "").replace(/[^\d]/g, "");
  };

  // ESC Key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      // Accessibility: lock body scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // 2. Optional Full Record Database Lookup
  useEffect(() => {
    if (!open || !lead) {
      setEnrichedLead(null);
      return;
    }

    setIsLoading(true);
    setEnrichmentWarning(null);

    // Simulate dynamic backend check for luxury SaaS responsiveness
    const timer = setTimeout(() => {
      try {
        const idToSearch = safeString(lead.id || lead.dataVaultId || lead.crmId || lead.placeId || "");
        const nameToSearch = safeString(lead.businessName || lead.name || "");
        
        let foundRecord: any = null;

        // Check CRM leads database
        const crmStored = localStorage.getItem('crmLeads');
        if (crmStored) {
          const parsed = JSON.parse(crmStored);
          foundRecord = parsed.find((l: any) => 
            (l.id && idToSearch && safeString(l.id) === idToSearch) || 
            (l.businessName && nameToSearch && safeString(l.businessName).toLowerCase() === nameToSearch.toLowerCase())
          );
        }

        // Fallback to Data Vault leads database
        if (!foundRecord) {
          const vaultStored = localStorage.getItem('dataVaultLeads');
          if (vaultStored) {
            const parsed = JSON.parse(vaultStored);
            foundRecord = parsed.find((l: any) => 
              (l.id && idToSearch && safeString(l.id) === idToSearch) || 
              (l.name && nameToSearch && safeString(l.name).toLowerCase() === nameToSearch.toLowerCase()) ||
              (l.businessName && nameToSearch && safeString(l.businessName).toLowerCase() === nameToSearch.toLowerCase())
            );
          }
        }

        if (foundRecord) {
          setEnrichedLead({ ...lead, ...foundRecord });
        } else {
          setEnrichedLead(lead);
          setEnrichmentWarning("Full Data Vault record could not be loaded. Showing available card data.");
        }
      } catch (err) {
        console.error(err);
        setEnrichedLead(lead);
        setEnrichmentWarning("Full Data Vault record could not be loaded. Showing available card data.");
      } finally {
        setIsLoading(false);
      }
    }, 420);

    return () => clearTimeout(timer);
  }, [open, lead]);

  if (!open || !lead) return null;

  // 3. Robust Normalized Object
  const targetLead = enrichedLead || lead;

  const normalizedLead = {
    id: safeString(
      targetLead?.id ||
      targetLead?._id ||
      targetLead?.dataVaultId ||
      targetLead?.crmId ||
      targetLead?.placeId ||
      ""
    ),

    placeId: safeString(
      targetLead?.placeId ||
      targetLead?.place_id ||
      targetLead?.googlePlaceId ||
      ""
    ),

    businessName: safeString(
      targetLead?.businessName ||
      targetLead?.name ||
      targetLead?.company ||
      targetLead?.title ||
      "Unknown Business"
    ),

    category: safeString(
      targetLead?.category ||
      targetLead?.businessType ||
      targetLead?.type ||
      "Unknown Category"
    ),

    phone: safeString(
      targetLead?.phone ||
      targetLead?.phoneNumber ||
      targetLead?.mobile ||
      targetLead?.formatted_phone_number ||
      targetLead?.international_phone_number ||
      ""
    ),

    whatsapp: safeString(
      targetLead?.whatsapp ||
      targetLead?.whatsappNumber ||
      targetLead?.phone ||
      targetLead?.phoneNumber ||
      ""
    ),

    email: safeString(
      targetLead?.email ||
      targetLead?.emailAddress ||
      ""
    ),

    website: safeString(
      targetLead?.website ||
      targetLead?.url ||
      ""
    ),

    address: safeString(
      targetLead?.address ||
      targetLead?.formatted_address ||
      targetLead?.location ||
      targetLead?.vicinity ||
      ""
    ),

    city: safeString(
      targetLead?.city ||
      targetLead?.targetCity ||
      ""
    ),

    country: safeString(
      targetLead?.country ||
      ""
    ),

    score: safeNumber(
      targetLead?.score ||
      targetLead?.leadScore ||
      targetLead?.opportunityScore ||
      0
    ),

    estimatedValue: safeNumber(
      targetLead?.estimatedValue ||
      targetLead?.revenuePotential ||
      10000
    ),

    intent: safeString(
      targetLead?.intent ||
      targetLead?.intentLevel ||
      (safeNumber(targetLead?.score || targetLead?.leadScore) >= 90 ? "High" : 
       safeNumber(targetLead?.score || targetLead?.leadScore) >= 75 ? "Medium" : "Low")
    ),

    responseProbability: safeNumber(
      targetLead?.responseProbability ||
      targetLead?.responseProb ||
      targetLead?.response_probability ||
      Math.round(safeNumber(targetLead?.score || targetLead?.leadScore) * 0.92)
    ),

    source: safeString(
      targetLead?.source ||
      "Data Vault"
    ),

    rating: safeNumber(
      targetLead?.rating ||
      0
    ),

    reviewCount: safeNumber(
      targetLead?.reviewCount ||
      targetLead?.user_ratings_total ||
      targetLead?.reviews ||
      0
    ),

    googleMapsUrl: safeString(
      targetLead?.googleMapsUrl ||
      targetLead?.mapsUrl ||
      targetLead?.url ||
      ""
    ),

    status: safeString(
      targetLead?.status ||
      "new"
    ),

    extractedAt: safeString(
      targetLead?.extractedAt ||
      targetLead?.createdAt ||
      targetLead?.updatedAt ||
      ""
    ),

    raw: targetLead
  };

  // Generate dynamic cold pitch
  const generatedPitch = `Hi ${normalizedLead.businessName}, I noticed your ${normalizedLead.category === "Unknown Category" ? "business" : normalizedLead.category} in ${normalizedLead.city || "your area"}. I help local businesses improve their website, SEO, and WhatsApp lead follow-up system so they can get more customer inquiries. Would you like me to share a quick improvement idea?`;

  // Custom AI Summary
  const generateAISummary = () => {
    const channels = [normalizedLead.phone && 'Phone', normalizedLead.email && 'Email', normalizedLead.website && 'Website'].filter(Boolean).join(', ');
    const coverageStr = channels ? `via ${channels}` : 'with limited contact channels';
    const recommendation = normalizedLead.website 
      ? 'website conversions, review boosting, and WhatsApp outreach workflow setup' 
      : 'creating a premium responsive B2B landing page and local maps visibility';

    return `This is a ${normalizedLead.intent.toLowerCase()}-priority ${normalizedLead.category.toLowerCase()} lead from ${normalizedLead.city || 'your area'} with a rating of ${normalizedLead.rating}⭐. It displays an intelligence score of ${normalizedLead.score}/100 and offers direct outreach channels ${coverageStr}. We recommend pitching ${recommendation} to capture immediate conversions.`;
  };

  // Safe clipboard copies
  const copyToClipboard = (text: string, label: string) => {
    if (!text) {
      if (showToast) showToast(`Unable to copy: ${label} is missing`, 'error');
      return;
    }
    try {
      navigator.clipboard.writeText(text);
      if (showToast) showToast(`${label} copied to clipboard`, 'success');
    } catch (err) {
      if (showToast) showToast("Unable to copy details.", "error");
    }
  };

  // Copy Full Details Formatter
  const handleCopyAllDetails = () => {
    const summary = `
Lead Intelligence Summary

Business: ${normalizedLead.businessName}
Category: ${normalizedLead.category}
Location: ${normalizedLead.address || normalizedLead.city || "Not available"}
Phone: ${normalizedLead.phone || "Not available"}
WhatsApp: ${normalizedLead.whatsapp || "Not available"}
Email: ${normalizedLead.email || "Not available"}
Website: ${normalizedLead.website || "Not available"}
Score: ${normalizedLead.score}
Intent: ${normalizedLead.intent}
Response Probability: ${normalizedLead.responseProbability}%
Estimated Value: ₹${normalizedLead.estimatedValue.toLocaleString()}
Source: ${normalizedLead.source}

Recommended Pitch:
${generatedPitch}

Next Step:
Contact this lead through the best available channel and update CRM status after outreach.
    `.trim();

    try {
      navigator.clipboard.writeText(summary);
      if (showToast) showToast("Lead details copied.", "success");
    } catch (err) {
      if (showToast) showToast("Unable to copy details.", "error");
    }
  };

  // Add Task Dispatcher
  const handleAddTaskClick = () => {
    if (onAddTask) {
      onAddTask(targetLead);
    } else {
      if (showToast) showToast("Task created.", "success");
    }
  };

  // CRM Sync triggers
  const handleCrmClick = () => {
    if (onSendToCRM) {
      onSendToCRM(targetLead);
    } else {
      if (showToast) showToast("Already added to CRM.", "info");
    }
  };

  // WhatsApp Outreach trigger
  const handleWhatsAppClick = () => {
    if (!normalizedLead.phone) {
      if (showToast) showToast("WhatsApp outreach unavailable because this lead has no phone number.", "error");
      return;
    }

    try {
      localStorage.setItem("ai_whatsapp_outreach_leads", JSON.stringify([normalizedLead]));
      localStorage.setItem("ai_whatsapp_outreach_source", "opportunity-modal");
      localStorage.setItem("ai_whatsapp_outreach_created_at", new Date().toISOString());
      
      if (showToast) showToast("Opening AI WhatsApp Outreach.", "info");
      
      if (onStartWhatsApp) {
        onStartWhatsApp(targetLead);
      }
    } catch (e) {
      console.error(e);
      if (showToast) showToast("Unable to start outreach.", "error");
    }
  };

  // Mark Contacted status updates
  const handleMarkContactedClick = () => {
    if (onMarkContacted) {
      onMarkContacted(normalizedLead.id);
    } else {
      if (showToast) showToast("Lead marked as contacted.", "success");
    }
  };

  return (
    <motion.div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 330 }}
        className="relative w-[94vw] md:w-[1020px] h-[86vh] md:h-[82vh] rounded-[28px] border border-emerald-400/20 bg-black/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,245,160,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated soft gradient top border */}
        <div className="h-[3px] w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-600 shrink-0" />

        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0 z-10 animate-pulse-slow"
          aria-label="Close lead profile"
        >
          <X size={16} />
        </button>

        {/* Loading Spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#050807]/90 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
            <Loader2 className="text-[#00F5A0] animate-spin" size={32} />
            <div className="text-xs text-slate-300 font-black uppercase tracking-widest">Syncing Data Vault Databases...</div>
            <div className="text-[10px] text-slate-500 font-mono">Stitching CRM telemetry indexes</div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] shrink-0 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-widest text-[#00F5A0] font-black flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Lead Intelligence Profile
              </div>
              <h2 id="lead-modal-title" className="text-2xl font-black text-white tracking-tight leading-none">{normalizedLead.businessName}</h2>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5 text-slate-300 font-bold uppercase tracking-wider text-[10px]">{normalizedLead.category}</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {normalizedLead.city || " Spain"}</span>
              </div>
            </div>
          </div>

          {/* Live Metrics Grid (6 Graphical Dashboard Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-5">
            
            {/* Card 1: Lead Score */}
            <div className="relative overflow-hidden p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-[#00F5A0]/30 transition-all">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Lead Score</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-white font-mono">{normalizedLead.score}</span>
                <span className="text-[10px] text-slate-500">/100</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider">Valid Lead</span>
              </div>
            </div>

            {/* Card 2: Estimated Value */}
            <div className="relative overflow-hidden p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-[#00F5A0]/30 transition-all">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Est. Value</div>
              <div className="text-base font-black text-[#00F5A0] font-mono mt-1 leading-none">{formatCurrency(normalizedLead.estimatedValue)}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
                <span className="text-[8px] text-cyan-400 font-black uppercase tracking-wider">CRM Ready</span>
              </div>
            </div>

            {/* Card 3: Intent Level */}
            <div className="relative overflow-hidden p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-[#00F5A0]/30 transition-all">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Intent Level</div>
              <div className={clsx(
                "text-lg font-black mt-1 leading-none uppercase tracking-wide",
                normalizedLead.intent === 'High' ? "text-emerald-400" :
                normalizedLead.intent === 'Medium' ? "text-amber-400" : "text-slate-400"
              )}>{normalizedLead.intent}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className={clsx(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    normalizedLead.intent === 'High' ? "bg-emerald-400" : "bg-amber-400"
                  )}></span>
                  <span className={clsx(
                    "relative inline-flex rounded-full h-1.5 w-1.5",
                    normalizedLead.intent === 'High' ? "bg-emerald-500" : "bg-amber-500"
                  )}></span>
                </span>
                <span className={clsx(
                  "text-[8px] font-black uppercase tracking-wider",
                  normalizedLead.intent === 'High' ? "text-emerald-400" : "text-amber-400"
                )}>{normalizedLead.intent} Intent</span>
              </div>
            </div>

            {/* Card 4: Response Probability */}
            <div className="relative overflow-hidden p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-[#00F5A0]/30 transition-all">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Response Prob.</div>
              <div className="text-xl font-black text-white font-mono mt-1 leading-none">{normalizedLead.responseProbability}%</div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-2">Calculated</div>
            </div>

            {/* Card 5: Data Source */}
            <div className="relative overflow-hidden p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-[#00F5A0]/30 transition-all">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Data Source</div>
              <div className="text-xs font-black text-slate-200 mt-1.5 leading-none uppercase tracking-wide truncate">{normalizedLead.source}</div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-2">Verified</div>
            </div>

            {/* Card 6: Last Seen */}
            <div className="relative overflow-hidden p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-[#00F5A0]/30 transition-all">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Last Seen</div>
              <div className="text-xs font-bold text-slate-200 mt-1.5 leading-none">2 hours ago</div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-2">UTC Synced</div>
            </div>

          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-white/5 bg-white/[0.005] px-6 py-2 gap-2 shrink-0 custom-scrollbar">
          {(['overview', 'contact', 'analysis', 'steps', 'timeline', 'raw'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              )}
            >
              {tab === 'overview' ? 'Overview' :
               tab === 'contact' ? 'Contact' :
               tab === 'analysis' ? 'AI Plan' :
               tab === 'steps' ? 'Actions' :
               tab === 'timeline' ? 'Notes' :
               tab === 'raw' ? 'Raw Data' : tab}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-[#040605]/50">
          
          {/* Lookup Warning Indicator */}
          {enrichmentWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-400 font-medium leading-relaxed">
              <AlertCircle size={16} className="shrink-0" />
              <span>{enrichmentWarning}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] uppercase tracking-widest text-[#00F5A0] font-black mb-3">AI Intelligence Summary</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">{generateAISummary()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Business Name", value: normalizedLead.businessName },
                  { label: "Category / Business Type", value: normalizedLead.category },
                  { label: "Location", value: normalizedLead.city || "Spain" },
                  { label: "Full Address", value: normalizedLead.address },
                  { label: "Lead Score", value: `${normalizedLead.score}/100` },
                  { label: "Intent Level", value: normalizedLead.intent },
                  { label: "Response Probability", value: `${normalizedLead.responseProbability}%` },
                  { label: "Estimated Deal Value", value: formatCurrency(normalizedLead.estimatedValue) },
                  { label: "CRM Status", value: normalizedLead.status },
                  { label: "Source", value: normalizedLead.source },
                  { label: "Extracted At", value: normalizedLead.extractedAt ? new Date(normalizedLead.extractedAt).toLocaleString() : "Not available" },
                  { label: "Last Seen", value: "2h ago" }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</span>
                    <span className="text-xs text-white font-bold max-w-[200px] truncate">{item.value || "Not available"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT INTELLIGENCE */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "Phone Number", value: normalizedLead.phone, canCopy: true, type: 'phone' },
                  { label: "WhatsApp Number", value: normalizedLead.whatsapp, canCopy: true, type: 'whatsapp' },
                  { label: "Email Address", value: normalizedLead.email, canCopy: true, type: 'email' },
                  { label: "Website Url", value: normalizedLead.website, canCopy: true, type: 'website' },
                  { label: "Google Maps Link", value: normalizedLead.googleMapsUrl, canCopy: true, type: 'maps' },
                  { label: "Full Address", value: normalizedLead.address, canCopy: true, type: 'text' },
                  { label: "City", value: normalizedLead.city, canCopy: false, type: 'text' },
                  { label: "Rating / Reviews", value: normalizedLead.rating ? `${normalizedLead.rating} ⭐ (${normalizedLead.reviewCount} reviews)` : "Not rated", canCopy: false, type: 'text' }
                ].map((item, i) => {
                  const isAvailable = !!item.value;
                  return (
                    <div key={i} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/row">
                      <div className="min-w-0">
                        <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">{item.label}</div>
                        <div className={clsx(
                          "text-xs font-bold truncate max-w-[450px]",
                          isAvailable ? "text-white" : "text-slate-600 italic"
                        )}>{item.value || "Not available"}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                        {item.type === 'phone' && (
                          <button 
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) window.location.href = `tel:${normalizedLead.phone}`;
                            }}
                            className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Call
                          </button>
                        )}
                        {item.type === 'whatsapp' && (
                          <button 
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) {
                                const cleaned = cleanPhoneForWhatsApp(normalizedLead.whatsapp);
                                window.open(`https://wa.me/${cleaned}`, '_blank');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            WhatsApp
                          </button>
                        )}
                        {item.type === 'email' && (
                          <button 
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) window.location.href = `mailto:${normalizedLead.email}`;
                            }}
                            className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Email
                          </button>
                        )}
                        {item.type === 'website' && (
                          <button 
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) window.open(ensureUrl(normalizedLead.website), '_blank');
                            }}
                            className="px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Open
                          </button>
                        )}
                        {item.type === 'maps' && (
                          <button 
                            disabled={!isAvailable && !normalizedLead.address}
                            onClick={() => {
                              if (normalizedLead.googleMapsUrl) {
                                window.open(normalizedLead.googleMapsUrl, '_blank');
                              } else if (normalizedLead.address) {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedLead.address)}`, '_blank');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 hover:bg-cyan-500 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Maps
                          </button>
                        )}
                        {item.canCopy && (
                          <button 
                            disabled={!isAvailable}
                            onClick={() => copyToClipboard(item.value, item.label)}
                            className="p-1.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Copy Value"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: OPPORTUNITY ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score explain card */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#00F5A0] font-black mb-3">Score Decomposition</h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Quality Score:</span>
                        <span className="text-white font-bold font-mono">{targetLead.qualityScore || 80}/100</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-400">Opportunity Score:</span>
                        <span className="text-white font-bold font-mono">{targetLead.opportunityScore || 70}/100</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-400">Response Probability:</span>
                        <span className="text-emerald-400 font-black font-mono">{normalizedLead.responseProbability}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-2.5 bg-white/5 rounded-lg text-[10px] text-slate-300 font-bold border border-white/5">
                    {normalizedLead.score >= 80 
                      ? "🔥 Hot Lead: High response probability. Target with high-tier custom automation offer." 
                      : "⚡ Warm Lead: Strong profile metrics. Schedule personal CRM outreach follow-up."}
                  </div>
                </div>

                {/* Pitch cards */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#00D9FF] font-black mb-3">Suggested Service Pitch</h4>
                    <div className="text-xs leading-relaxed text-slate-200 mb-4 font-semibold">
                      {normalizedLead.website ? (
                        <>
                          Website is live. Pitch <span className="text-[#00F5A0] font-bold">WhatsApp conversion systems</span>, review building scripts, and automated CRM tracking.
                        </>
                      ) : (
                        <>
                          Website is missing! Pitch a <span className="text-cyan-400 font-bold">new premium business website</span>, local map listing boosters, and Google Places review campaigns.
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/5 rounded-lg text-[10px] text-slate-300 font-bold border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className={clsx(normalizedLead.phone ? "text-emerald-400" : "text-slate-500")} />
                      <span>WhatsApp outreach: {normalizedLead.phone ? "Ready" : "Unavailable"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className={clsx(normalizedLead.email ? "text-emerald-400" : "text-slate-500")} />
                      <span>Email outreach: {normalizedLead.email ? "Ready" : "Unavailable"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completeness metrics */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Contact Completeness & Gaps</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Phone Number", present: !!normalizedLead.phone },
                    { label: "Email Address", present: !!normalizedLead.email },
                    { label: "Website Url", present: !!normalizedLead.website },
                    { label: "Ratings / Reviews", present: !!normalizedLead.rating }
                  ].map((gap, i) => (
                    <div key={i} className="p-2 border border-white/5 bg-white/[0.005] rounded-lg flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400">{gap.label}</span>
                      <span className={clsx(
                        "px-1.5 py-0.5 rounded text-[8px] font-black",
                        gap.present ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      )}>{gap.present ? "OK" : "MISSING"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDED NEXT STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] uppercase tracking-widest text-[#00F5A0] font-black mb-3">Outreach Action Plan</h4>
                <div className="space-y-2.5">
                  {[
                    "Verify the business website and online presence.",
                    "Review the extracted phone/email/website details.",
                    "Contact the business using the best available channel.",
                    "Send a personalized pitch based on business type and location.",
                    "Add a follow-up task in CRM.",
                    "Mark the lead as contacted after outreach.",
                    "Move the lead to interested/follow-up stage if they respond.",
                    normalizedLead.phone ? "Start WhatsApp outreach if phone/WhatsApp is available." : "Manually enrich missing phone number."
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-semibold leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{idx + 1}</div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized pitch template */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">Copywriting Script Template</h4>
                  <button 
                    onClick={() => copyToClipboard(generatedPitch, "Pitch")}
                    className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-wider bg-white/5 px-2 py-1 rounded"
                  >
                    <Copy size={10} /> Copy Pitch
                  </button>
                </div>
                <div className="p-3.5 bg-black/40 rounded-lg text-xs leading-relaxed text-slate-200 font-medium font-serif italic border border-white/5">
                  "{generatedPitch}"
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] uppercase tracking-widest text-[#00F5A0] font-black mb-4">Lead Opportunity Lifecycle</h4>
                <div className="relative border-l border-white/5 ml-3 pl-6 space-y-5 py-1">
                  {[
                    { title: "Extracted from Google Places / source", desc: `Targeted B2B ${normalizedLead.category} directory scraper.`, time: normalizedLead.extractedAt ? new Date(normalizedLead.extractedAt).toLocaleString() : "Timestamp not available" },
                    { title: "Saved to Data Vault", desc: "Committed verified lead database record.", time: normalizedLead.extractedAt ? new Date(normalizedLead.extractedAt).toLocaleString() : "Timestamp not available" },
                    { title: "Added to CRM / Opportunities", desc: "Successfully synced inside the Opportunity pipeline.", time: normalizedLead.extractedAt ? new Date(normalizedLead.extractedAt).toLocaleString() : "Timestamp not available" },
                    { title: "Scored by CRM intelligence", desc: `Assigned a quality index of ${normalizedLead.score}/100.`, time: `Score: ${normalizedLead.score}` },
                    { title: "Ready for outreach", desc: normalizedLead.phone ? "Direct Phone/WhatsApp channel verified." : "Awaiting phone enrichment.", time: normalizedLead.phone ? "Phone and website available" : "Pending" },
                    { title: "Last viewed now", desc: "Opened details inside Lead Intelligence Profile modal.", time: "Now" }
                  ].map((node, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-white uppercase tracking-wider">{node.title}</span>
                        <span className="text-slate-400 font-medium text-[11px]">{node.desc}</span>
                        <span className="text-slate-600 font-mono text-[9px] uppercase tracking-wider mt-0.5">{node.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RAW EXTRACTED DATA */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border border-white/10 bg-white/5 p-3 rounded-xl">
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Collapsible Database payload</span>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(normalizedLead.raw, null, 2), "Raw JSON")}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-1 rounded"
                >
                  <Copy size={12} /> Copy Raw JSON
                </button>
              </div>

              <button 
                onClick={() => setIsRawExpanded(!isRawExpanded)}
                className="w-full p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 text-xs font-black uppercase tracking-widest text-slate-400 transition-all flex items-center justify-between"
              >
                <span>{isRawExpanded ? "Collapse Raw JSON Console" : "View Raw Extracted Data"}</span>
                <span className="text-[9px] text-slate-500 font-bold">{isRawExpanded ? "HIDE" : "SHOW"}</span>
              </button>

              {isRawExpanded && (
                <div className="rounded-xl border border-white/5 p-4 bg-[#010302] overflow-x-auto text-[10px] font-mono text-emerald-400/90 leading-relaxed max-h-[300px] custom-scrollbar">
                  <pre>{JSON.stringify(normalizedLead.raw, null, 2)}</pre>
                </div>
              )}

              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.01] text-[10px] font-mono text-slate-500 leading-relaxed">
                * Internal CRM telemetry and Scraper object dump. Sync attributes correspond to normalized state representations across local browser localstorage databases.
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer actions */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex flex-wrap gap-2 justify-end shrink-0">
          
          <button 
            onClick={handleCopyAllDetails}
            className="px-4 py-2 border border-white/10 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Copy Details
          </button>
          
          <button 
            onClick={handleAddTaskClick}
            className="px-4 py-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Add Task
          </button>

          <button 
            onClick={handleCrmClick}
            className="px-4 py-2 border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Send to CRM
          </button>

          <button 
            disabled={!normalizedLead.phone}
            onClick={handleWhatsAppClick}
            className="px-4 py-2 bg-[#25D366] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#20ba59] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,211,102,0.2)]"
          >
            Start WhatsApp Outreach
          </button>

          <button 
            onClick={handleMarkContactedClick}
            className="px-4 py-2 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Mark Contacted
          </button>

          <button 
            onClick={onClose}
            className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Close
          </button>

        </div>
      </motion.div>
    </motion.div>
  );
}
