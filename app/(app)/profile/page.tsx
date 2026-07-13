import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileClient } from "@/components/profile/profile-client";
import { currentSessionUser } from "@/lib/server/session";

export default async function ProfilePage() {
  const user = await currentSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Profile" description="Manage your profile picture, name, mobile number, username, and password." />
      <ProfileClient user={user} />
    </div>
  );
}
