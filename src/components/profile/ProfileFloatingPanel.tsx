import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, LogOut, Settings, Database, RefreshCw, 
  Shield, CreditCard, ChevronRight, Activity, Download
} from 'lucide-react';
import clsx from 'clsx';
import { useProfileData } from '../../hooks/useProfileData';

interface ProfileFloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export const ProfileFloatingPanel: React.FC<ProfileFloatingPanelProps> = ({ isOpen, onClose, onNavigate }) => {
  const { data, loading, error, isRefreshing, refreshDataVault, refetch } = useProfileData();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSignOut = () => {
    // In a real app: await supabase.auth.signOut();
    onClose();
    if (onNavigate) onNavigate('home');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for click-outside */}
          <div 
            className="fixed inset-0 z-[100] bg-transparent" 
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-label="Profile Panel"
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 right-6 md:top-24 md:right-8 w-[calc(100vw-48px)] md:w-[380px] max-h-[82vh] z-[101] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Glow background effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] -z-10 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10 rounded-full pointer-events-none" />

            {/* Top Header */}
            <div className="p-5 border-b border-white/5 relative shrink-0">
              <button 
                onClick={onClose}
                aria-label="Close profile panel"
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mt-2">
                {loading ? (
                  <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0 relative">
                    {data?.user?.name ? data.user.name.charAt(0) : 'U'}
                    {data?.user?.status === 'Online' && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#121212] rounded-full" />
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0 pr-4">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                    </div>
                  ) : error ? (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Error Loading Data</h3>
                      <button onClick={refetch} className="text-xs text-emerald-400 flex items-center gap-1 hover:underline">
                        <RefreshCw size={10} /> Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-white leading-tight truncate">{data?.user?.name || 'Unknown User'}</h3>
                      <div className="text-xs text-slate-400 truncate">{data?.user?.email || 'No email found'}</div>
                    </>
                  )}
                </div>
              </div>

              {!loading && !error && (
                <div className="flex gap-2 mt-4">
                  <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                    {data?.user?.role || 'User'}
                  </span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold uppercase tracking-widest text-slate-300">
                    {data?.account?.plan || 'Free'}
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Database size={10}/> Saved Leads</div>
                  <div className="text-xl font-black text-white font-mono">
                    {loading ? <span className="animate-pulse">--</span> : data?.stats?.savedLeads || 0}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Download size={10}/> CSV Exports</div>
                  <div className="text-xl font-black text-white font-mono">
                    {loading ? <span className="animate-pulse">--</span> : data?.stats?.csvExports || 0}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity size={10}/> Active Agents</div>
                  <div className="text-xl font-black text-white font-mono">
                    {loading ? <span className="animate-pulse">--</span> : data?.stats?.activeAgents || 0}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><RefreshCw size={10}/> Vault Sync</div>
                  <div className="text-sm font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
                    {loading ? <span className="animate-pulse text-slate-500">Checking</span> : (
                      <>
                        <span className={clsx(
                          "w-2 h-2 rounded-full",
                          data?.stats?.vaultSyncStatus === 'synced' ? "bg-emerald-500" :
                          data?.stats?.vaultSyncStatus === 'outdated' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <span className={clsx(
                          data?.stats?.vaultSyncStatus === 'synced' ? "text-emerald-400" :
                          data?.stats?.vaultSyncStatus === 'outdated' ? "text-amber-400" : "text-red-400"
                        )}>{data?.stats?.vaultSyncStatus || 'Error'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Vault Actions */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2"><Database size={14} className="text-emerald-400"/> Data Vault</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest">
                    {data?.stats?.lastVaultRefreshAt ? new Date(data.stats.lastVaultRefreshAt).toLocaleTimeString() : '--:--'}
                  </div>
                </div>
                <button 
                  onClick={refreshDataVault}
                  disabled={isRefreshing || loading}
                  className="w-full py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={12} className={clsx(isRefreshing && "animate-spin")} />
                  {isRefreshing ? 'Syncing Vault...' : 'Force Sync Vault'}
                </button>
              </div>

              {/* Action List */}
              <div className="space-y-1 border-t border-white/5 pt-4">
                <button 
                  onClick={() => { onClose(); if (onNavigate) onNavigate('profile'); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Profile Settings</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>

                <button 
                  onClick={() => { onClose(); if (onNavigate) onNavigate('settings'); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Account & Workspace</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>

                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Billing & Plan</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 border border-white/10 px-2 py-0.5 rounded">Soon</span>
                </button>
                
                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">Security Log</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 border border-white/10 px-2 py-0.5 rounded">Soon</span>
                </button>
              </div>

            </div>

            {/* Footer / Sign Out */}
            <div className="p-4 border-t border-white/5 bg-black/40 shrink-0">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
              <div className="text-center mt-3">
                <span className="text-[9px] font-mono text-slate-600">ID: {data?.user?.id || '---'}</span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
