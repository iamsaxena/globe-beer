import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { PageHeader } from "@/components/layout/page-header";
import { workspace } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={workspace.name}
        title="Dashboard"
        description="Internal lead operations: generated leads, calling progress, follow-ups, quotes, and saved exports."
      />
      <DashboardClient />
    </div>
  );
}
