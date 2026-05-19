import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Zap, Bot, ArrowRight, Activity, Database, Workflow, Shield } from 'lucide-react';
import clsx from 'clsx';
import { AnimatedWorkflowScene, AnimatedInfrastructureScene, AnimatedLeadVisual, AnimatedWhatsAppVisual } from './components/Visuals';
import HeroAutomationDashboard from './components/HeroAutomationDashboard';
import IntroAutomationHero from './components/IntroAutomationHero';

interface HomeProps {
  onLaunch: (mode: 'lead_engine' | 'ai_whatsapp' | 'crm') => void;
}

export default function Home({ onLaunch }: HomeProps) {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-obsidian min-h-screen text-slate-200 overflow-x-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-neon-green/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Cinematic Intro Hero Section */}
      <section id="home">
        <IntroAutomationHero />
      </section>

      {/* 1. HERO SECTION */}
      <motion.section 
        className="relative min-h-[92vh] py-12 lg:py-16 flex items-center justify-center pt-16 px-6 lg:px-20 z-30 -mt-10"
      >
        {/* Soft upper central ambient glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
        {/* Full-width Subtle Animated Background Grid with Top Radial Mask */}
        <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none z-0" style={{ maskImage: 'radial-gradient(ellipse at top, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at top, black, transparent 75%)' }} />
        {/* Center the visually expanded dashboard */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="relative h-[620px] lg:h-[720px] w-full z-10">
            <HeroAutomationDashboard onLaunch={onLaunch} />
          </div>
        </div>
      </motion.section>

      {/* 2. SCROLL REVEAL SECTIONS */}
      <section id="systems" className="relative z-10 py-32 px-6 lg:px-20 bg-gradient-to-b from-transparent to-black/50">
        <div id="architecture" className="absolute -top-24" />
        <div className="max-w-7xl mx-auto space-y-40">
          
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                  <Workflow size={24} className="text-purple-400" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Workflow Intelligence</h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Deploy multi-agent systems that coordinate across channels. Our neural infrastructure handles complex decision trees in real-time, adapting to responses and optimizing conversion pathways autonomously.
                </p>
              </div>
              <div className="flex-1 w-full aspect-video rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative overflow-hidden flex items-center justify-center">
                <AnimatedWorkflowScene />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Shield size={24} className="text-blue-400" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Enterprise Infrastructure</h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Built on a foundation of secure, high-velocity data pipelines. Your lead data, agent personas, and automated conversations are isolated, encrypted, and globally accessible with sub-100ms latency.
                </p>
              </div>
              <div className="flex-1 w-full aspect-video rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative overflow-hidden flex items-center justify-center">
                <AnimatedInfrastructureScene />
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 3. AI SYSTEMS (TOOL SELECTION) */}
      <section id="workspace" className="relative z-20 py-32 px-6 lg:px-20 bg-black">
        <div id="ai-systems" className="absolute -top-24" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 mb-4">Core Modules</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Initialize AI Systems</h3>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Select a primary operational module to deploy your workspace. Each system is fully isolated yet shares the global data mesh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEAD ENGINE CARD */}
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 lg:p-12 overflow-hidden hover:border-neon-green/30 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/0 via-transparent to-neon-green/0 group-hover:from-neon-green/10 transition-colors duration-500" />
              <AnimatedLeadVisual />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-neon-green/10 rounded-2xl flex items-center justify-center border border-neon-green/20 mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                  <Zap size={32} className="text-neon-green" />
                </div>
                
                <h4 className="text-3xl font-black text-white mb-4">Lead Engine</h4>
                <p className="text-slate-400 mb-8 leading-relaxed">AI-powered lead extraction and business intelligence system. Discover, score, and enrich prospect data autonomously.</p>
                
                <div className="space-y-3 mb-12">
                  {['Smart scraping algorithms', 'Predictive quality scoring', 'Global data extraction', 'Automated opportunity detection'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                      <span className="text-sm font-bold text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => onLaunch('lead_engine')}
                    className="w-full py-4 bg-neon-green/10 text-neon-green font-black uppercase tracking-widest text-xs rounded-xl border border-neon-green/20 group-hover:bg-neon-green group-hover:text-black transition-all"
                  >
                    Open Lead Engine
                  </button>
                </div>
              </div>
            </motion.div>

            {/* AI WHATSAPP CARD */}
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 lg:p-12 overflow-hidden hover:border-blue-500/30 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:from-blue-500/10 transition-colors duration-500" />
              <AnimatedWhatsAppVisual />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Bot size={32} className="text-blue-500" />
                </div>
                
                <h4 className="text-3xl font-black text-white mb-4">AI WhatsApp</h4>
                <p className="text-slate-400 mb-8 leading-relaxed">AI-powered WhatsApp automation and conversation engine. Deploy autonomous agents to handle outbound and inbound communications.</p>
                
                <div className="space-y-3 mb-12">
                  {['Automated targeted messaging', 'Intelligent lead nurturing', 'Human-like AI replies', 'Visual workflow automation'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-sm font-bold text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => onLaunch('ai_whatsapp')}
                    className="w-full py-4 bg-blue-500/10 text-blue-400 font-black uppercase tracking-widest text-xs rounded-xl border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    Open AI WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}

// Scroll Animation Wrapper Component
function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
