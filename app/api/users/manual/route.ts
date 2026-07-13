import { NextRequest, NextResponse } from "next/server";
import { currentSessionUser } from "@/lib/server/session";
import { createManualUser, isAdmin, listUsers } from "@/lib/server/store";

export async function GET() {
  const user = await currentSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request: NextRequest) {
  const currentUser = await currentSessionUser();
  if (!isAdmin(currentUser)) return NextResponse.json({ message: "Only admin can create manual users." }, { status: 403 });
  const payload = await request.json();
  if (!payload.name || !payload.email || !payload.mobile || !payload.username || !payload.password) {
    return NextResponse.json({ message: "All user fields are required." }, { status: 400 });
  }
  try {
    const user = await createManualUser({ ...payload, role: payload.role ?? "Operator" });
    return NextResponse.json({ user, status: "created" });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to create user." }, { status: 400 });
  }
}
