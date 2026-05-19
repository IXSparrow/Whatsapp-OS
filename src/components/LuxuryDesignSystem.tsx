import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import clsx from 'clsx';

// 1. CursorGlow: Soft glowing cursor follower with trailing blur and elastic springs
export function CursorGlow() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        borderColor: 'var(--accent-border)',
        backgroundColor: 'var(--accent-soft)',
        boxShadow: '0 0 20px var(--accent-glow)'
      }}
      className="fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-[9999] hidden md:block"
    />
  );
}

// 2. AuroraBackground: Slow-pulsing dual radial spotlights linked to accent colors
export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      <div 
        className="absolute top-[-15%] left-[20%] w-[60vw] h-[50vh] blur-[120px] rounded-full animate-[pulse_10s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-[-15%] right-[10%] w-[50vw] h-[45vh] blur-[110px] rounded-full animate-[pulse_12s_ease-in-out_infinite_2s]" 
        style={{
          background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)'
        }}
      />
    </div>
  );
}

// 3. NeuralGrid: Subtle vector space mesh overlay
export function NeuralGrid() {
  return (
    <div 
      className="absolute inset-0 opacity-[0.035] pointer-events-none -z-10" 
      style={{
        backgroundImage: `linear-gradient(to right, var(--accent-border) 1px, transparent 1px), linear-gradient(to bottom, var(--accent-border) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}
    />
  );
}

// 4. AmbientLightLayer: Layered colored mist filters
export function AmbientLightLayer() {
  return (
    <div className="absolute inset-0 bg-[var(--bg)] -z-30 pointer-events-none transition-colors duration-300" />
  );
}

// 5. PremiumCard: Luxury glassmorphic card container with border sweeps and lighting effects
interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'cyan' | 'emerald' | 'violet';
}

export function PremiumCard({ children, className, glowColor = 'cyan' }: PremiumCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      style={{
        backgroundColor: 'var(--card)',
        borderColor: isHovered ? 'var(--accent-border)' : 'var(--border)',
        boxShadow: isHovered ? '0 12px 30px var(--accent-soft)' : '0 12px 35px rgba(0,0,0,0.6)'
      }}
      className={clsx(
        "relative overflow-hidden border rounded-3xl p-6 transition-all duration-300 group cursor-pointer",
        className
      )}
    >
      {/* Edge shimmer line animation */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite] pointer-events-none" />

      {/* Internal ambient glowing gradient reflection */}
      <div 
        style={{
          background: 'var(--accent-soft)',
          opacity: isHovered ? 0.08 : 0
        }}
        className="absolute inset-0 transition-opacity duration-700 blur-[20px] -z-10" 
      />

      {/* Specular glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.003] to-white/[0.025] pointer-events-none" />

      {children}
    </motion.div>
  );
}

// 6. GlowButton: High-end button with linear shine and spring mouse coordination pull
interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlowButton({ children, className, ...props }: GlowButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 120, damping: 12 });
  const springY = useSpring(y, { stiffness: 120, damping: 12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX * 0.2);
    y.set(mouseY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={{ 
        x: springX, 
        y: springY,
        background: 'var(--accent-gradient)',
        borderColor: 'var(--accent-border)',
        boxShadow: '0 0 20px var(--accent-glow)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      className={clsx(
        "relative overflow-hidden group transition-all duration-300 outline-none select-none cursor-pointer border rounded-xl font-mono font-black uppercase tracking-widest text-[9px] py-3.5 px-7 text-black",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

// 7. FloatingPanel: Luxury modular card tilting slightly based on mouse events
export function FloatingPanel({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
      className={clsx(
        "rounded-[2.4rem] border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] hover:border-cyan-500/10 transition-all duration-300 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.003] to-white/[0.025] pointer-events-none" />
      {children}
    </div>
  );
}

// 8. AnimatedInput: Holographic field with focus glow and clean active outlines
interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<{ size?: number, className?: string }>;
}

export function AnimatedInput({ label, icon: Icon, className, ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
        {Icon && <Icon size={10} style={{ color: 'var(--accent)' }} />} {label}
      </label>
      <input
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          borderColor: isFocused ? 'var(--accent-border)' : 'var(--border)',
          boxShadow: isFocused ? '0 0 10px var(--accent-soft)' : undefined
        }}
        className={clsx(
          "bg-black/60 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-medium font-mono",
          className
        )}
      />
    </div>
  );
}

// 9. LuxurySidebar: Sidebar links with morphing active neon indicators
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number, className?: string }>;
}

interface LuxurySidebarProps {
  items: SidebarItem[];
  activeId: string;
  onChange: (id: any) => void;
}

export function LuxurySidebar({ items, activeId, onChange }: LuxurySidebarProps) {
  return (
    <div 
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
      className="flex flex-col gap-2.5 border rounded-3xl p-3.5 backdrop-blur-3xl shadow-[0_20px_45px_rgba(0,0,0,0.55)]"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              borderColor: isActive ? 'var(--accent-border)' : 'transparent',
              boxShadow: isActive ? 'inset 0 1px 12px var(--accent-soft)' : undefined
            }}
            className={clsx(
              "w-full text-left p-4 rounded-2xl transition-all duration-300 border flex flex-col gap-1.5 group select-none cursor-pointer outline-none relative overflow-hidden",
              isActive 
                ? "text-white scale-[1.02]" 
                : "bg-transparent text-slate-400 hover:bg-white/[0.02] hover:text-white"
            )}
          >
            {isActive && (
              <div 
                className="absolute top-0 bottom-0 left-0 w-[2px]" 
                style={{
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 10px var(--accent-glow)'
                }}
              />
            )}
            <div className="flex items-center gap-3">
              <div 
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'rgba(255,255,255,0.05)',
                  borderColor: isActive ? 'var(--accent-border)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'var(--accent)' : '#64748b'
                }}
                className="w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border transition-colors"
              >
                <Icon size={12.5} />
              </div>
              <span className="text-[9.5px] font-black uppercase tracking-wider leading-none">{item.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// 10. DashboardTile: Bento metric tile with soft glow indicators
interface DashboardTileProps {
  title: string;
  metric: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  glowColor?: 'blue' | 'cyan' | 'emerald' | 'violet';
}

export function DashboardTile({ title, metric, desc, icon: Icon, glowColor = 'cyan' }: DashboardTileProps) {
  return (
    <PremiumCard glowColor={glowColor} className="flex flex-col justify-between min-h-[145px]">
      <div className="flex items-start justify-between relative z-10">
        <div 
          style={{
            backgroundColor: 'var(--accent-soft)',
            borderColor: 'var(--accent-border)',
            color: 'var(--accent)'
          }}
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center border transition-all duration-300"
        >
          <Icon className="w-4 h-4" />
        </div>
        <div 
          style={{
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent-glow)'
          }}
          className="w-2 h-2 rounded-full transition-all duration-500" 
        />
      </div>

      <div className="mt-5 relative z-10">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">
          {title}
        </span>
        <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
          {desc}
        </span>
        <div className="flex items-baseline justify-between mt-2.5">
          <span className="text-xs font-black text-white leading-none tracking-tight">
            {metric}
          </span>
        </div>
      </div>
    </PremiumCard>
  );
}
