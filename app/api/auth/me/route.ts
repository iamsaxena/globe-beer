import { NextResponse } from "next/server";
import { currentSessionUser } from "@/lib/server/session";

export async function GET() {
  return NextResponse.json({ user: await currentSessionUser() });
}
