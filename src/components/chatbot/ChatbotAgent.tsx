import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { 
  X, 
  Send, 
  Search, 
  Database, 
  BarChart3, 
  MessageCircle, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Mic, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun,
  Layers,
  Settings
} from 'lucide-react';
import { useNexusAgent } from '../../hooks/useNexusAgent';

export default function ChatbotAgent({ navigateTo }: { navigateTo: (route: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    runCommand,
    clearChat,
    commandHistory,
    voiceEnabled,
    toggleVoice,
    tasks
  } = useNexusAgent(navigateTo);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-IN"; // Optimized for English, Hindi, and Hinglish mixtures

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [setInput]);

  // Scroll to bottom on fresh messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isMinimized]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const quickChips = [
    { label: "dentist in London", icon: Search, command: "dentist in London" },
    { label: "Open CRM", icon: BarChart3, command: "open crm dashboard" },
    { label: "AI WhatsApp", icon: MessageCircle, command: "open ai whatsapp" },
    { label: "Data Vault", icon: Database, command: "open data vault" },
    { label: "Dark Mode", icon: Moon, command: "turn dark mode" },
    { label: "Light Mode", icon: Sun, command: "turn light mode" }
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={clsx(
          "fixed bottom-6 right-6 z-[100] h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto shadow-[0_0_35px_rgba(0,245,160,0.3)] border border-[rgba(38,255,169,0.3)] bg-[#030706] hover:scale-110",
          isOpen && !isMinimized ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"
        )}
        title="Open NEXUS ORBIT AI"
      >
        <div className="nexus-orbit-logo scale-90">
          <div className="orbit-ring orbit-ring-1" />
          <div className="orbit-ring orbit-ring-2" />
          <div className="orbit-core" />
          <div className="orbit-node node-1" />
          <div className="orbit-node node-2" />
          <div className="orbit-node node-3" />
        </div>
      </button>

      {/* Floating Agent Console Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "68px" : "600px"
            }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className={clsx(
              "fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[110] w-full sm:w-[410px] rounded-t-3xl sm:rounded-[28px] border-t sm:border border-[rgba(38,255,169,0.18)] bg-[#030706]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col font-sans pointer-events-auto overflow-hidden transition-all duration-300 nexus-aurora-glow",
              isMinimized ? "h-[68px]" : "h-[80vh] sm:h-[600px] sm:max-h-[calc(100vh-48px)]"
            )}
          >
            {/* Top auroral neon glowing linear strip */}
            <div className="h-1 w-full bg-gradient-to-r from-[#00F5A0] via-[#00D9FF] to-[#0B6B5A] shrink-0" />

            {/* Premium Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01] shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Orbit Core Animated Logo */}
                  <div className="nexus-orbit-logo scale-90">
                    <div className="orbit-ring orbit-ring-1" />
                    <div className="orbit-ring orbit-ring-2" />
                    <div className="orbit-core" />
                    <div className="orbit-node node-1" />
                    <div className="orbit-node node-2" />
                    <div className="orbit-node node-3" />
                  </div>
                  {/* Online pulsing green indicator dot */}
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00F5A0] rounded-full border-2 border-[#030706] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-[#F4FFF9] tracking-wider uppercase">NEXUS ORBIT</h3>
                    <span className="text-[7px] font-black bg-[#00F5A0]/10 border border-[#00F5A0]/20 text-[#00F5A0] px-1 rounded uppercase tracking-wider animate-pulse">
                      LIVE CONTROL ACTIVE
                    </span>
                  </div>
                  <div className="text-[9px] text-[#8FA79E] font-bold uppercase tracking-widest">Autonomous Lead & App Operator</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Voice Narration Speaker Button */}
                <button 
                  onClick={toggleVoice}
                  className={clsx(
                    "p-2 rounded-xl transition-all border",
                    voiceEnabled 
                      ? "bg-[#00F5A0]/10 border-[#00F5A0]/30 text-[#00F5A0]" 
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  )}
                  title={voiceEnabled ? "Mute Voice Narrations" : "Enable Voice Narrations"}
                >
                  {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                {/* Clear Chat History */}
                {!isMinimized && (
                  <button 
                    onClick={clearChat}
                    className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                    title="Clear Log History"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {/* Minimize Toggle */}
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  title={isMinimized ? "Maximize Drawer" : "Minimize Drawer"}
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                {/* Close Button */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Body & Scroll Area */}
            {!isMinimized && (
              <>
                {/* Chat messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={clsx("flex max-w-[85%]", msg.role === 'user' ? "ml-auto" : "mr-auto")}>
                      {msg.role !== 'user' && (
                        <div className="nexus-orbit-logo scale-50 shrink-0 mr-1.5 -mt-1">
                          <div className="orbit-ring orbit-ring-1" />
                          <div className="orbit-ring orbit-ring-2" />
                          <div className="orbit-core" />
                        </div>
                      )}
                      
                      <div className={clsx(
                        "px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-md",
                        msg.role === 'user' 
                          ? "bg-gradient-to-r from-[#00F5A0] to-[#0B6B5A] text-black font-extrabold rounded-tr-sm shadow-[0_0_15px_rgba(0,245,160,0.15)]" 
                          : "bg-[rgba(15,24,22,0.92)] border border-[rgba(38,255,169,0.12)] text-[#F4FFF9] rounded-tl-sm font-semibold"
                      )}>
                        {msg.content.split('**').map((part, i) => (
                          i % 2 === 1 ? <strong key={i} className="text-[#00F5A0] font-black">{part}</strong> : <span key={i}>{part}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex max-w-[85%] mr-auto">
                      <div className="nexus-orbit-logo scale-50 shrink-0 mr-1.5 -mt-1">
                        <div className="orbit-ring orbit-ring-1" />
                        <div className="orbit-ring orbit-ring-2" />
                        <div className="orbit-core" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-[rgba(15,24,22,0.92)] border border-[rgba(38,255,169,0.12)] rounded-tl-sm flex items-center gap-1.5 h-[38px]">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-[#00F5A0] rounded-full" />
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#00D9FF] rounded-full" />
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#00F5A0] rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Embedded Live Task Queue Console */}
                {tasks.length > 0 && (
                  <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NEXUS Task Queue</span>
                      <span className="text-[7px] font-black bg-emerald-500/10 border border-emerald-400/20 text-[#00F5A0] px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                    </div>
                    <div className="flex flex-col gap-1 max-h-[85px] overflow-y-auto custom-scrollbar">
                      {tasks.slice(0, 3).map((task) => (
                        <div 
                          key={task.id} 
                          className="p-1.5 rounded-lg border border-emerald-400/10 bg-[#08100e]/60 flex items-center justify-between text-[10px] text-[#F4FFF9] group hover:border-[#00F5A0]/30 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={clsx(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              task.status === "running" ? "bg-cyan-400 animate-pulse" :
                              task.status === "completed" ? "bg-[#00F5A0]" : "bg-rose-500"
                            )} />
                            <span className="font-semibold truncate max-w-[180px] text-slate-300">{task.title}</span>
                          </div>
                          
                          <div className="text-right shrink-0 flex items-center gap-1.5 font-bold">
                            {task.status === "running" && (
                              <>
                                <span className="text-cyan-400 text-[8px]">{task.progress || 0}%</span>
                                <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${task.progress || 0}%` }} />
                                </div>
                              </>
                            )}
                            {task.status === "completed" && <span className="text-[#00F5A0] text-[8px] uppercase">Done</span>}
                            {task.status === "failed" && <span className="text-rose-400 text-[8px] uppercase">Failed</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Command History Suggestions */}
                {commandHistory.length > 0 && (
                  <div className="px-4 py-1.5 border-t border-white/5 flex flex-wrap gap-1.5 shrink-0 bg-white/[0.01]">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest self-center mr-1">Recent:</span>
                    {commandHistory.slice(0, 4).map((cmd, idx) => (
                      <button
                        key={idx}
                        onClick={() => runCommand(cmd)}
                        className="px-2 py-0.5 rounded bg-[rgba(15,24,22,0.8)] hover:bg-[#00F5A0]/10 border border-white/5 hover:border-[#00F5A0]/30 text-[9px] font-semibold text-slate-400 hover:text-[#00F5A0] truncate max-w-[120px] transition-all"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Action Capsules */}
                <div className="px-4 pb-2 pt-1.5 border-t border-white/5 flex overflow-x-auto custom-scrollbar gap-2 shrink-0 bg-white/[0.01]">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => runCommand(chip.command)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[rgba(15,24,22,0.8)] hover:bg-[#00F5A0]/10 border border-white/5 hover:border-[#00F5A0]/30 text-[9px] font-bold tracking-wider uppercase text-[#8FA79E] hover:text-[#00F5A0] transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      <chip.icon size={11} className="shrink-0" /> {chip.label}
                    </button>
                  ))}
                </div>

                {/* Voice & Keyboard Input Console Area */}
                <div className="p-4 bg-white/[0.01] border-t border-white/10 shrink-0">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex items-center gap-2"
                  >
                    {/* Microphone input trigger button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={clsx(
                        "w-11 h-11 rounded-xl border flex items-center justify-center transition-all shrink-0",
                        isListening 
                          ? "bg-rose-500/10 border-rose-500/35 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(251,113,133,0.2)]" 
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                      )}
                      title="Speak Command"
                    >
                      <Mic size={16} />
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? "Listening..." : "Ask NEXUS: dentist in London, crm sync..."}
                      className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-[#F4FFF9] placeholder:text-slate-500 focus:outline-none focus:border-[#00F5A0]/40 transition-colors"
                      disabled={isListening}
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || isListening}
                      className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00D9FF] text-black flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,245,160,0.45)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send size={15} className="ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
