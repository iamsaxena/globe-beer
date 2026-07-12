import "server-only";
import { pbkdf2Sync, randomBytes, randomUUID } from "crypto";

export type LeadRecord = {
  id: string;
  name: string;
  category: string;
  address?: string;
  phone: string;
  email?: string;
  website?: string;
  maps?: string;
  source: string;
  agent?: string;
  lead_status: string;
  leadStatus?: string;
  actionable?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ManualUserRecord = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
};

export type ExportRecord = {
  id: string;
  name: string;
  export_type: string;
  rows: number;
  destination: string;
  status: string;
  created_at: string;
};

type MemoryStore = {
  leads: LeadRecord[];
  users: ManualUserRecord[];
  exports: ExportRecord[];
};

const globalStore = globalThis as typeof globalThis & { globeStore?: MemoryStore };

function memory(): MemoryStore {
  globalStore.globeStore ??= { leads: [], users: [], exports: [] };
  return globalStore.globeStore;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function supabaseRequest<T>(table: string, init: RequestInit = {}): Promise<T | null> {
  const config = supabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const iterations = 120000;
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

export async function listLeads(): Promise<LeadRecord[]> {
  const remote = await supabaseRequest<LeadRecord[]>("leads?select=*&order=created_at.desc");
  return remote ?? memory().leads;
}

export async function upsertLeads(records: Array<Omit<LeadRecord, "created_at" | "updated_at">>) {
  const now = new Date().toISOString();
  const leads = records.map((record) => ({
    id: record.id || randomUUID(),
    name: record.name,
    category: record.category,
    address: record.address,
    phone: record.phone,
    email: record.email,
    website: record.website,
    maps: record.maps,
    source: record.source,
    agent: record.agent ?? "",
    lead_status: record.lead_status ?? record.leadStatus ?? "Not Contacted",
    actionable: record.actionable ?? "",
    notes: record.notes ?? "",
    created_at: now,
    updated_at: now
  }));
  const remote = await supabaseRequest<LeadRecord[]>("leads?on_conflict=phone", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(leads)
  });
  if (remote) return remote;

  const store = memory();
  for (const lead of leads) {
    const index = store.leads.findIndex((item) => item.phone === lead.phone);
    if (index >= 0) store.leads[index] = { ...store.leads[index], ...lead, created_at: store.leads[index].created_at, updated_at: now };
    else store.leads.unshift(lead);
  }
  return store.leads;
}

export async function updateLead(id: string, patch: Partial<LeadRecord>) {
  const updated_at = new Date().toISOString();
  const dbPatch = {
    ...patch,
    lead_status: patch.lead_status ?? patch.leadStatus,
    leadStatus: undefined,
    updated_at
  };
  const remote = await supabaseRequest<LeadRecord[]>(`leads?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(dbPatch)
  });
  if (remote) return remote[0];

  const store = memory();
  const index = store.leads.findIndex((lead) => lead.id === id);
  if (index < 0) return null;
  store.leads[index] = {
    ...store.leads[index],
    ...patch,
    lead_status: patch.lead_status ?? patch.leadStatus ?? store.leads[index].lead_status,
    leadStatus: undefined,
    updated_at
  };
  return store.leads[index];
}

export async function createManualUser(payload: Omit<ManualUserRecord, "id" | "created_at" | "password_hash"> & { password: string }) {
  const record: ManualUserRecord = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    username: payload.username,
    password_hash: hashPassword(payload.password),
    role: payload.role,
    created_at: new Date().toISOString()
  };
  const remote = await supabaseRequest<ManualUserRecord[]>("manual_users", { method: "POST", body: JSON.stringify(record) });
  if (remote) return { ...remote[0], password_hash: undefined };
  memory().users.unshift(record);
  return { ...record, password_hash: undefined };
}

export async function listUsers() {
  const remote = await supabaseRequest<ManualUserRecord[]>("manual_users?select=id,name,email,mobile,username,role,created_at&order=created_at.desc");
  return remote ?? memory().users.map(({ password_hash: _password_hash, ...user }) => user);
}

export async function addExport(record: Omit<ExportRecord, "id" | "created_at">) {
  const exportRecord = { ...record, id: randomUUID(), created_at: new Date().toISOString() };
  const remote = await supabaseRequest<ExportRecord[]>("exports", { method: "POST", body: JSON.stringify(exportRecord) });
  if (remote) return remote[0];
  memory().exports.unshift(exportRecord);
  return exportRecord;
}

export async function listExports() {
  const remote = await supabaseRequest<ExportRecord[]>("exports?select=*&order=created_at.desc");
  return remote ?? memory().exports;
}

export async function metrics() {
  const leads = await listLeads();
  return {
    leadsGenerated: leads.length,
    contacted: leads.filter((lead) => lead.lead_status === "Contacted").length,
    notContacted: leads.filter((lead) => lead.lead_status === "Not Contacted").length,
    followUps: leads.filter((lead) => lead.lead_status === "Call Back Request").length,
    disconnected: leads.filter((lead) => lead.lead_status === "Disconnected").length,
    quoteSent: leads.filter((lead) => lead.lead_status === "Quote Sent").length,
    exports: (await listExports()).length
  };
}
