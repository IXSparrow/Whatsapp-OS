/**
 * Central route configuration for NexusOS.
 * Maps internal tab IDs to URL paths and vice versa.
 */

export type AppRoute = 
  | 'home'
  | 'lead_engine'
  | 'command-center'
  | 'whatsapp-operative'
  | 'conversations'
  | 'ai-agents'
  | 'campaigns'
  | 'lead-intel'
  | 'analytics'
  | 'workflows'
  | 'integrations'
  | 'system-config'
  | 'crm'
  | 'settings'
  | 'profile'
  | 'new_campaign';

/** Route definitions mapping URL paths to old internal state names */
export const ROUTE_CONFIG = {
  // Home / Landing
  '/': { appState: 'home', label: 'Home' },
  
  // Lead Engine (standalone module)
  '/lead-engine': { appState: 'lead_engine', label: 'Lead Engine' },
  
  // AI WhatsApp module tabs → individual routes
  '/command-center': { appState: 'ai_whatsapp', tab: 'dashboard', label: 'Command Center' },
  '/whatsapp-operative': { appState: 'ai_whatsapp', tab: 'operative', label: 'WhatsApp Operative' },
  '/conversations': { appState: 'ai_whatsapp', tab: 'conversations', label: 'Conversations' },
  '/ai-agents': { appState: 'ai_whatsapp', tab: 'agents', label: 'AI Agents' },
  '/campaigns': { appState: 'ai_whatsapp', tab: 'campaigns', label: 'Campaigns' },
  '/lead-intel': { appState: 'ai_whatsapp', tab: 'leads', label: 'Lead Intel' },
  '/analytics': { appState: 'ai_whatsapp', tab: 'analytics', label: 'Analytics' },
  '/workflows': { appState: 'ai_whatsapp', tab: 'workflows', label: 'Workflows' },
  '/integrations': { appState: 'ai_whatsapp', tab: 'integrations', label: 'Integrations' },
  '/system-config': { appState: 'ai_whatsapp', tab: 'settings', label: 'System Config' },
  
  // CRM
  '/crm': { appState: 'crm', label: 'CRM' },
  
  // Admin
  '/settings': { appState: 'settings', label: 'Settings' },
  '/profile': { appState: 'profile', label: 'Profile' },
  
  // Campaign builder
  '/campaigns/new': { appState: 'new_campaign', label: 'New Campaign' },
} as const;

/** Map old appState values → canonical URL paths */
export const APP_STATE_TO_PATH: Record<string, string> = {
  'home': '/',
  'lead_engine': '/lead-engine',
  'ai_whatsapp': '/command-center',
  'crm': '/crm',
  'settings': '/settings',
  'profile': '/profile',
  'new_campaign': '/campaigns/new',
};

/** Map AIWhatsAppModule tab IDs → URL paths */
export const TAB_TO_PATH: Record<string, string> = {
  'dashboard': '/command-center',
  'operative': '/whatsapp-operative',
  'conversations': '/conversations',
  'agents': '/ai-agents',
  'campaigns': '/campaigns',
  'leads': '/lead-intel',
  'analytics': '/analytics',
  'workflows': '/workflows',
  'integrations': '/integrations',
  'settings': '/system-config',
};

/** Map URL path → AIWhatsAppModule tab ID */
export const PATH_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab])
);

/** Determines the correct URL path for a given old-style appState + optional tab */
export function getPathForState(appState: string, tab?: string): string {
  if (appState === 'ai_whatsapp' && tab && TAB_TO_PATH[tab]) {
    return TAB_TO_PATH[tab];
  }
  return APP_STATE_TO_PATH[appState] || '/';
}
