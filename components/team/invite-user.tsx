"use client";

import { KeyRound, Save } from "lucide-react";
import { useState } from "react";

type InviteUserProps = {
  onCreated?: () => void;
};

export function InviteUser({ onCreated }: InviteUserProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const createUser = async () => {
    const response = await fetch("/api/users/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, mobile, username, password, role: "Operator" })
    });
    const payload = await response.json();
    setStatus(response.ok ? `Created ${payload.user.username}` : payload.message);
    if (response.ok) {
      setEmail("");
      setName("");
      setMobile("");
      setUsername("");
      setPassword("");
      onCreated?.();
    }
  };

  return (
    <form className="grid gap-3 rounded-lg border border-line/20 bg-panel/80 p-4 backdrop-blur-xl xl:grid-cols-6">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold"
        placeholder="Full name"
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold"
        placeholder="email@company.com"
        type="email"
      />
      <input
        value={mobile}
        onChange={(event) => setMobile(event.target.value)}
        className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold"
        placeholder="Mobile number"
      />
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold"
        placeholder="Username"
      />
      <div className="flex items-center gap-2 rounded-md border border-line/20 bg-ink px-3 py-2">
        <KeyRound className="h-4 w-4 text-gold" />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Password"
          type="password"
        />
      </div>
      <button onClick={createUser} className="flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 font-semibold text-black" type="button">
        <Save className="h-4 w-4" />
        Add
      </button>
      {status && <p className="text-sm text-muted xl:col-span-6">{status}</p>}
    </form>
  );
}
