import { PageHeader } from "@/components/layout/page-header";
import { ExportHistoryClient } from "@/components/export/export-history-client";

export default function ExportHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Data operations" title="Export History" description="CSV and Google Sheets exports with status and ownership." />
      <ExportHistoryClient />
    </div>
  );
}
