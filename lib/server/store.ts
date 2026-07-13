import "server-only";
import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "crypto";

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
  profile_pic?: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at?: string;
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
const adminUsername = "whoshobhitsaxena@gmail.com";
const adminPassword = process.env.GLOBE_ADMIN_PASSWORD ?? "Password";
const defaultAdmin: ManualUserRecord = {
  id: "admin-shobhit-saxena",
  name: "Shobhit Saxena",
  email: adminUsername,
  mobile: "",
  username: adminUsername,
  profile_pic: "",
  password_hash: "",
  role: "Admin",
  created_at: "2026-07-13T00:00:00.000Z"
};

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

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterationsText, salt, expectedHash] = storedHash.split("$");
  if (scheme !== "pbkdf2_sha256" || !iterationsText || !salt || !expectedHash) return false;
  const iterations = Number(iterationsText);
  if (!Number.isFinite(iterations)) return false;
  const actual = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
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
  if (payload.username === adminUsername || payload.email === adminUsername) {
    throw new Error("Built-in admin already exists.");
  }
  const record: ManualUserRecord = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    username: payload.username,
    profile_pic: payload.profile_pic ?? "",
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
  const remote = await supabaseRequest<ManualUserRecord[]>("manual_users?select=id,name,email,mobile,username,profile_pic,role,created_at,updated_at&order=created_at.desc");
  const users = remote ?? memory().users.map(({ password_hash: _password_hash, ...user }) => user as ManualUserRecord);
  const hasAdmin = users.some((user) => user.username === adminUsername);
  const admin = { ...defaultAdmin, password_hash: undefined };
  return hasAdmin ? users : [admin, ...users];
}

export async function hasManualUsers() {
  return true;
}

export async function findManualUserByUsername(username: string) {
  const normalized = username.trim();
  if (!normalized) return null;
  const remote = await supabaseRequest<ManualUserRecord[]>(`manual_users?select=*&username=eq.${encodeURIComponent(normalized)}&limit=1`);
  const stored = remote ? remote[0] ?? null : memory().users.find((user) => user.username === normalized) ?? null;
  if (stored) return stored;
  return normalized === adminUsername ? defaultAdmin : null;
}

export function isBuiltInAdmin(user?: { username?: string; role?: string } | null) {
  return user?.username === adminUsername && user.role === "Admin";
}

export function isAdmin(user?: { username?: string; role?: string } | null) {
  return user?.role === "Admin" || user?.username === adminUsername;
}

export function verifyManualUserPassword(user: ManualUserRecord, password: string) {
  if (user.username === adminUsername && !user.password_hash) return password === adminPassword;
  return verifyPassword(password, user.password_hash);
}

export async function updateManualUserProfile(username: string, patch: Partial<Pick<ManualUserRecord, "name" | "mobile" | "profile_pic">>) {
  const user = await findManualUserByUsername(username);
  if (!user) return null;
  const updated_at = new Date().toISOString();
  const next = {
    ...user,
    name: patch.name ?? user.name,
    mobile: patch.mobile ?? user.mobile,
    profile_pic: patch.profile_pic ?? user.profile_pic ?? "",
    updated_at
  };
  if (user.username === adminUsername && !user.password_hash) {
    next.password_hash = hashPassword(adminPassword);
  }
  const remote = await supabaseRequest<ManualUserRecord[]>(`manual_users?username=eq.${encodeURIComponent(username)}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: next.name,
      mobile: next.mobile,
      profile_pic: next.profile_pic,
      updated_at
    })
  });
  if (remote?.[0]) return remote[0];
  if (Array.isArray(remote) && remote.length === 0) {
    const inserted = await supabaseRequest<ManualUserRecord[]>("manual_users", { method: "POST", body: JSON.stringify(next) });
    if (inserted?.[0]) return inserted[0];
  }
  const store = memory();
  const index = store.users.findIndex((item) => item.username === username);
  if (index >= 0) store.users[index] = { ...store.users[index], ...next };
  else store.users.unshift(next);
  return next;
}

export async function changeManualUserPassword(username: string, currentPassword: string, nextPassword: string) {
  const user = await findManualUserByUsername(username);
  if (!user || !verifyManualUserPassword(user, currentPassword)) return null;
  const password_hash = hashPassword(nextPassword);
  const updated_at = new Date().toISOString();
  const baseRecord = user.username === adminUsername && !user.password_hash
    ? { ...defaultAdmin, password_hash }
    : { ...user, password_hash };
  const remote = await supabaseRequest<ManualUserRecord[]>(`manual_users?username=eq.${encodeURIComponent(username)}`, {
    method: "PATCH",
    body: JSON.stringify({ password_hash, updated_at })
  });
  if (remote?.[0]) return remote[0];
  if (Array.isArray(remote) && remote.length === 0) {
    const inserted = await supabaseRequest<ManualUserRecord[]>("manual_users", { method: "POST", body: JSON.stringify({ ...baseRecord, updated_at }) });
    if (inserted?.[0]) return inserted[0];
  }
  const store = memory();
  const index = store.users.findIndex((item) => item.username === username);
  if (index >= 0) store.users[index] = { ...store.users[index], password_hash, updated_at };
  else store.users.unshift({ ...baseRecord, updated_at });
  return store.users.find((item) => item.username === username) ?? baseRecord;
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
  const exports = await listExports();
  const users = await listUsers();
  const statuses = ["Not Contacted", "Contacted", "Call Back Request", "Disconnected", "Quote Sent", "Converted", "Not Interested"];
  const statusBreakdown = statuses.map((status) => ({
    status,
    count: leads.filter((lead) => lead.lead_status === status).length
  }));
  const agentMap = new Map<string, { agent: string; total: number; contacted: number; quotes: number; callbacks: number }>();
  for (const lead of leads) {
    const agent = lead.agent?.trim() || "Unassigned";
    const current = agentMap.get(agent) ?? { agent, total: 0, contacted: 0, quotes: 0, callbacks: 0 };
    current.total += 1;
    if (lead.lead_status === "Contacted") current.contacted += 1;
    if (lead.lead_status === "Quote Sent") current.quotes += 1;
    if (lead.lead_status === "Call Back Request") current.callbacks += 1;
    agentMap.set(agent, current);
  }
  const contacted = leads.filter((lead) => lead.lead_status === "Contacted").length;
  const quoteSent = leads.filter((lead) => lead.lead_status === "Quote Sent").length;
  return {
    leadsGenerated: leads.length,
    contacted,
    notContacted: leads.filter((lead) => lead.lead_status === "Not Contacted").length,
    followUps: leads.filter((lead) => lead.lead_status === "Call Back Request").length,
    disconnected: leads.filter((lead) => lead.lead_status === "Disconnected").length,
    quoteSent,
    exports: exports.length,
    conversionRate: leads.length ? Math.round((quoteSent / leads.length) * 100) : 0,
    contactRate: leads.length ? Math.round((contacted / leads.length) * 100) : 0,
    activeAgents: users.length,
    statusBreakdown,
    agentBreakdown: [...agentMap.values()].sort((a, b) => b.total - a.total).slice(0, 8),
    recentLeads: leads.slice(0, 8).map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      agent: lead.agent || "Unassigned",
      status: lead.lead_status,
      source: lead.source,
      updated_at: lead.updated_at
    }))
  };
}
