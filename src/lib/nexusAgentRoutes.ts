export const NEXUS_ROUTES = {
  home: "/",
  workspace: "/workspace",

  crm: "/crm",
  crmOverview: "/crm/overview",
  crmReports: "/crm/reports",
  crmLeads: "/crm/leads",
  crmRevenue: "/crm/revenue",
  crmMarketing: "/crm/marketing",
  crmOpportunities: "/crm/opportunities",
  crmTasks: "/crm/tasks",

  dataVault: "/data-vault",

  aiWhatsapp: "/workspace/ai-whatsapp/operative",
  aiLeadAgent: "/workspace/ai-lead-agent",
  leadGeneration: "/workspace/lead-generation",

  systems: "/systems",
  settings: "/settings",
  help: "/help"
};

/**
 * Resolves a virtual route from NEXUS_ROUTES into the corresponding SPA state/tabs.
 * Since this application uses a state-based single-page-app layout, this helper
 * dispatches the appropriate browser events to switch page views and tabs.
 */
export function resolveSPARoute(route: string, navigateTo: (state: string) => void) {
  if (!route) return;

  if (route === "/" || route === "/workspace") {
    navigateTo("home");
    return;
  }

  if (route.startsWith("/crm")) {
    navigateTo("crm");
    let tab = "overview";
    if (route === "/crm/reports") tab = "reports";
    else if (route === "/crm/leads") tab = "leads";
    else if (route === "/crm/revenue") tab = "revenue";
    else if (route === "/crm/marketing") tab = "marketing";
    else if (route === "/crm/opportunities") tab = "opportunities";
    else if (route === "/crm/tasks") tab = "tasks";
    
    // Dispatch navigation event to change internal tab after mounting
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("nexus-navigate", {
        detail: { page: "crm", tab }
      }));
    }, 100);
    return;
  }

  if (route === "/data-vault") {
    navigateTo("lead_engine");
    setTimeout(() => {
      document.getElementById("data-vault")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
    return;
  }

  if (route === "/workspace/ai-whatsapp/operative") {
    navigateTo("ai_whatsapp");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("nexus-navigate", {
        detail: { page: "ai_whatsapp", tab: "dashboard" }
      }));
    }, 100);
    return;
  }

  if (route === "/workspace/ai-lead-agent") {
    navigateTo("ai_whatsapp");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("nexus-navigate", {
        detail: { page: "ai_whatsapp", tab: "agents" }
      }));
    }, 100);
    return;
  }

  if (route === "/workspace/lead-generation" || route === "/systems") {
    navigateTo("lead_engine");
    return;
  }

  if (route === "/settings") {
    navigateTo("settings");
    return;
  }

  if (route === "/help") {
    navigateTo("settings");
    return;
  }
}
