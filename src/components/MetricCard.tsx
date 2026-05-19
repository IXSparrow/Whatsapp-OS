import React from 'react';
import { motion } from 'motion/react';

type MetricCardProps = {
  label: string;
  value: string;
};

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-3 bg-[rgba(12,12,16,0.85)] border border-[#ffffff0d] rounded-lg flex flex-col items-center"
    >
      <span className="text-xs text-[#22c55e] uppercase mb-1">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </motion.div>
  );
}
