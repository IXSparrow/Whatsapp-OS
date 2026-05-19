import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';

interface CategoryGroup {
  label: string;
  options: string[];
}

const RECOMMENDED = [
  'Dental Clinics',
  'Real Estate',
  'Plumbers',
  'Hotels',
  'Gyms',
  'Law Firms',
  'Restaurants',
  'Interior Designers',
  'Marketing Agencies',
];

const GROUPS: CategoryGroup[] = [
  { label: 'High Value Leads', options: ['Dental Clinics', 'Real Estate Agencies', 'Law Firms', 'Interior Designers'] },
  { label: 'Local Services', options: ['Restaurants', 'Cafes', 'Gyms', 'Salons', 'Plumbers', 'Electricians'] },
  { label: 'Healthcare', options: ['Hospitals', 'Clinics', 'Dental Clinics', 'Pharmacies'] },
  { label: 'Real Estate', options: ['Real Estate Agencies', 'Property Management', 'Architects'] },
  { label: 'Food & Hospitality', options: ['Restaurants', 'Cafes', 'Hotels', 'Bakeries'] },
  { label: 'Education', options: ['Schools', 'Colleges', 'Coaching Centers'] },
  { label: 'Retail', options: ['Clothing Stores', 'Jewelry Stores', 'Grocery Stores', 'Furniture Stores'] },
  { label: 'Professional Services', options: ['Law Firms', 'Accountants', 'Consultancies', 'Marketing Agencies'] },
  { label: 'Automotive', options: ['Car Dealers', 'Repair Shops'] },
  { label: 'Beauty & Fitness', options: ['Salons', 'Spas', 'Fitness Trainers', 'Yoga Studios'] },
  { label: 'Technology', options: ['Software Companies', 'IT Services', 'Coworking Spaces'] },
  { label: 'Industrial', options: ['Factories', 'Warehouses', 'Logistics Companies'] },
];

interface BusinessTypeSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export default function BusinessTypeSelect({ value, onChange }: BusinessTypeSelectProps) {
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
        <Search size={16} className={clsx("transition-colors", open ? "text-neon-green" : "text-slate-500")} />
        <input
          type="text"
          placeholder="Search business type..."
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
                Use custom type: <span className="font-bold">"{search}"</span>
              </button>
            </div>
          )}
          
          <div className="p-3 border-b border-white/5 bg-white/[0.02]">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Best AI Targets</div>
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
