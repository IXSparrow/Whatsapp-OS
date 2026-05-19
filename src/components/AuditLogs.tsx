import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { getRandomInt } from '@/lib/utils';

interface LogEntry {
  time: string;
  message: string;
  agent: string;
}

const initialLogs: LogEntry[] = [
  { time: '09:42:01', message: 'CRM database sync complete', agent: 'CRM_AGENT' },
  { time: '09:21:40', message: 'Normalized B2B prospect data', agent: 'CLEAN_AGENT' },
  { time: '08:45:11', message: 'Assigned cognitive confidence scores', agent: 'SCORE_AGENT' },
  { time: '07:11:04', message: 'WhatsApp broadcast pipeline initiated', agent: 'OUTREACH_AGENT' },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  const runSync = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour12: false });
    const newLog: LogEntry = {
      time,
      message: 'Manual synchronization executed',
      agent: 'SYNC_AGENT',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const restoreLogs = () => {
    setLogs(initialLogs);
  };

  return (
    <div className="glass-card p-4 bg-[rgba(12,12,16,0.85)] rounded-2xl border border-[#ffffff0d]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-mono uppercase text-[#8b5cf6]">ADMINISTRATIVE AUDIT LOGS</h3>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={runSync}
            className="px-2 py-1 text-xs bg-[#22c55e]/10 border border-[#22c55e]/30 rounded hover:bg-[#22c55e]/20"
          >
            Run Sync
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={clearLogs}
            className="px-2 py-1 text-xs bg-[#ef4444]/10 border border-[#ef4444]/30 rounded hover:bg-[#ef4444]/20"
          >
            Clear Logs
          </motion.button>
          {logs.length === 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={restoreLogs}
              className="px-2 py-1 text-xs bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded hover:bg-[#06b6d4]/20"
            >
              Restore Logs
            </motion.button>
          )}
        </div>
      </div>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-500">No audit logs available</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22c55e] rounded-full" />
              <span className="text-xs text-[#22c55e] w-20">{log.time}</span>
              <span className="flex-1 text-sm text-white">{log.message}</span>
              <span className="text-xs bg-[#22c55e]/10 border border-[#22c55e]/30 rounded px-1 text-[#22c55e] uppercase">
                {log.agent}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
