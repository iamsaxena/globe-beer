import { NextRequest, NextResponse } from "next/server";
import { currentSessionUser } from "@/lib/server/session";
import { createManualUser, deleteManualUserById, isAdmin, listUsers, updateManualUserById } from "@/lib/server/store";

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

export async function PATCH(request: NextRequest) {
  const currentUser = await currentSessionUser();
  if (!isAdmin(currentUser)) return NextResponse.json({ message: "Only admin can edit manual users." }, { status: 403 });
  const payload = await request.json();
  if (!payload.id) return NextResponse.json({ message: "User id is required." }, { status: 400 });
  try {
    const user = await updateManualUserById(String(payload.id), {
      name: payload.name,
      email: payload.email,
      mobile: payload.mobile,
      username: payload.username,
      role: payload.role,
      disabled: payload.disabled,
      password: payload.password
    });
    return NextResponse.json({ user, status: user ? "updated" : "missing" }, { status: user ? 200 : 404 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to update user." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await currentSessionUser();
  if (!isAdmin(currentUser)) return NextResponse.json({ message: "Only admin can delete manual users." }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ message: "User id is required." }, { status: 400 });
  try {
    const deleted = await deleteManualUserById(id);
    return NextResponse.json({ status: deleted ? "deleted" : "missing" }, { status: deleted ? 200 : 404 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to delete user." }, { status: 400 });
  }
}
