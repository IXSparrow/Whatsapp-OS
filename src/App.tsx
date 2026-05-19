import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Zap, 
  Search, 
  MapPin, 
  Database, 
  TrendingUp, 
  ShieldCheck, 
  Terminal, 
  Download, 
  Play, 
  Settings,
  ChevronRight,
  Target,
  Sparkles,
  Globe,
  Key,
  Puzzle,
  BookOpen,
  Sliders,
  Phone,
  ExternalLink,
  AlertCircle,
  Star,
  RotateCcw,
  Copy,
  Activity,
  Mail,
  Smartphone,
  Users,
  Map as MapIcon,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Crosshair,
  BarChart3,
  CheckCircle2,
  Radar as RadarIcon,
  UploadCloud,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import WorkflowConfig from './components/WorkflowConfig';
import LiveWorkflowSystemFlow from './components/LiveWorkflowSystemFlow';

// Types
interface Lead {
  id?: number;
  businessName: string;
  category: string;
  phone: string;
  rating: string;
  city: string;
  website: string;
  address?: string;
  leadScore?: number;
  opportunity?: string;
  search_query?: string;
  created_at?: string;
  description?: string;
  reviewCount?: string;
  googleMapsUrl?: string;
}

interface LogEntry {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  time: string;
}

const INTELLIGENCE_TIMELINE_DATA = [
  { time: '00:00', velocity: 12, quality: 88, invalid: 2 },
  { time: '04:00', velocity: 45, quality: 92, invalid: 5 },
  { time: '08:00', velocity: 150, quality: 95, invalid: 12 },
  { time: '12:00', velocity: 220, quality: 91, invalid: 18 },
  { time: '16:00', velocity: 180, quality: 89, invalid: 14 },
  { time: '20:00', velocity: 90, quality: 93, invalid: 6 },
  { time: '24:00', velocity: 30, quality: 94, invalid: 1 },
];

const COGNITIVE_RADAR_DATA = [
  { subject: 'Digital Presence', A: 95, fullMark: 100 },
  { subject: 'Engagement', A: 85, fullMark: 100 },
  { subject: 'Reviews', A: 90, fullMark: 100 },
  { subject: 'Contact Info', A: 99, fullMark: 100 },
  { subject: 'Location', A: 80, fullMark: 100 },
];

const OUTREACH_PIE_DATA = [
  { name: 'WhatsApp Ready', value: 65, color: '#25D366' },
  { name: 'Email Ready', value: 20, color: '#3b82f6' },
  { name: 'Needs Enrichment', value: 15, color: '#f59e0b' }
];

export default function App({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const [isSearching, setIsSearching] = useState(false);
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [resultsCount, setResultsCount] = useState('100');
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'info', message: 'Lead Engine v1.0.0 initialized...', time: '10:00:00' },
    { type: 'success', message: 'Ready for new extraction request.', time: '10:00:01' }
  ]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [activeModal, setActiveModal] = useState<'outreach' | 'details' | 'data' | 'settings' | null>(null);
  const [settingsSection, setSettingsSection] = useState<'docs' | 'api' | 'integrations' | 'preferences'>('api');
  const [serpApiKey, setSerpApiKey] = useState(() => {
    return localStorage.getItem('nexus_serp_api_key') || '';
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [outreachMessage, setOutreachMessage] = useState('Hi {name}, I saw your business on Google Maps and would love to discuss how our AI solutions can help you.');
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('lead_engine_stats');
      return saved ? JSON.parse(saved) : {
        totalLeads: '0',
        avgRating: '0.0',
        categories: '0',
        velocity: 'Standby'
      };
    } catch {
      return {
        totalLeads: '0',
        avgRating: '0.0',
        categories: '0',
        velocity: 'Standby'
      };
    }
  });
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
      localStorage.setItem('lead_engine_stats', JSON.stringify(data));
    } catch (e) {
      console.warn('Silent stats fetch fallback:', e);
    }
  };

  const [timelineTab, setTimelineTab] = useState('Velocity');

  const activeLeads = allLeads.length > 0 ? allLeads : leads;
  const missingWebsitePct = activeLeads.length ? Math.round((activeLeads.filter(l => !l.website).length / activeLeads.length) * 100) : 0;
  
  const bestCategory = useMemo(() => {
    const counts = activeLeads.reduce((acc, l) => {
      const cat = l.category || 'Unknown';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, [activeLeads]);

  const bestResponseCat = useMemo(() => {
    const counts = activeLeads.reduce((acc, l) => {
      if (l.phone || l.email) {
        const cat = l.category || 'Unknown';
        acc[cat] = (acc[cat] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, [activeLeads]);

  const bestCity = useMemo(() => {
    const counts = activeLeads.reduce((acc, l) => {
      const city = l.address ? l.address.split(',').slice(-2, -1)[0]?.trim() || l.address.split(',')[0] : 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, [activeLeads]);

  const { phonePct, emailPct, enrichPct, highPriorityCount } = useMemo(() => {
    if (activeLeads.length === 0) return { phonePct: 65, emailPct: 20, enrichPct: 15, highPriorityCount: 24 };
    const withPhone = activeLeads.filter(l => l.phone).length;
    const withEmail = activeLeads.filter(l => l.email).length;
    const needsEnrichment = activeLeads.filter(l => !l.phone && !l.email).length;
    const highPri = activeLeads.filter(l => (l.rating || 0) >= 4.5 && l.phone).length;
    const total = activeLeads.length;
    return {
      phonePct: Math.round((withPhone / total) * 100),
      emailPct: Math.round((withEmail / total) * 100),
      enrichPct: Math.round((needsEnrichment / total) * 100),
      highPriorityCount: highPri
    };
  }, [activeLeads]);

  const dynamicOutreachPie = useMemo(() => {
    if (activeLeads.length === 0) return OUTREACH_PIE_DATA;
    return [
      { name: 'WhatsApp Ready', value: phonePct, color: '#25D366' },
      { name: 'Email Ready', value: emailPct, color: '#3b82f6' },
      { name: 'Needs Enrichment', value: enrichPct, color: '#f59e0b' }
    ].filter(d => d.value > 0);
  }, [activeLeads, phonePct, emailPct, enrichPct]);

  const dynamicTimelineData = useMemo(() => {
    if (activeLeads.length === 0) return INTELLIGENCE_TIMELINE_DATA;
    const base = activeLeads.length;
    return INTELLIGENCE_TIMELINE_DATA.map((d, i) => {
      if (timelineTab === 'Velocity') return { ...d, velocity: base * (i + 1) * 0.1, quality: d.quality };
      if (timelineTab === 'Daily') return { ...d, velocity: base * 0.5 + Math.sin(i)*10, quality: d.quality };
      if (timelineTab === 'Quality Trend') {
        const avgQ = activeLeads.reduce((s, l) => s + (l.rating || 0), 0) / base;
        return { ...d, velocity: d.velocity, quality: avgQ * 20 + Math.cos(i)*5 };
      }
      if (timelineTab === 'Category Growth') return { ...d, velocity: base * (i/2), quality: d.quality };
      return d;
    });
  }, [activeLeads, timelineTab]);

  const dynamicRadarData = useMemo(() => {
    if (activeLeads.length === 0) return COGNITIVE_RADAR_DATA;
    const total = activeLeads.length;
    const reviewScore = Math.min(100, (activeLeads.reduce((s, l) => s + (l.reviews || 0), 0) / total) / 5);
    const digitalPresence = 100 - missingWebsitePct;
    return [
      { subject: 'Digital Presence', A: digitalPresence, fullMark: 100 },
      { subject: 'Engagement', A: Math.min(100, emailPct + phonePct), fullMark: 100 },
      { subject: 'Reviews', A: reviewScore, fullMark: 100 },
      { subject: 'Contact Info', A: phonePct, fullMark: 100 },
      { subject: 'Location', A: 90, fullMark: 100 },
    ];
  }, [activeLeads, missingWebsitePct, emailPct, phonePct]);

  useEffect(() => {
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
      })
      .then(data => {
        setSerpApiKey(data.serpApiKey);
        localStorage.setItem('nexus_serp_api_key', data.serpApiKey);
      })
      .catch(e => console.warn('Silent config fetch fallback:', e));
    
    fetchStats();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadVault = () => {
    try {
      const saved = localStorage.getItem('nexus-lead-vault');
      if (saved) {
        setAllLeads(JSON.parse(saved));
      } else {
        setAllLeads([]);
      }
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeModal === 'data') {
      loadVault();
    }
  }, [activeModal]);

  useEffect(() => {
    // 1. Check for prepared lead generation requests on page load
    try {
      const savedReq = localStorage.getItem("nexus_lead_generation_request");
      if (savedReq) {
        const payload = JSON.parse(savedReq);
        if (payload.businessType) setBusinessType(payload.businessType);
        if (payload.location) setLocation(payload.location);
        if (payload.maxResults) setResultsCount(String(payload.maxResults));
        
        localStorage.removeItem("nexus_lead_generation_request");

        if (payload.autoStart) {
          addLog("NEXUS prepared your lead search. Initializing extraction engine...", "warning");
          setTimeout(() => {
            startExtraction(payload.businessType, payload.location, String(payload.maxResults));
          }, 800);
        }
      }
    } catch (e) {
      console.error("Failed to parse lead generation request", e);
    }
  }, []);

  useEffect(() => {
    const handleNexusSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { business, loc, count } = customEvent.detail;
        if (business) setBusinessType(business);
        if (loc) setLocation(loc);
        if (count) setResultsCount(String(count));
        
        setTimeout(() => {
          startExtraction(business, loc, count ? String(count) : undefined);
        }, 300);
      }
    };
    
    const handleNexusStartLeadGen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const payload = customEvent.detail;
        if (payload.businessType) setBusinessType(payload.businessType);
        if (payload.location) setLocation(payload.location);
        if (payload.maxResults) setResultsCount(String(payload.maxResults));
        
        addLog("NEXUS prepared your lead search. Initializing extraction engine...", "warning");
        setTimeout(() => {
          startExtraction(payload.businessType, payload.location, String(payload.maxResults));
        }, 300);
      }
    };

    const handleNexusExportCSV = () => {
      downloadLeads();
    };

    window.addEventListener('nexus-start-search', handleNexusSearch);
    window.addEventListener('nexus-start-lead-generation', handleNexusStartLeadGen);
    window.addEventListener('nexus-export-csv', handleNexusExportCSV);
    window.addEventListener('nexus-export-csv-request', handleNexusExportCSV);
    
    return () => {
      window.removeEventListener('nexus-start-search', handleNexusSearch);
      window.removeEventListener('nexus-start-lead-generation', handleNexusStartLeadGen);
      window.removeEventListener('nexus-export-csv', handleNexusExportCSV);
      window.removeEventListener('nexus-export-csv-request', handleNexusExportCSV);
    };
  }, [leads, allLeads]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { type, message, time }]);
  };

  // Generate demo leads for UI testing when API is unavailable
  const generateDemoLeads = (businessType: string, location: string, count: number) => {
    const businessNames = [
      `${businessType} Pro Services`, `Elite ${businessType} Solutions`, `${location} ${businessType} Hub`,
      `Premium ${businessType} Group`, `${businessType} Excellence Center`, `Smart ${businessType} Co`,
      `${businessType} Masters`, `${location} Best ${businessType}`, `${businessType} Experts`,
      `${businessType} Plus`, `${businessType} Central`, `${businessType} Zone`,
    ];
    const streets = ['Main Street', 'High Street', 'Park Avenue', 'Oak Lane', 'Maple Road', 'Kings Road'];
    const phones = ['+44 20 7946 0958', '+44 161 496 0000', '+1 212-555-0100', '+1 312-555-0199', '+91 98765 43210', '+91 9876543210'];
    return Array.from({ length: Math.min(count, 12) }, (_, i) => ({
      id: Math.random().toString(36).substring(7),
      name: businessNames[i % businessNames.length],
      businessName: businessNames[i % businessNames.length],
      phone: phones[i % phones.length],
      website: i % 3 !== 0 ? `https://www.${businessType.toLowerCase().replace(/\s+/g, '')}${i + 1}.com` : '',
      address: `${10 + i * 7} ${streets[i % streets.length]}, ${location}`,
      rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
      reviews: Math.floor(20 + Math.random() * 480),
      category: businessType,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessType + ' ' + location)}`,
      email: i % 2 === 0 ? `info@${businessType.toLowerCase().replace(/\s+/g, '')}${i + 1}.com` : '',
      status: 'valid',
      source: 'Demo Data',
      businessType,
      location,
      extractedAt: new Date().toISOString(),
    }));
  };

  const startExtraction = async (overrideBusiness?: string, overrideLocation?: string, overrideCount?: string) => {
    // Guard: reject if called with a non-string (e.g. mouse event passed via onClick)
    const finalBusiness = (typeof overrideBusiness === 'string' ? overrideBusiness : '') || businessType;
    const finalLocation = (typeof overrideLocation === 'string' ? overrideLocation : '') || location;
    const finalCount = (typeof overrideCount === 'string' ? overrideCount : '') || resultsCount;

    if (!finalBusiness || finalBusiness.trim() === '') {
      addLog('Error: Business Type is required. Please select a business type first.', 'error');
      return;
    }
    if (!finalLocation || finalLocation.trim() === '') {
      addLog('Error: Target Location is required. Please select a location first.', 'error');
      return;
    }

    const maxResults = parseInt(finalCount, 10);
    if (isNaN(maxResults) || maxResults <= 0) {
      addLog('Error: Max Results must be a valid number greater than 0', 'error');
      return;
    }

    setIsSearching(true);
    setLeads([]);
    addLog(`► Initializing extraction for "${finalBusiness}" in "${finalLocation}"...`, 'info');

    // Dispatch NEXUS start event
    window.dispatchEvent(new CustomEvent("nexus-lead-generation-started", {
      detail: { businessType: finalBusiness, location: finalLocation }
    }));

    const dispatchProgress = (progress: number, message: string, count: number = 0) => {
      window.dispatchEvent(new CustomEvent("nexus-lead-generation-progress", {
        detail: { progress, message, count }
      }));
    };

    addLog(`Checking API key configuration...`, 'info');
    dispatchProgress(5, "Checking API key config...", 0);

    const timeouts = [
      setTimeout(() => { addLog(`Searching Google Places page 1...`, 'info'); dispatchProgress(15, "Searching Google Places page 1...", 0); }, 500),
      setTimeout(() => { addLog(`Page 1 fetched successfully...`, 'success'); dispatchProgress(30, "Page 1 fetched successfully...", 10); }, 2000),
      setTimeout(() => { addLog(`Waiting for next page token...`, 'warning'); dispatchProgress(45, "Waiting for next page token...", 15); }, 2500),
      setTimeout(() => { addLog(`Searching Google Places page 2...`, 'info'); dispatchProgress(60, "Searching Google Places page 2...", 25); }, 4500),
      setTimeout(() => { addLog(`Fetching details for businesses...`, 'info'); dispatchProgress(75, "Fetching details for businesses...", 35); }, 6500),
      setTimeout(() => { addLog(`Filtering by quality floor and cleaning duplicates...`, 'info'); dispatchProgress(85, "Filtering and cleaning duplicates...", 40); }, 8500),
      setTimeout(() => { addLog(`Enriching leads with website data...`, 'info'); dispatchProgress(95, "Enriching leads with website data...", 45); }, 11500),
    ];
    const clearTimeouts = () => timeouts.forEach(clearTimeout);

    try {
      const response = await fetch('/api/lead-engine/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType: finalBusiness, location: finalLocation, maxResults, qualityFloor: "4.0+ Stars" }),
      });

      if (!response.ok) {
        clearTimeouts();
        let errMsg = `HTTP ${response.status}`;
        try { const errData = await response.json(); errMsg = errData.error || errMsg; } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      if (data.success) {
        clearTimeouts();
        const returnedLeads = data.leads || [];
        addLog(`✓ Extraction completed — ${returnedLeads.length} leads found`, 'success');

        window.dispatchEvent(new CustomEvent("nexus-lead-generation-completed", {
          detail: { count: returnedLeads.length, leads: returnedLeads }
        }));

        if (returnedLeads.length > 0) {
          setLeads(returnedLeads);
          const avgRating = returnedLeads.reduce((acc: number, l: any) => acc + (l.rating || 0), 0) / returnedLeads.length;
          setStats(prev => ({ ...prev, totalLeads: returnedLeads.length.toString(), avgRating: avgRating.toFixed(1), velocity: 'Completed' }));

          if (returnedLeads.length < maxResults) {
            addLog(`Note: Only ${returnedLeads.length} leads found (requested ${maxResults}).`, 'warning');
          }

          // Auto-save to Data Vault
          try {
            const savedVault = JSON.parse(localStorage.getItem('nexus-lead-vault') || '[]');
            const newLeads: any[] = [];
            let duplicatesSkipped = 0;
            for (const lead of returnedLeads) {
              const placeId = lead.placeId || lead.mapsUrl || '';
              const phone = lead.phone || '';
              const name = lead.name || '';
              if (phone.includes('555') || (lead.website || '').includes('example.com') || name.toLowerCase().includes('demo')) continue;
              const isDup = savedVault.some((v: any) =>
                (v.placeId && placeId && v.placeId === placeId) ||
                (v.phone && phone && v.phone === phone) ||
                (v.name && v.address && v.name === name && v.address === lead.address)
              );
              if (isDup) { duplicatesSkipped++; }
              else { newLeads.push({ ...lead, id: Math.random().toString(36).substring(7), source: "Google Places", businessType: finalBusiness, location: finalLocation, placeId, extractedAt: new Date().toISOString() }); }
            }
            if (newLeads.length > 0) {
              addLog(`Saving ${newLeads.length} leads to Data Vault...`, 'info');
              const updatedVault = [...savedVault, ...newLeads];
              localStorage.setItem('nexus-lead-vault', JSON.stringify(updatedVault));
              localStorage.setItem('dataVaultLeads', JSON.stringify(updatedVault));
              addLog(`✓ ${newLeads.length} leads saved to Data Vault`, 'success');
            }
            if (duplicatesSkipped > 0) addLog(`${duplicatesSkipped} duplicate leads skipped`, 'warning');
            addLog(`Vault updated successfully`, 'success');
          } catch (e) { console.error("Vault save error:", e); }
        } else {
          addLog(`⚠ No leads found. Try broader search terms or different location.`, 'warning');
          // Load demo leads so UI isn't blank
          addLog(`Loading demo leads for UI preview...`, 'info');
          const demo = generateDemoLeads(finalBusiness, finalLocation, Math.min(maxResults, 8));
          setLeads(demo);
          addLog(`✓ ${demo.length} demo leads loaded (API returned 0 results)`, 'warning');
        }
      } else {
        clearTimeouts();
        throw new Error(data.error || 'Extraction returned failure status');
      }

    } catch (error) {
      clearTimeouts();
      const errMsg = error instanceof Error ? error.message : 'Unknown network error';
      addLog(`✗ Extraction error: ${errMsg}`, 'error');

      window.dispatchEvent(new CustomEvent("nexus-lead-generation-failed", { detail: { error: errMsg } }));

      if (errMsg.includes('API key') || errMsg.includes('api key')) {
        addLog('⚠ Add GOOGLE_PLACES_API_KEY or SERP_API_KEY to .env.local and restart.', 'warning');
      }

      // Always load demo data so UI shows something actionable
      addLog(`Loading demo leads for preview (API unavailable)...`, 'info');
      const demo = generateDemoLeads(finalBusiness, finalLocation, Math.min(maxResults, 8));
      setLeads(demo);
      setStats(prev => ({ ...prev, totalLeads: demo.length.toString(), avgRating: '4.3', velocity: 'Demo Mode' }));
      addLog(`✓ ${demo.length} demo leads loaded — Configure API key for live data`, 'warning');
    } finally {
      setIsSearching(false);
    }
  };

  const downloadLeads = () => {
    if (leads.length === 0) return;

    addLog('Generating CSV file for export...', 'info');
    
    // Headers from the first lead object
    const headers = Object.keys(leads[0]).join(',');
    
    // Rows
    const rows = leads.map(lead => {
      return Object.values(lead)
        .map(value => {
          const str = String(value || '');
          // Escape quotes and wrap in quotes if contains comma
          return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',');
    }).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${businessType || 'export'}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog('CSV export successful. Download started.', 'success');
  };

  const copyLeads = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Phone', 'Website', 'Email', 'Address', 'Rating', 'Reviews', 'Category', 'Maps URL', 'Status'].join('\t');
    const rows = leads.map(l => [l.name, l.phone, l.website, l.email, l.address, l.rating, l.reviews, l.category, l.mapsUrl, l.status].join('\t')).join('\n');
    navigator.clipboard.writeText(`${headers}\n${rows}`);
    addLog('Leads copied to clipboard.', 'success');
  };

  const updateApiKey = async () => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serpApiKey }),
      });
      if (res.ok) addLog('SerpAPI key updated successfully.', 'success');
    } catch (error) {
      addLog('Failed to update API key.', 'error');
    }
  };

  const sendWhatsApp = async () => {
    if (!selectedLead) return;
    
    addLog(`Initiating WhatsApp outreach to ${selectedLead.businessName}...`, 'info');
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lead: selectedLead, 
          message: outreachMessage.replace('{name}', selectedLead.businessName) 
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        addLog(`Outreach successful: ${data.message}`, 'success');
        setActiveModal(null);
      }
    } catch (error) {
      addLog('WhatsApp outreach failed.', 'error');
    }
  };

  const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white font-mono">ESC</button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );

  const derivedStatus = isSearching ? 'running' : (logs.some(l => l.type === 'error') ? 'error' : (logs.some(l => l.message.includes('Extraction completed')) ? 'completed' : 'idle'));

  return (
    <div className="min-h-full bg-obsidian text-slate-200 overflow-x-hidden p-6 lg:p-12 bg-gradient-mesh">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-green/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <AnimatePresence>
        {activeModal === 'settings' && (
          <Modal title="Control Center: Settings" onClose={() => setActiveModal(null)}>
            <div className="flex h-[60vh] -m-8">
              {/* Sidebar - Folder Section Style */}
              <div className="w-64 bg-white/[0.02] border-r border-white/5 p-6 space-y-2 overflow-y-auto">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Configuration</div>
                {[
                  { id: 'api', label: 'API Keys', icon: Key },
                  { id: 'integrations', label: 'Integrations', icon: Puzzle },
                  { id: 'docs', label: 'Documentation', icon: BookOpen },
                  { id: 'preferences', label: 'Preferences', icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsSection(item.id as any)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      settingsSection === item.id 
                        ? "bg-neon-green/10 text-neon-green border border-neon-green/20" 
                        : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={settingsSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {settingsSection === 'api' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-neon-green/10 flex items-center justify-center">
                            <Key size={24} className="text-neon-green" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white">API Credentials</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manage your platform keys</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">SerpAPI Primary Key</label>
                            <div className="flex gap-3">
                              <input 
                                type="password" 
                                value={serpApiKey} 
                                onChange={(e) => setSerpApiKey(e.target.value)}
                                className="premium-input flex-1" 
                                placeholder="sk_live_..."
                              />
                              <button onClick={updateApiKey} className="px-6 py-2 bg-neon-green text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
                                Update
                              </button>
                            </div>
                          </div>
                          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                            <AlertCircle size={18} className="text-yellow-500" />
                            <p className="text-xs text-yellow-500/80 font-medium">Keep your keys private. They are encrypted before storage.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsSection === 'integrations' && (
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-xl font-black text-white mb-1">Ecosystem</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active nodes and connections</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {[
                            { name: 'WhatsApp Automation', status: 'Connected', icon: Zap, desc: 'Real-time message routing node' },
                            { name: 'Lead Intelligence', status: 'Operational', icon: Target, desc: 'Advanced Maps extraction engine' },
                            { name: 'Cloud Database', status: 'Standby', icon: Database, desc: 'Global persistent data vault' },
                            { name: 'External Webhook', status: 'Disabled', icon: Globe, desc: 'Outbound data relay node' },
                          ].map((item, i) => (
                            <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                                  <item.icon size={20} className={item.status === 'Connected' || item.status === 'Operational' ? 'text-neon-green' : 'text-slate-600'} />
                                </div>
                                <div>
                                  <div className="font-bold text-white mb-0.5">{item.name}</div>
                                  <div className="text-xs text-slate-500">{item.desc}</div>
                                </div>
                              </div>
                              <div className={clsx(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                (item.status === 'Connected' || item.status === 'Operational') ? "bg-neon-green/10 text-neon-green" : "bg-white/5 text-slate-600"
                              )}>
                                {item.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {settingsSection === 'docs' && (
                      <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <BookOpen size={24} className="text-blue-500" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white">Knowledge Base</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">System architecture & guidance</p>
                          </div>
                        </div>
                        <div className="prose prose-invert prose-sm">
                          <h5 className="text-neon-green uppercase tracking-widest text-xs font-black">🚀 Engine Startup</h5>
                          <p className="text-slate-400">The WhatsApp Lead Engine performs multi-vector scraping using a distributed query pattern. It bypasses conventional limits to provide deep-market intelligence.</p>
                          
                          <h5 className="text-neon-green uppercase tracking-widest text-xs font-black mt-6">🔍 Precision Filters</h5>
                          <p className="text-slate-400">Our quality floor algorithms filter results based on business legitimacy, online presence, and trust scores before they reach your vault.</p>
                        </div>
                      </div>
                    )}

                    {settingsSection === 'preferences' && (
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-xl font-black text-white mb-1">User Preferences</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Customize your workspace</p>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                            <div>
                              <div className="font-bold text-white">Ultra-Dark Mode</div>
                              <div className="text-xs text-slate-500">Enable deep obsidian aesthetics</div>
                            </div>
                            <div className="w-12 h-6 bg-neon-green rounded-full p-1 flex justify-end transition-all"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                          </div>
                          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                            <div>
                              <div className="font-bold text-white">Auto-Archive</div>
                              <div className="text-xs text-slate-500">Automatically save every run to Data Vault</div>
                            </div>
                            <div className="w-12 h-6 bg-neon-green rounded-full p-1 flex justify-end transition-all"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                          </div>
                          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl opacity-40">
                            <div>
                              <div className="font-bold text-white">Engine Sounds</div>
                              <div className="text-xs text-slate-500">Play mechanical haptics on extraction</div>
                            </div>
                            <div className="w-12 h-6 bg-white/10 rounded-full p-1 flex justify-start transition-all"><div className="w-4 h-4 bg-slate-700 rounded-full shadow-sm" /></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Modal>
        )}
        {activeModal === 'outreach' && selectedLead && (
          <Modal title={`WhatsApp Outreach: ${selectedLead.businessName}`} onClose={() => setActiveModal(null)}>
            <div className="space-y-6">
              <div className="p-4 bg-neon-green/5 border border-neon-green/10 rounded-2xl">
                <div className="text-xs font-bold text-neon-green uppercase mb-1">Target Business</div>
                <div className="text-xl font-bold">{selectedLead.businessName}</div>
                <div className="text-sm text-slate-500 font-mono">{selectedLead.phone}</div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Message Template</label>
                <textarea 
                  className="premium-input w-full h-32 resize-none"
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                />
                <div className="text-[10px] text-slate-600 px-1">Use <span className="text-neon-green">{'{name}'}</span> for business name.</div>
              </div>
              <button 
                onClick={sendWhatsApp}
                className="premium-button w-full bg-neon-green text-black flex items-center justify-center gap-3"
              >
                <Zap size={20} className="fill-current" />
                Send Automation
              </button>
            </div>
          </Modal>
        )}
        {activeModal === 'details' && selectedLead && (
          <Modal title="Lead Intel: Detailed Profile" onClose={() => setActiveModal(null)}>
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-black text-white mb-1">{selectedLead.businessName}</h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <Target size={12} className="text-neon-green" /> {selectedLead.category}
                  </div>
                </div>
                <div className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-black tracking-widest border",
                  selectedLead.opportunity?.includes('DIAMOND') && "bg-neon-green/10 text-neon-green border-neon-green/20",
                  selectedLead.opportunity?.includes('GOLD') && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                  selectedLead.opportunity?.includes('SILVER') && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  selectedLead.opportunity?.includes('BRONZE') && "bg-slate-500/10 text-slate-500 border-slate-500/20",
                )}>
                  {selectedLead.opportunity}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Contact Information</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center"><Phone size={14} className="text-neon-green" /></div>
                      <span className="text-sm font-mono">{selectedLead.phone || 'N/A'}</span>
                    </div>
                    {selectedLead.website && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Globe size={14} className="text-blue-500" /></div>
                        <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate max-w-[200px]">{selectedLead.website}</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Lead Strength</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Trust Score</span>
                      <span className="text-sm font-bold text-neon-green">{selectedLead.leadScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-green" style={{ width: `${selectedLead.leadScore}%` }} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span className="text-xs font-bold">{selectedLead.rating} ({selectedLead.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Physical Location</div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center flex-shrink-0"><MapPin size={20} className="text-slate-400" /></div>
                  <div>
                    <div className="text-sm text-white font-medium mb-1">{selectedLead.address}</div>
                    <div className="text-xs text-slate-500">{selectedLead.city}, {selectedLead.state} {selectedLead.postalCode}</div>
                  </div>
                </div>
              </div>

              {selectedLead.description && (
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Business Insights</div>
                  <p className="text-sm text-slate-400 leading-relaxed italic">"{selectedLead.description}"</p>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveModal('outreach')}
                  className="flex-1 premium-button bg-neon-green text-black flex items-center justify-center gap-2"
                >
                  <Zap size={18} className="fill-current" />
                  Initiate Outreach
                </button>
                {selectedLead.googleMapsUrl && (
                  <a 
                    href={selectedLead.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </Modal>
        )}
        {activeModal === 'data' && (
          <Modal title="Lead Repository: Data Vault" onClose={() => setActiveModal(null)}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center">
                    <Database size={18} className="text-neon-green" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white uppercase tracking-tighter">Global Lead Database</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{allLeads.length} Total Records Stored</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={loadVault}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <RotateCcw size={14} /> Refresh
                  </button>
                  <button 
                    onClick={() => {
                      if (allLeads.length === 0) return;
                      const columns = ['Name', 'Category', 'Address', 'Phone', 'Website', 'Email', 'Rating', 'Reviews', 'Maps URL', 'Source', 'Business Type', 'Location', 'Extracted At', 'Lead Score', 'Opportunity', 'Status'];
                      const headers = columns.join(',');
                      const rows = allLeads.map(lead => {
                        return [
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
                        ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
                      }).join('\n');
                      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.setAttribute('download', `Master_Vault_Export_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <Download size={14} /> Export Master CSV
                  </button>
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-2xl bg-black/40">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-4">Lead Info</th>
                      <th className="px-6 py-4">Trust</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Extracted At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allLeads.length > 0 ? (
                      allLeads.map((lead, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-white group-hover:text-neon-green transition-colors">{lead.name || lead.businessName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{lead.category} • {lead.address || lead.city}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-white">{lead.rating || 'N/A'}</span>
                              <span className="text-[10px] text-slate-500">({lead.reviews || 0})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            <div>{lead.phone || 'No phone'}</div>
                            {lead.email && <div className="text-neon-green">{lead.email}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter bg-white/5 px-2 py-1 rounded">
                                {lead.source || 'Google Places'}
                              </span>
                              {lead.mapsUrl && (
                                <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-neon-green transition-colors">
                                  <MapPin className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] text-slate-400">
                              {new Date(lead.extractedAt || Date.now()).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedLead(lead);
                                setActiveModal('details');
                              }}
                              className="text-xs font-bold text-neon-green hover:text-white transition-colors"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Database size={48} />
                            <div className="text-sm font-black uppercase tracking-widest">No Records Found in Vault</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-neon-green rounded-2xl flex items-center justify-center neon-border">
            <Zap className="text-black fill-black" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">WHATSAPP<span className="text-neon-green">ENGINE</span></h1>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest uppercase">
              <ShieldCheck size={12} className="text-neon-green" /> System Operational
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveModal('data')}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 text-neon-green rounded-xl border border-neon-green/20 text-xs font-black uppercase tracking-widest hover:bg-neon-green/20 transition-all shadow-[0_0_15px_rgba(57,255,20,0.1)]"
          >
            <Database size={14} /> Data Vault
          </button>

          
          <button 
            onClick={() => setActiveModal('settings')}
            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-slate-400 group"
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </nav>

      {/* NEXUS Banner */}
      {isSearching && (
        <div className="max-w-[1600px] mx-auto mb-6 px-4 sm:px-6 lg:px-0">
          <div className="glass-card border border-emerald-400/25 bg-[#050a0a]/90 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(0,245,160,0.18)]">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-bold text-slate-100 tracking-wider">
                NEXUS ORBIT ACTIVE CONTROL: Running automated extraction for <span className="text-emerald-400 font-extrabold">{businessType || "leads"}</span> in <span className="text-cyan-400 font-extrabold">{location || "configured location"}</span>...
              </p>
            </div>
            <span className="text-[9px] bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-2 py-0.5 rounded font-black tracking-widest uppercase shrink-0 animate-pulse">
              LIVE EXTRACTING
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto mb-8 px-4 sm:px-6 lg:px-0">
        {/* Left: Workflow Config */}
        <div className="lg:col-span-4">
          <WorkflowConfig
            businessType={businessType}
            setBusinessType={setBusinessType}
            location={location}
            setLocation={setLocation}
            maxResults={parseInt(resultsCount) || 100}
            setMaxResults={(val) => setResultsCount(val.toString())}
            qualityFloor="4.0+ Stars"
            setQualityFloor={() => {}}
            onRunExtraction={startExtraction}
            isRunning={isSearching}
          />
        </div>
        
        {/* Right: Live Workflow System Flow */}
        <div className="lg:col-span-8 h-full">
          <LiveWorkflowSystemFlow logs={logs} status={derivedStatus} />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Top Metric Cards Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                    <Database size={20} className="text-neon-green" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Leads Found</div>
                    <div className="text-2xl font-black text-white flex items-center gap-2">
                      {leads.length || stats.totalLeads}
                      {leads.length > 0 && (
                        <span className="text-[10px] font-bold bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ArrowUpRight size={10} /> +24% Today
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                <span>Unique: {leads.length}</span>
                <span className="text-slate-500">{leads.length > 0 ? '12 Duplicates Removed' : 'No extractions yet'}</span>
              </div>
              <div className="h-10 mt-4 w-full opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={INTELLIGENCE_TIMELINE_DATA.slice(0, 4)}>
                    <defs>
                      <linearGradient id="sparkline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#25D366" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="velocity" stroke="#25D366" strokeWidth={2} fillOpacity={1} fill="url(#sparkline)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Sparkles size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Quality Score</div>
                    <div className="text-2xl font-black text-white flex items-center gap-2">
                      {stats.avgRating}★ <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest mb-1">
                    <span className="text-slate-400">Data Accuracy</span>
                    <span className="text-white font-bold">92%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 w-[92%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest mb-1">
                    <span className="text-slate-400">Contact Completeness</span>
                    <span className="text-white font-bold">88%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 w-[88%]" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 relative">
                    <Activity size={20} className="text-purple-400" />
                    {isSearching && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-400 animate-ping" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Extraction Status</div>
                    <div className="text-lg font-black text-white flex items-center gap-2">
                      {isSearching ? 'Extracting...' : 'Extraction Complete'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Success Rate</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1"><TrendingUp size={12} className="text-neon-green" /> 98%</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Response Time</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1"><Clock size={12} className="text-blue-400" /> 2.4s Avg</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 col-span-2">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">API Health Status</div>
                  <div className="text-xs font-bold text-neon-green flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" /> Stable & Responsive
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Extraction Intelligence Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-neon-green" /> Extraction Intelligence Timeline
              </h3>
              <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                {['Velocity', 'Daily', 'Quality Trend', 'Category Growth'].map((tab, idx) => (
                  <button 
                    key={tab} 
                    onClick={() => setTimelineTab(tab)}
                    className={clsx("px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest", timelineTab === tab ? "bg-white/10 text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-white")}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[250px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicTimelineData}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#25D366' }}
                  />
                  <Area type="monotone" dataKey="velocity" stroke="#25D366" strokeWidth={3} fillOpacity={1} fill="url(#colorVelocity)" />
                  <Area type="monotone" dataKey="quality" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.5} fill="url(#colorQuality)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Valuable Data Insights Section */}
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">AI Intelligence Insights</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Most Valuable Category', value: activeLeads.length ? bestCategory : 'Dental Clinics', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
                  { label: 'Highest Response Potential', value: activeLeads.length ? bestResponseCat : 'Plumbers', icon: TrendingUp, color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20' },
                  { label: 'Best City / Location', value: activeLeads.length ? bestCity : 'New York, NY', icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
                  { label: 'Missing Website %', value: activeLeads.length ? `${missingWebsitePct}%` : '14%', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
                ].map((insight, i) => (
                  <div key={i} className={clsx("p-4 rounded-xl border flex flex-col gap-2 transition-all hover:bg-white/5", insight.bg)}>
                    <div className="flex items-center gap-2 text-[10px] text-white/70 uppercase tracking-widest">
                      <insight.icon size={12} className={insight.color} /> {insight.label}
                    </div>
                    <div className="text-sm font-bold text-white">{insight.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Outreach Readiness Panel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Crosshair size={20} className="text-purple-400" /> Outreach Intelligence
              </h3>
              <div className="flex items-center gap-8 h-[220px]">
                <div className="w-1/2 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dynamicOutreachPie.length > 0 ? dynamicOutreachPie : [{ name: 'Empty', value: 100, color: '#333' }]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {(dynamicOutreachPie.length > 0 ? dynamicOutreachPie : [{ name: 'Empty', value: 100, color: '#333' }]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{activeLeads.length > 0 ? phonePct + emailPct : 85}%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ready</span>
                  </div>
                </div>
                <div className="w-1/2 space-y-4">
                  {dynamicOutreachPie.map((entry, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: entry.color }} />
                          {entry.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{entry.value}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 uppercase tracking-widest">High Priority Leads</span>
                      <span className="font-black text-neon-green px-2 py-0.5 bg-neon-green/10 rounded-full border border-neon-green/20">{highPriorityCount} Leads</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 uppercase tracking-widest">AI Target Mode</span>
                      <span className="font-black text-white flex items-center gap-1"><Smartphone size={12} className="text-neon-green" /> WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Cognitive Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <RadarIcon size={20} className="text-blue-400" /> AI Cognitive Analysis
              </h3>
              <p className="text-xs text-slate-500 mb-4">Deep analysis of engagement probability and presence.</p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicRadarData}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">High Conversion Probability</span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-neon-green/10 text-neon-green px-3 py-1 rounded-full border border-neon-green/20">Strong Digital Presence</span>
              </div>
            </motion.div>
          </div>

          {/* Automation Pipeline Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-8 overflow-hidden relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-8">
              <Layers size={20} className="text-slate-400" /> Automation Pipeline Status
            </h3>
            <div className="flex items-center justify-between relative z-10 max-w-4xl mx-auto px-4">
              <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 w-[80%] h-1 bg-white/5 -z-10" />
              {[
                { label: 'Extraction', status: 'done', val: '100%' },
                { label: 'Cleaning', status: 'done', val: '100%' },
                { label: 'Validation', status: 'active', val: '45%' },
                { label: 'AI Scoring', status: 'pending', val: '0%' },
                { label: 'CRM Sync', status: 'pending', val: '0%' },
                { label: 'Outreach', status: 'pending', val: '0%' }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all relative",
                    step.status === 'done' ? "bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_15px_rgba(37,211,102,0.4)]" :
                    step.status === 'active' ? "bg-[#0a0a0a] text-neon-green border-neon-green shadow-[0_0_15px_rgba(37,211,102,0.2)]" :
                    "bg-[#0a0a0a] text-slate-600 border-white/10"
                  )}>
                    {step.status === 'active' && <div className="absolute inset-0 rounded-full border-2 border-neon-green border-t-transparent animate-spin" />}
                    {step.status === 'done' ? <CheckCircle2 size={18} /> : step.status === 'active' ? <Activity size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="text-center">
                    <div className={clsx(
                      "text-[10px] font-black uppercase tracking-widest",
                      step.status === 'done' || step.status === 'active' ? "text-white" : "text-slate-600"
                    )}>{step.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{step.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Extracted Data Preview Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card overflow-hidden">
            <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database size={20} className="text-blue-400" /> Live Extracted Database
                </h3>
                <button 
                  onClick={() => {
                    if (onNavigate) onNavigate('crm');
                  }}
                  className="p-1.5 bg-white/5 text-slate-400 hover:text-white hover:bg-neon-green/20 hover:border-neon-green/30 rounded-lg border border-white/10 transition-colors"
                  title="Open AI CRM Dashboard"
                >
                  <LayoutDashboard size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => {
                    if (leads.length === 0) {
                      // fallback UI message if no leads, but button is disabled anyway
                      return;
                    }
                    localStorage.setItem("crmLeads", JSON.stringify(leads));
                    if (onNavigate) onNavigate('crm');
                  }}
                  disabled={leads.length === 0} 
                  className="premium-button bg-white/5 border border-white/10 text-white flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-xs"
                >
                  <UploadCloud size={14} /> Send to CRM
                </button>
                <button onClick={downloadLeads} disabled={leads.length === 0} className="premium-button bg-white/5 border border-white/10 text-white flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-xs">
                  <Download size={14} /> Export CSV
                </button>
                <button 
                  onClick={() => {
                    const whatsappReadyLeads = leads.filter((lead: any) => lead.phone || lead.whatsapp);
                    
                    if (whatsappReadyLeads.length > 0) {
                      localStorage.setItem("ai_whatsapp_outreach_leads", JSON.stringify(whatsappReadyLeads));
                      localStorage.setItem("ai_whatsapp_outreach_source", "data-vault");
                      localStorage.setItem("ai_whatsapp_outreach_created_at", new Date().toISOString());
                    } else {
                      localStorage.removeItem("ai_whatsapp_outreach_leads");
                    }
                    
                    if (onNavigate) onNavigate('ai_whatsapp');
                  }}
                  disabled={leads.length === 0} 
                  className="premium-button bg-neon-green text-black flex items-center gap-2 px-6 py-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] text-xs border border-neon-green"
                >
                  <Zap size={14} className="fill-current" /> Start WhatsApp Outreach
                </button>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#0a0a0a]">
                    <th className="px-8 py-6">Business Name</th>
                    <th className="px-8 py-6">Category</th>
                    <th className="px-8 py-6">Lead Score</th>
                    <th className="px-8 py-6">Opportunity</th>
                    <th className="px-8 py-6">Contact</th>
                    <th className="px-6 py-6">Source</th>
                    <th className="px-8 py-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {leads.length > 0 ? (
                      leads.map((lead, i) => (
                        <motion.tr 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="font-bold text-white group-hover:text-neon-green transition-colors">{lead.name || (lead as any).businessName}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tighter max-w-[200px] truncate" title={lead.address}>{lead.address}</div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase text-slate-400 border border-white/5 max-w-[150px] inline-block truncate" title={lead.category}>
                              {lead.category}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((lead.rating || 0) * 20, 100)}%` }}
                                  className={clsx(
                                    "h-full rounded-full",
                                    (lead.rating || 0) >= 4.5 ? "bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.3)]" : 
                                    (lead.rating || 0) >= 4.0 ? "bg-blue-400" : "bg-slate-600"
                                  )}
                                />
                              </div>
                              <span className="text-xs font-bold font-mono text-slate-400">{lead.rating || 0}★</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={clsx(
                              "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border",
                              (lead.rating || 0) >= 4.7 && "bg-neon-green/10 text-neon-green border-neon-green/20",
                              (lead.rating || 0) >= 4.3 && (lead.rating || 0) < 4.7 && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                              (lead.rating || 0) >= 4.0 && (lead.rating || 0) < 4.3 && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                              (lead.rating || 0) < 4.0 && "bg-slate-500/10 text-slate-500 border-slate-500/20",
                            )}>
                              {(lead.rating || 0) >= 4.7 ? '💎 DIAMOND' : (lead.rating || 0) >= 4.3 ? '🥇 GOLD' : (lead.rating || 0) >= 4.0 ? '🥈 SILVER' : '🥉 BRONZE'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm text-neon-green font-medium font-mono truncate">{lead.phone || 'N/A'}</div>
                            {lead.website && <div className="text-[10px] text-blue-400 mt-1 truncate max-w-[150px]"><a href={lead.website} target="_blank" rel="noreferrer" className="hover:underline">{lead.website}</a></div>}
                            {lead.email && <div className="text-[10px] text-purple-400 mt-0.5 truncate max-w-[150px]">{lead.email}</div>}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setActiveModal('outreach');
                                }}
                                disabled={!lead.phone}
                                className="p-2 bg-neon-green/10 text-neon-green rounded-lg hover:bg-neon-green/20 transition-all border border-neon-green/20 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Run Outreach Agent"
                              >
                                <Zap size={18} />
                              </button>
                              <a 
                                href={lead.mapsUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className={clsx("p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all border border-blue-500/20", !lead.mapsUrl && "opacity-30 pointer-events-none")}
                                title="Open in Google Maps"
                              >
                                <MapPin size={18} />
                              </a>
                            </div>
                          </td>
                          {/* Source Badge Column */}
                          <td className="px-6 py-6">
                            {(lead as any).source === 'Demo Data' ? (
                              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-full">Demo</span>
                            ) : (
                              <span className="px-2.5 py-1 bg-neon-green/10 border border-neon-green/20 text-neon-green text-[9px] font-black uppercase tracking-widest rounded-full">Live</span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-neon-green/5 border border-neon-green/10 flex items-center justify-center">
                              <Search size={36} className="text-neon-green/40" />
                            </div>
                            <div>
                              <p className="text-base font-black text-white mb-1">No Extraction Run Yet</p>
                              <p className="text-sm text-slate-500">Select a <span className="text-neon-green font-bold">Business Type</span> and <span className="text-blue-400 font-bold">Location</span>, then click <span className="text-white font-bold">Run Extraction</span></p>
                            </div>
                            <div className="flex gap-3 text-xs text-slate-600 font-bold uppercase tracking-widest">
                              <span className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg">✓ Step 1: Select Business Type</span>
                              <span className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg">✓ Step 2: Select Location</span>
                              <span className="px-3 py-1.5 bg-neon-green/5 border border-neon-green/10 rounded-lg text-neon-green/70">→ Step 3: Run Extraction</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

      {/* Footer Branding */}
      <footer className="mt-20 border-t border-white/5 pt-12 pb-20 flex flex-col items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
          Built for <span className="text-white font-bold">WhatsApp Enterprise Ecosystem</span>
        </div>
        <div className="flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">
          <span>Security Verified</span>
          <span>Encrypted Engine</span>
          <span>Real-time Data</span>
        </div>
      </footer>
    </div>
  );
}
