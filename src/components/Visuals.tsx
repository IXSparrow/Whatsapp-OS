import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Activity, Database, Workflow, Shield, Zap, MessageSquare, Cloud, Lock } from 'lucide-react';
import clsx from 'clsx';

// --- SHARED COMPONENTS ---
export const GlowOrb = ({ className, color }: { className?: string, color: string }) => (
  <motion.div 
    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className={clsx("absolute rounded-full blur-3xl pointer-events-none", color, className)}
  />
);

// --- HERO SCENES ---

const BrainNetworkScene = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.1 }}
    transition={{ duration: 1 }}
    className="absolute inset-0 flex items-center justify-center"
  >
    <GlowOrb className="w-64 h-64 bg-blue-500/20" color="bg-blue-500/20" />
    
    {/* SVG Lines connecting nodes */}
    <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }}>
      <motion.path 
        d="M150 150 L250 100 L350 200 L250 300 Z" 
        fill="none" 
        stroke="rgba(59,130,246,0.3)" 
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <motion.path 
        d="M250 100 L250 200 L350 200" 
        fill="none" 
        stroke="rgba(168,85,247,0.3)" 
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
      />
    </svg>

    {/* Floating Nodes */}
    <motion.div 
      animate={{ y: [-10, 10, -10] }} 
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[20%] left-[30%] w-16 h-16 bg-blue-500/10 border border-blue-500/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]"
    >
      <Activity className="text-blue-400" />
    </motion.div>

    <motion.div 
      animate={{ y: [10, -10, 10] }} 
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-[60%] left-[50%] w-20 h-20 bg-purple-500/10 border border-purple-500/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="w-10 h-10 bg-purple-500/20 rounded-full animate-pulse flex items-center justify-center">
        <Bot className="text-purple-400" size={20} />
      </div>
    </motion.div>

    <motion.div 
      animate={{ x: [-10, 10, -10] }} 
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      className="absolute top-[40%] right-[30%] w-14 h-14 bg-neon-green/10 border border-neon-green/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.2)]"
    >
      <Database className="text-neon-green" size={20} />
    </motion.div>
  </motion.div>
);

const WhatsAppFlowScene = () => (
  <motion.div 
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 50 }}
    transition={{ duration: 1 }}
    className="absolute inset-0 flex items-center justify-center"
  >
    <GlowOrb className="w-72 h-72 bg-emerald-500/10" color="bg-emerald-500/10" />
    
    <div className="relative w-64 h-80 flex flex-col items-center justify-center">
      {/* Bot Central Hub */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 rounded-full border border-dashed border-emerald-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        <motion.div 
          animate={{ rotate: -360 }} // Counter rotate to keep icon straight
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <MessageSquare className="text-emerald-400" />
        </motion.div>
      </motion.div>

      {/* Flowing Messages */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], y: -100, scale: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "linear" }}
          className={clsx(
            "absolute px-4 py-2 rounded-2xl backdrop-blur-md text-xs font-bold shadow-[0_0_15px_rgba(0,0,0,0.2)]",
            i % 2 === 0 ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 left-0" : "bg-blue-500/20 border border-blue-500/30 text-blue-300 right-0"
          )}
        >
          {i % 2 === 0 ? "Analyzing intent..." : "Generating reply..."}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const RadarScene = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 1.1 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 1 }}
    className="absolute inset-0 flex items-center justify-center"
  >
    <GlowOrb className="w-80 h-80 bg-neon-green/5" color="bg-neon-green/5" />
    
    <div className="relative w-64 h-64 rounded-full border border-neon-green/20 overflow-hidden shadow-[inset_0_0_50px_rgba(57,255,20,0.1)]">
      {/* Radar Grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border border-neon-green/10" />
        <div className="absolute w-48 h-48 rounded-full border border-neon-green/10" />
        <div className="absolute w-full h-px bg-neon-green/10" />
        <div className="absolute h-full w-px bg-neon-green/10" />
      </div>

      {/* Sweeper */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(57,255,20,0.4) 100%)' }}
      />

      {/* Blips */}
      {[
        { top: '30%', left: '40%', delay: 0 },
        { top: '60%', left: '70%', delay: 1.5 },
        { top: '40%', left: '20%', delay: 2.8 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#39ff14]"
          style={{ top: pos.top, left: pos.left }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, delay: pos.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  </motion.div>
);

export const AnimatedHeroScene = () => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scenes = [BrainNetworkScene, WhatsAppFlowScene, RadarScene];

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % scenes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {React.createElement(scenes[sceneIndex], { key: sceneIndex })}
      </AnimatePresence>
    </div>
  );
};


// --- WORKFLOW INTELLIGENCE VISUAL ---

export const AnimatedWorkflowScene = () => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    <GlowOrb className="w-full h-full bg-purple-500/10" color="bg-purple-500/10" />
    
    <div className="relative flex items-center gap-8 z-10 w-full px-12">
      {/* Node 1 */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg flex-shrink-0"
      >
        <Database size={24} className="text-slate-300" />
      </motion.div>

      {/* Animated Line 1 */}
      <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-purple-500/80 to-transparent blur-sm"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Node 2 - AI Processor */}
      <motion.div 
        animate={{ y: [5, -5, 5], scale: [1, 1.05, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)] flex-shrink-0 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />
        <Bot size={32} className="text-purple-400 relative z-10" />
      </motion.div>

      {/* Animated Line 2 */}
      <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent blur-sm"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
      </div>

      {/* Node 3 */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg flex-shrink-0"
      >
        <Zap size={24} className="text-blue-400" />
      </motion.div>
    </div>
  </div>
);


// --- ENTERPRISE INFRASTRUCTURE VISUAL ---

export const AnimatedInfrastructureScene = () => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    <GlowOrb className="w-full h-full bg-blue-500/5" color="bg-blue-500/5" />
    
    <div className="relative w-64 h-64">
      {/* Center Shield */}
      <motion.div 
        animate={{ rotateY: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.3)] z-20"
      >
        <Shield size={32} className="text-blue-400" />
      </motion.div>

      {/* Orbiting Elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-dashed border-white/10 rounded-full"
      >
        <motion.div 
          animate={{ rotate: -360 }} // keeps icon upright
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center justify-center shadow-lg"
        >
          <Cloud size={16} className="text-slate-300" />
        </motion.div>

        <motion.div 
          animate={{ rotate: -360 }} // keeps icon upright
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center justify-center shadow-lg"
        >
          <Database size={16} className="text-slate-300" />
        </motion.div>

        <motion.div 
          animate={{ rotate: -360 }} // keeps icon upright
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-4 -translate-y-1/2 w-12 h-12 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center justify-center shadow-lg"
        >
          <Lock size={16} className="text-slate-300" />
        </motion.div>
      </motion.div>

      {/* Inner Data Ring */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-8 left-8 right-8 bottom-8 border-2 border-transparent border-t-blue-500/40 border-r-blue-500/40 rounded-full mix-blend-screen"
      />
    </div>
  </div>
);


// --- CARD BACKGROUNDS ---

export const AnimatedLeadVisual = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
    <motion.div 
      animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square border-4 border-neon-green rounded-full"
    />
    <motion.div 
      animate={{ scale: [1.5, 2.5, 1.5], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square border-2 border-neon-green rounded-full"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
  </div>
);

export const AnimatedWhatsAppVisual = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 group-hover:opacity-20 transition-opacity duration-500">
    <div className="absolute inset-0 flex items-center justify-center">
      <Bot size={200} className="text-blue-500" />
    </div>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-12 h-12 bg-blue-500 rounded-full blur-xl"
        animate={{ 
          y: [-20, 20, -20],
          x: [-20, 20, -20],
          scale: [1, 1.5, 1]
        }}
        transition={{ 
          duration: 5 + i, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: i * 0.5
        }}
        style={{
          left: `${10 + i * 20}%`,
          top: `${10 + (i % 3) * 30}%`
        }}
      />
    ))}
    <div className="absolute inset-0 bg-black/60" />
  </div>
);
