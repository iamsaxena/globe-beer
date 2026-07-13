"use client";

import { Camera, KeyRound, Save, UserRound } from "lucide-react";
import { useState } from "react";

type ProfileUser = {
  name: string;
  email: string;
  mobile: string;
  username: string;
  profile_pic?: string;
  role: string;
};

export function ProfileClient({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name);
  const [mobile, setMobile] = useState(user.mobile ?? "");
  const [profilePic, setProfilePic] = useState(user.profile_pic ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [status, setStatus] = useState("");

  const saveProfile = async () => {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, profile_pic: profilePic })
    });
    const payload = await response.json();
    setStatus(response.ok ? "Profile updated." : payload.message);
  };

  const changePassword = async () => {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, nextPassword })
    });
    const payload = await response.json();
    setStatus(response.ok ? "Password changed." : payload.message);
    if (response.ok) {
      setCurrentPassword("");
      setNextPassword("");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
      <section className="rounded-lg border border-line/20 bg-panel/80 p-5 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border border-gold/40 bg-ink">
            {profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePic} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gold">
                <UserRound className="h-12 w-12" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{name}</h2>
          <p className="mt-1 text-sm text-muted">{user.username}</p>
          <span className="mt-3 rounded-full border border-line/20 px-3 py-1 text-xs text-gold">{user.role}</span>
        </div>
      </section>
      <section className="grid gap-5">
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Profile Details</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Mobile Number</span>
              <input value={mobile} onChange={(event) => setMobile(event.target.value)} className="w-full rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Username</span>
              <input value={user.username} className="w-full rounded-md border border-line/20 bg-ink/60 px-3 py-2 text-sm text-muted" readOnly />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Profile Pic URL</span>
              <input value={profilePic} onChange={(event) => setProfilePic(event.target.value)} className="w-full rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="https://..." />
            </label>
          </div>
          <button onClick={saveProfile} className="mt-4 flex items-center gap-2 rounded-md bg-gold px-4 py-2 font-semibold text-black" type="button">
            <Save className="h-4 w-4" />
            Save Profile
          </button>
        </div>
        <div className="rounded-lg border border-line/20 bg-panel/80 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="Current password" type="password" />
            <input value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} className="rounded-md border border-line/20 bg-ink px-3 py-2 text-sm outline-none focus:border-gold" placeholder="New password" type="password" />
          </div>
          <button onClick={changePassword} className="mt-4 flex items-center gap-2 rounded-md border border-line/20 px-4 py-2 font-semibold text-text hover:bg-ink/40" type="button">
            <KeyRound className="h-4 w-4" />
            Update Password
          </button>
          {status && <p className="mt-4 rounded-md border border-line/20 bg-ink/50 px-3 py-2 text-sm text-muted">{status}</p>}
        </div>
      </section>
    </div>
  );
}
