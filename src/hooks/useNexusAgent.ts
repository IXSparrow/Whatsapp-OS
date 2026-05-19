import { useState, useEffect } from "react";
import { parseNexusIntent, NexusIntent } from "../lib/nexusIntentParser";
import { setAppTheme } from "../lib/themeController";
import { speakFemale, isVoiceEnabled, setVoiceEnabled } from "../lib/nexusVoice";
import { createNexusLeadGenerationRequest } from "../lib/nexusLeadGenerationBridge";

export type NexusMessage = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  createdAt: string;
};

export type NexusTask = {
  id: string;
  type: "lead_generation" | "navigation" | "theme" | "outreach";
  status: "queued" | "running" | "completed" | "failed";
  title: string;
  payload: any;
  progress?: number;
  message?: string;
  count?: number;
  createdAt: string;
  completedAt?: string;
};

const WELCOME_MESSAGE: NexusMessage = {
  id: "welcome",
  role: "agent",
  content: "Hi, I’m NEXUS ORBIT AI. I can search leads automatically, open CRM pages, change light/dark themes, sync Data Vault, and prepare outreach campaign payloads. Ask me to find something, e.g., 'dentist in London'!",
  createdAt: new Date().toISOString()
};

export function useNexusAgent(navigateTo: (route: string) => void) {
  const [messages, setMessages] = useState<NexusMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabledState] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const [tasks, setTasks] = useState<NexusTask[]>([]);

  // Load chat, voice, command histories, pending intents, and tasks on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Voice Preference
    setVoiceEnabledState(isVoiceEnabled());

    // 2. Chat History
    try {
      const savedChat = localStorage.getItem("nexus_agent_chat_history");
      if (savedChat) {
        const parsed = JSON.parse(savedChat) as NexusMessage[];
        setMessages(parsed.slice(-20)); // Limit to last 20 messages
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    } catch (e) {
      setMessages([WELCOME_MESSAGE]);
    }

    // 3. Command History
    try {
      const savedCommands = localStorage.getItem("nexus_agent_command_history");
      if (savedCommands) {
        setCommandHistory(JSON.parse(savedCommands) as string[]);
      }
    } catch (e) {}

    // 4. Pending Intents
    try {
      const savedPending = localStorage.getItem("nexus_agent_pending_intent");
      if (savedPending) {
        setPendingIntent(JSON.parse(savedPending));
      }
    } catch (e) {}

    // 5. Tasks List
    try {
      const savedTasks = localStorage.getItem("nexus_agent_tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks) as NexusTask[]);
      }
    } catch (e) {}
  }, []);

  // Browser-wide lead generation event listeners for progress tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStarted = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { businessType, location } = customEvent.detail;
        
        // Add running task
        const newTaskId = Math.random().toString(36).substring(7);
        const newTask: NexusTask = {
          id: newTaskId,
          type: "lead_generation",
          status: "running",
          title: `Extract ${businessType} in ${location}`,
          payload: { businessType, location },
          progress: 0,
          count: 0,
          createdAt: new Date().toISOString()
        };

        setTasks(prev => {
          const updated = [newTask, ...prev].slice(0, 15);
          localStorage.setItem("nexus_agent_tasks", JSON.stringify(updated));
          return updated;
        });

        addSystemMessage(`Lead generation engine successfully started for **${businessType}** in **${location}**. Initializing crawlers...`);
      }
    };

    const handleProgress = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { progress, message, count } = customEvent.detail;
        
        setTasks(prev => {
          const updated = prev.map(t => {
            if (t.type === "lead_generation" && t.status === "running") {
              return { ...t, progress, message, count };
            }
            return t;
          });
          localStorage.setItem("nexus_agent_tasks", JSON.stringify(updated));
          return updated;
        });
      }
    };

    const handleCompleted = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { count } = customEvent.detail;
        
        setTasks(prev => {
          const updated = prev.map(t => {
            if (t.type === "lead_generation" && t.status === "running") {
              return { 
                ...t, 
                status: "completed", 
                progress: 100, 
                count, 
                message: "Completed", 
                completedAt: new Date().toISOString() 
              };
            }
            return t;
          });
          localStorage.setItem("nexus_agent_tasks", JSON.stringify(updated));
          return updated;
        });

        addSystemMessage(`Lead generation successfully completed! Found **${count}** real leads and saved them directly into your Data Vault.`);
      }
    };

    const handleFailed = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { error } = customEvent.detail;
        
        setTasks(prev => {
          const updated = prev.map(t => {
            if (t.type === "lead_generation" && t.status === "running") {
              return { 
                ...t, 
                status: "failed", 
                message: error, 
                completedAt: new Date().toISOString() 
              };
            }
            return t;
          });
          localStorage.setItem("nexus_agent_tasks", JSON.stringify(updated));
          return updated;
        });

        addSystemMessage(`Lead generation workflow extraction failed. Error: **${error}**`);
      }
    };

    window.addEventListener("nexus-lead-generation-started", handleStarted);
    window.addEventListener("nexus-lead-generation-progress", handleProgress);
    window.addEventListener("nexus-lead-generation-completed", handleCompleted);
    window.addEventListener("nexus-lead-generation-failed", handleFailed);

    return () => {
      window.removeEventListener("nexus-lead-generation-started", handleStarted);
      window.removeEventListener("nexus-lead-generation-progress", handleProgress);
      window.removeEventListener("nexus-lead-generation-completed", handleCompleted);
      window.removeEventListener("nexus-lead-generation-failed", handleFailed);
    };
  }, []);

  const saveChatHistory = (chatMessages: NexusMessage[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("nexus_agent_chat_history", JSON.stringify(chatMessages.slice(-20)));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  };

  const addSystemMessage = (content: string, role: "agent" | "system" = "agent") => {
    const newMsg: NexusMessage = {
      id: Math.random().toString(36).substring(7),
      role,
      content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => {
      const updated = [...prev, newMsg];
      localStorage.setItem("nexus_agent_chat_history", JSON.stringify(updated.slice(-20)));
      return updated;
    });
    
    if (role === "agent") {
      speakFemale(content.replace(/\*\*/g, ''));
    }
  };

  const toggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabledState(nextState);
    setVoiceEnabled(nextState);
    if (!nextState && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexus_agent_chat_history");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const addCommandToHistory = (cmd: string) => {
    if (!cmd.trim()) return;
    setCommandHistory(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== cmd.toLowerCase());
      const updated = [cmd, ...filtered].slice(0, 8);
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_agent_command_history", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const triggerNavigationRoute = (route: string, label: string) => {
    // Map intent routes to actual URL paths
    let urlPath = '/';
    if (route.startsWith('/crm')) {
      urlPath = '/crm';
    } else if (route === '/data-vault' || route === '/workspace/lead-generation' || route === '/systems') {
      urlPath = '/lead-engine';
    } else if (route.startsWith('/workspace/ai-whatsapp')) {
      urlPath = '/command-center';
    } else if (route === '/workspace/ai-lead-agent') {
      urlPath = '/ai-agents';
    } else if (route === '/settings' || route === '/help') {
      urlPath = '/settings';
    }
    
    navigateTo(urlPath);

    let tab = 'overview';
    if (route.startsWith('/crm')) {
      if (route === '/crm/reports') tab = 'reports';
      else if (route === '/crm/leads') tab = 'leads';
      else if (route === '/crm/revenue') tab = 'revenue';
      else if (route === '/crm/marketing') tab = 'marketing';
      else if (route === '/crm/opportunities') tab = 'opportunities';
      else if (route === '/crm/tasks') tab = 'tasks';
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nexus-navigate', {
          detail: { page: 'crm', tab }
        }));
      }, 300);
    } else if (route === '/workspace/ai-lead-agent') {
      // Already navigated to /ai-agents above
    } else if (route === '/data-vault') {
      setTimeout(() => {
        document.getElementById("data-vault")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  const executeNexusIntent = async (intent: NexusIntent, originalMessage: string): Promise<string> => {
    const isHinglish = /kholo|karo|dikhao|nikalo|chalu|badhiya|swagat|chal/i.test(originalMessage);

    switch (intent.type) {
      case "navigate": {
        triggerNavigationRoute(intent.route, intent.label);
        return isHinglish 
          ? `Ji bilkul! ${intent.label} open kar diya hai.` 
          : `Sure, I'm opening the ${intent.label} for you now.`;
      }

      case "theme": {
        setAppTheme(intent.mode);
        return isHinglish
          ? `Done! App ko ${intent.mode} theme me switch kar diya gaya hai.`
          : `Done. ${intent.mode === "dark" ? "Dark" : "Light"} mode is now active.`;
      }

      case "lead_generation": {
        if (intent.missing === "location") {
          const pending = {
            type: "lead_generation",
            businessType: intent.businessType,
            maxResults: intent.maxResults || 100,
            missing: "location"
          };
          setPendingIntent(pending);
          if (typeof window !== "undefined") {
            localStorage.setItem("nexus_agent_pending_intent", JSON.stringify(pending));
          }
          return isHinglish
            ? `Aapko **${intent.businessType}** leads kis location me chahiye? Jaise: London, Dubai, Delhi.`
            : `Which location should I search **${intent.businessType}** leads in? Example: London, Dubai, Delhi.`;
        }

        if (intent.missing === "businessType") {
          const pending = {
            type: "lead_generation",
            location: intent.location,
            maxResults: intent.maxResults || 100,
            missing: "businessType"
          };
          setPendingIntent(pending);
          if (typeof window !== "undefined") {
            localStorage.setItem("nexus_agent_pending_intent", JSON.stringify(pending));
          }
          return isHinglish
            ? `Aapko **${intent.location}** me kis tarah ke businesses ki list chahiye? Jaise: dentist, restaurant, gym.`
            : `Which business type should I search in **${intent.location}**? Example: dentist, restaurant, gym.`;
        }

        // Complete intent: trigger lead generation bridge!
        const payload = createNexusLeadGenerationRequest({
          businessType: intent.businessType || "",
          location: intent.location || "",
          maxResults: intent.maxResults || 100,
          autoStart: true
        });

        // Navigate to the correct Lead Engine page
        navigateTo('/lead-engine');

        return isHinglish
          ? `Bilkul! **${payload.businessType}** leads ke liye search shuru kar di hai **${payload.location}** me. Lead Generation panel load ho raha hai.`
          : `Starting lead generation for **${payload.businessType}** in **${payload.location}**. I'm opening the AI Lead Agent now.`;
      }

      case "whatsapp_outreach": {
        let outreachLeads: any[] = [];
        if (typeof window !== "undefined") {
          try {
            const rawCRM = localStorage.getItem("crmLeads") || "[]";
            const rawVault = localStorage.getItem("dataVaultLeads") || localStorage.getItem("nexus-lead-vault") || "[]";
            const parsedCRM = JSON.parse(rawCRM);
            const parsedVault = JSON.parse(rawVault);
            
            const rawLeads = parsedCRM.length > 0 ? parsedCRM : parsedVault;
            outreachLeads = rawLeads.filter((l: any) => l.phone || l.whatsapp || l.mobile || l.phoneNumber);
            
            localStorage.setItem("ai_whatsapp_outreach_leads", JSON.stringify(outreachLeads));
            localStorage.setItem("ai_whatsapp_outreach_source", "nexus-agent-lead-generation");
            localStorage.setItem("ai_whatsapp_outreach_created_at", new Date().toISOString());
          } catch (e) {
            console.error("Outreach packaging failed", e);
          }
        }

        navigateTo('/command-center');

        if (outreachLeads.length > 0) {
          return isHinglish
            ? `AI WhatsApp Operative open kar diya hai. Outreach list me ${outreachLeads.length} leads loaded hain.`
            : `Opening AI WhatsApp Operative with your ${outreachLeads.length} WhatsApp-ready leads.`;
        } else {
          return isHinglish
            ? "AI WhatsApp Operative open kar diya hai. Lekin outreach ke liye koi WhatsApp-ready leads nahi mile."
            : "I opened AI WhatsApp Operative. No WhatsApp-ready leads were found yet.";
        }
      }

      case "crm_sync": {
        if (typeof window !== "undefined") {
          try {
            const rawVault = localStorage.getItem("dataVaultLeads") || localStorage.getItem("nexus-lead-vault") || "[]";
            localStorage.setItem("crmLeads", rawVault);
            localStorage.setItem("crmInitialized", "true");
            
            window.dispatchEvent(new CustomEvent("nexus-crm-sync-request"));
            window.dispatchEvent(new CustomEvent("crm-data-refreshed"));
          } catch (e) {
            console.error("CRM Sync failed", e);
          }
        }
        navigateTo('/crm');
        return isHinglish
          ? "Data Vault se leads successfully sync kar di gayi hain. CRM workspace fully updated hai."
          : "Syncing CRM with Data Vault now. Active widgets and charts updated.";
      }

      case "export_csv": {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("nexus-export-csv-request"));
          window.dispatchEvent(new CustomEvent("nexus-export-csv"));
        }
        return isHinglish
          ? "Ji, CSV export file download link compile kar di hai."
          : "I'm preparing your CSV export file. Download starting now.";
      }

      case "help": {
        return isHinglish
          ? "Main pure workspace ko control kar sakti hoon! Aap mujhe Hindi ya English me standard commands bol sakte hain:\n• 'Open CRM' (Dashboard kholo)\n• 'Switch to dark theme' (Theme badlo)\n• 'Find gyms in Goa' (Leads nikalo)\n• 'Sync Data Vault' (Data refresh karo)\n• 'Start WhatsApp outreach' (Personalized campaign shuru karo)"
          : "I can control the entire workspace via chat! You can issue command queries like:\n• 'Open CRM dashboard' (Navigate views)\n• 'Switch to dark theme' (Theme toggler)\n• 'Find 50 cafes in Goa' (Lead generation extraction)\n• 'Sync Data Vault' (CRM database imports)\n• 'Start WhatsApp outreach' (Open outreach campaign)";
      }

      case "unknown":
      default: {
        return intent.type === "unknown" && intent.reply 
          ? intent.reply 
          : "I can open pages, control themes, start lead generation, open CRM, open AI WhatsApp, sync Data Vault, and prepare outreach. Tell me what you want to do.";
      }
    }
  };

  const runCommand = (commandText: string) => {
    if (!commandText.trim()) return;

    // 1. Add user message
    const userMessage: NexusMessage = {
      id: Date.now().toString(),
      role: "user",
      content: commandText,
      createdAt: new Date().toISOString()
    };

    const updatedWithUser = [...messages, userMessage];
    setMessages(updatedWithUser);
    saveChatHistory(updatedWithUser);
    setInput("");
    setIsTyping(true);
    addCommandToHistory(commandText);

    // 2. Simulate short human delay for intelligence experience
    setTimeout(async () => {
      let intent: NexusIntent;
      
      // Smart follow-up combined checks
      if (pendingIntent) {
        const queryText = commandText.trim().toLowerCase();
        
        if (pendingIntent.missing === "location") {
          const location = queryText.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          intent = {
            type: "lead_generation",
            businessType: pendingIntent.businessType,
            location: location,
            maxResults: pendingIntent.maxResults || 100,
            autoStart: true
          };
        } else {
          intent = {
            type: "lead_generation",
            businessType: queryText,
            location: pendingIntent.location,
            maxResults: pendingIntent.maxResults || 100,
            autoStart: true
          };
        }

        // Clear pending states
        setPendingIntent(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("nexus_agent_pending_intent");
        }
      } else {
        // Normal parse
        intent = parseNexusIntent(commandText);
      }

      const reply = await executeNexusIntent(intent, commandText);

      const agentMessage: NexusMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: reply,
        createdAt: new Date().toISOString()
      };

      const updatedWithAgent = [...updatedWithUser, agentMessage];
      setMessages(updatedWithAgent);
      saveChatHistory(updatedWithAgent);
      setIsTyping(false);

      speakFemale(reply.replace(/\*\*/g, ''));
    }, 850);
  };

  return {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage: () => runCommand(input),
    runCommand,
    clearChat,
    commandHistory,
    voiceEnabled,
    toggleVoice,
    tasks,
    setTasks
  };
}
