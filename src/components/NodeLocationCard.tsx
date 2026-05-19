import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server } from 'lucide-react';

export default function NodeLocationCard() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="glass-card w-full p-3 bg-[rgba(12,12,16,0.85)] border border-[#ffffff0d] rounded-lg flex items-center space-x-2"
      >
        <Server className="w-4 h-4 text-[#22c55e]" />
        <div className="flex-1 text-sm font-mono text-[#22c55e]">SERVER_NODE_NEXUS</div>
        <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
        <span className="text-xs text-[#22c55e]">SECURE TUNNEL ACTIVE</span>
      </button>
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#0c0c10] border border-[#22c55e]/30 rounded-md text-xs text-[#22c55e]"
        >
          Node tunnel verified. Latency stable at 12ms.
        </motion.div>
      )}
    </div>
  );
}
