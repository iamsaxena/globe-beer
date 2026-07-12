"use client";

import { CheckCircle2, Clock, Download, PhoneCall, PhoneOff, Send, Users } from "lucide-react";
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
};

const emptyMetrics: Metrics = {
  leadsGenerated: 0,
  contacted: 0,
  notContacted: 0,
  followUps: 0,
  disconnected: 0,
  quoteSent: 0,
  exports: 0
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
  const pipeline = [
    { label: "Not Contacted", value: metrics.notContacted, color: "bg-slate-500" },
    { label: "Contacted", value: metrics.contacted, color: "bg-sky" },
    { label: "Call Back Request", value: metrics.followUps, color: "bg-gold" },
    { label: "Disconnected", value: metrics.disconnected, color: "bg-coral" },
    { label: "Quote Sent", value: metrics.quoteSent, color: "bg-mint" }
  ];

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Leads Generated" value={metrics.leadsGenerated.toLocaleString()} tone="mint" />
        <MetricCard icon={PhoneCall} label="Contacted" value={metrics.contacted.toLocaleString()} tone="sky" />
        <MetricCard icon={Clock} label="Not Contacted" value={metrics.notContacted.toLocaleString()} tone="coral" />
        <MetricCard icon={Download} label="Exports" value={metrics.exports.toLocaleString()} tone="mint" />
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 shadow-glow backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lead Pipeline</h2>
            <span className="text-xs text-muted">Live saved-lead status</span>
          </div>
          <div className="space-y-4">
            {pipeline.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/60">
                  <div className={`h-full ${item.color}`} style={{ width: `${Math.min((item.value / total) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <h2 className="text-lg font-semibold">Calling Outcomes</h2>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-ink/35 p-3"><CheckCircle2 className="h-4 w-4 text-mint" /> Quote sent and callback tracking</div>
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-ink/35 p-3"><PhoneOff className="h-4 w-4 text-coral" /> Disconnected and not interested states</div>
            <div className="flex items-center gap-3 rounded-md border border-line/20 bg-ink/35 p-3"><Send className="h-4 w-4 text-gold" /> Agent assignment saved to backend</div>
          </div>
        </div>
      </section>
    </>
  );
}
