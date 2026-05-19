import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Cpu, BarChart3, Clock } from 'lucide-react';
import { getRandomFloat, getRandomInt } from '@/lib/utils';

export default function TelemetryPanel() {
  const [valRate, setValRate] = useState(98.4);
  const [leadPct, setLeadPct] = useState(52);
  const [logPct, setLogPct] = useState(56);

  const refreshAll = () => {
    setValRate(getRandomFloat(94.0, 99.9, 1));
    setLeadPct(getRandomInt(40, 90));
    setLogPct(getRandomInt(40, 90));
    // also could trigger global metric update via context, but simple here
  };

  return (
    <div className="glass-card p-4 bg-[rgba(12,12,16,0.85)] rounded-2xl border border-[#ffffff0d]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-mono uppercase text-[#8b5cf6]">SYSTEM TELEMETRY</h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={refreshAll}
          className="p-1 text-[#22c55e] hover:text-[#22c55e]/80"
        >
          <RefreshCw size={16} />
        </motion.button>
      </div>
      {/* Circular gauge */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="#22c55e" strokeWidth="8" strokeDasharray="264" strokeDashoffset={(100 - valRate) * 2.64} fill="none" className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{valRate}%</span>
            <span className="text-xs text-[#22c55e] uppercase mt-1">VAL RATE</span>
          </div>
        </div>
      </div>
      {/* Progress bars */}
      <div className="space-y-3">
        {[
          { label: 'SCRAPED PROSPECT LEADS', pct: leadPct },
          { label: 'WHATSAPP OUTREACH LOGS', pct: logPct },
        ].map((b, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#22c55e]">{b.label}</span>
              <span className="text-white">{b.pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden border border-[#22c55e]/10">
              <div className="h-full bg-[#22c55e]" style={{ width: `${b.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
