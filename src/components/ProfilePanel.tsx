import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCheck, CheckCircle2 } from 'lucide-react';

export default function ProfilePanel() {
  // biometric sync state
  const [bioSync, setBioSync] = useState<'AUTHENTICATED' | 'SYNCING'>('AUTHENTICATED');
  // gate lockout state
  const [gateOn, setGateOn] = useState(true);

  const handleBioSync = () => {
    if (bioSync === 'AUTHENTICATED') {
      setBioSync('SYNCING');
      setTimeout(() => setBioSync('AUTHENTICATED'), 1500);
    }
  };

  const handleGateToggle = () => {
    setGateOn(!gateOn);
  };

  return (
    <div className="glass-card p-6 bg-[rgba(12,12,16,0.85)] rounded-2xl border border-[#ffffff0d]">
      <div className="text-xs font-mono uppercase tracking-wider text-[#22c55e] mb-2">VERIFICATION // SECURE AUTH</div>
      {/* Radar */}
      <div className="relative w-40 h-40 mx-auto mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" stroke="rgba(34,197,94,0.1)" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r="36" stroke="rgba(34,197,94,0.04)" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-[spin_30s_linear_infinite]" />
          <circle cx="50" cy="50" r="42" stroke="#22c55e" strokeWidth="8" strokeDasharray="264" strokeDashoffset="0" fill="none" className="drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          {/* scanning line */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(34,197,94,0.3)" strokeWidth="2" className="animate-[scan-line_3s_ease-in-out_infinite]" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <UserCheck className="text-[#22c55e] w-8 h-8" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white text-center mb-1">Guest Developer</h2>
      <div className="px-3 py-1 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-full text-xs font-mono uppercase tracking-widest text-[#22c55e] text-center mb-4">
        SYSTEM ARCHITECT // TIER 1
      </div>
      {/* Mini cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Biometric Sync */}
        <button
          onClick={handleBioSync}
          className="flex flex-col items-center p-2 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg text-xs text-[#22c55e]"
        >
          <span>BIOMETRIC SYNC</span>
          {bioSync === 'SYNCING' ? (
            <motion.div
              className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          ) : (
            <span className="mt-1 font-bold">AUTHENTICATED</span>
          )}
        </button>
        {/* Gate Lockout */}
        <button
          onClick={handleGateToggle}
          className={`flex flex-col items-center p-2 border rounded-lg text-xs ${gateOn ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]' : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'}`}
        >
          <span>GATE LOCKOUT</span>
          <span className="mt-1 font-bold">{gateOn ? 'SECURE // ON' : 'SECURE // OFF'}</span>
        </button>
      </div>
    </div>
  );
}
