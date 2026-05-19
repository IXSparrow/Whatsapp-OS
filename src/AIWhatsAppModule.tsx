import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TAB_TO_PATH, PATH_TO_TAB } from './routeConfig';
import { 
  Activity, BarChart3, Bot, Calendar, ChevronRight, MessageSquare, 
  Settings, Users, Zap, Search, Bell, Plus, Play, Pause, Database, 
  Workflow, GitBranch, Terminal, Shield, MessageCircle, Star, Sparkles, Phone,
  ArrowUpRight, CheckCircle2, AlertTriangle, Cpu, RefreshCw, Send, Copy, BookOpen,
  ShieldAlert, MapPin, X, Download, XCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AgentsOS from './components/AgentsOS';
import { AICampaignAgentPopup } from './components/AICampaignAgentPopup';
import { ProfileAvatarButton } from './components/profile/ProfileAvatarButton';
import { ProfileFloatingPanel } from './components/profile/ProfileFloatingPanel';
import { useProfileData } from './hooks/useProfileData';
import { WhatsAppOperativeOS } from './components/WhatsAppOperativeOS';

// --- MOCK DATA ---
const performanceData = [
  { time: '00:00', sent: 120, replied: 40 },
  { time: '04:00', sent: 80, replied: 20 },
  { time: '08:00', sent: 450, replied: 180 },
  { time: '12:00', sent: 800, replied: 350 },
  { time: '16:00', sent: 600, replied: 290 },
  { time: '20:00', sent: 300, replied: 110 },
];

const mockAgents = [
  { id: 1, name: 'Nova', role: 'Sales Closer', status: 'active', success: '94%' },
  { id: 2, name: 'Atlas', role: 'Support Guide', status: 'standby', success: '99%' },
  { id: 3, name: 'Echo', role: 'Follow-up Engager', status: 'active', success: '87%' },
  { id: 4, name: 'Orion', role: 'Booking Coordinator', status: 'active', success: '91%' },
];

type Tab = 'dashboard' | 'operative' | 'campaigns' | 'leads' | 'conversations' | 'agents' | 'analytics' | 'workflows' | 'integrations' | 'settings';

export default function AIWhatsAppModule({ onNavigate }: { onNavigate?: (route?: string) => void }) {
  const location = useLocation();
  const routerNavigate = useNavigate();

  // Derive active tab from URL pathname
  const activeTab: Tab = (PATH_TO_TAB[location.pathname] as Tab) || 'dashboard';

  // Tab navigation → push URL (enables browser back/forward)
  const setActiveTab = (tab: Tab) => {
    const path = TAB_TO_PATH[tab];
    if (path) {
      routerNavigate(path);
    }
  };
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_wa_stats');
      return saved ? JSON.parse(saved) : { activeAgents: 0, runningCampaigns: 0, activeConversations: 0, messagesSentToday: 0 };
    } catch {
      return { activeAgents: 0, runningCampaigns: 0, activeConversations: 0, messagesSentToday: 0 };
    }
  });
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

  // No longer need to save tab to localStorage — it's derived from URL

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then(res => {
        if (!res.ok) throw new Error('Network response error');
        return res.json();
      })
      .then(data => {
        setStats(data);
        localStorage.setItem('nexus_wa_stats', JSON.stringify(data));
      })
      .catch(e => console.warn('Silent fallback for stats overview:', e));
      
    const hasOutreach = localStorage.getItem("ai_whatsapp_outreach_leads");
    if (hasOutreach && location.pathname === '/command-center') {
      routerNavigate('/lead-intel');
    }

    const handleNexusNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.page === 'ai_whatsapp') {
        if (customEvent.detail.tab) {
          const path = TAB_TO_PATH[customEvent.detail.tab];
          if (path) routerNavigate(path);
        }
      }
    };
    window.addEventListener('nexus-navigate', handleNexusNavigate);
    return () => window.removeEventListener('nexus-navigate', handleNexusNavigate);
  }, []);

  const TABS: { id: Tab, label: string, icon: any }[] = [
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'operative', label: 'WhatsApp Operative', icon: Cpu },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'campaigns', label: 'Campaigns', icon: Zap },
    { id: 'leads', label: 'Lead Intel', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'workflows', label: 'Workflows', icon: GitBranch },
    { id: 'integrations', label: 'Integrations', icon: Workflow },
    { id: 'settings', label: 'System Config', icon: Settings },
  ];

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
    <div className="flex flex-col md:flex-row h-full bg-obsidian text-slate-200 overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full -z-10 animate-pulse pointer-events-none" style={{ backgroundColor: 'var(--accent-soft)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-green/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-72 bg-white/[0.01] border-b md:border-b-0 md:border-r border-white/5 flex flex-col backdrop-blur-2xl z-10 shrink-0"
      >
        <div className="p-6 pb-2 hidden md:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-border)' }}>
              <Bot style={{ color: 'var(--accent)' }} size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white">AI<span style={{ color: 'var(--accent)' }}>OPERATIVE</span></h1>
              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} /> System Online
              </div>
            </div>
          </div>

          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Core Modules</div>
        </div>

        <nav className="flex flex-row md:flex-col items-center md:items-stretch gap-2 px-6 py-4 md:px-4 md:py-0 md:space-y-1 overflow-x-auto md:overflow-y-auto custom-scrollbar pb-6 shrink-0 w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative overflow-hidden group shrink-0",
                activeTab === tab.id 
                  ? "text-white bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]" 
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent"
              )}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="sidebar-indicator" 
                  className="absolute left-0 bottom-0 md:top-0 w-full md:w-1 h-0.5 md:h-full" 
                  style={{
                    backgroundColor: 'var(--accent)',
                    boxShadow: '0 0 10px var(--accent-glow)'
                  }}
                />
              )}
              <tab.icon size={18} className="transition-colors" style={{ color: activeTab === tab.id ? 'var(--accent)' : undefined }} />
              {tab.label}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.01] backdrop-blur-md relative z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Search operations..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-colors w-64 placeholder-slate-600" />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-obsidian" style={{ backgroundColor: 'var(--accent)' }} />
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
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r" style={{ backgroundColor: 'var(--accent)' }} />
                              )}
                              
                              <div className="shrink-0 mt-0.5">
                                {n.type === 'success' ? (
                                  <CheckCircle2 size={14} className="text-emerald-400" />
                                ) : n.type === 'warning' ? (
                                  <AlertTriangle size={14} className="text-amber-400" />
                                ) : n.type === 'error' ? (
                                  <ShieldAlert size={14} className="text-rose-500" />
                                ) : (
                                  <Cpu size={14} className="text-cyan-400" />
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

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView stats={stats} />}
              {activeTab === 'operative' && <WhatsAppOperativeOS />}
              {activeTab === 'agents' && <AgentsOS />}
              {activeTab === 'conversations' && <ConversationsView />}
              {activeTab === 'campaigns' && <CampaignsView onNavigate={onNavigate} />}
              {activeTab === 'leads' && <LeadsView onNavigate={onNavigate} />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'workflows' && <WorkflowsView />}
              {activeTab === 'integrations' && <IntegrationsView />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ProfileFloatingPanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onNavigate={onNavigate} 
      />

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

// --- SUB VIEWS ---

function DashboardView({ stats }: { stats: any }) {
  let leads = [];
  try {
    const stored = localStorage.getItem('whatsapp_operative_leads');
    if (stored) leads = JSON.parse(stored);
  } catch {}
  if (!Array.isArray(leads)) leads = [];
  const totalLeads = leads.length;
  const sentLeads = leads.filter((l: any) => l.messageStatus === 'sent').length;
  const queuedLeads = leads.filter((l: any) => l.messageStatus === 'queued').length;
  const consentBlocked = leads.filter((l: any) => l.consentStatus === 'missing').length;

  const systemModules = [
    { label: 'Lead Intel', status: totalLeads > 0 ? 'Active' : 'Idle', count: totalLeads, color: 'cyan', icon: Users, route: 'leads' },
    { label: 'Campaigns', status: 'Idle', count: 0, color: 'purple', icon: Zap, route: 'campaigns' },
    { label: 'WhatsApp Operative', status: queuedLeads > 0 ? 'Running' : 'Idle', count: queuedLeads, color: 'green', icon: MessageCircle, route: 'operative' },
    { label: 'Conversations', status: sentLeads > 0 ? 'Active' : 'Idle', count: sentLeads, color: 'blue', icon: MessageSquare, route: 'conversations' },
    { label: 'Analytics', status: totalLeads > 0 ? 'Active' : 'Idle', count: totalLeads, color: 'amber', icon: BarChart3, route: 'analytics' },
    { label: 'WhatsApp API', status: 'Offline', count: 0, color: 'rose', icon: ShieldAlert, route: 'integrations' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
          <Activity className="text-cyan-400" size={22} /> AI Operative Command Center
        </h2>
        <p className="text-slate-500 text-sm">Global system health and operational monitoring.</p>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {systemModules.map((mod, i) => (
          <div key={i} className="glass-card p-4 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', `bg-${mod.color}-500/10`)}>
                <mod.icon size={16} className={`text-${mod.color}-400`} />
              </div>
              <span className={clsx('text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border',
                mod.status === 'Running' || mod.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                mod.status === 'Offline' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                'bg-white/5 text-slate-500 border-white/10'
              )}>{mod.status}</span>
            </div>
            <div className="text-xl font-black text-white">{mod.count}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{mod.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Flow */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <GitBranch size={14} className="text-cyan-400" /> Platform Pipeline Flow
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', label: 'Lead Intel', desc: 'Qualify & score leads from CSV/Data Vault', count: totalLeads, active: totalLeads > 0 },
              { step: '2', label: 'Campaigns', desc: 'Organize outreach strategy and targeting', count: 0, active: false },
              { step: '3', label: 'WhatsApp Operative', desc: 'Execute phone validation and message dispatch', count: queuedLeads, active: queuedLeads > 0 },
              { step: '4', label: 'Conversations', desc: 'Handle inbound replies and AI responses', count: sentLeads, active: false },
              { step: '5', label: 'Analytics', desc: 'Measure performance across all modules', count: 0, active: totalLeads > 0 },
            ].map((s, i) => (
              <div key={i} className={clsx('flex items-center gap-4 p-3 rounded-xl border transition-all', s.active ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-white/[0.01] border-white/5')}>
                <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0', s.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500')}>{s.step}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white">{s.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
                </div>
                <div className={clsx('text-sm font-black', s.active ? 'text-cyan-400' : 'text-slate-600')}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} className="text-rose-400" /> System Alerts
          </h3>
          <div className="space-y-3 flex-1">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
              <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">WhatsApp API Offline</div>
              <div className="text-[9px] text-rose-300/70">No provider connected. Configure in Integrations.</div>
            </div>
            {consentBlocked > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Consent Blockers</div>
                <div className="text-[9px] text-amber-300/70">{consentBlocked} leads blocked — missing opt-in status.</div>
              </div>
            )}
            {totalLeads === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">No Leads Imported</div>
                <div className="text-[9px] text-slate-500">Go to Lead Intel → Import CSV to start the pipeline.</div>
              </div>
            )}
            {totalLeads > 0 && consentBlocked === 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">No Critical Alerts</div>
                <div className="text-[9px] text-emerald-300/70">All systems nominal. Connect API to dispatch.</div>
              </div>
            )}
          </div>
          <div className="border-t border-white/5 pt-4">
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Quick Actions</div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 transition-colors">→ Go to Lead Intel</button>
              <button className="w-full text-left px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 transition-colors">→ Configure Integrations</button>
              <button className="w-full text-left px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 transition-colors">→ Run WhatsApp Pipeline</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AgentRunConsole and old AgentsView replaced by AgentsOS component above
function AgentRunConsole({ agent, onClose }: { agent: any, onClose: () => void }) {
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info'|'success'|'warning'|'error'}[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const addLog = (msg: string, type: 'info'|'success'|'warning'|'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  useEffect(() => {
    let isMounted = true;
    
    const runProcess = async () => {
      if (!isMounted) return;
      addLog(`Initializing Agent [${agent.name}]...`, 'info');
      await new Promise(r => setTimeout(r, 1000));
      
      addLog('Connecting to Lead Data Vault...', 'warning');
      await new Promise(r => setTimeout(r, 1500));
      
      try {
        const res = await fetch('/api/leads');
        const leads = await res.json();
        
        if (!isMounted) return;
        
        if (!leads || leads.length === 0) {
          addLog('Data Vault empty. No leads found to process.', 'error');
          setIsComplete(true);
          return;
        }

        addLog(`Successfully extracted ${leads.length} leads. Initiating outreach sequence.`, 'success');
        
        // Process up to 5 leads for the live preview
        const processLimit = Math.min(leads.length, 5);
        
        for (let i = 0; i < processLimit; i++) {
          if (!isMounted) return;
          const lead = leads[i];
          
          await new Promise(r => setTimeout(r, 2000));
          addLog(`[${agent.name}] Analyzing intent profile for ${lead.businessName}...`, 'info');
          
          await new Promise(r => setTimeout(r, 1500));
          addLog(`[${agent.name}] Generating persona-matched pitch...`, 'info');
          
          await new Promise(r => setTimeout(r, 1000));
          addLog(`[${agent.name}] Transmitting WhatsApp packet to ${lead.phone || 'Unknown'}`, 'warning');
          
          await new Promise(r => setTimeout(r, 1500));
          addLog(`[${agent.name}] Payload delivered successfully to ${lead.businessName}.`, 'success');
          
          setProgress(Math.round(((i + 1) / processLimit) * 100));
        }
        
        if (!isMounted) return;
        addLog(`Outreach sequence complete. Agent [${agent.name}] entering standby.`, 'success');
        setIsComplete(true);
        
      } catch (e) {
        addLog('Connection failed to Data Vault.', 'error');
      }
    };
    
    runProcess();
    
    return () => { isMounted = false; };
  }, [agent.name]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8">
      <div className="bg-obsidian border border-white/10 rounded-2xl w-full max-w-3xl h-[600px] flex flex-col shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Bot className="text-blue-500" size={20} />
            </div>
            <div>
              <h3 className="font-black text-white">{agent.name} - Active Execution</h3>
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{agent.role}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-lg">
            Close Console
          </button>
        </div>
        
        {/* Progress */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/20">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-2">
            <span className="text-slate-400">Campaign Progress</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Terminal */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] space-y-3 custom-scrollbar flex flex-col">
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 border-b border-white/[0.02] pb-2"
            >
              <span className="text-slate-600 shrink-0">[{log.time}]</span>
              <span className={clsx(
                log.type === 'success' ? 'text-neon-green' : 
                log.type === 'warning' ? 'text-yellow-500' : 
                log.type === 'error' ? 'text-red-500' : 'text-slate-300'
              )}>
                {log.msg}
              </span>
            </motion.div>
          ))}
          {!isComplete && (
            <div className="flex gap-4 mt-2">
              <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-slate-500 flex items-center gap-1">
                Awaiting process...
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







function ConversationsView() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [apiConnected, setApiConnected] = useState(false); // Default false as per requirements
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  useEffect(() => {
    // Load real data from Data Vault / CRM sync
    try {
      const stored = localStorage.getItem('whatsapp_operative_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Only include leads where message was actually sent or reply received
          const validConvs = parsed.filter((l: any) => l.messageStatus === 'sent' || l.replyStatus === 'received');
          setConversations(validConvs);
          if (validConvs.length > 0) setActiveId(validConvs[0].id);
        }
      }
    } catch {}
  }, []);

  const filteredConvs = conversations.filter(c => 
    c.businessName.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.normalizedPhone && c.normalizedPhone.includes(search))
  );

  const activeConv = conversations.find(c => c.id === activeId) || conversations[0];

  return (
    <div className="flex h-full gap-6 max-w-[1600px] mx-auto pb-8">
      {/* Left Thread List */}
      <div className="w-80 glass-card border border-white/5 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Sent Success Inbox</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search by business, name, phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConvs.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center text-slate-500">
              <ShieldAlert className="mb-3 text-amber-500/50" size={32} />
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">No Active Threads</div>
              <div className="text-[10px]">No real conversations yet — WhatsApp API/Webhook not connected.</div>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <div 
                key={conv.id} 
                onClick={() => setActiveId(conv.id)}
                className={clsx(
                  "p-4 border-b border-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors",
                  activeId === conv.id && "bg-white/[0.05] border-l-2 border-l-cyan-500"
                )}>
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-xs text-white truncate pr-2" title={conv.businessName}>{conv.businessName}</div>
                  <div className="text-[9px] text-slate-500 shrink-0">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 mb-1">{conv.normalizedPhone || conv.originalPhone || 'No Phone'}</div>
                <div className="text-[10px] text-slate-400 truncate pr-4">{conv.generatedMessage || 'Started conversation...'}</div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-white/10">
                      {conv.source}
                    </span>
                    <span className={clsx(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      conv.replyStatus === 'received' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {conv.replyStatus === 'received' ? 'Replied' : 'Waiting'}
                    </span>
                  </div>
                  {conv.replyStatus === 'received' && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="flex-1 glass-card border border-white/5 flex flex-col overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
          <MessageSquare size={300} />
        </div>
        
        {!activeConv ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
             <Bot size={48} className="mb-4 opacity-20" />
             <div className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Workspace Standby</div>
             <p className="text-xs max-w-sm text-center">Select a conversation thread from the left to view the interactive timeline and take control of the AI agent.</p>
           </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-[72px] border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md shrink-0 z-10">
              <div>
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  {activeConv.businessName}
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20 font-bold uppercase tracking-widest">{activeConv.score || 50} Score</span>
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><Users size={12} className="text-cyan-400" /> {activeConv.name}</span>
                  <span className="flex items-center gap-1 font-mono text-cyan-400"><Phone size={12} /> {activeConv.normalizedPhone}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-purple-400" /> {activeConv.city}, {activeConv.country}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold transition-colors">
                  Require Human
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                  <ArrowUpRight size={14} /> Open CRM
                </button>
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-10">
              
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Pipeline Extraction • {new Date(activeConv.lastChecked).toLocaleDateString()}
                </span>
              </div>

              {/* CRM Context Card inside Chat */}
              <div className="self-center w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-xl p-4 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Database size={12} className="text-purple-400"/> CRM Lead Snapshot
                   </div>
                   <div className="flex gap-1.5">
                     <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", activeConv.whatsappStatus === 'verified_whatsapp' ? "bg-neon-green/10 text-neon-green border-neon-green/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20")}>
                       {activeConv.whatsappStatus.replace(/_/g, ' ')}
                     </span>
                     <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", activeConv.consentStatus === 'consented' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20")}>
                       Consent: {activeConv.consentStatus}
                     </span>
                   </div>
                </div>
                <div className="text-xs text-slate-300">
                  Identified via {activeConv.source}. Target categorized as <span className="font-bold text-white">{activeConv.category}</span>. 
                  Ready for AI personalized outreach based on location <span className="font-bold text-white">{activeConv.city}</span>.
                </div>
              </div>

              {/* Initial Outbound Pitch */}
              <div className="flex justify-end">
                <div className="max-w-[75%]">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Message Ready Agent</span>
                    <span className="text-[9px] text-slate-500">Auto-Generated</span>
                  </div>
                  <div 
                    onClick={() => setSelectedMessage({
                      sender: 'AI Outreach Campaign Agent (Nova)',
                      howSent: 'Meta API Post Request (JSON Payload)',
                      whereSent: 'Central Dispatched Queue',
                      platform: 'WhatsApp Cloud Business Gateway',
                      website: 'https://graph.facebook.com/v19.0',
                      automated: 'Fully Autonomous (Agentic Outbound)',
                      scope: 'Company / Enterprise Bulk Run',
                      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      meaning: 'Automated outbound personalized pitch customized for the business based on their category, city, and maps profile.',
                      implication: 'Nova Agent initiated outreach to secure inbound intent. This message is pending Meta network dispatch.',
                      content: activeConv.generatedMessage
                    })}
                    className="bg-cyan-900/40 border border-cyan-500/30 text-slate-200 p-3.5 rounded-2xl rounded-tr-sm text-sm shadow-[0_5px_15px_rgba(6,182,212,0.1)] whitespace-pre-wrap cursor-pointer hover:bg-cyan-900/60 hover:border-cyan-400 transition-all"
                    title="Click to view message intelligence telemetry"
                  >
                    {activeConv.generatedMessage}
                  </div>
                </div>
              </div>

              {/* Waiting / Delivery Status */}
              <div className="flex justify-end pr-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {activeConv.messageStatus === 'sent' ? (
                    <><CheckCircle2 size={12} className="text-emerald-400" /> Sent Success</>
                  ) : activeConv.messageStatus === 'queued' ? (
                    <><RefreshCw size={12} className="text-amber-400 animate-spin" /> Queued for dispatch</>
                  ) : (
                    <><AlertTriangle size={12} className="text-rose-400" /> Pending API Connection</>
                  )}
                </div>
              </div>

              {/* Inbound Reply (If exists) */}
              {activeConv.replyStatus === 'received' && (
                <div className="flex justify-start">
                  <div className="max-w-[75%]">
                    <div className="flex items-center gap-2 justify-start mb-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{activeConv.name}</span>
                      <span className="text-[9px] text-slate-500">Inbound Reply</span>
                    </div>
                    <div 
                      onClick={() => setSelectedMessage({
                        sender: activeConv.name,
                        howSent: 'WhatsApp Inbound Message',
                        whereSent: `${activeConv.city} Gateway`,
                        platform: 'WhatsApp Mobile App / Cloud Webhook',
                        website: 'https://business.whatsapp.com',
                        automated: 'Real User / Manual Response',
                        scope: 'Personal / Individual Target',
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        meaning: 'The recipient replied to our outbound campaign. They expressed caution regarding automatic outreach but asked direct product capability questions.',
                        implication: 'Nova Campaign Agent has flagged this as High Intent. A tailored response addressing spam filters has been drafted for immediate action.',
                        content: "That sounds interesting. How exactly does the automation work for our local shop? We get a lot of spam so I'm cautious."
                      })}
                      className="bg-white/10 border border-white/5 text-white p-3.5 rounded-2xl rounded-tl-sm text-sm cursor-pointer hover:bg-white/20 hover:border-cyan-500/30 transition-all"
                      title="Click to view message intelligence telemetry"
                    >
                      That sounds interesting. How exactly does the automation work for our local shop? We get a lot of spam so I'm cautious.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Composer */}
            <div className="p-4 border-t border-white/5 bg-[#050505] z-10 shrink-0">
              {!apiConnected ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-rose-400" />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">WhatsApp API Disconnected</span>
                  </div>
                  <button className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded text-[10px] font-black uppercase tracking-widest transition-colors">
                    Configure Provider
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeConv.replyStatus === 'received' && (
                    <div className="flex items-center gap-2">
                       <Sparkles size={14} className="text-purple-400" />
                       <span className="text-xs text-purple-400 font-bold">AI Suggested Draft:</span>
                       <span className="text-xs text-slate-400 italic truncate flex-1">"I completely understand the caution. Our system is fully verified by Meta..."</span>
                       <button className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-bold uppercase tracking-widest hover:bg-purple-500/30 transition-colors">
                         Use Draft
                       </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"><Plus size={18} /></button>
                    <input 
                      type="text" 
                      placeholder="Type a manual reply to take over..." 
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 shadow-inner" 
                    />
                    <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2">
                      Send <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dynamic Message Telemetry Details Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div key="msg-modal-container" className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              key="msg-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-[#020305]/80 backdrop-blur-md"
            />
            
            <motion.div
              key="msg-modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card border border-white/10 bg-[#0a0d14]/95 max-w-lg w-full p-6 relative z-[1000] flex flex-col gap-4 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">Message Telemetry Intelligence</span>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="px-2.5 py-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-slate-400 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              {/* Message Content Bubble */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-2">Message Body</div>
                <div className="text-xs text-white leading-relaxed font-mono whitespace-pre-wrap">{selectedMessage.content}</div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3.5 bg-black/40 border border-white/5 rounded-xl p-4">
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Sender</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.sender}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Dispatch Mode</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.howSent}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Target Node</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.whereSent}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Platform</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.platform}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Source URL</span>
                  <a href={selectedMessage.website} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 font-bold block truncate hover:underline">{selectedMessage.website}</a>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Origin Mode</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.automated}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Scope</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.scope}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Time Log</span>
                  <span className="text-xs text-white font-bold block truncate">{selectedMessage.time}</span>
                </div>
              </div>

              {/* Explanatory Sections */}
              <div className="flex flex-col gap-3">
                <div className="border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                  <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest block mb-1">Message Context & Meaning</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedMessage.meaning}</p>
                </div>

                <div className="border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                  <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest block mb-1">Downstream Implications</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedMessage.implication}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CampaignsView({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const [campaigns, setCampaigns] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_wa_campaigns');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load campaigns');
        return res.json();
      })
      .then(data => {
        setCampaigns(data);
        localStorage.setItem('nexus_wa_campaigns', JSON.stringify(data));
      })
      .catch(e => console.warn('Silent campaign fetch fallback:', e));
  }, []);

  const handleNewCampaign = () => {
    if (onNavigate) onNavigate('new_campaign');
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Active Campaigns</h2>
          <p className="text-slate-400 text-sm">Orchestrate and monitor your AI outreach sequences.</p>
        </div>
        <button
          id="new-campaign-btn"
          onClick={handleNewCampaign}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
        >
          <Zap size={16} className="fill-black" /> New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card border border-white/5 p-16 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Zap size={28} className="text-cyan-400" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">No Active Campaigns</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md">Launch your first AI-powered WhatsApp campaign. Import leads from Data Vault or CRM Opportunities and let the agent do the rest.</p>
          <button
            onClick={handleNewCampaign}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Zap size={16} className="fill-black" /> Create First Campaign
          </button>
        </div>
      ) : (
        <div className="glass-card border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Conversions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((camp, i) => {
                const progress = camp.totalLeads > 0 ? Math.round((camp.sentCount / camp.totalLeads) * 100) : 0;
                return (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{camp.name}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        camp.status === 'running' ? "bg-neon-green/10 text-neon-green" :
                        camp.status === 'paused' ? "bg-yellow-500/10 text-yellow-500" : "bg-slate-500/10 text-slate-400"
                      )}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">{camp.replyCount}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronRight size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeadsView({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const [leads, setLeads] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_wa_leads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [summary, setSummary] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_wa_summary');
      return saved ? JSON.parse(saved) : {
        totalLeads: 0,
        whatsappReady: 0,
        missingPhone: 0,
        aiValidated: 0,
        hotIntent: 0,
        campaignReady: 0,
        lastSynced: new Date().toLocaleTimeString()
      };
    } catch {
      return {
        totalLeads: 0,
        whatsappReady: 0,
        missingPhone: 0,
        aiValidated: 0,
        hotIntent: 0,
        campaignReady: 0,
        lastSynced: new Date().toLocaleTimeString()
      };
    }
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Customizer / Builder state
  const [template, setTemplate] = useState("Hi {name}, hope you are doing great! I noticed {businessName} has awesome customer ratings ({rating} stars) in {city}. We can help boost reviews even more using automated channels. Can we chat?");
  const [tone, setTone] = useState("Friendly");
  const [offer, setOffer] = useState("review boosting");
  const [campaignName, setCampaignName] = useState("Autopilot Outreach Run");
  
  // Selection
  const [selectedLead, setSelectedLead] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('nexus_wa_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0];
      }
    } catch {}
    return null;
  });
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  
  // Controls
  const [campaignStatus, setCampaignStatus] = useState<'idle' | 'running' | 'paused' | 'stopped' | 'completed'>('idle');
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  
  // Interactive UI helpers
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [rawViewLead, setRawViewLead] = useState<any>(null);
  
  // Load local offline leads to compare/sync
  const rawLocal = localStorage.getItem('dataVaultLeads') || localStorage.getItem('nexus-lead-vault') || localStorage.getItem('extractedLeads') || '[]';
  let localLeads = [];
  try {
    localLeads = JSON.parse(rawLocal);
  } catch (e) {
    localLeads = [];
  }

  // Real database leads from active API sync
  const vaultLeads = leads;

  // Find unsynced local leads
  const unsyncedLeads = localLeads.filter((local: any) => {
    const localPhone = String(local.phone || '').trim();
    if (!localPhone) return false;
    return !vaultLeads.some((db: any) => String(db.phone || '').trim() === localPhone);
  });

  const filteredVaultLeads = vaultLeads.filter((l: any) => {
    const query = vaultSearchQuery.toLowerCase();
    const name = (l.name || l.businessName || '').toLowerCase();
    const cat = (l.category || '').toLowerCase();
    const addr = (l.address || l.city || '').toLowerCase();
    return name.includes(query) || cat.includes(query) || addr.includes(query);
  });
  
  // Terminal log stream
  const [terminalLogs, setTerminalLogs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_wa_terminal_logs');
      return saved ? JSON.parse(saved) : [
        "[10:00:00] [System Core] AI Lead Intel War Room successfully initialized.",
        "[10:00:01] [Lead Validator Agent] Active Data Vault connection verified."
      ];
    } catch {
      return [
        "[10:00:00] [System Core] AI Lead Intel War Room successfully initialized.",
        "[10:00:01] [Lead Validator Agent] Active Data Vault connection verified."
      ];
    }
  });

  const addLocalLog = (agent: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs(prev => {
      const updated = [
        `[${timestamp}] [${agent}] ${message}`,
        ...prev.slice(0, 19)
      ];
      localStorage.setItem('nexus_wa_terminal_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/outreach/summary');
      if (!res.ok) throw new Error('Failed to fetch outreach summary');
      const data = await res.json();
      if (data.success) {
        setSummary(data);
        localStorage.setItem('nexus_wa_summary', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Silent outreach summary fetch fallback:', e);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/outreach/leads');
      if (!res.ok) throw new Error('Failed to fetch outreach leads');
      const data = await res.json();
      setLeads(data);
      localStorage.setItem('nexus_wa_leads', JSON.stringify(data));
      if (data.length > 0) {
        setSelectedLead(data[0]);
      }
    } catch (e) {
      console.warn('Silent outreach targets fetch fallback:', e);
    }
  };

  const fetchDBLogs = async () => {
    try {
      const res = await fetch('/api/outreach/logs');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((l: any) => {
          const time = new Date(l.createdAt).toLocaleTimeString();
          return `[${time}] [${l.agentName}] ${l.action}: ${l.message || ''}`;
        });
        setTerminalLogs(prev => [...formatted, ...prev].slice(0, 30));
      }
    } catch (e) {
      console.error('Error loading database logs:', e);
    }
  };

  // Socket IO real time hook
  useEffect(() => {
    fetchSummary();
    fetchLeads();
    fetchDBLogs();

    const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin);

    socket.on('lead-status-update', (data: any) => {
      setLeads(prev => prev.map(l => {
        if (l.id === data.leadId) {
          return { ...l, messageStatus: data.status, error: data.error || '' };
        }
        return l;
      }));
      addLocalLog("Outreach Agent", `Lead ${data.leadId.slice(0, 8)} status transition: ${data.status}`);
      fetchSummary();
    });

    socket.on('campaign-started', (data: any) => {
      setCampaignStatus('running');
      setActiveCampaignId(data.campaignId);
      addLocalLog("Campaign Queue Agent", `Outreach run started. Syncing ${data.totalLeads} prospects.`);
      fetchSummary();
    });

    socket.on('campaign-paused', () => {
      setCampaignStatus('paused');
      addLocalLog("System", "Campaign execution paused by commander.");
    });

    socket.on('campaign-stopped', () => {
      setCampaignStatus('stopped');
      addLocalLog("System", "Campaign execution terminated by commander.");
    });

    socket.on('campaign-completed', () => {
      setCampaignStatus('completed');
      addLocalLog("Campaign Queue Agent", "Campaign finished successfully. CRM synchronizations complete.");
      fetchLeads();
      fetchSummary();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync variables to text
  const injectVariable = (variable: string) => {
    setTemplate(prev => prev + ` ${variable}`);
  };

  // Generate Personalized AI Pitch (Module 2)
  const generateAIMessages = async () => {
    setIsGenerating(true);
    addLocalLog("Message Personalizer Agent", "Initiating personalized generation models...");
    try {
      const res = await fetch('/api/outreach/generate-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateText: template,
          selectedLeadIds: selectedLeadIds.length > 0 ? selectedLeadIds : leads.map(l => l.id)
        })
      });
      const data = await res.json();
      if (data.success) {
        addLocalLog("Message Personalizer Agent", `Successfully customized ${data.count} unique opening messages.`);
        fetchLeads();
        fetchSummary();
      } else {
        addLocalLog("System", `Message generation failed: ${data.error}`);
      }
    } catch (e: any) {
      addLocalLog("System", `Network failure: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start campaign
  const handleLaunchCampaign = async () => {
    if (leads.filter(l => l.phone).length === 0) {
      addLocalLog("System", "Error: No contacts with valid phone number available.");
      return;
    }
    setShowConfirmModal(true);
  };

  const executeCampaignStart = async () => {
    setShowConfirmModal(false);
    addLocalLog("Campaign Queue Agent", "Qualifying leads list... preparing runner payload.");
    try {
      const res = await fetch('/api/outreach/start-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          templateText: template,
          selectedLeadIds: selectedLeadIds.length > 0 ? selectedLeadIds : leads.filter(l => l.phone).map(l => l.id)
        })
      });
      const data = await res.json();
      if (data.success) {
        setCampaignStatus('running');
        setActiveCampaignId(data.campaignId);
      } else {
        addLocalLog("System", `Failed to boot outreach campaign: ${data.error}`);
      }
    } catch (e: any) {
      addLocalLog("System", `Network failure: ${e.message}`);
    }
  };

  // Stop active run
  const stopCampaign = async () => {
    if (!activeCampaignId) return;
    try {
      await fetch('/api/outreach/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: activeCampaignId })
      });
      setCampaignStatus('stopped');
    } catch (e) {
      console.error(e);
    }
  };

  // Pause active run
  const pauseCampaign = async () => {
    if (!activeCampaignId) return;
    try {
      await fetch('/api/outreach/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: activeCampaignId })
      });
      setCampaignStatus('paused');
    } catch (e) {
      console.error(e);
    }
  };

  // Quick single test dispatch
  const handleSendTest = async (lead: any) => {
    addLocalLog("Outreach Agent", `Dispatching single sandbox test payload to ${lead.phone}...`);
    try {
      const res = await fetch('/api/outreach/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          message: lead.generatedMessage || `Hi ${lead.name || 'there'}, this is a verified single test message.`
        })
      });
      const data = await res.json();
      if (data.success) {
        addLocalLog("Outreach Agent", `✓ Test package successfully delivered. ID: ${data.messageId}`);
      } else {
        addLocalLog("Outreach Agent", `⚠ Test delivery rejected: ${data.error}`);
      }
    } catch (e: any) {
      addLocalLog("System", `Test dispatcher failed: ${e.message}`);
    }
  };

  // Mark hot immediately
  const markHotLead = async (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, score: 99, priority: 'Hot' };
      }
      return l;
    }));
    addLocalLog("AI Scoring Agent", `Lead ${leadId.slice(0, 8)} priority updated to Hot.`);
  };

  // Skip lead
  const toggleSkipLead = (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const nextStatus = l.messageStatus === 'Skipped' ? 'Imported' : 'Skipped';
        return { ...l, messageStatus: nextStatus };
      }
      return l;
    }));
    addLocalLog("Lead Validator Agent", `Lead ${leadId.slice(0, 8)} status skipped toggled.`);
  };

  // Process CSV upload
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLocalLog("Lead Validator Agent", `Parsing CSV package: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/outreach/import-csv', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        addLocalLog("Lead Validator Agent", `✓ Import Complete: ${data.importedRows} new leads, ${data.merged} merged, ${data.duplicates} duplicates skipped.`);
        fetchLeads();
        fetchSummary();
      } else {
        addLocalLog("Lead Validator Agent", `Failed to parse CSV: ${data.error}`);
      }
    } catch (err: any) {
      addLocalLog("System", `CSV parser failure: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-[1650px] mx-auto pb-12 text-slate-200">
      
      {/* SECTION 1: SMART HEADER */}
      <div className="glass-card border border-white/5 p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-purple-500" />
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              War Room Connected
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Last sync: {summary.lastSynced}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">Lead Intelligence Command Center</h2>
          <p className="text-slate-400 text-sm font-medium">Validate, qualify, and execute premium multi-channel AI outreach targeting verified Data Vault leads.</p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button 
            onClick={() => onNavigate?.('crm')}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
          >
            ← Back to CRM
          </button>
          
          <button 
            onClick={() => setShowVaultModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Database size={13} className="text-cyan-400" /> Data Vault
          </button>

          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleCSVUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            Import CSV
          </button>

          <button 
            onClick={generateAIMessages}
            disabled={isGenerating || leads.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wide rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Analyzing..." : "Generate AI Messages"}
          </button>

          {campaignStatus === 'running' ? (
            <div className="flex gap-2">
              <button 
                onClick={pauseCampaign}
                className="px-4 py-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 font-black text-xs uppercase rounded-xl hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <Pause size={13} /> Pause
              </button>
              <button 
                onClick={stopCampaign}
                className="px-4 py-2 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-black text-xs uppercase rounded-xl hover:bg-rose-500/30 transition-all flex items-center gap-1.5"
              >
                <XCircle size={13} /> Terminate
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLaunchCampaign}
              disabled={leads.length === 0}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wide rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all flex items-center gap-1.5"
            >
              <Play size={13} className="fill-black" />
              {campaignStatus === 'paused' ? 'Resume Campaign' : 'Start Campaign'}
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: REAL METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Leads Received', value: summary.totalLeads, desc: 'Real-time database listings', border: 'border-white/5', glow: 'text-slate-400', progress: 100, tooltip: 'Absolute count of raw leads extracted in the Data Vault.' },
          { label: 'WhatsApp Ready', value: summary.whatsappReady, desc: 'Valid delivery channel', border: 'border-emerald-500/10', glow: 'text-emerald-400', progress: summary.totalLeads > 0 ? (summary.whatsappReady / summary.totalLeads) * 100 : 0, tooltip: 'Leads possessing a verified phone number for messaging.' },
          { label: 'Missing Phone', value: summary.missingPhone, desc: 'Filter out (No Channel)', border: 'border-rose-500/10', glow: 'text-rose-400', progress: summary.totalLeads > 0 ? (summary.missingPhone / summary.totalLeads) * 100 : 0, tooltip: 'Leads skipped due to missing phone records.' },
          { label: 'AI Validated', value: summary.aiValidated, desc: 'Passed hygiene checks', border: 'border-cyan-500/10', glow: 'text-cyan-400', progress: summary.totalLeads > 0 ? (summary.aiValidated / summary.totalLeads) * 100 : 0, tooltip: 'Leads that successfully passed duplications, rating formats, and sanitizations.' },
          { label: 'Hot Intent', value: summary.hotIntent, desc: 'Dynamic score > 70', border: 'border-purple-500/10', glow: 'text-purple-400', progress: summary.totalLeads > 0 ? (summary.hotIntent / summary.totalLeads) * 100 : 0, tooltip: 'High-intent listings exhibiting score metrics exceeding 70/100.' },
          { label: 'Campaign Ready', value: summary.campaignReady, desc: 'Hygiene & channel passed', border: 'border-indigo-500/10', glow: 'text-indigo-400', progress: summary.whatsappReady > 0 ? (summary.campaignReady / summary.whatsappReady) * 100 : 0, tooltip: 'Verified contacts featuring valid WhatsApp channels and generated AI pitches.' }
        ].map((card, i) => (
          <div 
            key={i} 
            className={clsx("glass-card p-4 border flex flex-col justify-between h-28 relative overflow-hidden group hover:border-white/20 transition-all", card.border)}
            title={card.tooltip}
          >
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 block mb-1">{card.label}</span>
              <span className={clsx("text-2xl font-black tracking-tight", card.glow)}>{card.value || 'Not available'}</span>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" style={{ width: `${card.progress}%` }} />
              </div>
              <span className="text-[9px] text-slate-500 font-medium block truncate">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN command room columns (3 Zones Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SECTION 3: AI OUTREACH BUILDER (Middle Left Zone - 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card border border-white/5 p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-black text-white tracking-wider uppercase">AI Outreach Builder</h3>
                <span className="text-[10px] text-slate-400 font-medium">Craft the dynamic intelligence template</span>
              </div>
              <Cpu className="text-cyan-400 h-5 w-5" />
            </div>

            {/* Campaign Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Outreach Session Name</label>
              <input 
                type="text" 
                value={campaignName} 
                onChange={(e) => setCampaignName(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/50 font-bold"
              />
            </div>

            {/* Variable Injector chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Variable Injection Chips</label>
              <div className="flex flex-wrap gap-1.5">
                {['{name}', '{businessName}', '{category}', '{city}', '{rating}', '{website}', '{offer}'].map((v, i) => (
                  <button 
                    key={i} 
                    onClick={() => injectVariable(v)}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/5 text-[9px] font-bold text-slate-300 font-mono transition-all"
                  >
                    + {v.slice(1, -1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Template input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">Template Editor</label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none font-medium leading-relaxed font-sans"
              />
            </div>

            {/* Selector Tone & Offer rows */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AI Personality Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50 font-bold"
                >
                  {['Friendly', 'Premium', 'Direct', 'Luxury', 'Local Business', 'Follow-up', 'Human-like Short Pitch'].map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Dynamic Target Offer</label>
                <select 
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/50 font-bold"
                >
                  {['WhatsApp automation', 'website redesign', 'review boosting', 'lead generation', 'CRM automation'].map((o, idx) => (
                    <option key={idx} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AI Previews panel for Selected Lead */}
          {selectedLead && (
            <div className="glass-card border border-cyan-500/10 p-5 flex flex-col gap-3.5 relative overflow-hidden bg-cyan-950/[0.03]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-2xl rounded-full" />
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider">Selected Target Preview</span>
                <span className="text-[9px] font-bold text-slate-500">ID: {selectedLead.id.slice(0, 8)}</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-black text-white">{selectedLead.name || 'Unknown Contact'}</div>
                <div className="text-[10px] text-slate-400 font-bold">{selectedLead.businessName || 'No Business Name'}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                  <span>{selectedLead.category}</span>
                  <span>•</span>
                  <span>{selectedLead.city}</span>
                </div>
              </div>

              <div className="bg-[#040608] border border-white/5 rounded-xl p-3 text-[10px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap break-words">
                {selectedLead.generatedMessage || "Click \"Generate AI Messages\" at the top to customize a unique opening pitch for this business."}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-white/5 border border-white/5 rounded-lg p-2">
                  <div className="text-[9px] uppercase font-black text-slate-500">Estimated Reply Prob</div>
                  <div className="text-xs font-black text-emerald-400">{selectedLead.responseProbability}%</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-lg p-2">
                  <div className="text-[9px] uppercase font-black text-slate-500">Best sending window</div>
                  <div className="text-xs font-black text-cyan-400">{selectedLead.bestContactTime}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: LEAD TARGET MATRIX (Middle Center Zone - 8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card border border-white/5 overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Lead Target Matrix</h3>
                <span className="text-[10px] text-slate-400 font-medium">Verify channels and monitor message statuses live</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-400 font-bold">
                {leads.length} leads loaded
              </span>
            </div>

            <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar bg-[#020305]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">Target Lead</th>
                    <th className="px-5 py-3.5">Channel Details</th>
                    <th className="px-5 py-3.5">AI Intent Score</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => {
                    const isExpanded = expandedLeadId === lead.id;
                    return (
                      <React.Fragment key={lead.id}>
                        <tr 
                          onClick={() => setSelectedLead(lead)}
                          className={clsx(
                            "hover:bg-white/[0.02] transition-colors cursor-pointer",
                            selectedLead?.id === lead.id ? "bg-white/[0.01]" : ""
                          )}
                        >
                          <td className="px-5 py-3">
                            <div className="font-bold text-white text-xs truncate max-w-[200px]">{lead.name}</div>
                            <div className="text-[9px] text-slate-500 truncate max-w-[200px]">{lead.businessName}</div>
                          </td>
                          <td className="px-5 py-3">
                            {lead.phone ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-slate-300 font-mono font-medium">{lead.phone}</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase">{lead.city} • {lead.category}</span>
                              </div>
                            ) : (
                              <span className="text-rose-400 text-[10px] font-black flex items-center gap-1">
                                <AlertTriangle size={10} /> Not available
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={clsx(
                                "font-bold text-[10px] px-2 py-0.5 rounded font-mono border",
                                lead.score >= 80 ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20" : lead.score >= 60 ? "text-yellow-400 bg-yellow-500/10 border-yellow-400/20" : "text-slate-400 bg-white/5 border-white/10"
                              )}>{lead.score}/100</span>
                              <span className="text-[9px] text-slate-500 font-bold uppercase">{lead.priority}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={clsx(
                              "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-[0_0_10px_rgba(255,255,255,0.01)]",
                              lead.messageStatus === 'sent' || lead.messageStatus === 'delivered' || lead.messageStatus === 'seen' ? "text-emerald-400 bg-emerald-500/10 border-emerald-400/20" : 
                              lead.messageStatus === 'replied' ? "text-cyan-400 bg-cyan-500/10 border-cyan-400/20" : 
                              lead.messageStatus === 'queued' || lead.messageStatus === 'processing' || lead.messageStatus === 'sending' ? "text-amber-300 bg-amber-500/10 border-amber-400/20 animate-pulse" : 
                              lead.messageStatus === 'failed' ? "text-rose-400 bg-rose-500/10 border-rose-400/20" : 
                              lead.messageStatus === 'Skipped' ? "text-slate-500 bg-white/5 border-white/5" :
                              "text-cyan-400 bg-cyan-500/10 border-cyan-400/20"
                            )}>
                              {lead.messageStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                                className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-300 hover:bg-white/10 transition-colors"
                                title="Expand Details"
                              >
                                {isExpanded ? "Collapse" : "Preview"}
                              </button>
                              
                              <button 
                                onClick={() => handleSendTest(lead)}
                                disabled={!lead.phone}
                                className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-400/20 hover:bg-cyan-500/20 text-[9px] font-bold text-cyan-300 disabled:opacity-50 transition-colors"
                                title="Send test WhatsApp message"
                              >
                                Test Send
                              </button>
                              
                              <button 
                                onClick={() => markHotLead(lead.id)}
                                className="p-1 rounded bg-purple-500/10 border border-purple-400/20 hover:bg-purple-500/20 text-purple-300"
                                title="Mark Hot Priority"
                              >
                                <Star size={11} className="fill-purple-400" />
                              </button>

                              <button 
                                onClick={() => toggleSkipLead(lead.id)}
                                className="p-1 rounded bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-400/20 text-slate-400 hover:text-rose-400"
                                title="Toggle Skip Outreach"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Details Container */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-5 py-4 bg-[#05070a]/90 border-y border-white/5">
                              <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                              >
                                {/* Left stats col */}
                                <div className="flex flex-col gap-2.5">
                                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Lead Variables Breakdown</span>
                                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2 text-[10px]">
                                    <div className="flex justify-between"><span className="text-slate-400">Website Status:</span> <span className="text-white font-bold truncate max-w-[120px]">{lead.website}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Rating reviews:</span> <span className="text-white font-bold">{lead.rating} ★ ({lead.reviews} reviews)</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Lead ID:</span> <span className="text-slate-500 font-mono text-[9px]">{lead.id}</span></div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Raw Data Structure:</span> 
                                      <button 
                                        onClick={() => setRawViewLead(lead)} 
                                        className="text-cyan-400 hover:underline font-bold text-[9px]"
                                      >
                                        View JSON Payload
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Message preview col */}
                                <div className="flex flex-col gap-2.5">
                                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Generated Personalized message</span>
                                  <div className="bg-[#030508] border border-white/5 rounded-xl p-3 text-[10px] text-slate-300 leading-relaxed font-mono break-words">
                                    {lead.generatedMessage || "No personalized message generated yet. Trigger using Generate AI Messages."}
                                  </div>
                                </div>

                                {/* CRM timeline flow */}
                                <div className="flex flex-col gap-2.5">
                                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">CRM Lifecycle Timeline</span>
                                  <div className="flex flex-col gap-3 relative pl-3 border-l border-white/5 py-1">
                                    {[
                                      { label: 'Prospect Imported', status: 'completed', desc: 'Added from Google Maps' },
                                      { label: 'Hygiene Verification', status: lead.score > 0 ? 'completed' : 'pending', desc: 'Valid credentials passed' },
                                      { label: 'Outreach Dispatched', status: lead.messageStatus !== 'Imported' && lead.messageStatus !== 'Skipped' ? 'completed' : 'pending', desc: 'Dispatched to whatsapp provider' }
                                    ].map((step, idx) => (
                                      <div key={idx} className="flex gap-2.5 items-start text-[10px]">
                                        <div className={clsx(
                                          "w-2 h-2 rounded-full mt-1 shrink-0",
                                          step.status === 'completed' ? "bg-emerald-400 shadow-[0_0_8px_var(--accent)]" : "bg-slate-700"
                                        )} />
                                        <div>
                                          <div className="font-bold text-slate-200">{step.label}</div>
                                          <div className="text-[9px] text-slate-500 font-medium">{step.desc}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-bold">
                        No targets available. Please import a CSV or pull fresh leads into the workspace first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 5 & 11: BOTTOM GRIDS (LIVE AI INTELLIGENCE + AGENT LOGS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LIVE AI INTELLIGENCE PANEL (Right Zone - 1/3 Width) */}
        <div className="glass-card border border-white/5 p-5 flex flex-col gap-4">
          <div className="border-b border-white/5 pb-2.5 flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Live AI Intelligence</h3>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[8px] uppercase font-black text-slate-500 block mb-1">Best time to send</span>
              <span className="text-xs font-black text-emerald-400">10:00 AM - 12:30 PM</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[8px] uppercase font-black text-slate-500 block mb-1">Reply Probability</span>
              <span className="text-xs font-black text-cyan-400">
                {leads.length > 0 ? Math.round(leads.reduce((a, b) => a + (b.responseProbability || 50), 0) / leads.length) : 65}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-[#05070a] border border-white/5 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[9px] uppercase font-black text-purple-400 tracking-wider">Risk Monitor Status</span>
              <div className="text-[10px] text-slate-400 font-medium space-y-1">
                <div>• Missing phone records: <span className="text-rose-400 font-bold">{summary.missingPhone} detected</span></div>
                <div>• Sanitization formatting errors: <span className="text-slate-300">0 found</span></div>
              </div>
            </div>

            <div className="bg-cyan-500/5 border border-cyan-400/10 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-black text-cyan-300 tracking-wider">AI Autonomous Recommendation</span>
              <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                “Commanding dispatch: proceed immediately with the {summary.whatsappReady} high-intent WhatsApp-ready leads detected. Tone: Friendly, Offer: {offer}.”
              </p>
            </div>
            
            <div className="bg-indigo-500/5 border border-indigo-400/10 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-black text-indigo-300 tracking-wider">Expected Outreach Forecast</span>
              <div className="text-[10px] text-slate-300 font-medium grid grid-cols-2 gap-2 text-center mt-1">
                <div className="bg-white/5 rounded p-1"><span className="text-slate-500 text-[8px] block">Msgs Sent</span><span className="font-bold text-white">{summary.whatsappReady}</span></div>
                <div className="bg-white/5 rounded p-1"><span className="text-slate-500 text-[8px] block">Replies (65%)</span><span className="font-bold text-emerald-400">{Math.round(summary.whatsappReady * 0.65)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 11: LIVE AGENT LOGS (Shell terminal - 2/3 Width) */}
        <div className="lg:col-span-2 glass-card border border-white/5 p-5 flex flex-col gap-3 min-h-[300px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Agent Execution shell</h3>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-400/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-400/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-400/30" />
            </div>
          </div>

          <div className="flex-1 bg-[#030508] border border-white/10 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 h-64 select-none">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-normal break-words hover:bg-white/[0.02] py-0.5 rounded px-1.5 transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* JSON Payload raw data view modal */}
      <AnimatePresence>
        {rawViewLead && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setRawViewLead(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card border border-white/10 bg-[#0a0d14]/90 max-w-2xl w-full p-5 relative z-10 flex flex-col gap-4 shadow-2xl rounded-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-xs font-black text-white uppercase tracking-wider">Raw Lead Intelligence Record JSON</span>
                <button onClick={() => setRawViewLead(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>
              <div className="flex-1 overflow-auto bg-[#030507] border border-white/5 rounded-xl p-4 text-[10px] text-cyan-400 font-mono">
                <pre>{JSON.stringify(rawViewLead, null, 2)}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campaign execution safety warning modal (Module 19) */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020305]/85 backdrop-blur-md"
              onClick={() => setShowConfirmModal(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card border border-white/10 bg-[#0a0d14]/90 max-w-lg w-full p-6 relative z-10 flex flex-col gap-5 shadow-2xl rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Confirm AI WhatsApp Outreach</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Safety checkpoint initialized</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 text-xs text-slate-300 font-medium leading-relaxed">
                <div>
                  <span className="text-slate-400 font-bold">Target Leads Count:</span>
                  <span className="text-white font-black ml-2">{summary.whatsappReady} valid contacts</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Campaign Source:</span>
                  <span className="text-cyan-400 font-black ml-2 uppercase tracking-wide">Data Vault</span>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <span className="text-slate-400 font-bold block mb-1">Sample Message Preview:</span>
                  <span className="text-slate-100 font-bold bg-[#040608] px-3 py-2 rounded-lg block font-mono text-[10px] break-words whitespace-pre-wrap">
                    {template.replace('{name}', 'John Doe').replace('{businessName}', 'Clinic Pro').replace('{city}', 'London').replace('{rating}', '4.8')}
                  </span>
                </div>
              </div>

              {summary.whatsappReady > 100 && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-400/20 text-rose-300 rounded-xl text-xs font-bold leading-relaxed flex items-start gap-2.5">
                  <span className="text-rose-400">⚠</span>
                  <span>Safety warning: You are starting an outreach targeting more than 100 contacts. Meta Cloud API guidelines recommend initial test batches to prevent temporary spam blocks.</span>
                </div>
              )}

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 rounded-xl text-xs font-bold leading-relaxed flex items-start gap-2.5">
                <span className="text-emerald-400">✓</span>
                <span>Confirming will trigger automated message generations, calculate intelligence scores, map pipelines, and schedule custom follow-ups.</span>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeCampaignStart}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                >
                  Confirm & Launch Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redesigned Transparent Medium Pop-up for Data Vault */}
      <AnimatePresence>
        {showVaultModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#020305]/80 backdrop-blur-md"
                onClick={() => setShowVaultModal(false)}
              />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-card border border-white/10 bg-[#0a0d14]/95 max-w-4xl w-full p-6 relative z-10 flex flex-col gap-4 shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                      <Database size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight">Lead Repository: Data Vault</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Database Storage (Synced Live)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowVaultModal(false)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Top Statistics HUD */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <div className="text-lg font-black text-white font-mono">{vaultLeads.length}</div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-500">Total Leads Stored</div>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {vaultLeads.filter((l: any) => l.phone && l.phone.trim().length > 4 && l.whatsappReady).length}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-500">Valid WhatsApp Channels</div>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                    <div className="text-lg font-black text-purple-400 font-mono">
                      {vaultLeads.filter((l: any) => (l.score || l.leadScore || 0) >= 80).length}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-500">High Score Targets</div>
                  </div>
                </div>

                {/* Warning banner for unsynced leads */}
                {unsyncedLeads.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-400/20 text-amber-300 rounded-xl text-[11px] font-bold leading-relaxed flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 animate-pulse text-sm">⚠</span>
                      <span>Detected {unsyncedLeads.length} unsynced offline Google Maps extractions in browser cache!</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            addLocalLog("Lead Validator Agent", `Initiating bulk sync of ${unsyncedLeads.length} offline leads...`);
                            const res = await fetch('/api/outreach/sync-vault', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ leads: unsyncedLeads })
                            });
                            const result = await res.json();
                            if (result.success) {
                              addLocalLog("Lead Validator Agent", `✓ Database Sync Complete: +${result.importedRows} new leads, ${result.merged} merged.`);
                              alert(`Sync successful! Uploaded ${result.importedRows} new leads, merged ${result.merged} updates.`);
                              // Clean up browser cache once safely synced
                              localStorage.removeItem('dataVaultLeads');
                              localStorage.removeItem('nexus-lead-vault');
                              localStorage.removeItem('extractedLeads');
                              fetchLeads();
                              fetchSummary();
                            } else {
                              alert(`Sync failed: ${result.error || 'Server error'}`);
                            }
                          } catch (err: any) {
                            alert(`Error synchronizing Data Vault: ${err.message}`);
                          }
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[9px] tracking-widest rounded-lg transition-colors shadow-lg"
                      >
                        Sync to Database Now
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear these offline extractions from your browser cache? They will not be added to the database.")) {
                            localStorage.removeItem('dataVaultLeads');
                            localStorage.removeItem('nexus-lead-vault');
                            localStorage.removeItem('extractedLeads');
                            // Trigger a quick state reload
                            fetchLeads();
                            fetchSummary();
                            addLocalLog("System", "Browser local storage leads cache cleared.");
                            alert("Browser leads cache cleared successfully!");
                          }
                        }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase text-[9px] tracking-widest rounded-lg transition-all"
                      >
                        Clear Cache
                      </button>
                    </div>
                  </div>
                )}

                {/* Search and Action Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={vaultSearchQuery}
                      onChange={(e) => setVaultSearchQuery(e.target.value)}
                      placeholder="Search by name, category..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        if (vaultLeads.length === 0) return;
                        const columns = ['Name', 'Category', 'Address', 'Phone', 'Website', 'Email', 'Rating', 'Reviews', 'Maps URL', 'Source', 'Business Type', 'Location', 'Extracted At', 'Lead Score', 'Opportunity', 'Status'];
                        const headers = columns.join(',');
                        const rows = vaultLeads.map((lead: any) => [
                          lead.name || lead.businessName || '',
                          lead.category || '',
                          lead.address || lead.city || '',
                          lead.phone || '',
                          lead.website || '',
                          lead.email || '',
                          lead.rating || '',
                          lead.reviews || lead.reviewCount || '',
                          lead.mapsUrl || '',
                          lead.source || 'Google Places',
                          lead.businessType || '',
                          lead.location || '',
                          lead.extractedAt || new Date().toISOString(),
                          lead.leadScore || '',
                          lead.opportunity || '',
                          lead.status || 'valid'
                        ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
                        const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute('download', `Vault_Export_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        addLocalLog("System", "Master CSV exported from Data Vault.");
                      }}
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Download size={12} /> Export CSV
                    </button>

                    <button
                      onClick={async () => {
                        if (unsyncedLeads.length > 0) {
                          try {
                            addLocalLog("Lead Validator Agent", `Initiating bulk sync of ${unsyncedLeads.length} offline leads...`);
                            const res = await fetch('/api/outreach/sync-vault', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ leads: unsyncedLeads })
                            });
                            const result = await res.json();
                            if (result.success) {
                              addLocalLog("Lead Validator Agent", `✓ Database Sync Complete: +${result.importedRows} new leads, ${result.merged} merged.`);
                              alert(`Sync successful! Uploaded ${result.importedRows} new leads, merged ${result.merged} updates.`);
                              localStorage.removeItem('dataVaultLeads');
                              localStorage.removeItem('nexus-lead-vault');
                              localStorage.removeItem('extractedLeads');
                              fetchLeads();
                              fetchSummary();
                            } else {
                              alert(`Sync failed: ${result.error}`);
                            }
                          } catch (err: any) {
                            alert(`Error: ${err.message}`);
                          }
                        } else {
                          alert("Database is already 100% synchronized and up to date!");
                        }
                      }}
                      className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    >
                      <RefreshCw size={12} /> Sync to Database
                    </button>
                  </div>
                </div>

                {/* Table Data */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-black/45 max-h-[45vh]">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#080b11] z-10 border-b border-white/5">
                      <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-5 py-3">Lead Details</th>
                        <th className="px-5 py-3">Trust Score</th>
                        <th className="px-5 py-3">Contact</th>
                        <th className="px-5 py-3">Strength</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredVaultLeads.length > 0 ? (
                        filteredVaultLeads.map((lead: any, idx: number) => (
                          <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3">
                              <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {lead.name || lead.businessName}
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                {lead.category} • {lead.city || lead.address || 'N/A'}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-white">{lead.rating || 'N/A'}</span>
                                <span className="text-[9px] text-slate-500">({lead.reviewCount || lead.reviews || 0})</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-slate-400">
                              <div>{lead.phone || 'No phone'}</div>
                              {lead.website && lead.website !== 'N/A' && (
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline truncate max-w-[150px] block mt-0.5">
                                  {lead.website}
                                </a>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className={clsx(
                                  "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border",
                                  (lead.score || 50) >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-white/5"
                                )}>
                                  {lead.score || 50}% SCORE
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-slate-500 italic text-xs">
                            No matching records found in Data Vault.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real data from Data Vault / CRM sync
    let leads = [];
    try {
      const stored = localStorage.getItem('whatsapp_operative_leads');
      if (stored) leads = JSON.parse(stored);
    } catch {}
    if (!Array.isArray(leads)) leads = [];

    if (leads.length > 0) {
      const totalLeads = leads.length;
      const sentLeads = leads.filter((l: any) => l.messageStatus === 'sent').length;
      const queuedLeads = leads.filter((l: any) => l.messageStatus === 'queued').length;
      const verifiedLeads = leads.filter((l: any) => l.whatsappStatus === 'verified_whatsapp').length;
      const repliedLeads = leads.filter((l: any) => l.replyStatus === 'received').length;
      const savedContacts = leads.filter((l: any) => l.contactSaveStatus === 'saved').length;
      const missingConsent = leads.filter((l: any) => l.consentStatus === 'missing').length;
      const invalidPhones = leads.filter((l: any) => l.whatsappStatus === 'invalid_number' || l.whatsappStatus === 'missing_phone').length;

      const hasRealActivity = totalLeads > 0;

      setData({
        hasRealActivity,
        totalLeads,
        sentLeads,
        queuedLeads,
        verifiedLeads,
        repliedLeads,
        savedContacts,
        missingConsent,
        invalidPhones,
        apiConnected: false // Strictly false until integrated
      });
    } else {
      setData({ hasRealActivity: false });
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12 font-sans">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
          <Activity className="text-cyan-400" size={24} /> AI Operative Intelligence Analytics
        </h2>
        <p className="text-slate-400 text-sm font-medium">Real-time operational intelligence across outreach, automation, conversations, workflows, and AI agents.</p>
      </div>

      {!data || !data.hasRealActivity ? (
        <div className="glass-card border border-white/5 p-16 flex flex-col items-center justify-center text-center rounded-2xl h-[500px]">
          <BarChart3 size={48} className="text-slate-600 mb-4" />
          <h3 className="text-xl font-black text-white mb-2">No real analytics data available yet.</h3>
          <p className="text-sm text-slate-500 max-w-lg mb-6">
            The AI Operative Intelligence Analytics System strictly relies on live, verified database logs and provider webhooks. Since the system has not processed any real workflow runs or campaigns yet, there is no data to analyze. We do not show placeholder or demo metrics.
          </p>
          <button className="px-6 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-cyan-500/20 transition-colors">
            Run Initial Workflow
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SECTION 1 - GLOBAL OVERVIEW */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Section 1 — Global Operative Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="glass-card p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Leads Processed</div>
                <div className="text-2xl font-black text-white">{data.totalLeads}</div>
                <div className="text-[9px] text-cyan-400 mt-1">Live CRM Sync</div>
              </div>
              <div className="glass-card p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">WhatsApp Verified</div>
                <div className="text-2xl font-black text-white">{data.verifiedLeads}</div>
                <div className="text-[9px] text-amber-500 mt-1">API Disconnected</div>
              </div>
              <div className="glass-card p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sent Success Count</div>
                <div className="text-2xl font-black text-white">{data.sentLeads}</div>
                <div className="text-[9px] text-amber-500 mt-1">Pending Connection</div>
              </div>
              <div className="glass-card p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Conversations</div>
                <div className="text-2xl font-black text-white">0</div>
                <div className="text-[9px] text-slate-500 mt-1">Requires Webhook</div>
              </div>
              <div className="glass-card p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reply Rate</div>
                <div className="text-2xl font-black text-white">0%</div>
                <div className="text-[9px] text-slate-500 mt-1">Awaiting Data</div>
              </div>
              <div className="glass-card p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">API Health</div>
                <div className="text-lg font-black text-rose-400 mt-1">OFFLINE</div>
                <div className="text-[9px] text-rose-500 mt-1 font-bold">Unverified</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION 3 - WHATSAPP OPERATIVE ANALYTICS */}
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Section 3 — WhatsApp Operative Analytics</h3>
              <div className="glass-card p-6 border border-white/5">
                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-400">Numbers Processed</span> <span className="text-white">{data.totalLeads}</span></div>
                     <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '100%' }}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-400">Invalid / Missing Phones</span> <span className="text-white">{data.invalidPhones}</span></div>
                     <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${(data.invalidPhones/data.totalLeads)*100}%` }}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-400">Consent Missing</span> <span className="text-white">{data.missingConsent}</span></div>
                     <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(data.missingConsent/data.totalLeads)*100}%` }}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-400">Queued for Dispatch</span> <span className="text-white">{data.queuedLeads}</span></div>
                     <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(data.queuedLeads/data.totalLeads)*100}%` }}></div></div>
                   </div>
                 </div>
              </div>
            </div>

            {/* SECTION 5 - AI AGENT ANALYTICS */}
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Section 5 — AI Agent Analytics</h3>
              <div className="glass-card p-6 border border-white/5">
                <div className="flex items-center justify-center h-[180px] border border-dashed border-white/10 rounded-xl bg-black/20">
                  <div className="text-center">
                     <Bot size={24} className="text-slate-600 mx-auto mb-2" />
                     <div className="text-xs font-bold text-slate-400">Agent Execution Chain Empty</div>
                     <div className="text-[10px] text-slate-500">Run the command center workflow to populate agent neural graphs.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 13 - ALERTS & BLOCKERS */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Section 13 — Alerts & Blockers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!data.apiConnected && (
                <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="text-rose-400 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">API Disconnected</h4>
                    <p className="text-[10px] text-rose-300/70">WhatsApp Business API provider is not configured. All dispatches will be held in queue.</p>
                  </div>
                </div>
              )}
              {data.missingConsent > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-400 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Consent Missing Spikes</h4>
                    <p className="text-[10px] text-amber-300/70">{data.missingConsent} leads are currently blocked in the pipeline due to strict opt-in requirements.</p>
                  </div>
                </div>
              )}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No other critical alerts</span>
              </div>
            </div>
          </div>

          {/* SECTION 11 - LIVE OPERATIONS FEED */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Section 11 — Live Operations Feed</h3>
            <div className="glass-card border border-white/5 overflow-hidden">
               {data.totalLeads > 0 ? (
                 <table className="w-full text-left">
                   <thead className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     <tr>
                       <th className="px-6 py-3">Timestamp</th>
                       <th className="px-6 py-3">Agent Source</th>
                       <th className="px-6 py-3">Event Type</th>
                       <th className="px-6 py-3">Target</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                     <tr className="hover:bg-white/[0.01]">
                       <td className="px-6 py-3 text-slate-500 font-mono text-[10px]">{new Date().toLocaleTimeString()}</td>
                       <td className="px-6 py-3"><span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 text-[9px] uppercase font-bold tracking-widest">Total Leads Agent</span></td>
                       <td className="px-6 py-3 text-white">Pipeline Extraction Complete</td>
                       <td className="px-6 py-3">{data.totalLeads} Contacts</td>
                     </tr>
                     <tr className="hover:bg-white/[0.01]">
                       <td className="px-6 py-3 text-slate-500 font-mono text-[10px]">{new Date().toLocaleTimeString()}</td>
                       <td className="px-6 py-3"><span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 text-[9px] uppercase font-bold tracking-widest">System Monitor</span></td>
                       <td className="px-6 py-3 text-white">API Connection Failure</td>
                       <td className="px-6 py-3">Webhook Disconnected</td>
                     </tr>
                   </tbody>
                 </table>
               ) : (
                 <div className="p-8 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                   System Idle - No operations recorded
                 </div>
               )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function WorkflowsView() {
  let leads = [];
  try {
    const stored = localStorage.getItem('whatsapp_operative_leads');
    if (stored) leads = JSON.parse(stored);
  } catch {}
  if (!Array.isArray(leads)) leads = [];
  const hasLeads = leads.length > 0;

  const pipeline = [
    { id: 'A', label: 'CSV / Data Vault Import', icon: Database, color: 'blue', status: hasLeads ? 'complete' : 'idle' },
    { id: 'B', label: 'Lead Validation & Scoring', icon: CheckCircle2, color: 'cyan', status: hasLeads ? 'complete' : 'idle' },
    { id: 'C', label: 'Campaign Assignment', icon: Zap, color: 'purple', status: 'idle' },
    { id: 'D', label: 'WhatsApp Operative Execution', icon: MessageCircle, color: 'green', status: 'idle' },
    { id: 'E', label: 'Reply Handling', icon: MessageSquare, color: 'amber', status: 'idle' },
    { id: 'F', label: 'Analytics Update', icon: BarChart3, color: 'rose', status: 'idle' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
          <GitBranch className="text-purple-400" size={22} /> Automation Orchestration
        </h2>
        <p className="text-slate-500 text-sm">Visual automation pipeline showing real data flow across the operative system.</p>
      </div>

      <div className="glass-card border border-white/5 p-8">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Platform Workflow DAG — Real Pipeline State</h3>
        <div className="flex flex-col gap-0">
          {pipeline.map((node, i) => (
            <div key={node.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all',
                  node.status === 'complete' ? `bg-${node.color}-500/20 border-${node.color}-500/40` : 'bg-white/5 border-white/10'
                )}>
                  <node.icon size={18} className={node.status === 'complete' ? `text-${node.color}-400` : 'text-slate-600'} />
                </div>
                {i < pipeline.length - 1 && <div className={clsx('w-px flex-1 my-1 min-h-[32px]', node.status === 'complete' ? 'bg-cyan-500/40' : 'bg-white/10')} />}
              </div>
              <div className={clsx('flex-1 pb-6 pt-1.5 pl-1',  i < pipeline.length - 1 ? 'border-b border-white/5' : '')}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-white">{node.label}</div>
                  <span className={clsx('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border',
                    node.status === 'complete' ? `bg-${node.color}-500/10 text-${node.color}-400 border-${node.color}-500/20` : 'bg-white/5 text-slate-600 border-white/10'
                  )}>{node.status === 'complete' ? 'Complete' : 'Idle — Awaiting Trigger'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!hasLeads && (
        <div className="glass-card border border-dashed border-white/10 p-10 text-center rounded-2xl">
          <GitBranch size={32} className="text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-black text-slate-400 mb-1">No workflow activity yet</div>
          <div className="text-xs text-slate-500">Import leads from Lead Intel to trigger the automation pipeline.</div>
        </div>
      )}
    </div>
  );
}


function IntegrationsView() {
  const integrations = [
    { name: 'WhatsApp Business API', provider: 'Meta / 360Dialog / Twilio', status: 'Not Connected', detail: 'Required for message dispatch and reply webhooks.', icon: MessageCircle, color: 'green' },
    { name: 'CRM / Data Vault', provider: 'Internal Database', status: 'Connected', detail: 'Lead data flowing from nexus_crm_leads and nexus-lead-vault.', icon: Database, color: 'cyan' },
    { name: 'OpenAI / AI Provider', provider: 'OpenAI API', status: 'Not Connected', detail: 'Required for AI reply generation and lead scoring.', icon: Bot, color: 'purple' },
    { name: 'Webhook Receiver', provider: 'Internal Server', status: 'Idle', detail: 'Inbound webhook not receiving events. API not connected.', icon: Workflow, color: 'amber' },
    { name: 'SMTP / Email', provider: 'SMTP Server', status: 'Not Connected', detail: 'Optional email fallback channel.', icon: Send, color: 'blue' },
    { name: 'Google Contacts', provider: 'Google API', status: 'Not Connected', detail: 'Sync saved contacts to Google Workspace.', icon: Users, color: 'rose' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
          <Workflow className="text-amber-400" size={22} /> Integrations & External Systems
        </h2>
        <p className="text-slate-500 text-sm">Real connection status for all external APIs, webhooks, and data providers.</p>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
        <div>
          <div className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">WhatsApp API Not Connected</div>
          <div className="text-[10px] text-rose-300/70">The system cannot send or receive WhatsApp messages until a real provider (Meta Cloud API, Twilio, or 360Dialog) is configured. No messages will be dispatched until this is resolved.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((app, i) => (
          <div key={i} className="glass-card p-5 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${app.color}-500/10`)}>
                <app.icon size={20} className={`text-${app.color}-400`} />
              </div>
              <span className={clsx('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border',
                app.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                app.status === 'Idle' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-white/5 text-slate-500 border-white/10'
              )}>{app.status}</span>
            </div>
            <h3 className="text-sm font-black text-white mb-1">{app.name}</h3>
            <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">{app.provider}</div>
            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">{app.detail}</p>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white transition-colors uppercase tracking-widest">
              {app.status === 'Connected' ? 'Configure' : 'Connect Provider'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


function SettingsView() {
  return (
    <div className="space-y-8 max-w-[1000px] mx-auto pb-12">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
          <Settings className="text-slate-400" size={22} /> System Configuration
        </h2>
        <p className="text-slate-500 text-sm">Global settings, operational rules, consent policy, queue limits, and security config.</p>
      </div>

      <div className="space-y-6">
        {/* Consent Rules */}
        <div className="glass-card border border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2"><Shield size={14} className="text-emerald-400" /> Consent & Compliance Rules</h3>
          <div className="space-y-4">
            {[['Require explicit opt-in before sending messages', true], ['Block leads with consent_status = missing', true], ['Auto-quarantine unsubscribe requests', true], ['Enable GDPR-mode data deletion on request', false]].map(([label, active], i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="text-sm text-slate-300 font-medium">{label as string}</div>
                <div className={clsx('w-11 h-6 rounded-full relative cursor-pointer transition-colors', active ? 'bg-emerald-500' : 'bg-white/10')}>
                  <div className={clsx('absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all', active ? 'right-1' : 'left-1')} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Config */}
        <div className="glass-card border border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2"><Activity size={14} className="text-cyan-400" /> Queue & Send Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            {[['Max messages per hour', '50'], ['Retry limit per lead', '3'], ['Queue worker threads', '1'], ['Global send delay (seconds)', '3']].map(([label, val], i) => (
              <div key={i}>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</label>
                <input type="number" defaultValue={val as string} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
              </div>
            ))}
          </div>
        </div>

        {/* API Config */}
        <div className="glass-card border border-white/5 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2"><Terminal size={14} className="text-purple-400" /> API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">WhatsApp Provider API Key</label>
              <input type="password" placeholder="Enter your provider API key..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">OpenAI API Key</label>
              <input type="password" placeholder="Enter your OpenAI API key..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 font-mono focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Global Timezone</label>
              <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                <option>UTC (GMT+0)</option><option>IST (GMT+5:30)</option><option>EST (GMT-5)</option><option>PST (GMT-8)</option>
              </select>
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          Save Configuration
        </button>
      </div>
    </div>
  );
}


const PhoneIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
