import { ManualUsersClient } from "@/components/team/manual-users-client";
import { PageHeader } from "@/components/layout/page-header";
import { currentSessionUser } from "@/lib/server/session";
import { isAdmin } from "@/lib/server/store";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const user = await currentSessionUser();
  if (!isAdmin(user)) redirect("/dashboard");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Manual access" title="Manual Users" description="Onboard operators yourself with name, email, mobile, username, and password." />
      <ManualUsersClient />
    </div>
  );
}
