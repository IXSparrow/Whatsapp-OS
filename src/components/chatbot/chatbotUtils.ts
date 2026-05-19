export const analyzeLeadsLocal = () => {
  try {
    const vaultData = JSON.parse(localStorage.getItem("whatsapp_leads_vault") || localStorage.getItem("extractedLeads") || "[]");
    
    if (!Array.isArray(vaultData) || vaultData.length === 0) {
      return "No extracted leads found yet. Run lead extraction first from the Lead Engine workspace.";
    }

    const totalLeads = vaultData.length;
    let whatsappReady = 0;
    let emailReady = 0;
    let missingWebsite = 0;
    let highPriority = 0;

    const categories: Record<string, number> = {};
    const locations: Record<string, number> = {};

    vaultData.forEach((lead: any) => {
      if (lead.phone) whatsappReady++;
      if (lead.email) emailReady++;
      if (!lead.website) missingWebsite++;
      if (lead.rating >= 4.5 && lead.phone) highPriority++;

      const cat = lead.category || "Unknown";
      categories[cat] = (categories[cat] || 0) + 1;

      const loc = lead.address ? lead.address.split(',').slice(-2, -1)[0]?.trim() || lead.address.split(',')[0] : "Unknown";
      locations[loc] = (locations[loc] || 0) + 1;
    });

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const topLocation = Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const missingPct = Math.round((missingWebsite / totalLeads) * 100);

    return `Here is your real lead analysis:
• Total leads: **${totalLeads}**
• WhatsApp-ready: **${whatsappReady}**
• Email-ready: **${emailReady}**
• Top category: **${topCategory}**
• Best location: **${topLocation}**
• Missing website: **${missingPct}%**
• High-priority leads: **${highPriority}**

**Next best action:** Start WhatsApp outreach with your ${highPriority} high-priority phone-ready leads first.`;
  } catch (error) {
    return "Error reading data vault. Please try again later.";
  }
};

export const getBotResponse = (userMessage: string, navigateTo: (route: string) => void): { reply: string, action?: string } => {
  const text = userMessage.toLowerCase();

  if (text.includes("analyze") || text.includes("lead report") || text.includes("analyze my leads")) {
    return { reply: analyzeLeadsLocal() };
  }

  if (text.includes("data vault")) {
    return { 
      reply: "The Data Vault securely stores all your extracted leads locally. You can export them to CSV, send them to the AI CRM, or start WhatsApp outreach directly from there.",
      action: "OPEN_DATA_VAULT" 
    };
  }

  if (text.includes("crm")) {
    return { 
      reply: "The AI CRM Dashboard provides deep analytics on your lead quality, revenue potential, pipeline stages, and automatically calculates tasks. I'll open it for you now.",
      action: "OPEN_CRM" 
    };
  }

  if (text.includes("whatsapp") || text.includes("outreach")) {
    return { 
      reply: "WhatsApp outreach uses the connected WhatsApp Web session to send personalized, AI-driven messages to your leads. Make sure you have extracted leads with valid phone numbers first.",
      action: "START_WHATSAPP" 
    };
  }

  if (text.includes("extract") || text.includes("lead") || text.includes("how to")) {
    return { 
      reply: "To extract leads, go to the 'Systems' workspace (Lead Engine). Select a Business Type and Location, set your Max Results, and click 'Run AI Extraction Engine'. Once completed, they will automatically save to your Data Vault." 
    };
  }

  if (text.includes("error") || text.includes("not working") || text.includes("fix") || text.includes("issue")) {
    return { 
      reply: "If you're facing issues:\n1. Check if your SerpAPI key is valid in Settings.\n2. Ensure you have an active internet connection.\n3. If 0 leads are extracted, try broader search terms.\n4. Check the Terminal Stream for specific AI agent error logs." 
    };
  }
  
  if (text.includes("dashboard") || text.includes("explain")) {
    return {
      reply: "Your workspace is divided into specific specialized modules:\n• **Pipeline OS:** The main hub to launch modules.\n• **Lead Engine:** Extracts leads using AI agents.\n• **Data Vault:** Securely stores your results.\n• **CRM Dashboard:** Analyzes revenue, quality, and pipeline."
    }
  }

  return { 
    reply: "I am the NEXUS AI Agent. I can help analyze your leads, explain dashboard features, open the CRM, or troubleshoot extraction issues. What can I assist you with today?" 
  };
};
