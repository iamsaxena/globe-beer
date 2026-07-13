import { NextResponse } from "next/server";
import { metrics } from "@/lib/server/store";

export async function GET() {
  return NextResponse.json(await metrics());
}
