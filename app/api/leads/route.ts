import { NextRequest, NextResponse } from "next/server";
import { LeadRecord, listLeads, updateLead, upsertLeads } from "@/lib/server/store";

export async function GET() {
  return NextResponse.json({ rows: await listLeads() });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const inputRows = (Array.isArray(payload.rows) ? payload.rows : [payload]) as Array<Omit<LeadRecord, "created_at" | "updated_at">>;
  const rows = inputRows.filter((row) => row?.phone);
  if (rows.length === 0) {
    return NextResponse.json({ message: "Contact number is mandatory for every saved lead." }, { status: 400 });
  }
  const saved = await upsertLeads(rows);
  return NextResponse.json({ rows: saved, status: "saved" });
}

export async function PATCH(request: NextRequest) {
  const payload = await request.json();
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!id) {
    return NextResponse.json({ message: "Lead id is required." }, { status: 400 });
  }
  const lead = await updateLead(id, payload);
  return NextResponse.json({ lead, status: lead ? "updated" : "missing" }, { status: lead ? 200 : 404 });
}
