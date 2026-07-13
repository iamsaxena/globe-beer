"use client";

import { Edit3, KeyRound, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { InviteUser } from "@/components/team/invite-user";

type ManualUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  role: string;
  disabled?: boolean;
  created_at: string;
};

type EditState = Pick<ManualUser, "id" | "name" | "email" | "mobile" | "username" | "role"> & { password: string };

const emptyEdit: EditState = { id: "", name: "", email: "", mobile: "", username: "", role: "Operator", password: "" };

export function ManualUsersClient() {
  const [users, setUsers] = useState<ManualUser[]>([]);
  const [status, setStatus] = useState("Loading manual users...");
  const [editing, setEditing] = useState<EditState | null>(null);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users/manual", { cache: "no-store" });
      const payload = (await response.json()) as { users?: ManualUser[]; message?: string };
      if (!response.ok) {
        setStatus(payload.message ?? "Admin access required.");
        return;
      }
      setUsers(payload.users ?? []);
      setStatus(payload.users?.length ? "Admin can add, edit, disable, or delete operators. Operators work independently and do not see this tab." : "No manual users created yet.");
    } catch {
      setStatus("Unable to load manual users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const startEdit = (member: ManualUser) => {
    setEditing({ id: member.id, name: member.name, email: member.email, mobile: member.mobile, username: member.username, role: member.role, password: "" });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const response = await fetch("/api/users/manual", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    const payload = await response.json();
    setStatus(response.ok ? `Updated ${editing.username}.` : payload.message);
    if (response.ok) {
      setEditing(null);
      loadUsers();
    }
  };

  const toggleDisabled = async (member: ManualUser) => {
    const response = await fetch("/api/users/manual", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, disabled: !member.disabled })
    });
    const payload = await response.json();
    setStatus(response.ok ? `${member.username} ${member.disabled ? "enabled" : "disabled"}.` : payload.message);
    if (response.ok) loadUsers();
  };

  const deleteUser = async (member: ManualUser) => {
    const response = await fetch(`/api/users/manual?id=${encodeURIComponent(member.id)}`, { method: "DELETE" });
    const payload = await response.json();
    setStatus(response.ok ? `${member.username} deleted.` : payload.message);
    if (response.ok) loadUsers();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-line/20 bg-ink/35 p-4 text-sm text-muted">
        Admin-only controls. Operators created here can log in and work in parallel by time, territory, or business unit, but they cannot see or manage Manual Users.
      </section>
      <InviteUser onCreated={loadUsers} />
      <p className="rounded-md border border-line/20 bg-ink/40 px-3 py-2 text-sm text-muted">{status}</p>

      {editing && (
        <section className="rounded-lg border border-gold/30 bg-panel/90 p-4 shadow-glow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <button onClick={() => setEditing(null)} className="rounded-md border border-line/20 p-2 text-muted hover:text-text" type="button"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-3 xl:grid-cols-6">
            <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Full name" />
            <input value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Email" />
            <input value={editing.mobile} onChange={(event) => setEditing({ ...editing, mobile: event.target.value })} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Mobile" />
            <input value={editing.username} onChange={(event) => setEditing({ ...editing, username: event.target.value })} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Username" />
            <input value={editing.password} onChange={(event) => setEditing({ ...editing, password: event.target.value })} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="New password optional" type="password" />
            <button onClick={saveEdit} className="flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 font-semibold text-black" type="button">
              <KeyRound className="h-4 w-4" />
              Save
            </button>
          </div>
        </section>
      )}

      <div className="overflow-hidden rounded-lg border border-line/20 bg-panel/80 backdrop-blur-xl">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-ink/50 text-muted">
            <tr>
              {["Name", "Email", "Mobile", "Username", "Role", "Status", "Actions"].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((member) => {
              const isBuiltInAdmin = member.username === "whoshobhitsaxena@gmail.com";
              return (
                <tr key={member.id} className="border-t border-line/20">
                  <td className="px-4 py-4 font-semibold">{member.name}</td>
                  <td className="px-4 py-4 text-muted">{member.email}</td>
                  <td className="px-4 py-4 text-muted">{member.mobile || "-"}</td>
                  <td className="px-4 py-4 text-muted">@{member.username}</td>
                  <td className="px-4 py-4"><span className="rounded-full border border-line/20 px-3 py-1 text-xs text-muted">{member.role}</span></td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs ${member.disabled ? "border-coral/40 text-coral" : "border-mint/40 text-mint"}`}>
                      {member.disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => startEdit(member)} disabled={isBuiltInAdmin} className="flex items-center gap-2 rounded-md border border-line/20 px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-40" type="button">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button onClick={() => toggleDisabled(member)} disabled={isBuiltInAdmin} className="flex items-center gap-2 rounded-md border border-line/20 px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-40" type="button">
                        {member.disabled ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        {member.disabled ? "Enable" : "Disable"}
                      </button>
                      <button onClick={() => deleteUser(member)} disabled={isBuiltInAdmin} className="flex items-center gap-2 rounded-md border border-coral/30 px-3 py-2 text-sm text-coral disabled:cursor-not-allowed disabled:opacity-40" type="button">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
