import { config } from "@/lib/config";
import type { BusinessLead, Role } from "@/types/globe";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Globe-Role": "Owner",
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Globe API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const globeApi = {
  crawlBusinesses(payload: { country: string; state: string; district: string; industry: string }) {
    return request<BusinessLead[]>("/crawl/businesses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  addManualUser(payload: { name: string; email: string; mobile: string; username: string; password: string; role: Role }) {
    return request<{ email: string; username: string; status: string }>("/team/manual-users", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
