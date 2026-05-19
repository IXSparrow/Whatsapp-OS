export interface NexusLeadGenerationRequest {
  id: string;
  businessType: string;
  location: string;
  maxResults: number;
  autoStart: boolean;
  source: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
}

export function createNexusLeadGenerationRequest(input: {
  businessType: string;
  location: string;
  maxResults?: number;
  autoStart?: boolean;
}): NexusLeadGenerationRequest {
  const request: NexusLeadGenerationRequest = {
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36),
    businessType: input.businessType,
    location: input.location,
    maxResults: input.maxResults || 100,
    autoStart: input.autoStart ?? true,
    source: "nexus-agent",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("nexus_lead_generation_request", JSON.stringify(request));
    
    // Dispatch custom event for real-time active pages to capture instantly
    window.dispatchEvent(
      new CustomEvent("nexus-lead-generation-request", {
        detail: request
      })
    );
  }

  return request;
}

export function getNexusLeadGenerationRequest(): NexusLeadGenerationRequest | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("nexus_lead_generation_request");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as NexusLeadGenerationRequest;
  } catch (e) {
    return null;
  }
}

export function clearNexusLeadGenerationRequest() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nexus_lead_generation_request");
  }
}

export function dispatchNexusLeadGenerationRequest(payload: NexusLeadGenerationRequest) {
  if (typeof window !== "undefined") {
    localStorage.setItem("nexus_lead_generation_request", JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent("nexus-lead-generation-request", {
        detail: payload
      })
    );
  }
}
