"use client";

import { Activity, CheckCircle2, Clock, Download, PhoneCall, PhoneOff, Send, Target, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";

type Metrics = {
  leadsGenerated: number;
  contacted: number;
  notContacted: number;
  followUps: number;
  disconnected: number;
  quoteSent: number;
  exports: number;
  conversionRate: number;
  contactRate: number;
  activeAgents: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  agentBreakdown: Array<{ agent: string; total: number; contacted: number; quotes: number; callbacks: number }>;
  recentLeads: Array<{ id: string; name: string; phone: string; agent: string; status: string; source: string; updated_at: string }>;
};

const emptyMetrics: Metrics = {
  leadsGenerated: 0,
  contacted: 0,
  notContacted: 0,
  followUps: 0,
  disconnected: 0,
  quoteSent: 0,
  exports: 0,
  conversionRate: 0,
  contactRate: 0,
  activeAgents: 0,
  statusBreakdown: [],
  agentBreakdown: [],
  recentLeads: []
};

export function DashboardClient() {
  const [metrics, setMetrics] = useState(emptyMetrics);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((response) => response.json())
      .then((payload: Metrics) => setMetrics(payload))
      .catch(() => setMetrics(emptyMetrics));
  }, []);

  const total = Math.max(metrics.leadsGenerated, 1);
  const pipeline = metrics.statusBreakdown.length ? metrics.statusBreakdown : [
    { status: "Not Contacted", count: metrics.notContacted },
    { status: "Contacted", count: metrics.contacted },
    { status: "Call Back Request", count: metrics.followUps },
    { status: "Disconnected", count: metrics.disconnected },
    { status: "Quote Sent", count: metrics.quoteSent }
  ];

  const colorFor = (status: string) => ({
    "Not Contacted": "bg-slate-500",
    Contacted: "bg-sky",
    "Call Back Request": "bg-gold",
    Disconnected: "bg-coral",
    "Quote Sent": "bg-mint",
    Converted: "bg-emerald-400",
    "Not Interested": "bg-zinc-500"
  }[status] ?? "bg-muted");

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Leads Generated" value={metrics.leadsGenerated.toLocaleString()} tone="mint" />
        <MetricCard icon={PhoneCall} label="Contacted" value={metrics.contacted.toLocaleString()} tone="sky" />
        <MetricCard icon={Clock} label="Not Contacted" value={metrics.notContacted.toLocaleString()} tone="coral" />
        <MetricCard icon={Download} label="Exports" value={metrics.exports.toLocaleString()} tone="mint" />
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Contact Rate</p>
            <TrendingUp className="h-4 w-4 text-sky" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{metrics.contactRate}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/60">
            <div className="h-full bg-sky" style={{ width: `${Math.min(metrics.contactRate, 100)}%` }} />
          </div>
        </div>
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Quote Conversion</p>
            <Target className="h-4 w-4 text-mint" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{metrics.conversionRate}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/60">
            <div className="h-full bg-mint" style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }} />
          </div>
        </div>
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Manual Users</p>
            <Activity className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{metrics.activeAgents}</p>
          <p className="mt-3 text-sm text-muted">Users eligible for team login</p>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 shadow-glow backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lead Pipeline</h2>
            <span className="text-xs text-muted">Live saved-lead status</span>
          </div>
          <div className="space-y-4">
            {pipeline.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">{item.status}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/60">
                  <div className={`h-full ${colorFor(item.status)}`} style={{ width: `${Math.min((item.count / total) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <h2 className="text-lg font-semibold">Agent Performance</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-line/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/60 text-muted">
                <tr>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Leads</th>
                  <th className="px-3 py-2">Contacted</th>
                  <th className="px-3 py-2">Quotes</th>
                </tr>
              </thead>
              <tbody>
                {metrics.agentBreakdown.map((agent) => (
                  <tr key={agent.agent} className="border-t border-line/20">
                    <td className="px-3 py-3 font-medium">{agent.agent}</td>
                    <td className="px-3 py-3">{agent.total}</td>
                    <td className="px-3 py-3">{agent.contacted}</td>
                    <td className="px-3 py-3">{agent.quotes}</td>
                  </tr>
                ))}
                {metrics.agentBreakdown.length === 0 && (
                  <tr><td className="px-3 py-6 text-muted" colSpan={4}>No saved agent activity yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <h2 className="text-lg font-semibold">Calling Outcomes</h2>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-ink/35 p-3"><CheckCircle2 className="h-4 w-4 text-mint" /> Quote sent: {metrics.quoteSent}</div>
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-ink/35 p-3"><PhoneOff className="h-4 w-4 text-coral" /> Disconnected: {metrics.disconnected}</div>
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-ink/35 p-3"><Send className="h-4 w-4 text-gold" /> Callback requests: {metrics.followUps}</div>
          </div>
        </div>
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Lead Activity</h2>
            <a className="text-sm text-gold" href="/business-crawl">Open Search</a>
          </div>
          <div className="overflow-hidden rounded-md border border-line/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/60 text-muted">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-line/20">
                    <td className="px-3 py-3">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted">{lead.phone}</p>
                    </td>
                    <td className="px-3 py-3">{lead.agent}</td>
                    <td className="px-3 py-3"><span className="rounded-full border border-line/20 px-2 py-1 text-xs">{lead.status}</span></td>
                    <td className="px-3 py-3 text-muted">{lead.source}</td>
                  </tr>
                ))}
                {metrics.recentLeads.length === 0 && (
                  <tr><td className="px-3 py-6 text-muted" colSpan={4}>Save leads from Business Search to populate live activity.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
