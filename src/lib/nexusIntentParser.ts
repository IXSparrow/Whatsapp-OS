export type NexusIntent =
  | { type: "navigate"; route: string; label: string }
  | { type: "theme"; mode: "dark" | "light" }
  | { type: "lead_generation"; businessType?: string; location?: string; maxResults?: number; autoStart?: boolean; missing?: "businessType" | "location" }
  | { type: "whatsapp_outreach"; source?: "crm" | "data-vault" | "current" }
  | { type: "crm_sync" }
  | { type: "export_csv" }
  | { type: "help" }
  | { type: "unknown"; reply: string };

export const COMMON_BUSINESS_TYPES = [
  "dentist", "dental clinic", "doctor", "clinic", "hospital", "medical center",
  "restaurant", "cafe", "hotel", "gym", "salon", "spa", "real estate", "school",
  "college", "coaching center", "lawyer", "advocate", "web design agency",
  "digital marketing agency", "travel agency", "car dealer", "interior designer",
  "construction company", "cosmetic dentist", "ecommerce store", "plumber",
  "electrician", "mechanic", "bakery", "boutique", "furniture store", "jewelry store",
  "fitness center", "yoga studio", "photographer", "event planner", "coaching"
];

// Helper to sanitize noise words from candidate business type
function cleanBusinessNoise(text: string): string {
  return text
    .replace(/^(find|extract|get|generate|search|real|leads|leads\s+for|search\s+for|extract\s+leads\s+for|generate\s+leads\s+for|me|in|near|at|from|mumbai|delhi|london|dubai|goa|new\s+york|bangalore|50|100|200|10|25|number|high\s+priority)\s+/gi, '')
    .replace(/\s+(leads|leads\s+in|leads\s+for|in|near|at|from|me|mein|nikalo|find|karo|kholo|mumbai|delhi|london|dubai|goa|new\s+york|bangalore)$/gi, '')
    .trim();
}

export function extractBusinessType(text: string): string | undefined {
  const cleanText = text.toLowerCase().trim();

  const sortedTypes = [...COMMON_BUSINESS_TYPES].sort((a, b) => b.length - a.length);
  for (const type of sortedTypes) {
    const regex = new RegExp(`\\b${type}\\b`, 'i');
    if (regex.test(cleanText)) {
      return type;
    }
  }

  const patterns = [
    /(?:leads\s+for|search\s+for|extract|find|get|generate)\s+([a-zA-Z\s]+?)(?:\s+in\s+|\s+near\s+|\s+from\s+|\s+at\s+|\s+me\s+|\s+mein\s+)/i,
    /([a-zA-Z\s]+?)\s+leads\s+in/i,
    /([a-zA-Z\s]+?)\s+leads\s+find/i,
    /([a-zA-Z\s]+?)\s+leads\s+nikalo/i,
    /([a-zA-Z\s]+?)\s+(?:in|near|from|at)\s+[a-zA-Z]+/i
  ];

  for (const regex of patterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const cleaned = cleanBusinessNoise(match[1]);
      if (cleaned.length > 2) {
        return cleaned;
      }
    }
  }

  return undefined;
}

export function extractLocation(text: string): string | undefined {
  const cleanText = text.toLowerCase().trim();

  const patterns = [
    /(?:in|near|from|at)\s+([a-zA-Z\s]+?)(?:\s+kholo|\s+leads|\s+nikalo|\s+find|\s+generate|\s+karo|$)/i,
    /\b([a-zA-Z\s]+?)\s+(?:me|mein|ke\s+leads|se\s+leads)\b/i,
    /(?:dentist|clinic|restaurant|gym|salon|hotel|cafe|plumber|real estate|lawyer|school|spa)\s+([a-zA-Z\s]+)$/i
  ];

  for (const regex of patterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const loc = match[1].trim();
      const cleaned = loc.replace(/(?:leads|find|generate|karo|nikalo|kholo|dashboard|engine|operative|vault|system|karke|se|ke|me|mein)/gi, '').trim();
      if (cleaned.length > 1) {
        return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }

  const words = cleanText.split(/\s+/);
  if (words.length >= 2) {
    const lastWord = words[words.length - 1];
    if (
      isNaN(Number(lastWord)) && 
      !COMMON_BUSINESS_TYPES.includes(lastWord) && 
      !["leads", "find", "get", "extract", "generate", "in", "near", "at", "me", "mein", "nikalo"].includes(lastWord)
    ) {
      return lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
    }
  }

  return undefined;
}

export function extractMaxResults(text: string): number | undefined {
  const match = text.match(/\b(\d+)\b/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num <= 500) {
      return num;
    }
  }
  return undefined;
}

export function isBusinessLocationQuery(text: string): boolean {
  const business = extractBusinessType(text);
  const location = extractLocation(text);
  return Boolean(business && location);
}

// Highly sophisticated conversational reply generator for any type of general query
export function generateConversationalReply(query: string): string {
  const clean = query.toLowerCase().trim();
  const isHinglish = /kholo|karo|dikhao|nikalo|chalu|badhiya|swagat|chal|kaise|bol|batao|kya|hai|tu|apna/i.test(query);

  // 1. GREETINGS & INTRODUCTIONS
  if (clean === "hi" || clean === "hello" || clean === "hey" || clean === "sup" || clean === "yo") {
    return isHinglish
      ? "Namaste! Main **NEXUS ORBIT AI** assistant hoon. Main aapke business ke liye leads generate kar sakti hoon aur WhatsApp outreach auto-run kar sakti hoon. Kaise help karu?"
      : "Hello! I am **NEXUS ORBIT AI**, your autonomous SaaS assistant. I can scrape high-value leads, manage your CRM pipeline, change dark/light themes, and launch outreach campaigns. What can I do for you today?";
  }
  if (clean.includes("how are you") || clean.includes("kaise ho") || clean.includes("kya haal hai")) {
    return isHinglish
      ? "Main ekdum badhiya hoon! Aap bataiye, aaj kon sa task schedule ya automate karna hai?"
      : "I'm running at peak computational efficiency! Ready to automate your lead pipelines and outreach today. How are you doing?";
  }
  if (clean.includes("who are you") || clean.includes("your name") || clean.includes("tumhara naam") || clean.includes("kaun ho")) {
    return isHinglish
      ? "Mera naam **NEXUS ORBIT AI** hai. Main is Premium AI operating system ki autonomous operator hoon!"
      : "I am **NEXUS ORBIT AI**, the autonomous command operator designed to control lead generation, CRM pipelines, and WhatsApp outreach in this workspace.";
  }

  // 2. LEAD GENERATION ADVICE & FAQs
  if (
    clean.includes("how to get leads") || 
    clean.includes("lead kaise") || 
    clean.includes("find customers") || 
    clean.includes("marketing advice") ||
    clean.includes("strategy")
  ) {
    return isHinglish
      ? "Leads find karne ka sabse badhiya tarika: \n1. Chat me type kijiye: **'dentist in London'** ya **'gym in Delhi'**.\n2. NEXUS automation engine Google Places se real-time map reviews aur listings fetch karega.\n3. Automatic filter aur clean karke Data Vault me save kar dega!"
      : "To capture high-quality leads dynamically: \n1. Type directly in this chat, e.g., **'restaurant in Dubai'**.\n2. Our scraping engine fetches verified details (names, ratings, websites, phone numbers) from Google Maps.\n3. It filters low-quality listings (under 4 stars) and automatically saves clean records into the Data Vault.";
  }

  // 3. WHATSAPP OUTREACH COMPLIANCE & SAFETY
  if (
    clean.includes("whatsapp ban") || 
    clean.includes("anti spam") || 
    clean.includes("spam protection") || 
    clean.includes("safe outreach") ||
    clean.includes("avoid spam")
  ) {
    return isHinglish
      ? "WhatsApp outreach ko safe rakhne aur ban se bachne ke liye:\n1. Ek personalized message template use karein (jaise `{name}` use karein).\n2. Messages ke beech **15 to 30 seconds** ka custom random delay set karein.\n3. Direct bulk marketing ki jagah friendly conversational hook send karein."
      : "To maintain 100% WhatsApp deliverability and prevent numbers from being flagged:\n1. **Personalize templates**: Use variables like `{name}` or `{rating}` dynamically.\n2. **Custom Delays**: Inject random 15-30 second intervals between consecutive messages.\n3. **Safety Modal**: Our visual safety modal acts as a double-verification step before launching campaigns.";
  }

  // 4. COPYWRITING & TEMPLATE GENERATORS
  if (
    clean.includes("write message") || 
    clean.includes("write template") || 
    clean.includes("outreach message") || 
    clean.includes("message template") || 
    clean.includes("cold message") ||
    clean.includes("template likho")
  ) {
    return isHinglish
      ? "Ji! Ye raha ek high-converting WhatsApp outreach template jo aap use kar sakte hain:\n\n*\"Hi {name},* \n*Main aapki {location} me listing dekh raha tha. Aapki reviews (Rating: {rating}⭐) sach me bohot badhiya hain! Hamari team ne dekha ki hum aapke business me automated WhatsApp bookings chalu karke appointments double kar sakte hain. Kya hum next week ek quick call par baat karein?\"*"
      : "Here is a highly effective, professional outreach copy optimized for conversions:\n\n*\"Hi {name},* \n*I came across your business in {location}. Your ratings ({rating}⭐) are impressive! I noticed a couple of simple integrations on your site that could double your customer inquiries using WhatsApp workflows. Are you open to a brief 5-minute call next Tuesday? Best, [Your Name]\"*";
  }

  // 5. DATA SYNCING & CRM INFO
  if (clean.includes("data vault") || clean.includes("crm leads") || clean.includes("what is crm")) {
    return isHinglish
      ? "CRM (Customer Relationship Management) aapke prospects ko deals me convert karne me help karta hai. Jab aap business leads extract karte hain, aap simple **'sync Data Vault'** command se saari data direct pipeline me load kar sakte hain."
      : "The CRM module lets you manage extracted leads through active stages. Syncing is simple—just issue the command **'sync CRM'** or click the 'Fetch From Data Vault' button to import clean extracted records directly into your opportunities pipeline.";
  }

  // 6. GENERIC CONVERSATIONAL REPLIES (Contextual Noun Extraction Fallback)
  // Extracts primary nouns to make the reply feel custom-tailored to the topic!
  const words = clean.split(/\s+/);
  const coreSubject = words.find(w => w.length > 4 && !["about", "write", "please", "could", "would", "kardo", "karke", "batao", "karna"].includes(w));
  
  if (coreSubject) {
    const subjectCapitalized = coreSubject.charAt(0).toUpperCase() + coreSubject.slice(1);
    return isHinglish
      ? `Main **${subjectCapitalized}** ke baare me seekh rahi hoon! Lekin abhi main fully optimized hoon aapke Lead Generation, CRM pipelines, aur automated outreach templates ko manage karne ke liye. Kya main aapke liye iske related koi workflow start karu?`
      : `Interesting point about **${subjectCapitalized}**! While I explore more about that, I am fully equipped to handle your B2B Lead generation, CRM deals, and personalized WhatsApp outreach workflows right now. Would you like me to trigger a business extraction or open a dashboard?`;
  }

  return isHinglish
    ? "Aapki request received ho gayi hai! Main pages open kar sakti hoon, theme badal sakti hoon, dentist leads in London find kar sakti hoon, aur campaigns trigger kar sakti hoon. Kripya bataiye kya help chahiye?"
    : "I received your request! I am fully optimized to run custom B2B searches, switch theme colors, sync CRM databases, and manage WhatsApp campaigns. Tell me what you would like to execute in the workspace!";
}

export function parseNexusIntent(message: string): NexusIntent {
  const query = message.toLowerCase().trim();

  // --- 1. HELP / INFO COMMANDS ---
  if (
    query.includes("help") || 
    query.includes("madad") || 
    query.includes("guide") || 
    query.includes("kya kar sakte ho") ||
    query.includes("what can you do")
  ) {
    return { type: "help" };
  }

  // --- 2. THEME MODE COMMANDS ---
  if (
    query.includes("turn dark mode") ||
    query.includes("dark mode on") ||
    query.includes("switch to dark") ||
    query.includes("dark theme chalu karo") ||
    query.includes("dark mode chalu karo") ||
    query.includes("dark karo")
  ) {
    return { type: "theme", mode: "dark" };
  }

  if (
    query.includes("turn light mode") ||
    query.includes("light mode on") ||
    query.includes("switch to light") ||
    query.includes("light theme chalu karo") ||
    query.includes("light mode chalu karo") ||
    query.includes("light karo")
  ) {
    return { type: "theme", mode: "light" };
  }

  // --- 3. EXPORT CSV COMMANDS ---
  if (
    query.includes("export csv") || 
    query.includes("csv download karo") || 
    query.includes("export leads") ||
    query.includes("leads download karo")
  ) {
    return { type: "export_csv" };
  }

  // --- 4. CRM SYNC / REFRESH COMMANDS ---
  if (
    query.includes("sync crm") ||
    query.includes("refresh crm") ||
    query.includes("sync data vault") ||
    query.includes("fetch data vault") ||
    query.includes("sync data") ||
    query.includes("vault sync karo")
  ) {
    return { type: "crm_sync" };
  }

  // --- 5. WHATSAPP OUTREACH COMMANDS ---
  if (
    query.includes("start whatsapp outreach") ||
    query.includes("open whatsapp outreach") ||
    query.includes("message these leads") ||
    query.includes("whatsapp campaign start karo") ||
    query.includes("ai whatsapp kholo") ||
    query.includes("whatsapp automation kholo") ||
    query.includes("outreach start karo")
  ) {
    const source = query.includes("crm") ? "crm" : query.includes("vault") ? "data-vault" : "current";
    return { type: "whatsapp_outreach", source };
  }

  // --- 6. LEAD GENERATION / EXTRACTION COMMANDS ---
  const businessType = extractBusinessType(message);
  const location = extractLocation(message);
  const maxResults = extractMaxResults(message) || 100;

  const hasLeadKeywords = 
    query.includes("find leads") ||
    query.includes("generate leads") ||
    query.includes("leads find karo") ||
    query.includes("leads nikalo") ||
    query.includes("lead extraction") ||
    query.includes("extraction start") ||
    query.includes("google maps");

  if (hasLeadKeywords || (businessType && location)) {
    return {
      type: "lead_generation",
      businessType,
      location,
      maxResults,
      autoStart: Boolean(businessType && location)
    };
  }

  if (businessType && !location && (query.includes("find") || query.includes("generate") || query.includes("leads") || COMMON_BUSINESS_TYPES.includes(query))) {
    return {
      type: "lead_generation",
      businessType,
      missing: "location"
    };
  }

  // --- 7. NAVIGATION COMMANDS ---
  if (
    query.includes("open crm dashboard") ||
    query.includes("crm dashboard kholo") ||
    query.includes("crm open karo") ||
    query.includes("go to crm") ||
    query.includes("open crm")
  ) {
    return { type: "navigate", route: "/crm/overview", label: "CRM Dashboard" };
  }

  if (query.includes("open reports") || query.includes("reports page kholo") || query.includes("reports kholo")) {
    return { type: "navigate", route: "/crm/reports", label: "CRM Reports" };
  }

  if (query.includes("open leads") || query.includes("leads page kholo") || query.includes("leads kholo")) {
    return { type: "navigate", route: "/crm/leads", label: "CRM Leads" };
  }

  if (query.includes("open revenue") || query.includes("revenue page kholo") || query.includes("revenue kholo")) {
    return { type: "navigate", route: "/crm/revenue", label: "CRM Revenue" };
  }

  if (query.includes("open marketing") || query.includes("marketing page kholo") || query.includes("marketing kholo")) {
    return { type: "navigate", route: "/crm/marketing", label: "CRM Marketing" };
  }

  if (query.includes("open opportunities") || query.includes("opportunities kholo") || query.includes("opportunities dikhao")) {
    return { type: "navigate", route: "/crm/opportunities", label: "CRM Opportunities" };
  }

  if (query.includes("open tasks") || query.includes("tasks page kholo") || query.includes("tasks kholo")) {
    return { type: "navigate", route: "/crm/tasks", label: "CRM Tasks" };
  }

  if (query.includes("open data vault") || query.includes("data vault kholo") || query.includes("vault open karo") || query.includes("data vault")) {
    return { type: "navigate", route: "/data-vault", label: "Data Vault" };
  }

  if (query.includes("open workspace") || query.includes("open systems") || query.includes("systems kholo")) {
    return { type: "navigate", route: "/systems", label: "Systems Workspace" };
  }

  if (query.includes("open settings") || query.includes("settings kholo") || query.includes("settings open karo")) {
    return { type: "navigate", route: "/settings", label: "Settings" };
  }

  if (
    query.includes("open ai whatsapp") || 
    query.includes("whatsapp agent kholo") || 
    query.includes("open ai operative")
  ) {
    return { type: "navigate", route: "/workspace/ai-whatsapp/operative", label: "AI WhatsApp Operative" };
  }

  if (query.includes("open ai lead agent") || query.includes("lead agent kholo")) {
    return { type: "navigate", route: "/workspace/ai-lead-agent", label: "AI Lead Agent" };
  }

  if (query.includes("open lead generation") || query.includes("lead generate page kholo") || query.includes("lead generation page")) {
    return { type: "navigate", route: "/workspace/lead-generation", label: "Lead Generation" };
  }

  if (query.includes("show high priority leads") || query.includes("priority leads")) {
    return { type: "navigate", route: "/crm/opportunities", label: "CRM Priority Leads" };
  }

  if (query.includes("show valid leads") || query.includes("show revenue report")) {
    return { type: "navigate", route: "/crm/revenue", label: "CRM Revenue" };
  }

  // --- 8. DYNAMIC CONVERSATIONAL FALLBACK ---
  // When no specific control commands are matched, invoke the sophisticated Local Conversational AI
  return {
    type: "unknown",
    reply: generateConversationalReply(message)
  };
}
