import { NextRequest, NextResponse } from "next/server";
import { currentSessionUser, setSession } from "@/lib/server/session";
import { changeManualUserPassword, updateManualUserProfile } from "@/lib/server/store";

export async function PATCH(request: NextRequest) {
  const user = await currentSessionUser();
  if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
  const payload = await request.json();
  const updated = await updateManualUserProfile(user.username, {
    name: String(payload.name ?? user.name).trim(),
    mobile: String(payload.mobile ?? user.mobile).trim(),
    profile_pic: String(payload.profile_pic ?? user.profile_pic ?? "").trim()
  });
  if (!updated) return NextResponse.json({ message: "Profile update failed." }, { status: 400 });
  const nextUser = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    mobile: updated.mobile,
    username: updated.username,
    profile_pic: updated.profile_pic ?? "",
    role: updated.role
  };
  setSession(nextUser);
  return NextResponse.json({ user: nextUser, status: "updated" });
}

export async function POST(request: NextRequest) {
  const user = await currentSessionUser();
  if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
  const payload = await request.json();
  const currentPassword = String(payload.currentPassword ?? "");
  const nextPassword = String(payload.nextPassword ?? "");
  if (nextPassword.length < 6) {
    return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
  }
  const updated = await changeManualUserPassword(user.username, currentPassword, nextPassword);
  if (!updated) return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
  return NextResponse.json({ status: "password_changed" });
}
