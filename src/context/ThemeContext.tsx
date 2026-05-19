import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';
export type Accent = 'blue' | 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'lime' | 'custom';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  customAccent: string;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setCustomAccent: (color: string) => void;
  saveThemeConfig: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  if (cleanHex.length !== 6) {
    return `rgba(59, 130, 246, ${alpha})`; // fallback
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [accent, setAccentState] = useState<Accent>('cyan');
  const [customAccent, setCustomAccentState] = useState<string>('#EC4899'); // Default Rose/Pink custom

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus-theme') as Theme;
    const savedAccent = localStorage.getItem('nexus-accent') as Accent;
    const savedCustomAccent = localStorage.getItem('nexus-custom-accent');

    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('dark');
    }

    if (savedCustomAccent) {
      setCustomAccentState(savedCustomAccent);
    }

    if (savedAccent) {
      setAccentState(savedAccent);
      applyAccent(savedAccent, savedCustomAccent || '#EC4899');
    } else {
      applyAccent('cyan', '#EC4899');
    }
  }, []);

  useEffect(() => {
    const handleNexusTheme = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.mode) {
        setThemeState(customEvent.detail.mode);
        applyTheme(customEvent.detail.mode);
      }
    };
    window.addEventListener("nexus-theme-change", handleNexusTheme);
    return () => window.removeEventListener("nexus-theme-change", handleNexusTheme);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.setProperty('--bg', '#020305');
      root.style.setProperty('--surface', '#07090d');
      root.style.setProperty('--card', 'rgba(10, 12, 18, 0.82)');
      root.style.setProperty('--text', '#ffffff');
      root.style.setProperty('--muted', '#94a3b8');
      root.style.setProperty('--border', 'rgba(255, 255, 255, 0.10)');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.setProperty('--bg', '#f7f8fb');
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--card', 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--text', '#0b1220');
      root.style.setProperty('--muted', '#64748b');
      root.style.setProperty('--border', 'rgba(15, 23, 42, 0.12)');
    }
  };

  const applyAccent = (a: Accent, customVal: string) => {
    const root = document.documentElement;
    let color = '#06B6D4';
    let soft = 'rgba(6, 182, 212, 0.16)';
    let glow = 'rgba(6, 182, 212, 0.38)';

    switch (a) {
      case 'blue':
        color = '#3B82F6';
        soft = 'rgba(59, 130, 246, 0.16)';
        glow = 'rgba(59, 130, 246, 0.38)';
        break;
      case 'cyan':
        color = '#06B6D4';
        soft = 'rgba(6, 182, 212, 0.16)';
        glow = 'rgba(6, 182, 212, 0.38)';
        break;
      case 'violet':
        color = '#A855F7';
        soft = 'rgba(168, 85, 247, 0.16)';
        glow = 'rgba(168, 85, 247, 0.38)';
        break;
      case 'emerald':
        color = '#10B981';
        soft = 'rgba(16, 185, 129, 0.16)';
        glow = 'rgba(16, 185, 129, 0.38)';
        break;
      case 'rose':
        color = '#F43F5E';
        soft = 'rgba(244, 63, 94, 0.16)';
        glow = 'rgba(244, 63, 94, 0.38)';
        break;
      case 'amber':
        color = '#F59E0B';
        soft = 'rgba(245, 158, 11, 0.16)';
        glow = 'rgba(245, 158, 11, 0.38)';
        break;
      case 'lime':
        color = '#84CC16';
        soft = 'rgba(132, 204, 22, 0.16)';
        glow = 'rgba(132, 204, 22, 0.38)';
        break;
      case 'custom':
        color = customVal.startsWith('#') ? customVal : `#${customVal}`;
        soft = hexToRgba(color, 0.16);
        glow = hexToRgba(color, 0.38);
        break;
    }

    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-soft', soft);
    root.style.setProperty('--accent-glow', glow);
    root.style.setProperty('--accent-border', soft);
    root.style.setProperty('--accent-gradient', `linear-gradient(to right, ${color}, ${glow})`);

    // Backwards compatibility bindings
    root.style.setProperty('--neon-green', color);
    root.style.setProperty('--neon-glow', glow);
    root.style.setProperty('--glass-border', soft);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  const setAccent = (a: Accent) => {
    setAccentState(a);
    applyAccent(a, customAccent);
  };

  const setCustomAccent = (color: string) => {
    setCustomAccentState(color);
    if (accent === 'custom') {
      applyAccent('custom', color);
    }
  };

  const saveThemeConfig = () => {
    localStorage.setItem('nexus-theme', theme);
    localStorage.setItem('nexus-accent', accent);
    localStorage.setItem('nexus-custom-accent', customAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, customAccent, setTheme, setAccent, setCustomAccent, saveThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
