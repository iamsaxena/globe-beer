"use client";

import { useEffect, useState } from "react";

type ExportRow = {
  id: string;
  name: string;
  export_type: string;
  rows: number;
  destination: string;
  status: string;
};

export function ExportHistoryClient() {
  const [rows, setRows] = useState<ExportRow[]>([]);

  useEffect(() => {
    fetch("/api/exports")
      .then((response) => response.json())
      .then((payload: { exports: ExportRow[] }) => setRows(payload.exports))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-line/20 bg-panel/80 backdrop-blur-xl">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line/20 text-muted">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Rows</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id} className="border-b border-line/20 last:border-0">
              <td className="px-4 py-4 font-medium">{item.name}</td>
              <td className="px-4 py-4 text-muted">{item.export_type}</td>
              <td className="px-4 py-4 text-muted">{item.rows}</td>
              <td className="px-4 py-4 text-muted">{item.destination}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">{item.status}</span></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className="px-4 py-8 text-muted" colSpan={5}>No exports recorded yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
