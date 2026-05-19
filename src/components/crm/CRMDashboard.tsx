import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BarChart2, Users, DollarSign, Target, CheckSquare, 
  Briefcase, HelpCircle, Settings, Bell, Search, ChevronRight, 
  MoreVertical, Phone, Mail, Zap, RefreshCw, Download, AlertCircle,
  Database, Filter, Edit, Trash, Plus, Globe, CheckCircle2, Clock, Sparkles, X,
  Copy, MapPin, MessageSquare, Calendar, ArrowRight, ShieldCheck, FileText, BrainCircuit, ListChecks,
  Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import clsx from 'clsx';
import { 
  cleanAndNormalizeLeads, 
  calculateCRMAnalytics,
  CRMLead
} from '../../utils/crmAnalytics';
import {
  CRMOverviewPage,
  CRMReportsPage,
  CRMLeadsPage,
  CRMRevenuePage,
  CRMMarketingPage,
  CRMOpportunitiesPage,
  CRMTasksPage,
  CRMSettingsPage
} from './CRMPages';
import { ProfileAvatarButton } from '../profile/ProfileAvatarButton';
import { ProfileFloatingPanel } from '../profile/ProfileFloatingPanel';
import { useProfileData } from '../../hooks/useProfileData';
import LeadIntelligenceModal from './LeadIntelligenceModal';

export default function CRMDashboard({ onNavigate }: { onNavigate?: (route?: string) => void }) {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof calculateCRMAnalytics> | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('nexus_crm_active_tab');
    const validTabs = ['overview', 'reports', 'leads', 'revenue', 'marketing', 'opportunities', 'tasks', 'settings', 'help'];
    if (saved && validTabs.includes(saved)) {
      return saved;
    }
    return 'opportunities';
  });
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isCommandCenterOpen, setCommandCenterOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('Overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: profileData } = useProfileData();

  // Unified Notifications Center State
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      { id: '1', title: 'System Config', message: 'WhatsApp Operative Engine successfully initialized.', type: 'success', time: '10m ago', read: false },
      { id: '2', title: 'Consent Verification', message: 'Lead verification completed: 1027 ready channels.', type: 'info', time: '30m ago', read: false },
      { id: '3', title: 'AI Operative', message: 'Campaign Nova Agent dispatched 128 cold outreach messages.', type: 'success', time: '1h ago', read: false },
      { id: '4', title: 'Database Sync', message: '1602 leads merged in lead intelligence repository.', type: 'info', time: '2h ago', read: true }
    ];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('nexus_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      message,
      type,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('nexus_crm_active_tab', activeTab);
  }, [activeTab]);

  const openLeadModal = (lead: CRMLead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
    setSidebarOpen(false);
    setIsProfileOpen(false);
    setCommandCenterOpen(false);
  };

  const closeLeadModal = () => {
    setIsLeadModalOpen(false);
    setSelectedLead(null);
  };

  // Load from local storage initially
  useEffect(() => {
    loadCRMData();
  }, []);

  useEffect(() => {
    const handleNexusNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.page === 'crm') {
        if (customEvent.detail.tab) {
          setActiveTab(customEvent.detail.tab);
        }
      }
    };

    const handleCrmSync = () => {
      loadCRMData();
      showToast("CRM synced by NEXUS AI Agent", "success");
    };

    window.addEventListener('nexus-navigate', handleNexusNavigate);
    window.addEventListener('nexus-crm-sync-request', handleCrmSync);
    window.addEventListener('crm-data-refreshed', handleCrmSync);

    return () => {
      window.removeEventListener('nexus-navigate', handleNexusNavigate);
      window.removeEventListener('nexus-crm-sync-request', handleCrmSync);
      window.removeEventListener('crm-data-refreshed', handleCrmSync);
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCRMData = () => {
    try {
      const stored = localStorage.getItem('crmLeads');
      const time = localStorage.getItem('crmLastSynced');
      if (time) setLastSynced(time);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          // Re-normalize to ensure all new fields are present
          const { cleaned } = cleanAndNormalizeLeads(parsed);
          setLeads(cleaned);
          setStats(calculateCRMAnalytics(cleaned));
        }
      }
    } catch (e) {
      console.error("Failed to load CRM data", e);
    }
  };

  const fetchVaultData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      try {
        const rawVault = localStorage.getItem('dataVaultLeads') || localStorage.getItem('nexus-lead-vault') || localStorage.getItem('extractedLeads') || '[]';
        let vaultLeads = [];
        try { vaultLeads = JSON.parse(rawVault); } catch (e) { vaultLeads = []; }
        
        let isFallback = false;
        if (!Array.isArray(vaultLeads) || vaultLeads.length === 0) {
          isFallback = true;
          vaultLeads = [
            {
              id: "crm-001",
              businessName: "Lodha Group",
              category: "Real Estate Developer",
              leadScore: 96,
              opportunity: "Hot",
              phone: "+91 22 6213 4400",
              email: "info@lodhagroup.com",
              location: "Mumbai, India",
              status: "New"
            },
            {
              id: "crm-002",
              businessName: "Godrej Properties",
              category: "Real Estate Developer",
              leadScore: 94,
              opportunity: "Hot",
              phone: "+91 22 6169 8500",
              email: "enquiries@godrejproperties.com",
              location: "Mumbai, India",
              status: "Follow-up"
            },
            {
              id: "crm-003",
              businessName: "Prestige Group",
              category: "Real Estate Developer",
              leadScore: 92,
              opportunity: "Hot",
              phone: "+91 80 2559 5910",
              email: "info@prestigeconstructions.com",
              location: "Bangalore, India",
              status: "Qualified"
            }
          ];
        }

        const { cleaned, duplicatesRemoved } = cleanAndNormalizeLeads(vaultLeads);
        setLeads(cleaned);
        setStats(calculateCRMAnalytics(cleaned));
        
        localStorage.setItem('crmLeads', JSON.stringify(cleaned));
        localStorage.setItem('crmInitialized', 'true');
        
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSynced(now);
        localStorage.setItem('crmLastSynced', now);

        if (isFallback) {
          showToast("Could not load Data Vault. Using demo CRM data.", 'info');
        } else {
          showToast(`CRM updated with latest Data Vault records.`, 'success');
        }
      } catch (e) {
        console.error("Failed to fetch vault data:", e);
        showToast("Error loading Data Vault.", 'error');
      } finally {
        setIsRefreshing(false);
      }
    }, 900);
  };

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports', icon: BarChart2, label: 'Analytics' },
    { id: 'leads', icon: Users, label: 'Contacts' },
    { id: 'revenue', icon: DollarSign, label: 'Revenue' },
    { id: 'marketing', icon: Target, label: 'Targeting' },
    { id: 'opportunities', icon: Briefcase, label: 'Opportunities' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' }
  ];

  const bottomItems = [
    { id: 'help', icon: HelpCircle, label: 'Help' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  if (!stats) {
    return (
      <div className="h-full bg-[#050505] flex items-center justify-center p-6 text-white font-sans w-full">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Database size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black mb-3 tracking-tight">Initialize CRM Workspace</h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">No CRM data found. Sync your latest extracted leads from the Data Vault to build your intelligent dashboard.</p>
          <button 
            onClick={fetchVaultData} 
            disabled={isRefreshing}
            className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRefreshing ? <><RefreshCw size={16} className="animate-spin" /> Fetching...</> : <><Database size={16} /> Fetch from Data Vault</>}
          </button>
        </div>
      </div>
    );
  }

  // Removed inline render functions in favor of modular page components

  // Calculate selected notification variables for the telemetry modal cleanly before render
  let telemetryDetails = null;
  if (selectedNotification) {
    const n = selectedNotification;
    const title = n.title || 'System Notification';
    const msg = n.message || '';
    const time = n.time || 'Just now';
    
    let sender = 'AI Operative System Core';
    let howSent = 'System Daemon Event';
    let whereSent = 'Outreach Engine Localhost Node';
    let platform = 'React Dashboard Context';
    let website = 'http://localhost:3000';
    let automated = 'Automated System Monitor';
    let scope = 'Company / Core Infrastructure';
    let meaning = 'System health check confirming WhatsApp Operative OS modules are operating within normal parameters.';
    let implication = 'API health checks return green (200 OK). System telemetry is functioning perfectly.';

    if (title.toUpperCase().includes('WEBHOOK') || msg.toLowerCase().includes('reply') || msg.toLowerCase().includes('received')) {
      sender = 'End-User Client (+1 786-334-5459)';
      howSent = 'WhatsApp Inbound Message';
      whereSent = 'Miami, Florida Gateway';
      platform = 'WhatsApp Cloud API';
      website = 'https://business.whatsapp.com';
      automated = 'Real User / Manual Response';
      scope = 'Personal / Individual Target';
      meaning = 'The recipient replied to our outbound campaign. They expressed caution regarding automatic outreach but asked direct product capability questions.';
      implication = 'Nova Campaign Agent has flagged this as High Intent. A tailored response addressing spam filters has been drafted for immediate action.';
    } else if (title.toUpperCase().includes('CAMPAIGN') || msg.toLowerCase().includes('dispatch') || msg.toLowerCase().includes('sent')) {
      sender = 'AI Outreach Campaign Agent (Nova)';
      howSent = 'Meta API Post Request (JSON Payload)';
      whereSent = 'Central Dispatched Queue';
      platform = 'WhatsApp Cloud Business Gateway';
      website = 'https://graph.facebook.com/v19.0';
      automated = 'Fully Autonomous (Agentic Outbound)';
      scope = 'Company / Enterprise Bulk Run';
      meaning = 'Automated outbound batch campaign dispatch based on active database target criteria.';
      implication = 'Nova Agent is monitoring live delivery receipts. Success rates are currently running at 98.4%.';
    } else if (title.toUpperCase().includes('DATABASE') || msg.toLowerCase().includes('sqlite') || msg.toLowerCase().includes('sync') || msg.toLowerCase().includes('vault')) {
      sender = 'Local SQLite DB Broker';
      howSent = 'Batch SQL Transaction (UPSERT Query)';
      whereSent = 'Secure SQLite Database File';
      platform = 'Prisma Client / Node.js Engine';
      website = 'https://www.sqlite.org';
      automated = 'Automated Platform Cron';
      scope = 'Company / Internal System Log';
      meaning = 'A database synchronization event ensuring the local cache is fully aligned with active leads.';
      implication = 'Lead Intelligence repository is perfectly consistent with 1602 total leads. No manual action required.';
    } else if (title.toUpperCase().includes('CONSENT') || msg.toLowerCase().includes('consent') || msg.toLowerCase().includes('verification')) {
      sender = 'Lead Normalization pipeline';
      howSent = 'Bulk Consent Verification check';
      whereSent = 'Compliance & Filtering Pipeline';
      platform = 'E.164 Phone Normalization Gateway';
      website = 'https://twilio.com/lookup';
      automated = 'Fully Autonomous (System check)';
      scope = 'Enterprise / Bulk Database run';
      meaning = 'The system ran an E.164 compliance and consent verification check against the imported lead repository.';
      implication = '1027 channels marked as reachable and approved for outbound queue. Invalid records filtered safely.';
    }
    
    telemetryDetails = {
      title, msg, time, sender, howSent, whereSent, platform, website, automated, scope, meaning, implication, type: n.type
    };
  }

  return (
    <div className="app-shell relative h-full bg-[#020202] text-white font-sans">

      {/* ── Expandable Icon-Rail Sidebar (Pure CSS-driven) ── */}
      <aside className="sidebar">
        {/* Logo pill */}
        <div className="sidebar-logo">
          <Zap size={18} style={{ color: '#00ffaa', flexShrink: 0 }} />
          <span className="sidebar-label" style={{ fontWeight: 800, color: '#fff' }}>Nexus CRM</span>
        </div>

        {/* Main nav icons */}
        <div className="sidebar-nav-container">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                title={item.label}
                className={clsx("sidebar-item", isActive && "active")}
              >
                <item.icon size={17} style={{ flexShrink: 0 }} />
                <span className="sidebar-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom nav icons */}
        <div className="sidebar-bottom">
          {onNavigate && (
            <button 
              onClick={onNavigate as any} 
              title="Workspace" 
              className="sidebar-item"
            >
              <LayoutDashboard size={17} style={{ flexShrink: 0 }} />
              <span className="sidebar-label">Apps</span>
            </button>
          )}
          {bottomItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                title={item.label}
                className={clsx("sidebar-item", isActive && "active")}
              >
                <item.icon size={17} style={{ flexShrink: 0 }} />
                <span className="sidebar-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main Content — offset past sidebar ── */}
      <div className="dashboard-content" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="absolute top-20 left-1/2 z-[100] px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl font-medium text-sm"
              style={{
                backgroundColor: toast.type === 'error' ? 'rgba(239,68,68,0.1)' : toast.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                borderColor: toast.type === 'error' ? 'rgba(239,68,68,0.3)' : toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
                color: toast.type === 'error' ? '#f87171' : toast.type === 'success' ? '#34d399' : '#fff'
              }}
            >
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-black/40 backdrop-blur-2xl shrink-0 relative z-50">
          <h1 className="text-lg font-bold capitalize">
            {[...menuItems, ...bottomItems].find(item => item.id === activeTab)?.label || activeTab}
          </h1>
          <div className="flex items-center gap-4">
            {lastSynced && <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block">Last synced: {lastSynced}</span>}
            <button 
              onClick={fetchVaultData}
              disabled={isRefreshing}
              className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={clsx(isRefreshing && "animate-spin")} /> 
              {isRefreshing ? 'Fetching...' : 'Refresh Data Vault'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all focus:outline-none relative"
              >
                <Bell size={14} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
              
              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 glass-card border border-white/10 bg-[#0a0d14]/95 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]"
                    >
                      {/* Popover Header */}
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-white tracking-widest">Operational Intelligence</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        {notifications.some(n => !n.read) && (
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            }}
                            className="text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>

                      {/* Popover Body */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[300px] divide-y divide-white/5">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                                setSelectedNotification(n);
                                setShowNotifications(false);
                              }}
                              className={clsx(
                                "p-3.5 flex gap-3 hover:bg-white/[0.02] transition-all cursor-pointer relative",
                                !n.read && "bg-white/[0.01]"
                              )}
                            >
                              {!n.read && (
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-cyan-400" />
                              )}
                              
                              <div className="shrink-0 mt-0.5">
                                {n.type === 'success' ? (
                                  <CheckCircle2 size={14} className="text-emerald-400" />
                                ) : n.type === 'warning' ? (
                                  <AlertCircle size={14} className="text-amber-400" />
                                ) : n.type === 'error' ? (
                                  <AlertCircle size={14} className="text-rose-500" />
                                ) : (
                                  <Zap size={14} className="text-cyan-400" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-black uppercase text-white tracking-wider truncate">{n.title}</span>
                                  <span className="text-[8px] text-slate-500 font-medium font-mono shrink-0">{n.time}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5 break-words font-medium">{n.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                            <Bell size={24} className="text-slate-600 animate-bounce" />
                            <span className="text-slate-500 italic text-[11px]">System console clear. No pending alerts.</span>
                          </div>
                        )}
                      </div>

                      {/* Popover Footer */}
                      <div className="p-3 border-t border-white/5 flex items-center justify-between bg-black/20 gap-2">
                        <button 
                          onClick={() => {
                            setNotifications([]);
                          }}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                        >
                          Clear All
                        </button>
                        
                        <button
                          onClick={() => {
                            const events = [
                              { title: 'Inbound Webhook', msg: 'Incoming WhatsApp reply classified: [High Intent] Nova Agent assigned.', type: 'warning' },
                              { title: 'Campaign Agent', msg: 'Consent checks complete: 1027 dispatches queued.', type: 'success' },
                              { title: 'Security Vault', msg: 'SQLite backup archive created successfully.', type: 'info' },
                              { title: 'Outreach Engine', msg: 'WhatsApp API status warning: High traffic latency detected.', type: 'error' }
                            ];
                            const randomEvent = events[Math.floor(Math.random() * events.length)];
                            addNotification(randomEvent.title, randomEvent.msg, randomEvent.type as any);
                          }}
                          className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Simulate Telemetry
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/10 cursor-pointer">
              <ProfileAvatarButton 
                user={profileData?.user}
                isOpen={isProfileOpen}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                useInitial={true}
              />
            </div>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <CRMOverviewPage leads={leads} stats={stats} onNavigate={(tab) => setActiveTab(tab)} onSelectLead={openLeadModal} />}
              {activeTab === 'reports' && <CRMReportsPage leads={leads} stats={stats} />}
              {activeTab === 'leads' && <CRMLeadsPage leads={leads} onSelectLead={openLeadModal} onNavigate={onNavigate} showToast={showToast} />}
              {activeTab === 'revenue' && <CRMRevenuePage leads={leads} stats={stats} />}
              {activeTab === 'marketing' && <CRMMarketingPage leads={leads} stats={stats} />}
              {activeTab === 'opportunities' && <CRMOpportunitiesPage leads={leads} stats={stats} onSelectLead={openLeadModal} onNavigate={onNavigate} showToast={showToast} />}
              {activeTab === 'tasks' && <CRMTasksPage leads={leads} />}
              {activeTab === 'settings' && <CRMSettingsPage />}
              
              {/* Optional fallback for help */}
              {activeTab === 'help' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 h-[calc(100vh-140px)] bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-slate-400"><HelpCircle size={24} /></div>
                  <h2 className="text-xl font-bold text-white mb-2">CRM Help Center</h2>
                  <p className="text-sm text-slate-400 max-w-md">Read guides on how to extract leads, send data to CRM, and trigger WhatsApp outreach.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      </div>

      {/* Lead Command Center Drawer */}
      <AnimatePresence>
        {selectedLead && isCommandCenterOpen && !isLeadModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => { setSelectedLead(null); setCommandCenterOpen(false); }} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[520px] bg-[#0a0a0a] border-l border-white/10 z-[110] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="p-6 border-b border-white/5 flex flex-col gap-4 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-emerald-400" /> Lead Command Center
                  </h2>
                  <button onClick={() => { setSelectedLead(null); setCommandCenterOpen(false); }} className="text-slate-500 hover:text-white p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={16} /></button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-lg font-black text-white shadow-lg shrink-0">
                    {selectedLead.businessName.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight truncate max-w-[300px]">{selectedLead.businessName}</h3>
                    <div className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">{selectedLead.category}</span>
                      <span>{selectedLead.city}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 mt-2">
                  {['Overview', 'Contact', 'AI Plan', 'Actions', 'Notes', 'Timeline'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setDrawerTab(tab)}
                      className={clsx(
                        "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg whitespace-nowrap transition-colors",
                        drawerTab === tab ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0a0a0a]">
                
                {drawerTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors"></div>
                        <div className="text-3xl font-black text-emerald-400 font-mono mb-1">{selectedLead.leadScore}</div>
                        <div className="text-[9px] uppercase tracking-widest text-slate-500">Lead Score</div>
                      </div>
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/50 group-hover:bg-blue-400 transition-colors"></div>
                        <div className="text-2xl font-black text-white font-mono mb-1 mt-1">₹{selectedLead.revenuePotential.toLocaleString()}</div>
                        <div className="text-[9px] uppercase tracking-widest text-slate-500">Potential Value</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><Briefcase size={10}/> Current Stage</div>
                        <div className="text-sm font-bold text-white">{selectedLead.crmStage || 'New Lead'}</div>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1"><Database size={10}/> Data Source</div>
                        <div className="text-sm font-bold text-white truncate">Data Vault</div>
                        <div className="text-[9px] text-slate-500 mt-1 truncate">Extracted: {new Date(selectedLead.extractedAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-white/5 pb-2 flex items-center gap-2"><Target size={12}/> Business Intelligence</h4>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Rating</span>
                        <span className="font-bold text-white flex items-center gap-2">{selectedLead.rating || 'N/A'} <span className="text-xs text-slate-500 font-normal">({selectedLead.reviews || 0} reviews)</span></span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Online Presence</span>
                        <span className={clsx("font-bold", selectedLead.website ? "text-emerald-400" : "text-amber-400")}>
                          {selectedLead.website ? 'Active' : 'Missing Website'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Contact Channels</span>
                        <span className="font-bold text-white flex items-center gap-2">
                          {selectedLead.phone && <Phone size={12} className="text-emerald-400"/>}
                          {selectedLead.email && <Mail size={12} className="text-blue-400"/>}
                          {!selectedLead.phone && !selectedLead.email && <span className="text-slate-500 text-xs">None</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'Contact' && (
                  <div className="space-y-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                      
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <Phone size={16} className="text-slate-500" />
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Phone / WhatsApp</div>
                            <div className={clsx("font-medium", !selectedLead.phone && "text-slate-600 italic")}>{selectedLead.phone || 'Not available'}</div>
                          </div>
                        </div>
                        {selectedLead.phone && <button onClick={() => { navigator.clipboard.writeText(selectedLead.phone); showToast('Phone copied'); }} className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={12}/></button>}
                      </div>
                      
                      <div className="w-full h-px bg-white/5"></div>

                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <Mail size={16} className="text-slate-500" />
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Email Address</div>
                            <div className={clsx("font-medium truncate max-w-[200px]", !selectedLead.email && "text-slate-600 italic")}>{selectedLead.email || 'Not available'}</div>
                          </div>
                        </div>
                        {selectedLead.email && <button onClick={() => { navigator.clipboard.writeText(selectedLead.email); showToast('Email copied'); }} className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={12}/></button>}
                      </div>

                      <div className="w-full h-px bg-white/5"></div>

                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <Globe size={16} className="text-slate-500" />
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Website</div>
                            {selectedLead.website ? (
                              <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-medium truncate max-w-[200px] block">{selectedLead.website}</a>
                            ) : (
                              <span className="text-slate-600 italic">Not available</span>
                            )}
                          </div>
                        </div>
                        {selectedLead.website && <button onClick={() => { navigator.clipboard.writeText(selectedLead.website); showToast('Website copied'); }} className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={12}/></button>}
                      </div>

                      <div className="w-full h-px bg-white/5"></div>

                      <div className="flex items-start justify-between group">
                        <div className="flex items-start gap-3 text-sm text-slate-300">
                          <MapPin size={16} className="text-slate-500 mt-1" />
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-slate-500">Location</div>
                            <div className="font-medium text-slate-300 leading-relaxed pr-4">{selectedLead.city}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {drawerTab === 'AI Plan' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={64} className="text-emerald-400" /></div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2 relative z-10"><Sparkles size={14}/> AI Recommended Strategy</h4>
                      
                      <div className="space-y-4 relative z-10">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Priority Level</div>
                          {selectedLead.leadScore >= 80 ? <span className="text-sm font-bold text-red-400">High - Immediate Action Required</span> : selectedLead.leadScore >= 60 ? <span className="text-sm font-bold text-amber-400">Medium - Follow up within 48h</span> : <span className="text-sm font-bold text-slate-400">Low - Nurture</span>}
                        </div>
                        
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Identified Pain Point</div>
                          <div className="text-sm text-white">
                            {!selectedLead.website ? "No active website detected. They are losing customers to competitors who have an online presence." : "Website exists but may need modernization or better conversion tracking."}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Best Pitch Angle</div>
                          <div className="text-sm text-white">
                            {!selectedLead.website ? `Offer a fast, professional website setup for their ${selectedLead.category} business in ${selectedLead.city}.` : `Offer advanced WhatsApp CRM integration and Google Maps SEO for ${selectedLead.businessName}.`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><MessageSquare size={12}/> AI WhatsApp Pitch Template</h4>
                      <div className="bg-black/50 p-4 rounded-lg border border-white/5 text-sm text-slate-300 font-mono leading-relaxed mb-4">
                        Hi team at {selectedLead.businessName},<br/><br/>
                        I noticed your {selectedLead.category} in {selectedLead.city}. We help local businesses get more customers with {selectedLead.website ? "automated WhatsApp CRM systems" : "premium websites and Google Maps SEO"}.<br/><br/>
                        Would you be open to a quick 5-min chat to see if we can help you grow?<br/><br/>
                        Best,<br/>AI CRM Team
                      </div>
                      <button onClick={() => { showToast('Pitch copied to clipboard'); }} className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 flex items-center justify-center gap-2">
                        <Copy size={14} /> Copy Pitch
                      </button>
                    </div>
                  </div>
                )}

                {drawerTab === 'Actions' && (
                  <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><ListChecks size={12}/> Outreach Tools</h4>
                      <div className="space-y-3">
                        <button disabled={!selectedLead.phone} className="w-full py-3 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          <MessageSquare size={14} className="fill-current" /> Open WhatsApp Web
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button disabled={!selectedLead.phone} className="py-3 bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50">
                            <Phone size={14} /> Log Call
                          </button>
                          <button disabled={!selectedLead.email} className="py-3 bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50">
                            <Mail size={14} /> Send Email
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Briefcase size={12}/> Move Pipeline Stage</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Qualified', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Lost'].map(stage => (
                          <button 
                            key={stage}
                            onClick={() => {
                              showToast(`Moved to ${stage}`, 'success');
                              // TODO: Persist stage change to localStorage / backend
                            }}
                            className={clsx(
                              "py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-colors",
                              selectedLead.crmStage === stage 
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'Notes' && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 space-y-4 mb-4">
                      {/* TODO: Map over actual notes from backend */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                          <span>System</span>
                          <span>{new Date(selectedLead.extractedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">Lead extracted from Data Vault automatically. Requires initial qualification.</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto shrink-0 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col gap-3">
                      <textarea 
                        placeholder="Add a note about this lead..." 
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-24 custom-scrollbar"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">Press Cmd+Enter to save</span>
                        <button className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'Timeline' && (
                  <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Database size={14} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-bold text-white uppercase tracking-widest">Extracted</div>
                          <div className="text-[10px] font-mono text-slate-500">{new Date(selectedLead.extractedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm text-slate-400">Lead data securely imported from Data Vault.</div>
                      </div>
                    </div>

                    {/* Pending next action indicator */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Clock size={14} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-transparent border-dashed">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Next Action Required</div>
                        <div className="text-sm text-slate-600">Pending qualification or outreach.</div>
                      </div>
                    </div>
                    
                  </div>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProfileFloatingPanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onNavigate={onNavigate} 
      />

      <AnimatePresence>
        {isLeadModalOpen && selectedLead && (
          <LeadIntelligenceModal
            open={isLeadModalOpen}
            lead={selectedLead}
            onClose={closeLeadModal}
            onMarkContacted={(leadId) => {
              setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'Contacted', crmStage: 'Contacted' } : l));
              // Keep localStorage up to date
              try {
                const stored = localStorage.getItem('crmLeads');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  const updated = parsed.map((l: any) => l.id === leadId ? { ...l, status: 'Contacted', crmStage: 'Contacted' } : l);
                  localStorage.setItem('crmLeads', JSON.stringify(updated));
                }
              } catch (err) {
                console.error(err);
              }
            }}
            onStartWhatsApp={(lead) => {
              closeLeadModal();
              if (onNavigate) onNavigate('ai_whatsapp');
            }}
            onAddTask={(lead) => {
              showToast(`Task created: Follow up with ${lead.businessName}`, 'success');
            }}
            onSendToCRM={(lead) => {
              showToast("Already added to CRM", "info");
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Telemetry Notification Details Modal */}
      <AnimatePresence>
        {telemetryDetails && (
          <div key="telemetry-modal-container" className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              key="telemetry-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              key="telemetry-modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card border border-white/10 bg-[#0a0d14]/90 max-w-lg w-full p-6 relative z-10 flex flex-col gap-4 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                    <Activity size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight">Telemetry Diagnostic Details</h3>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{telemetryDetails.title}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body Diagnostic Grid */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">Sender / Creator</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.sender}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">How Sent (Method)</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.howSent}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">From Where (Gateway)</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.whereSent}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">Active Platform</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.platform}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">Originating Website</span>
                  <a href={telemetryDetails.website} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 font-bold block truncate hover:underline">{telemetryDetails.website}</a>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">Automation Class</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.automated}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">Recipient / Log Scope</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.scope}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-0.5">Time of Event</span>
                  <span className="text-xs text-white font-bold block truncate">{telemetryDetails.time} (System local)</span>
                </div>
              </div>

              {/* AI Semantic Meaning */}
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-black">AI Semantic Meaning</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{telemetryDetails.meaning}</p>
              </div>

              {/* Operational Implication / Recommended Action */}
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap size={14} className="text-cyan-400" />
                  <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">Operational Implication</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{telemetryDetails.implication}</p>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedNotification(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-colors mt-2"
              >
                Dismiss Telemetry Log
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
