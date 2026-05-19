import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, MapPin } from 'lucide-react';

interface CategoryGroup {
  label: string;
  options: string[];
}

const RECOMMENDED = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Dubai', 'London', 'New York', 'Singapore'
];

const GROUPS: CategoryGroup[] = [
  { label: 'India Top Cities', options: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat', 'Noida', 'Gurgaon', 'Chandigarh', 'Lucknow', 'Indore', 'Bhopal', 'Patna', 'Ranchi', 'Bhubaneswar', 'Kochi', 'Coimbatore', 'Nagpur', 'Nashik', 'Vadodara', 'Rajkot'] },
  { label: 'USA Top Cities', options: ['New York', 'Los Angeles', 'San Francisco', 'Chicago', 'Houston', 'Dallas', 'Miami', 'Seattle', 'Boston'] },
  { label: 'UAE Business Hubs', options: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
  { label: 'UK Business Hubs', options: ['London', 'Manchester', 'Birmingham'] },
  { label: 'Europe Business Hubs', options: ['Berlin', 'Munich', 'Paris', 'Amsterdam', 'Madrid', 'Milan'] },
  { label: 'Asia Pacific', options: ['Singapore', 'Sydney', 'Melbourne', 'Hong Kong', 'Tokyo', 'Seoul', 'Bangkok', 'Kuala Lumpur'] },
  { label: 'Middle East', options: ['Doha', 'Riyadh', 'Jeddah'] },
];

interface LocationSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export default function LocationSelect({ value, onChange }: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredGroups = GROUPS.map(g => ({
    label: g.label,
    options: g.options.filter(o => o.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.options.length > 0);

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setSearch('');
  };

  const handleCustom = () => {
    if (search.trim()) {
      onChange(search.trim());
      setOpen(false);
      setSearch('');
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Enter' && open && search.trim() && filteredGroups.length === 0) {
        handleCustom();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, search, filteredGroups]);

  return (
    <div className="relative" ref={containerRef}>
      <div className={clsx(
        "flex items-center gap-2 bg-transparent border-b pb-2 transition-colors",
        open ? "border-neon-green" : "border-white/10 hover:border-white/30"
      )}>
        <MapPin size={16} className={clsx("transition-colors", open ? "text-neon-green" : "text-slate-500")} />
        <input
          type="text"
          placeholder="Search location or type custom..."
          className="bg-transparent flex-1 text-base text-white placeholder:text-slate-500 focus:outline-none"
          value={open ? search : (value || search)}
          onChange={e => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {value && !open && (
          <button 
            type="button" 
            className="text-slate-500 hover:text-white px-1"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          >
            ×
          </button>
        )}
        <ChevronDown size={16} className={clsx("cursor-pointer transition-transform", open ? "rotate-180 text-neon-green" : "text-slate-500")} onClick={() => setOpen(!open)} />
      </div>
      
      {open && (
        <div className="absolute z-50 mt-2 w-[110%] -ml-[5%] max-h-[400px] overflow-auto rounded-xl bg-[#0a0a0c]/95 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {search && filteredGroups.length === 0 && (
            <div className="p-2 border-b border-white/5">
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm rounded bg-neon-green/10 text-neon-green hover:bg-neon-green/20 border border-neon-green/20 transition-colors"
                onClick={handleCustom}
              >
                Use custom location: <span className="font-bold">"{search}"</span>
              </button>
            </div>
          )}
          
          <div className="p-3 border-b border-white/5 bg-white/[0.02]">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Best AI Locations</div>
            <div className="flex flex-wrap gap-1.5">
              {RECOMMENDED.map(chip => (
                <button
                  key={chip}
                  type="button"
                  className={clsx(
                    'px-2.5 py-1 text-xs rounded-lg border transition-colors',
                    chip === value ? 'bg-neon-green/20 text-neon-green border-neon-green/30 font-bold shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'bg-[#050505] text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                  )}
                  onClick={() => handleSelect(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2 space-y-4">
            {filteredGroups.map(g => (
              <div key={g.label}>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-2">{g.label}</div>
                <div className="grid grid-cols-2 gap-1">
                  {g.options.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={clsx(
                        'flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                        opt === value ? 'bg-neon-green/10 text-neon-green font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                      onClick={() => handleSelect(opt)}
                    >
                      <span className="truncate">{opt}</span>
                      {opt === value && <Check size={14} className="ml-2 flex-shrink-0 text-neon-green" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
