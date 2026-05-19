import React, { useState } from 'react';
import { 
  DollarSign, Users, Zap, AlertCircle, Phone, Mail, Globe, 
  ChevronRight, Sparkles, Search, Filter, Download, Edit, Trash, 
  Plus, CheckCircle2, TrendingUp, Briefcase, Activity, Calendar,
  ArrowRight, ShieldCheck, Database, Sliders, UploadCloud, Clock,
  MapPin, MessageSquare, Target
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import clsx from 'clsx';
import { CRMLead, calculateCRMAnalytics } from '../../utils/crmAnalytics';

const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

// OVERVIEW PAGE
export const CRMOverviewPage = ({ leads, stats, onNavigate, onSelectLead }: { leads: CRMLead[], stats: ReturnType<typeof calculateCRMAnalytics>, onNavigate: (t: string) => void, onSelectLead: (l: CRMLead) => void }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center"><DollarSign size={16} className="text-emerald-400" /></div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Potential</span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Revenue Potential</div>
        <div className="text-2xl font-black text-white">₹{stats.revenuePotential.toLocaleString()}</div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center"><Users size={16} className="text-blue-400" /></div>
          <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">Total: {stats.totalLeads}</span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Valid Leads</div>
        <div className="text-2xl font-black text-white">{stats.validLeads}</div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center"><Zap size={16} className="text-purple-400" /></div>
          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">{stats.campaignReadyLeads} Ready</span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Follow-up Ready</div>
        <div className="text-2xl font-black text-white">{stats.followUpReadyPercentage}%</div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center"><AlertCircle size={16} className="text-amber-400" /></div>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Needs Enrichment</div>
        <div className="text-2xl font-black text-white">{stats.needsEnrichment}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-6 rounded-2xl h-[350px] flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Leads Activity</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.leadsActivityByDate}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl h-[350px] flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Market Share</h3>
        <div className="flex-1 flex flex-col gap-4 justify-center">
          {stats.categoryDistribution.slice(0,5).map((cat, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-white truncate max-w-[150px]">{cat.name}</span>
                <span className="text-slate-400 font-mono">{cat.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: colors[i % colors.length] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Top Priority Leads</h3>
          <button onClick={() => onNavigate('leads')} className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 hover:text-emerald-300">View All</button>
        </div>
        <div className="space-y-4">
          {stats.topPriorityLeads.slice(0,5).map((lead, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer" onClick={() => onSelectLead(lead)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                  {lead.businessName.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-[300px]">{lead.businessName}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest">{lead.category} • {lead.city}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">{lead.leadScore}/100</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Score</div>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          ))}
          {stats.topPriorityLeads.length === 0 && <div className="text-center text-sm text-slate-500 py-4">No leads available.</div>}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={64} className="text-emerald-400" /></div>
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2 relative z-10"><Sparkles size={14}/> AI CRM Insights</h3>
          <ul className="space-y-3 relative z-10">
            {stats.aiInsights.slice(0, 4).map((insight, idx) => (
              <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') }} />
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Pipeline Stages</h3>
          <div className="space-y-3">
            {stats.pipelineStages.filter(p => p.value > 0).map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-[10px] font-bold text-slate-400 w-20">{p.name}</div>
                <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-white/5">
                   <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.value/stats.totalLeads)*100}%`, backgroundColor: colors[i % colors.length] }} />
                </div>
                <div className="text-[10px] font-mono text-white w-8 text-right">{p.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

// REPORTS PAGE
export const CRMReportsPage = ({ leads, stats }: { leads: CRMLead[], stats: ReturnType<typeof calculateCRMAnalytics> }) => {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Performance Analytics</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
            <Calendar size={14} /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-colors">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Average Lead Score</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.avgLeadQuality}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">WhatsApp Ready</div>
          <div className="text-2xl font-black text-white">{stats.whatsappReadyLeads} <span className="text-sm font-normal text-slate-500">({Math.round((stats.whatsappReadyLeads/stats.totalLeads)*100 || 0)}%)</span></div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Email Ready</div>
          <div className="text-2xl font-black text-white">{stats.emailReadyLeads} <span className="text-sm font-normal text-slate-500">({Math.round((stats.emailReadyLeads/stats.totalLeads)*100 || 0)}%)</span></div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Missing Website</div>
          <div className="text-2xl font-black text-amber-400">{stats.websiteMissingLeads}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col h-[300px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Leads by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.categoryDistribution.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} width={100} />
              <RechartsTooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {stats.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col h-[300px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Leads by Location</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.locationDistribution.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// LEADS PAGE
export const CRMLeadsPage = ({ leads, onSelectLead, onNavigate, showToast }: { leads: CRMLead[], onSelectLead: (l: CRMLead) => void, onNavigate?: (route: string) => void, showToast?: (msg: string, type?: 'success'|'error'|'info') => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const filtered = leads.filter(l => 
    l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewLeadClick = () => {
    if (showToast) showToast('Opening Lead Engine...', 'info');
    if (onNavigate) {
      setTimeout(() => onNavigate('lead_engine'), 500);
    }
  };

  const exportLeadsToCSV = () => {
    if (!leads || leads.length === 0) {
      if (showToast) showToast('No real leads available to export.', 'error');
      return;
    }
    
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        const columns = [
          "id", "businessName", "category", "location", "address", 
          "phone", "whatsapp", "email", "website", "mapsUrl", 
          "rating", "reviews", "score", "status", "stage", 
          "value", "source", "extractedAt", "updatedAt", "notes"
        ];
        
        // Deduplicate
        const uniqueLeads = new Map();
        leads.forEach(lead => {
          const key = lead.id || lead.phone || `${lead.businessName}-${lead.city}`;
          if (!uniqueLeads.has(key)) {
            uniqueLeads.set(key, lead);
          }
        });
        
        const dedupedLeads = Array.from(uniqueLeads.values());
        
        const csvRows = [];
        csvRows.push(columns.join(','));
        
        dedupedLeads.forEach(lead => {
          const normalized = {
            id: lead.id || "",
            businessName: lead.businessName || lead.name || lead.title || "",
            category: lead.category || lead.businessType || lead.type || "",
            location: lead.location || lead.city || lead.area || "",
            address: lead.address || "",
            phone: lead.phone || lead.phoneNumber || "",
            whatsapp: lead.whatsapp || lead.whatsappNumber || lead.phone || "",
            email: lead.email || "",
            website: lead.website || lead.websiteUrl || "",
            mapsUrl: lead.mapsUrl || lead.googleMapsUrl || lead.googleMapUrl || "",
            rating: lead.rating || "",
            reviews: lead.reviews || lead.reviewCount || "",
            score: lead.score || lead.leadScore || "",
            status: lead.status || "",
            stage: lead.crmStage || lead.stage || "",
            value: lead.revenuePotential || lead.value || lead.potentialValue || "",
            source: lead.source || "Data Vault",
            extractedAt: lead.extractedAt || lead.createdAt || "",
            updatedAt: lead.updatedAt || "",
            notes: Array.isArray(lead.notes) ? lead.notes.map((n:any) => n.text || n).join(" | ") : lead.notes || ""
          };
          
          const row = columns.map(col => {
            let val = String((normalized as any)[col] || '');
            val = val.replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) {
              val = `"${val}"`;
            }
            return val;
          });
          csvRows.push(row.join(','));
        });
        
        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        link.download = `leads-export-${yyyy}-${mm}-${dd}-${hh}-${min}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (showToast) showToast('CSV exported successfully.', 'success');
      } catch (err) {
        if (showToast) showToast('CSV export failed. Please try again.', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 300); // Simulate short loading UX
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-black/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 w-64" 
            />
          </div>
          <button className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 transition-colors"><Filter size={16} /></button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNewLeadClick}
            aria-label="Open Lead Engine"
            className="text-xs font-bold uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={14} /> New Lead
          </button>
          <button 
            onClick={exportLeadsToCSV}
            disabled={isExporting}
            aria-label="Export all leads as CSV"
            className="text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Clock size={14} className="animate-spin" /> : <Download size={14} />} 
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0a0a0a] z-10 text-[10px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="p-4 font-bold border-b border-white/5">Business Name</th>
              <th className="p-4 font-bold border-b border-white/5">Category</th>
              <th className="p-4 font-bold border-b border-white/5">Location</th>
              <th className="p-4 font-bold border-b border-white/5 text-center">Score</th>
              <th className="p-4 font-bold border-b border-white/5">Contact</th>
              <th className="p-4 font-bold border-b border-white/5">Stage</th>
              <th className="p-4 font-bold border-b border-white/5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onSelectLead(lead)}>
                <td className="p-4 font-bold text-white max-w-[200px] truncate">{lead.businessName}</td>
                <td className="p-4 text-slate-300">{lead.category}</td>
                <td className="p-4 text-slate-400 text-xs truncate max-w-[150px]">{lead.city}</td>
                <td className="p-4 text-center">
                  <span className={clsx(
                    "px-2 py-1 rounded-md text-xs font-bold font-mono",
                    lead.leadScore >= 80 ? "bg-emerald-500/10 text-emerald-400" : lead.leadScore >= 50 ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
                  )}>{lead.leadScore}</span>
                </td>
                <td className="p-4 flex items-center gap-2">
                  {lead.phone ? <Phone size={14} className="text-emerald-400" /> : <Phone size={14} className="text-slate-700" />}
                  {lead.email ? <Mail size={14} className="text-blue-400" /> : <Mail size={14} className="text-slate-700" />}
                  {lead.website ? <Globe size={14} className="text-purple-400" /> : <Globe size={14} className="text-slate-700" />}
                </td>
                <td className="p-4">
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md border border-white/5 text-slate-300">{lead.crmStage}</span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                  <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit"><Edit size={14} /></button>
                  <button className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Delete"><Trash size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Search size={32} className="mb-4 opacity-20" />
            <p>No leads found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

// REVENUE PAGE
export const CRMRevenuePage = ({ leads, stats }: { leads: CRMLead[], stats: ReturnType<typeof calculateCRMAnalytics> }) => {
  const highValue = leads.filter(l => l.revenuePotential >= 10000).length;
  const expectedConv = Math.round(stats.revenuePotential * 0.15); // Simple 15% assumption
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-6 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Total Pipeline Value</h3>
          <div className="text-4xl font-black text-white mb-2">₹{stats.revenuePotential.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Based on standard scoring formula</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Expected Conversion (15%)</h3>
          <div className="text-3xl font-black text-emerald-400 font-mono">₹{expectedConv.toLocaleString()}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">High Value Targets</h3>
          <div className="text-3xl font-black text-white font-mono">{highValue} <span className="text-sm font-normal text-slate-500">Leads</span></div>
        </div>
      </div>
      
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Revenue by CRM Stage</h3>
         <div className="space-y-4">
           {stats.pipelineStages.filter(s => s.value > 0).map((stage, i) => {
             const stageLeads = leads.filter(l => l.crmStage === stage.name);
             const stageRev = stageLeads.reduce((acc, l) => acc + l.revenuePotential, 0);
             const percentage = stats.revenuePotential ? Math.round((stageRev / stats.revenuePotential) * 100) : 0;
             return (
               <div key={i} className="flex items-center gap-4">
                 <div className="w-24 text-xs font-bold text-slate-300">{stage.name}</div>
                 <div className="flex-1 h-3 bg-black rounded-full overflow-hidden border border-white/5">
                   <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors[i % colors.length] }} />
                 </div>
                 <div className="w-24 text-right font-mono text-sm font-bold text-white">₹{stageRev.toLocaleString()}</div>
               </div>
             );
           })}
         </div>
      </div>
      
      <div className="flex justify-end">
        <button className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-colors flex items-center gap-2">
          <TrendingUp size={16} /> Create Revenue Campaign
        </button>
      </div>
    </div>
  );
};

// MARKETING PAGE
export const CRMMarketingPage = ({ leads, stats }: { leads: CRMLead[], stats: ReturnType<typeof calculateCRMAnalytics> }) => {
  const hotLeads = leads.filter(l => l.leadScore >= 80 && (l.phone || l.email)).length;
  const warmLeads = leads.filter(l => l.leadScore >= 60 && l.leadScore < 80).length;
  const coldLeads = leads.filter(l => l.leadScore < 60).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
          <div className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1">Hot Segment</div>
          <div className="text-2xl font-black text-white mb-2">{hotLeads}</div>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase flex items-center gap-1">Launch <ArrowRight size={12}/></button>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
          <div className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">Warm Segment</div>
          <div className="text-2xl font-black text-white mb-2">{warmLeads}</div>
          <button className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase flex items-center gap-1">Nurture <ArrowRight size={12}/></button>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Cold Segment</div>
          <div className="text-2xl font-black text-white mb-2">{coldLeads}</div>
          <button className="text-xs text-slate-400 hover:text-slate-300 font-bold uppercase flex items-center gap-1">Re-engage <ArrowRight size={12}/></button>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <div className="text-[10px] text-amber-400 uppercase tracking-widest mb-1">Needs Enrichment</div>
          <div className="text-2xl font-black text-white mb-2">{stats.needsEnrichment}</div>
          <button className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1">Enrich <ArrowRight size={12}/></button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex-1">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Channel Readiness</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2"><Phone size={16} className="text-emerald-400"/> WhatsApp / Phone</span>
              <span className="font-mono">{stats.whatsappReadyLeads} Leads</span>
            </div>
            <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.totalLeads ? (stats.whatsappReadyLeads/stats.totalLeads)*100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2"><Mail size={16} className="text-blue-400"/> Email</span>
              <span className="font-mono">{stats.emailReadyLeads} Leads</span>
            </div>
            <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.totalLeads ? (stats.emailReadyLeads/stats.totalLeads)*100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// OPPORTUNITIES PAGE
export const CRMOpportunitiesPage = ({ 
  leads, 
  stats, 
  onSelectLead,
  onNavigate,
  showToast
}: { 
  leads: CRMLead[], 
  stats: ReturnType<typeof calculateCRMAnalytics>, 
  onSelectLead: (l: CRMLead) => void,
  onNavigate?: (route: string) => void,
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('All Scores');
  const [sortMode, setSortMode] = useState('Sort: Score');
  const [intentFilter, setIntentFilter] = useState('All Intent');

  // Add 20 sample leads for demonstration of scrolling
  const sampleLeads = Array.from({ length: 20 }).map((_, i) => ({
    id: `sample-${i}`,
    businessName: `Sample Prospect ${i + 1}`,
    location: "Dubai Healthcare City, Dubai",
    category: "Dental Clinic",
    source: "Google Maps",
    leadScore: 100 - (i % 30),
    revenuePotential: 146000 - (i * 2000),
    phone: i % 4 === 0 ? "" : "+971501234567",
    email: i % 5 === 0 ? "" : "hello@example.com",
    website: i % 6 === 0 ? "" : "https://example.com",
    whatsapp: i % 4 === 0 ? "" : "+971501234567",
    city: "Dubai",
    extractedAt: new Date().toISOString(),
    crmStage: 'New Lead' as const
  })) as CRMLead[];

  // Use only new leads + sample leads
  const allLeads = [...leads.filter(l => l.crmStage === 'New Lead'), ...sampleLeads];

  const filteredLeads = allLeads.filter(l => {
    if (searchTerm && !l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) && !l.city.toLowerCase().includes(searchTerm.toLowerCase()) && !l.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (scoreFilter === '90+' && l.leadScore < 90) return false;
    if (scoreFilter === '80+' && l.leadScore < 80) return false;
    if (scoreFilter === '70+' && l.leadScore < 70) return false;
    if (scoreFilter === 'Below 70' && l.leadScore >= 70) return false;

    // We generate intent dynamically for demo purposes based on score
    const intent = l.leadScore >= 90 ? 'High' : l.leadScore >= 75 ? 'Medium' : 'Low';
    if (intentFilter === 'High Intent' && intent !== 'High') return false;
    if (intentFilter === 'Medium Intent' && intent !== 'Medium') return false;
    if (intentFilter === 'Low Intent' && intent !== 'Low') return false;

    return true;
  }).sort((a, b) => {
    if (sortMode === 'Sort: Score') return b.leadScore - a.leadScore;
    if (sortMode === 'Sort: Value') return b.revenuePotential - a.revenuePotential;
    if (sortMode === 'Sort: Probability') return (b.leadScore * 0.9) - (a.leadScore * 0.9);
    return new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime(); // Recent
  });

  const totalValue = filteredLeads.reduce((acc, l) => acc + l.revenuePotential, 0);
  const avgScore = filteredLeads.length ? Math.round(filteredLeads.reduce((acc, l) => acc + l.leadScore, 0) / filteredLeads.length) : 0;
  const hotCount = filteredLeads.filter(l => l.leadScore >= 90).length;

  return (
    <div className="dashboard-inner flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN: Leads Section (70% width) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505] border border-emerald-500/10 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.03)] relative overflow-hidden">
        {/* Top glow border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-20"></div>
        
        {/* Header Block with Neural Summary Counters */}
        <div className="shrink-0 p-5 border-b border-white/5 bg-white/[0.01] z-10 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Target size={14} className="text-emerald-400 animate-pulse" />
                </div>
                Nexus Intelligence Center
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Cyber-Neural Campaign Opportunity Pipeline</p>
            </div>
          </div>

          {/* Filter counters */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-black/50 border border-white/5 p-2 rounded-xl relative overflow-hidden group">
              <div className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5 font-bold">Active Leads</div>
              <div className="text-sm font-black text-white font-mono leading-none">{filteredLeads.length}</div>
              <div className="absolute right-2 bottom-1.5 text-[8px] font-bold text-slate-600">VAULT</div>
            </div>
            <div className="bg-black/50 border border-white/5 p-2 rounded-xl relative overflow-hidden group">
              <div className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5 font-bold">AI Validated</div>
              <div className="text-sm font-black text-emerald-400 font-mono leading-none">{Math.round(filteredLeads.length * 0.95)}</div>
              <div className="absolute right-2 bottom-1.5 text-[8px] font-bold text-emerald-500/60">95%</div>
            </div>
            <div className="bg-black/50 border border-white/5 p-2 rounded-xl relative overflow-hidden group">
              <div className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5 font-bold">Hot Intent</div>
              <div className="text-sm font-black text-amber-400 font-mono leading-none">{hotCount}</div>
              <div className="absolute right-2 bottom-1.5 text-[8px] font-bold text-amber-500/60">Flame</div>
            </div>
            <div className="bg-black/50 border border-white/5 p-2 rounded-xl relative overflow-hidden group">
              <div className="text-[8px] uppercase tracking-widest text-slate-500 mb-0.5 font-bold">CRM Synced</div>
              <div className="text-sm font-black text-cyan-400 font-mono leading-none">{leads.length}</div>
              <div className="absolute right-2 bottom-1.5 text-[8px] font-bold text-cyan-500/60">SYNCED</div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="shrink-0 p-3.5 border-b border-white/5 bg-black/40 z-10">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Filter by name, city, category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>
            <select 
              value={scoreFilter} 
              onChange={(e) => setScoreFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option>All Scores</option>
              <option>90+</option>
              <option>80+</option>
              <option>70+</option>
              <option>Below 70</option>
            </select>
            <select 
              value={sortMode} 
              onChange={(e) => setSortMode(e.target.value)}
              className="bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option>Sort: Score</option>
              <option>Sort: Value</option>
              <option>Sort: Recent</option>
              <option>Sort: Probability</option>
            </select>
            <select 
              value={intentFilter} 
              onChange={(e) => setIntentFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option>All Intent</option>
              <option>High Intent</option>
              <option>Medium Intent</option>
              <option>Low Intent</option>
            </select>
          </div>
        </div>

        {/* Lead cards scroll list */}
        <div className="p-4 space-y-3">
          {filteredLeads.map((lead, idx) => {
            const intent = lead.leadScore >= 90 ? 'High' : lead.leadScore >= 75 ? 'Medium' : 'Low';
            const probability = Math.round(lead.leadScore * 0.92);
            const hasPhone = !!lead.phone;
            const hasEmail = !!lead.email;
            const hasWeb = !!lead.website;
            const hasWhatsapp = !!lead.whatsapp;
            
            const aiSummary = `Valid ${lead.category || 'lead'} in ${lead.city || 'local area'} showing strong digital presence. Ready for direct ${hasWhatsapp ? 'WhatsApp' : 'phone'} outreach.`;

            return (
              <div 
                key={`${lead.id}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectLead(lead)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectLead(lead);
                  }
                }}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 cursor-pointer select-none hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-gradient-to-b hover:from-white/[0.04] hover:to-emerald-500/[0.01] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.04)] transition-all duration-300 relative overflow-hidden group shadow-md"
              >
                {/* Skew shine effect */}
                <div className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out pointer-events-none" />
                
                {/* Left boundary edge lighting */}
                <div className={clsx(
                  "absolute top-0 left-0 w-[3px] h-full transition-colors",
                  lead.leadScore >= 90 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
                  lead.leadScore >= 75 ? "bg-cyan-500 shadow-[0_0_10px_#06b6d4]" :
                  "bg-slate-700"
                )}></div>

                {/* Row 1: Business Name & Score Badge */}
                <div className="flex justify-between items-start mb-1.5 pl-1.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-sm font-black text-white tracking-tight leading-snug truncate max-w-[200px] sm:max-w-[320px]">{lead.businessName}</h3>
                  </div>
                  <div className={clsx(
                    "flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono shrink-0 ml-4",
                    lead.leadScore >= 90 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    lead.leadScore >= 75 ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" :
                    "bg-slate-800 border-slate-700 text-slate-400"
                  )}>
                    <span>SCORE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span>{lead.leadScore}</span>
                  </div>
                </div>

                {/* Row 2: Category • Location • Vault */}
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3 pl-1.5 truncate flex items-center gap-1.5">
                  <MapPin size={9} className="text-slate-500" />
                  <span className="truncate max-w-[120px]">{lead.city || lead.location || 'Unknown Location'}</span>
                  <span className="text-slate-700">•</span>
                  <span className="truncate max-w-[120px]">{lead.category}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-emerald-400/80">{lead.source || 'Data Vault'}</span>
                </div>

                {/* Row 3: Contact Actions */}
                <div className="flex items-center gap-2 mb-3 pl-1.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasPhone) navigator.clipboard.writeText(lead.phone || '');
                    }}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all duration-200",
                      hasPhone ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15" : "bg-white/5 border-transparent text-slate-600 opacity-50 cursor-not-allowed"
                    )}
                    title={hasPhone ? `Copy ${lead.phone}` : "No phone available"}
                  >
                    <Phone size={10} /> Call
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasEmail) window.open(`mailto:${lead.email}`);
                    }}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all duration-200",
                      hasEmail ? "bg-blue-500/5 border-blue-500/20 text-blue-400 hover:bg-blue-500/15" : "bg-white/5 border-transparent text-slate-600 opacity-50 cursor-not-allowed"
                    )}
                    title={hasEmail ? `Email ${lead.email}` : "No email available"}
                  >
                    <Mail size={10} /> Email
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasWeb) window.open(lead.website, '_blank');
                    }}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all duration-200",
                      hasWeb ? "bg-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/15" : "bg-white/5 border-transparent text-slate-600 opacity-50 cursor-not-allowed"
                    )}
                    title={hasWeb ? `Visit ${lead.website}` : "No website available"}
                  >
                    <Globe size={10} /> Web
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasWhatsapp) return;
                      
                      if (onNavigate) {
                        // Package this lead for AI WhatsApp Outreach
                        const outreachLead = {
                          id: lead.id,
                          name: lead.businessName,
                          businessName: lead.businessName,
                          phone: lead.whatsapp || lead.phone,
                          whatsapp: lead.whatsapp || lead.phone,
                          category: lead.category,
                          rating: lead.leadScore ? (lead.leadScore / 20).toString() : '4.5',
                          crmStage: 'Interested',
                          opportunity: 'Hot',
                          source: 'CRM Opportunities Direct'
                        };
                        localStorage.setItem("ai_whatsapp_outreach_leads", JSON.stringify([outreachLead]));
                        localStorage.setItem("ai_whatsapp_outreach_source", "crm-opportunities-direct");
                        localStorage.setItem("ai_whatsapp_outreach_created_at", new Date().toISOString());
                        
                        if (showToast) showToast(`Queued ${lead.businessName} for AI WhatsApp Outreach!`, 'success');
                        onNavigate('ai_whatsapp');
                      } else {
                        // Fallback direct WhatsApp redirect
                        window.open(`https://wa.me/${lead.whatsapp?.replace(/[^0-9]/g, '')}`, '_blank');
                      }
                    }}
                    className={clsx(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all duration-200",
                      hasWhatsapp ? "bg-[#25D366]/5 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/15" : "bg-white/5 border-transparent text-slate-600 opacity-50 cursor-not-allowed"
                    )}
                    title={hasWhatsapp ? `Launch AI WhatsApp Outreach for ${lead.businessName}` : "No WhatsApp number available"}
                  >
                    <MessageSquare size={10} /> Chat
                  </button>
                </div>

                {/* Row 4: Metrics Row */}
                <div className="bg-black/40 rounded-lg p-2 border border-white/5 grid grid-cols-5 gap-1.5 mb-3 pl-1.5 text-left">
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Value</div>
                    <div className="text-xs font-black text-white font-mono leading-none">₹{lead.revenuePotential.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Intent</div>
                    <div className={clsx(
                      "text-xs font-bold leading-none",
                      intent === 'High' ? "text-emerald-400" : intent === 'Medium' ? "text-cyan-400" : "text-slate-400"
                    )}>{intent}</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Response</div>
                    <div className="text-xs font-black text-white font-mono leading-none">{probability}%</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Last Seen</div>
                    <div className="text-xs font-semibold text-slate-300 leading-none">2h ago</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">AI Heat</div>
                    <div className="flex items-center gap-0.5 leading-none">
                      <span className={clsx(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        lead.leadScore >= 90 ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                      )}></span>
                      <span className="text-[10px] font-black text-white uppercase">{lead.leadScore >= 90 ? 'Hot' : 'Warm'}</span>
                    </div>
                  </div>
                </div>

                {/* Row 5: AI Summary & View Button */}
                <div className="flex justify-between items-center pl-1.5">
                  <p className="text-[10px] text-slate-400 italic line-clamp-1 flex-1 pr-4">{aiSummary}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1 group/btn shrink-0"
                  >
                    View <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search size={20} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No leads found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Neural Opportunity Matrix (30% width) */}
      <div className="w-full lg:w-[380px] flex flex-col gap-4 pr-1 shrink-0 pb-8 lg:sticky lg:top-4 lg:h-max">
        
        {/* Neural Summary Banner */}
        <div className="p-4 bg-gradient-to-br from-purple-500/15 to-emerald-500/5 border border-purple-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={48} className="text-purple-400" /></div>
          <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-1 flex items-center gap-2"><Sparkles size={12}/> Neural Intelligence</h3>
          <h2 className="text-base font-black text-white tracking-tight">Opportunity Matrix</h2>
          <p className="text-[10px] text-slate-400 mt-1">Autonomous scoring engine & live signal processor active.</p>
        </div>

        {/* Card A: Live AI Signals */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Live AI Signals
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Hot Identified</div>
              <div className="font-mono font-black text-white text-sm">{hotCount} Leads</div>
            </div>
            <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Response Prob.</div>
              <div className="font-mono font-black text-emerald-400 text-sm">{avgScore}% avg</div>
            </div>
            <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Top Category</div>
              <div className="font-semibold text-white truncate text-[11px]">{filteredLeads[0]?.category || 'Dental Clinic'}</div>
            </div>
            <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Velocity</div>
              <div className="font-mono font-black text-cyan-400 text-sm">48.2 l/hr</div>
            </div>
          </div>
        </div>

        {/* Card B: Market Pulse */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors"></div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-1.5">
            <Activity size={10} />
            Market Pulse
          </h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-300">Category Expansion</span>
                <span className="text-cyan-400 font-mono">+12.4%</span>
              </div>
              <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-300">Opportunity Intensity</span>
                <span className="text-emerald-400 font-mono">CRITICAL</span>
              </div>
              <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card C: AI Outreach Intelligence */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5">
            <Sparkles size={10} />
            Outreach Intelligence
          </h4>
          <div className="space-y-2 text-xs text-left">
            <div className="flex justify-between p-1.5 bg-black/30 rounded border border-white/5">
              <span className="text-slate-400">Best Contact Time</span>
              <span className="font-bold text-white">09:00 AM - 11:30 AM</span>
            </div>
            <div className="flex justify-between p-1.5 bg-black/30 rounded border border-white/5">
              <span className="text-slate-400">WhatsApp Match</span>
              <span className="font-bold text-emerald-400 font-mono">88.5% (High)</span>
            </div>
            <div className="flex justify-between p-1.5 bg-black/30 rounded border border-white/5">
              <span className="text-slate-400">Email Deliverability</span>
              <span className="font-bold text-cyan-400 font-mono">94.1%</span>
            </div>
            <div className="flex justify-between p-1.5 bg-black/30 rounded border border-white/5">
              <span className="text-slate-400">Conversion Forecast</span>
              <span className="font-bold text-purple-400 font-mono">18.4% Net</span>
            </div>
          </div>
        </div>

        {/* Card D: Live Activity Stream */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <Activity size={10} className="text-slate-500 animate-pulse" />
            Live Activity Stream
          </h4>
          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5 text-left">
            <div className="flex gap-2 pl-4 relative">
              <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div>
              <div>
                <div className="text-[10px] text-white font-bold leading-none">Lead Quality Validated</div>
                <div className="text-[8px] text-slate-500 font-mono mt-0.5">Just now • Score: 94</div>
              </div>
            </div>
            <div className="flex gap-2 pl-4 relative">
              <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]"></div>
              <div>
                <div className="text-[10px] text-white font-bold leading-none">Contact Record Enriched</div>
                <div className="text-[8px] text-slate-500 font-mono mt-0.5">2 min ago • SerpAPI</div>
              </div>
            </div>
            <div className="flex gap-2 pl-4 relative">
              <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#8b5cf6]"></div>
              <div>
                <div className="text-[10px] text-white font-bold leading-none">AI Score Recalculated</div>
                <div className="text-[8px] text-slate-500 font-mono mt-0.5">5 min ago • Neural engine</div>
              </div>
            </div>
            <div className="flex gap-2 pl-4 relative">
              <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/15"></div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold leading-none">SerpAPI Extraction Active</div>
                <div className="text-[8px] text-slate-500 font-mono mt-0.5">12 min ago • Google Maps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card E: Revenue Forecast */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl relative overflow-hidden group">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
            <DollarSign size={10} />
            Revenue Forecast
          </h4>
          <div className="space-y-2 text-xs text-left">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Daily Pipeline Est</span>
              <span className="font-bold text-white">₹{(totalValue / 30).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Monthly Projection</span>
              <span className="font-bold text-emerald-400">₹{totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Est. Close Rate</span>
              <span className="font-bold text-cyan-400">22.4% avg</span>
            </div>
            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5 mt-2">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: '22%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// TASKS PAGE
export const CRMTasksPage = ({ leads }: { leads: CRMLead[] }) => {
  // Generate some realistic tasks based on real leads
  const highPriority = leads.filter(l => l.leadScore >= 80 && l.phone && l.crmStage !== 'Contacted' && l.crmStage !== 'Converted');
  const missingWeb = leads.filter(l => !l.website);
  
  const tasks = [
    ...highPriority.slice(0, 3).map(l => ({ title: `Contact ${l.businessName} via WhatsApp`, type: 'Outreach', priority: 'High', status: 'Pending' })),
    ...missingWeb.slice(0, 2).map(l => ({ title: `Find website for ${l.businessName}`, type: 'Enrichment', priority: 'Medium', status: 'Pending' })),
    { title: `Follow up with ${leads.filter(l=>l.crmStage === 'Interested').length} interested leads`, type: 'Follow-up', priority: 'High', status: 'Pending' }
  ].filter(t => t.title && !t.title.includes('0 interested'));

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Generated Tasks</h2>
        <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400">
          <Plus size={14} /> Add Task
        </button>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center hover:border-emerald-400 cursor-pointer transition-colors" />
              <div>
                <div className="text-sm font-bold text-white">{task.title}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">{task.type}</div>
              </div>
            </div>
            <div className={clsx(
              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
              task.priority === 'High' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            )}>
              {task.priority}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="text-center text-slate-500 p-10">No tasks generated.</div>}
      </div>
    </div>
  );
};

// SETTINGS PAGE
export const CRMSettingsPage = () => {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Database size={16} className="text-emerald-400"/> Data Source Settings</h3>
        <p className="text-xs text-slate-400 mb-6">Manage how CRM connects to the extraction Data Vault.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="font-bold text-sm">Real-time Vault Sync</div>
              <div className="text-xs text-slate-500">Automatically pull latest extracted leads.</div>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-black rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">
              <UploadCloud size={14} /> Export All CRM Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest">
              <Trash size={14} /> Clear CRM Database
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Sliders size={16} className="text-blue-400"/> Scoring Formulas</h3>
        <p className="text-xs text-slate-400 mb-6">Configure how leads are scored and revenue is projected.</p>
        
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>High Quality Score Threshold</span>
            <input type="number" defaultValue={80} className="w-20 bg-black border border-white/10 rounded-lg px-3 py-1 text-center focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Potential (High Score) ₹</span>
            <input type="number" defaultValue={10000} className="w-24 bg-black border border-white/10 rounded-lg px-3 py-1 text-center focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
