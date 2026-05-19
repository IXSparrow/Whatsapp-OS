import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const messages = [
  'Secure credential cycle initiated',
  'Decrypt block #9029 complete',
  'Quantum port handshake verified',
  'Telemetry stream synchronized',
];

export default function ShellBar() {
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState('');

  // rotate message every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // typing effect for current message
  useEffect(() => {
    const msg = messages[index];
    setTyping('');
    let i = 0;
    const timer = setInterval(() => {
      setTyping(msg.slice(0, i + 1));
      i++;
      if (i === msg.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md border border-[#22c55e]/20 rounded-xl px-4 py-2">
      <motion.div className="w-2 h-2 rounded-full bg-[#22c55e]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
      <span className="text-xs font-mono text-[#22c55e] opacity-90">SHELL: [{typing}]</span>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}>
        <ChevronRight size={14} className="text-[#22c55e]" />
      </motion.div>
    </div>
  );
}
