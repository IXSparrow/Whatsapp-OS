import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Server, Zap, Database, Globe, Workflow, CheckCircle2 } from 'lucide-react';
import ShellBar from '@/components/ShellBar';
import ProfilePanel from '@/components/ProfilePanel';
import NodeLocationCard from '@/components/NodeLocationCard';
import QuantumPorts from '@/components/QuantumPorts';
import AuditLogs from '@/components/AuditLogs';
import TelemetryPanel from '@/components/TelemetryPanel';
import MetricCard from '@/components/MetricCard';
import { generateChartData } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col"
    >
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/5">
        <div className="text-xs font-mono uppercase tracking-wider text-[#22c55e]">
          NEXUS CORE OS // SYSTEM COMMAND // TIER V
        </div>
        <ShellBar />
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-6 overflow-hidden">
        {/* Left Column */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <ProfilePanel />
          <NodeLocationCard />
        </aside>
        {/* Center Column */}
        <section className="col-span-12 lg:col-span-6 space-y-4">
          <QuantumPorts />
          {/* Histogram Card */}
          <div className="glass-card p-4 bg-[rgba(12,12,16,0.85)] rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-mono uppercase text-[#8b5cf6]">AI SCORING HISTOGRAM</h3>
              <button className="text-xs text-[#06b6d4] hover:underline" onClick={() => window.location.reload()}>
                Regenerate
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={generateChartData(9)}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="y" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        {/* Right Column */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <TelemetryPanel />
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="UPTIME" value="99.9%" />
            <MetricCard label="LATENCY" value="12ms" />
          </div>
        </aside>
      </div>

      {/* Bottom Log Panel */}
      <footer className="p-6 border-t border-white/5">
        <AuditLogs />
      </footer>
    </motion.div>
  );
}
