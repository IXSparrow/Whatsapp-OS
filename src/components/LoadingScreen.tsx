import React from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl">
      <motion.div
        className="w-24 h-24 rounded-full border-4 border-neon-green/30 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-neon-green"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.div>
      <p className="absolute bottom-8 text-sm text-neon-green font-mono tracking-wider">
        Initializing Nexus Core OS…
      </p>
    </div>
  );
}
