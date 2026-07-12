import { NextRequest, NextResponse } from "next/server";
import { createManualUser, listUsers } from "@/lib/server/store";

export async function GET() {
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (!payload.name || !payload.email || !payload.mobile || !payload.username || !payload.password) {
    return NextResponse.json({ message: "All user fields are required." }, { status: 400 });
  }
  const user = await createManualUser({ ...payload, role: payload.role ?? "Operator" });
  return NextResponse.json({ user, status: "created" });
}
