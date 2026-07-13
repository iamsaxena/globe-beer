import { NextRequest, NextResponse } from "next/server";
import { findManualUserByUsername, verifyManualUserPassword } from "@/lib/server/store";
import { setSession } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const username = String(payload.username ?? "").trim();
  const password = String(payload.password ?? "");
  const user = await findManualUserByUsername(username);

  if (!user || !verifyManualUserPassword(user, password)) {
    return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
  }

  setSession({ id: user.id, name: user.name, email: user.email, mobile: user.mobile, username: user.username, profile_pic: user.profile_pic ?? "", role: user.role });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, username: user.username, profile_pic: user.profile_pic ?? "", role: user.role },
    status: "signed_in"
  });
}
