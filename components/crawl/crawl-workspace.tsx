"use client";

import { ChevronDown, Copy, Download, ExternalLink, Loader2, Mail, MapPinned, Phone, Save, Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { agents, businessUnits, leadStatuses } from "@/lib/mock-data";
import { fallbackCountries, fallbackStates, indiaDistricts } from "@/lib/geo-data";

type BusinessRow = {
  id: string;
  name: string;
  category: string;
  address: string;
  district: string;
  state: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  maps: string;
  rating: string;
  reviewCount: string;
  status: string;
  source: string;
  agent: string;
  leadStatus: string;
  lead_status?: string;
  actionable: string;
  notes: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  labels?: Record<string, string>;
};

const controlClass = "h-11 w-full rounded-md border bg-ink/85 px-3 text-sm text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-55";

function SelectField({ label, value, options, onChange, disabled, invalid, labels }: SelectFieldProps) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted">
      {label}
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${controlClass} appearance-none pr-9 ${invalid ? "border-coral/70" : "border-line/20"}`}
        >
          {options.map((item) => <option key={item} value={item}>{labels?.[item] ?? item}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}

function downloadCsv(filename: string, rows: Record<string, string | number | undefined>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function getJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function normalizeLead(row: BusinessRow): BusinessRow {
  return {
    ...row,
    leadStatus: row.leadStatus ?? row.lead_status ?? "Not Contacted",
    agent: row.agent ?? "",
    actionable: row.actionable ?? "",
    notes: row.notes ?? ""
  };
}

export function CrawlWorkspace() {
  const [countries, setCountries] = useState(["India"]);
  const [states, setStates] = useState(fallbackStates.India);
  const [districts, setDistricts] = useState(indiaDistricts.Maharashtra);
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("Mumbai City");
  const [unit, setUnit] = useState("Clinics");
  const [source, setSource] = useState<"google" | "osm">("google");
  const [agentInput, setAgentInput] = useState("");
  const [agentRoster, setAgentRoster] = useState(agents);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<BusinessRow[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Select filters and search. Results are fetched live from free public sources.");

  useEffect(() => {
    getJson<{ countries: string[] }>("/api/geo/countries", { countries: fallbackCountries }).then((payload) => {
      setCountries(payload.countries);
      setLoadingCountries(false);
    });
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("globe-agent-roster");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed) && parsed.length) setAgentRoster(Array.from(new Set([...agents, ...parsed.filter(Boolean)])));
      } catch {
        setAgentRoster(agents);
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/leads")
      .then((response) => response.json())
      .then((payload: { rows: BusinessRow[] }) => {
        if (payload.rows.length) {
          setRows(payload.rows.map(normalizeLead));
          setSavedIds(new Set(payload.rows.map((row) => row.id)));
          setStatus("Loaded saved leads from backend.");
        }
      })
      .catch(() => setStatus("Lead backend unavailable. Search still works, but saving may fail."));
  }, []);

  useEffect(() => {
    setLoadingStates(true);
    setStatus("Loading states for selected country...");
    getJson<{ states: string[] }>(`/api/geo/states?country=${encodeURIComponent(country)}`, { states: fallbackStates[country] ?? ["All regions"] }).then((payload) => {
      const nextStates = payload.states.length ? payload.states : ["All regions"];
      const nextState = country === "India" && nextStates.includes("Maharashtra") ? "Maharashtra" : nextStates[0];
      setStates(nextStates);
      setState(nextState);
      setLoadingStates(false);
      setStatus("State list updated from live/free geography source.");
    });
  }, [country]);

  useEffect(() => {
    setLoadingDistricts(true);
    setStatus("Loading districts for selected state...");
    getJson<{ districts: string[] }>(
      `/api/geo/districts?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`,
      { districts: country === "India" ? indiaDistricts[state] ?? ["All districts"] : ["All districts"] }
    ).then((payload) => {
      const nextDistricts = payload.districts.length ? payload.districts : ["All districts"];
      const preferredDistrict = country === "India" && state === "Maharashtra" && nextDistricts.includes("Mumbai City") ? "Mumbai City" : nextDistricts[0];
      setDistricts(nextDistricts);
      setDistrict((current) => nextDistricts.includes(current) ? current : preferredDistrict);
      setLoadingDistricts(false);
      setStatus("District list validated against selected state.");
    });
  }, [country, state]);

  const visibleRows = useMemo(() => {
    const term = query.toLowerCase();
    return rows.filter((row) =>
      row.name.toLowerCase().includes(term) ||
      row.category.toLowerCase().includes(term) ||
      row.phone.includes(term) ||
      row.agent.toLowerCase().includes(term) ||
      row.actionable.toLowerCase().includes(term)
    );
  }, [query, rows]);

  const validationIssues = useMemo(() => {
    const issues = [];
    if (!countries.includes(country)) issues.push("Country is not in the loaded list.");
    if (!states.includes(state)) issues.push("State is not valid for the selected country.");
    if (!districts.includes(district)) issues.push("District is not valid for the selected state.");
    if (!businessUnits.includes(unit)) issues.push("Business unit is not supported.");
    if (!["google", "osm"].includes(source)) issues.push("Data source is invalid.");
    if (loadingCountries || loadingStates || loadingDistricts) issues.push("Location data is still loading.");
    return issues;
  }, [countries, country, district, districts, loadingCountries, loadingDistricts, loadingStates, source, state, states, unit]);

  const reportRows = visibleRows.map((row) => ({
    business: row.name,
    unit: row.category,
    phone: row.phone,
    agent: row.agent,
    lead_status: row.leadStatus,
    actionable: row.actionable,
    notes: row.notes,
    address: row.address,
    website: row.website,
    maps: row.maps,
    source: row.source
  }));

  const rememberAgent = () => {
    const nextAgent = agentInput.trim();
    if (!nextAgent) {
      setStatus("Enter an agent name before saving it.");
      return;
    }
    const nextRoster = Array.from(new Set([...agentRoster, nextAgent]));
    setAgentRoster(nextRoster);
    window.localStorage.setItem("globe-agent-roster", JSON.stringify(nextRoster));
    setRows((current) => current.map((row) => ({ ...row, agent: row.agent || nextAgent })));
    setStatus(`${nextAgent} saved as an agent and applied to unassigned visible leads.`);
  };

  const search = async () => {
    if (validationIssues.length > 0) {
      setStatus(validationIssues[0]);
      return;
    }
    setLoading(true);
    const location = [district, state, country].filter(Boolean).join(", ");
    setStatus(source === "google" ? "Fetching real-time Google Places data..." : "Fetching public OpenStreetMap / Overpass data...");
    try {
      const response = await fetch(source === "google" ? "/api/google/places" : "/api/osm/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source === "google" ? { query: unit, location } : { country, state, district, businessUnit: unit })
      });
      const payload = (await response.json()) as { rows: BusinessRow[]; source: string; error?: string; message?: string; needsKey?: boolean };
      setRows(payload.rows.map((row) => normalizeLead({ ...row, agent: row.agent || agentInput })));
      setStatus(payload.error ?? payload.message ?? `${payload.rows.length} phone-verified live records from ${payload.source}.`);
    } catch (error) {
      setRows([]);
      setStatus(error instanceof Error ? error.message : "Unable to fetch live public business data.");
    } finally {
      setLoading(false);
    }
  };

  const updateLead = (id: string, patch: Partial<BusinessRow>) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
    if (savedIds.has(id)) {
      fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch })
      }).catch(() => setStatus("Status changed locally, but backend save failed."));
    }
  };

  const saveLeads = async () => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: rows.map((row) => ({ ...row, lead_status: row.leadStatus ?? row.lead_status ?? "Not Contacted" })) })
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.message ?? "Unable to save leads.");
      return;
    }
    setRows((payload.rows ?? rows).map(normalizeLead));
    setSavedIds(new Set((payload.rows ?? rows).map((row: BusinessRow) => row.id)));
    setStatus(`${rows.length} leads saved for future reference.`);
  };

  const exportCsv = async () => {
    downloadCsv("globe-lead-report.csv", reportRows);
    await fetch("/api/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lead action report",
        export_type: "Business Search Report",
        rows: reportRows.length,
        destination: "CSV",
        status: "Completed"
      })
    });
    setStatus(`${visibleRows.length} rows downloaded and export recorded.`);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line/20 bg-panel/80 p-4 shadow-glow backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-6">
          <SelectField label="Data Source" value={source} options={["google", "osm"]} labels={{ google: "Google Maps", osm: "OpenStreetMap" }} onChange={(value) => setSource(value as "google" | "osm")} invalid={!["google", "osm"].includes(source)} />
          <SelectField label="Country" value={country} options={countries} onChange={setCountry} disabled={loadingCountries} invalid={!countries.includes(country)} />
          <SelectField label="State" value={state} options={states} onChange={setState} disabled={loadingStates} invalid={!states.includes(state)} />
          <SelectField label="District" value={district} options={districts} onChange={setDistrict} disabled={loadingDistricts} invalid={!districts.includes(district)} />
          <SelectField label="Business Unit" value={unit} options={businessUnits} onChange={setUnit} invalid={!businessUnits.includes(unit)} />
          <button onClick={search} disabled={loading || validationIssues.length > 0} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-md bg-gold px-4 font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60" type="button">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_2fr]">
          <label className="grid gap-1 text-xs font-medium text-muted">
            Agent Input
            <span className="flex gap-2">
              <input value={agentInput} onChange={(event) => setAgentInput(event.target.value)} className={`${controlClass} border-line/20`} placeholder="Type agent name for new results" />
              <button onClick={rememberAgent} className="flex h-11 items-center justify-center gap-2 rounded-md border border-line/20 px-3 text-sm text-text transition hover:border-gold/40 hover:bg-gold/10" type="button">
                <UserPlus className="h-4 w-4" />
                Save Agent
              </button>
            </span>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted">
            Search Intent
            <input value={`${unit} near ${district}, ${state}`} readOnly className={`${controlClass} border-line/20 bg-ink/70 text-muted`} />
          </label>
        </div>
        <div className="mt-4 grid gap-3 rounded-md border border-line/20 bg-ink/45 p-3 text-sm text-muted lg:grid-cols-3">
          <span>Validated path: {country} / {state} / {district}</span>
          <span>Source: {source === "google" ? "Google Places API" : "OpenStreetMap / Overpass"}</span>
          <span>Workflow: assign agent, write actionables, save</span>
        </div>
        <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${validationIssues.length ? "border-coral/35 bg-coral/10 text-coral" : "border-line/20 bg-ink/35 text-muted"}`}>{validationIssues[0] ?? status}</p>
      </section>
      <section className="rounded-lg border border-line/20 bg-panel/80 backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-line/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            aria-label="Filter visible business results"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-md border border-line/20 bg-ink px-3 py-2 text-sm text-text outline-none focus:border-gold sm:max-w-sm"
            placeholder="Filter visible results"
          />
          <button
            onClick={exportCsv}
            disabled={visibleRows.length === 0}
            className="flex items-center justify-center gap-2 rounded-md border border-line/20 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button
            onClick={saveLeads}
            disabled={rows.length === 0}
            className="flex items-center justify-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            <Save className="h-4 w-4" />
            Save Leads
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                {["Business", "Unit", "Phone", "Agent", "Lead Status", "Actionable", "Notes", "Source", "Actions"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-t border-line/20">
                  <td className="px-4 py-4 font-medium">{row.name}</td>
                  <td className="px-4 py-4 text-muted">{row.category}</td>
                  <td className="px-4 py-4 font-semibold text-text">{row.phone}</td>
                  <td className="px-4 py-4">
                    <input
                      list="agent-options"
                      value={row.agent}
                      onChange={(event) => updateLead(row.id, { agent: event.target.value })}
                      className="min-w-32 rounded-md border border-line/20 bg-ink px-2 py-1 text-sm outline-none focus:border-gold"
                      placeholder={agentInput || "Agent"}
                    />
                    <datalist id="agent-options">
                      {agentRoster.map((agent) => <option key={agent} value={agent} />)}
                    </datalist>
                  </td>
                  <td className="px-4 py-4">
                    <span className="relative block min-w-44">
                      <select value={row.leadStatus} onChange={(event) => updateLead(row.id, { leadStatus: event.target.value })} className="w-full appearance-none rounded-md border border-line/20 bg-ink px-2 py-1 pr-8 text-sm outline-none focus:border-gold">
                        {leadStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <input value={row.actionable} onChange={(event) => updateLead(row.id, { actionable: event.target.value })} className="min-w-56 rounded-md border border-line/20 bg-ink px-2 py-1 text-sm" placeholder="Next action / owner task" />
                  </td>
                  <td className="px-4 py-4">
                    <input value={row.notes} onChange={(event) => updateLead(row.id, { notes: event.target.value })} className="min-w-44 rounded-md border border-line/20 bg-ink px-2 py-1 text-sm" placeholder="Notes" />
                  </td>
                  <td className="px-4 py-4 text-muted">{row.source}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <a className="rounded-md border border-line/20 p-2 text-muted hover:text-text" href={row.website || row.maps} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                      <a className="rounded-md border border-line/20 p-2 text-muted hover:text-text" href={row.maps} target="_blank"><MapPinned className="h-4 w-4" /></a>
                      <button className="rounded-md border border-line/20 p-2 text-muted hover:text-text" onClick={() => navigator.clipboard.writeText(row.phone)} type="button"><Phone className="h-4 w-4" /></button>
                      <button className="rounded-md border border-line/20 p-2 text-muted hover:text-text" onClick={() => navigator.clipboard.writeText(row.email)} type="button"><Mail className="h-4 w-4" /></button>
                      <button className="rounded-md border border-line/20 p-2 text-muted hover:text-text" onClick={() => navigator.clipboard.writeText(JSON.stringify(row))} type="button"><Copy className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr className="border-t border-line/20">
                  <td className="px-4 py-8 text-muted" colSpan={9}>No phone-verified live records yet. For Google Maps, add `GOOGLE_MAPS_API_KEY` in `.env.local` and restart. For OSM, try a broader city/business unit.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
