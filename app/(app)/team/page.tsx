import { ManualUsersClient } from "@/components/team/manual-users-client";
import { PageHeader } from "@/components/layout/page-header";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Manual access" title="Manual Users" description="Onboard operators yourself with name, email, mobile, username, and password." />
      <ManualUsersClient />
    </div>
  );
}
