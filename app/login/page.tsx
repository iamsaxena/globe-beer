import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { currentSessionUser } from "@/lib/server/session";
import { hasManualUsers } from "@/lib/server/store";

export default async function LoginPage() {
  const [user, usersExist] = await Promise.all([currentSessionUser(), hasManualUsers()]);
  if (user) redirect("/dashboard");
  return <LoginForm setupMode={!usersExist} />;
}
