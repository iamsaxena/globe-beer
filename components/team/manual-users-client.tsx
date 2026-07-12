"use client";

import { ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import { InviteUser } from "@/components/team/invite-user";

type ManualUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  role: string;
  created_at: string;
};

export function ManualUsersClient() {
  const [users, setUsers] = useState<ManualUser[]>([]);
  const [status, setStatus] = useState("Loading manual users...");

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users/manual", { cache: "no-store" });
      const payload = (await response.json()) as { users: ManualUser[] };
      setUsers(payload.users ?? []);
      setStatus(payload.users?.length ? "Manual users loaded from backend." : "No manual users created yet.");
    } catch {
      setStatus("Unable to load manual users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-4">
      <InviteUser onCreated={loadUsers} />
      <p className="rounded-md border border-line/20 bg-ink/40 px-3 py-2 text-sm text-muted">{status}</p>
      <div className="grid gap-3">
        {users.map((member) => (
          <div key={member.id} className="flex flex-col gap-3 rounded-lg border border-line/20 bg-panel/80 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-muted">{member.email} · {member.mobile} · @{member.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line/20 px-3 py-1 text-xs text-muted">{member.role}</span>
              <button className="flex items-center gap-2 rounded-md border border-line/20 px-3 py-2 text-sm text-text" type="button">
                <ShieldOff className="h-4 w-4" />
                Disable
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
