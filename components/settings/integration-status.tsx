"use client";

import { useEffect, useState } from "react";

type Status = Record<"supabase" | "googleMaps" | "googleSheets", boolean>;

export function IntegrationStatus() {
  const [status, setStatus] = useState<Status>({ supabase: false, googleMaps: false, googleSheets: false });

  useEffect(() => {
    fetch("/api/integrations/status")
      .then((response) => response.json())
      .then((payload: Status) => setStatus(payload))
      .catch(() => undefined);
  }, []);

  const items = [
    ["Supabase Persistence", status.supabase],
    ["Google Maps Places", status.googleMaps],
    ["Google Sheets", status.googleSheets]
  ] as const;

  return (
    <section className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
      <h2 className="text-lg font-semibold">Integration Status</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(([label, ready]) => (
          <div key={label} className="flex items-center justify-between rounded-md border border-line/20 bg-ink/35 px-4 py-3 text-sm">
            <span>{label}</span>
            <span className={ready ? "text-mint" : "text-coral"}>{ready ? "Ready" : "Missing env"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
