import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Zap, Globe, Workflow } from 'lucide-react';
import { getRandomInt } from '@/lib/utils';

export default function QuantumPorts() {
  const initialPorts = [
    { id: 1, name: 'Salesforce Core', server: 'ap-west-1.cloud', icon: Database, online: true },
    { id: 2, name: 'WhatsApp API', server: 'eu-central-2.wa', icon: Zap, online: true },
    { id: 3, name: 'n8n Workflow', server: 'localhost:5678', icon: Workflow, online: true },
    { id: 4, name: 'Instagram API', server: 'us-east-1.graph', icon: Globe, online: true },
  ];

  const [ports, setPorts] = useState(initialPorts);

  const togglePort = (id: number) => {
    setPorts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, online: !p.online } : p))
    );
  };

  const onlineCount = ports.filter((p) => p.online).length;

  return (
    <div className="glass-card p-4 bg-[rgba(12,12,16,0.85)] rounded-2xl border border-[#ffffff0d]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-mono uppercase text-[#8b5cf6]">CONNECTED QUANTUM PORTS</h3>
        <span className="text-xs text-[#22c55e]">{onlineCount} nodes online</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ports.map((port) => {
          const Icon = port.icon as any;
          const borderColor = port.online ? 'border-[#22c55e]/30' : 'border-[#ef4444]/30';
          const badgeColor = port.online ? '#22c55e' : '#ef4444';
          return (
            <button
              key={port.id}
              onClick={() => togglePort(port.id)}
              className={`glass-card p-3 flex flex-col justify-between bg-[rgba(12,12,16,0.85)] rounded-lg border ${borderColor}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-5 h-5" style={{ color: badgeColor }} />
                <span className="text-sm font-medium text-white">{port.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: badgeColor }}>ONLINE</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeColor }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
