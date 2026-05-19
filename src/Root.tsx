import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import App from './App';
import AIWhatsAppModule from './AIWhatsAppModule';
import Home from './Home';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import CRMDashboard from './components/crm/CRMDashboard';
import ChatbotAgent from './components/chatbot/ChatbotAgent';
import { CursorGlow } from './components/LuxuryDesignSystem';
import { AICampaignBuilderPage } from './components/AICampaignBuilderPage';
import ScrollToTop from './components/ScrollToTop';
import { APP_STATE_TO_PATH, TAB_TO_PATH, PATH_TO_TAB } from './routeConfig';
import { 
  Bot, 
  Zap, 
  Home as HomeIcon, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  UserCircle, 
  Menu, 
  X 
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';

// All paths that belong to the AI WhatsApp module
const AI_WHATSAPP_PATHS = [
  '/command-center',
  '/whatsapp-operative',
  '/conversations',
  '/ai-agents',
  '/campaigns',
  '/lead-intel',
  '/analytics',
  '/workflows',
  '/integrations',
  '/system-config',
];

/** Derive the old appState from the current URL pathname */
function getAppStateFromPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname === '/lead-engine') return 'lead_engine';
  if (pathname === '/crm') return 'crm';
  if (pathname === '/settings') return 'settings';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/campaigns/new') return 'new_campaign';
  if (AI_WHATSAPP_PATHS.includes(pathname)) return 'ai_whatsapp';
  return 'home'; // Fallback for unknown routes
}

/** Derive the AIWhatsApp tab from pathname */
function getTabFromPath(pathname: string): string | undefined {
  return PATH_TO_TAB[pathname];
}

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive current appState from URL (no more useState for appState!)
  const appState = getAppStateFromPath(location.pathname);

  // Navigation function that replaces the old setAppState
  // Accepts both old-style state names ('crm') and URL paths ('/crm')
  const navigateToRoute = (newAppState: string, tab?: string) => {
    // If it's already a URL path, navigate directly
    if (newAppState.startsWith('/')) {
      navigate(newAppState);
      return;
    }
    if (newAppState === 'ai_whatsapp' && tab) {
      const path = TAB_TO_PATH[tab];
      if (path) {
        navigate(path);
        return;
      }
    }
    const path = APP_STATE_TO_PATH[newAppState];
    if (path) {
      navigate(path);
    } else {
      navigate('/');
    }
  };

  // Smooth Navigation and Administrative Route Navigations
  const navigateToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    if (sectionId === 'settings') {
      navigate('/settings');
      setActiveSection('');
      return;
    }

    if (sectionId === 'profile') {
      navigate('/profile');
      setActiveSection('');
      return;
    }

    if (appState !== 'home') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Section Intersection Scroll Spying Observer (Only active when inside Home component)
  useEffect(() => {
    if (appState !== 'home') {
      setActiveSection('');
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ['home', 'workspace', 'systems'];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [appState]);

  // handleLaunch now navigates via URL
  const handleLaunch = (mode: 'lead_engine' | 'ai_whatsapp' | 'crm') => {
    navigateToRoute(mode);
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans overflow-hidden transition-colors duration-300">
      <CursorGlow />
      <ScrollToTop />
      
      {/* Floating Blur Navbar */}
      <nav 
        className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-14 bg-black/45 backdrop-blur-xl border border-white/10 rounded-2xl z-[100] flex items-center justify-between px-6 shadow-[0_0_30px_rgba(0,0,0,0.55)] pointer-events-auto select-none"
        aria-label="Global Directory Navbar"
      >
        
        {/* REDESIGNED LOGO: Isometric 3D Neural Hex-Core linked to accent */}
        <button 
          onClick={() => navigateToSection('home')}
          className="flex items-center gap-2.5 cursor-pointer group outline-none rounded-lg p-1 transition-all pointer-events-auto"
          aria-label="NexusOS Logo Home Link"
        >
          {/* Isometric 3D Hex Core Icon */}
          <div 
            className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center transition-all duration-500"
            style={{
              boxShadow: 'inset 0 1px 8px var(--accent-soft)'
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 fill-none group-hover:rotate-[360deg] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-glow)" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path d="M 12 2 L 20 6.5 L 20 15.5 L 12 20 L 4 15.5 L 4 6.5 Z" stroke="url(#hexGrad)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M 12 2 L 12 11 L 20 6.5" stroke="url(#hexGrad)" strokeWidth="1" />
              <path d="M 12 11 L 4 6.5" stroke="url(#hexGrad)" strokeWidth="1" />
              <path d="M 12 11 L 12 20" stroke="url(#hexGrad)" strokeWidth="1" />
              <circle cx="12" cy="11" r="1.5" className="animate-pulse" style={{ fill: 'var(--accent)' }} />
              <circle cx="12" cy="2" r="1" style={{ fill: 'var(--accent)' }} />
              <circle cx="20" cy="6.5" r="1" style={{ fill: 'var(--accent)' }} />
              <circle cx="4" cy="6.5" r="1" style={{ fill: 'var(--accent)' }} />
            </svg>
          </div>
          <span className="font-black text-white tracking-tighter text-lg hidden sm:block transition-all">
            NEXUS<span style={{ color: 'var(--accent)' }}>OS</span>
          </span>
        </button>

        {/* Center Links (Desktop / Laptop) with premium Shared Layout Indicators */}
        <div className="hidden md:flex items-center gap-4">
          {[
            { id: 'home', label: 'Home', icon: HomeIcon },
            { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
            { id: 'systems', label: 'Systems', icon: Bot },
          ].map((item) => {
            const isActive = appState === 'home' && activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateToSection(item.id)}
                className={clsx(
                  "relative flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer px-3.5 py-2 rounded-xl outline-none hover:text-white pointer-events-auto z-10",
                  isActive ? "text-white" : "text-slate-500"
                )}
                aria-label={`Scroll to ${item.label} section`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 border rounded-xl -z-10 animate-pulse"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      borderColor: 'var(--accent-border)',
                      boxShadow: 'inset 0 1px 12px var(--accent-soft), 0 0 20px var(--accent-glow)'
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon size={13} className={clsx("transition-transform duration-300", isActive && "scale-110")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Icons: Settings & Profile Actions */}
        <div className="flex items-center gap-3">
          
          {/* Settings Button */}
          <div className="relative">
            <button 
              onClick={() => navigateToSection('settings')}
              className={clsx(
                "relative transition-colors cursor-pointer outline-none rounded-xl p-2 flex items-center justify-center pointer-events-auto z-10",
                appState === 'settings' ? "text-white" : "text-slate-500 hover:text-white"
              )}
              aria-label="Navigate to administrative Settings workspace"
            >
              {appState === 'settings' && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 border rounded-xl -z-10 animate-pulse"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    borderColor: 'var(--accent-border)',
                    boxShadow: 'inset 0 1px 12px var(--accent-soft), 0 0 20px var(--accent-glow)'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <SettingsIcon size={16} className={clsx(appState === 'settings' && "scale-115 animate-[spin_5s_linear_infinite]")} style={{ color: appState === 'settings' ? 'var(--accent)' : undefined }} />
            </button>
          </div>

          {/* Profile Button */}
          <div className="relative">
            <button 
              onClick={() => navigateToSection('profile')}
              className={clsx(
                "relative transition-colors cursor-pointer outline-none rounded-xl p-2 flex items-center justify-center pointer-events-auto z-10",
                appState === 'profile' ? "text-white" : "text-slate-500 hover:text-white"
              )}
              aria-label="Navigate to administrative Profile dashboard"
            >
              {appState === 'profile' && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 border rounded-xl -z-10 animate-pulse"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    borderColor: 'var(--accent-border)',
                    boxShadow: 'inset 0 1px 12px var(--accent-soft), 0 0 20px var(--accent-glow)'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <UserCircle size={18} className={clsx(appState === 'profile' && "scale-115")} style={{ color: appState === 'profile' ? 'var(--accent)' : undefined }} />
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="relative md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer outline-none rounded-lg p-1.5 pointer-events-auto"
              aria-label="Toggle mobile directory links"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile menu dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-48 p-3 bg-black/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl z-[110] flex flex-col gap-1"
                >
                  {[
                    { id: 'home', label: 'Home', icon: HomeIcon },
                    { id: 'workspace', label: 'Workspace', icon: LayoutDashboard },
                    { id: 'systems', label: 'Systems', icon: Bot },
                  ].map((item) => {
                    const isMobActive = appState === 'home' && activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToSection(item.id)}
                        className={clsx(
                          "w-full text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-3 transition-colors cursor-pointer pointer-events-auto",
                          isMobActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                        style={{
                          backgroundColor: isMobActive ? 'var(--accent-soft)' : undefined,
                          borderColor: isMobActive ? 'var(--accent-border)' : undefined,
                        }}
                      >
                        <item.icon size={13} style={{ color: isMobActive ? 'var(--accent)' : undefined }} /> {item.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </nav>

      {/* Main View Area with Cinematic Blur Reveal Transitions */}
      <div className="flex-1 w-full h-full relative z-10 pointer-events-auto">
        <AnimatePresence mode="wait">
          <Routes location={location} key={appState}>
            {/* Home */}
            <Route path="/" element={
              <motion.div
                key="home"
                initial={{ opacity: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar pointer-events-auto z-10"
              >
                <Home onLaunch={handleLaunch} />
              </motion.div>
            } />

            {/* Lead Engine */}
            <Route path="/lead-engine" element={
              <motion.div
                key="lead_engine"
                ref={(el) => { if (el) el.scrollTop = 0; }}
                initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(20px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 pt-24 overflow-y-auto custom-scrollbar pointer-events-auto z-10"
              >
                <div className="min-h-full">
                  <App onNavigate={(route) => navigateToRoute(route)} />
                </div>
              </motion.div>
            } />

            {/* AI WhatsApp Module — all its sub-routes */}
            {AI_WHATSAPP_PATHS.map(path => (
              <Route key={path} path={path} element={
                <motion.div
                  key="ai_whatsapp"
                  initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(20px)' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 pt-24 pb-6 px-6 pointer-events-auto z-10"
                >
                  {/* Wraps AI WhatsApp in a glass card for premium entry feeling */}
                  <div className="w-full h-full bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <AIWhatsAppModule onNavigate={(route) => navigateToRoute(route ? route : 'home')} />
                  </div>
                </motion.div>
              } />
            ))}

            {/* Settings */}
            <Route path="/settings" element={
              <motion.div
                key="settings"
                initial={{ opacity: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar pointer-events-auto z-10"
              >
                <SettingsPage />
              </motion.div>
            } />

            {/* Profile */}
            <Route path="/profile" element={
              <motion.div
                key="profile"
                initial={{ opacity: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar pointer-events-auto z-10"
              >
                <ProfilePage />
              </motion.div>
            } />

            {/* CRM */}
            <Route path="/crm" element={
              <motion.div
                key="crm"
                initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(20px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 pt-24 pb-6 px-6 pointer-events-auto z-50 bg-[var(--bg)]"
              >
                <div className="w-full h-full bg-[#020202] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                  <CRMDashboard onNavigate={(route) => navigateToRoute(route ? route : 'home')} />
                </div>
              </motion.div>
            } />

            {/* New Campaign Builder */}
            <Route path="/campaigns/new" element={
              <motion.div
                key="new_campaign"
                initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.02 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(20px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 pointer-events-auto z-50"
              >
                <AICampaignBuilderPage onBack={() => navigate('/campaigns')} />
              </motion.div>
            } />

            {/* 404 / Catch-all → redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>

      <ChatbotAgent navigateTo={(route) => navigateToRoute(route)} />
    </div>
  );
}
