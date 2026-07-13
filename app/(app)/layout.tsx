import { AppShell } from "@/components/layout/app-shell";
import { currentSessionUser } from "@/lib/server/session";
import { hasManualUsers } from "@/lib/server/store";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [user, usersExist] = await Promise.all([currentSessionUser(), hasManualUsers()]);
  if (usersExist && !user) redirect("/login");
  return <AppShell user={user} setupMode={!usersExist}>{children}</AppShell>;
}
