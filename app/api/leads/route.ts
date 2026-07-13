import { NextRequest, NextResponse } from "next/server";
import { LeadRecord, listLeads, updateLead, upsertLeads } from "@/lib/server/store";
import { currentSessionUser } from "@/lib/server/session";
import { isAdmin } from "@/lib/server/store";

export async function GET() {
  const user = await currentSessionUser();
  const rows = await listLeads();
  if (!user || isAdmin(user)) return NextResponse.json({ rows });
  const agentKeys = [user.name, user.username].map((value) => value.toLowerCase());
  return NextResponse.json({ rows: rows.filter((row) => agentKeys.includes((row.agent ?? "").toLowerCase())) });
}

export async function POST(request: NextRequest) {
  const user = await currentSessionUser();
  if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
  const payload = await request.json();
  const inputRows = (Array.isArray(payload.rows) ? payload.rows : [payload]) as Array<Omit<LeadRecord, "created_at" | "updated_at">>;
  const rows = inputRows.filter((row) => row?.phone);
  if (rows.length === 0) {
    return NextResponse.json({ message: "Contact number is mandatory for every saved lead." }, { status: 400 });
  }
  const scopedRows = isAdmin(user) ? rows : rows.map((row) => ({ ...row, agent: user.name }));
  const saved = await upsertLeads(scopedRows);
  return NextResponse.json({ rows: saved, status: "saved" });
}

export async function PATCH(request: NextRequest) {
  const user = await currentSessionUser();
  if (!user) return NextResponse.json({ message: "Login required." }, { status: 401 });
  const payload = await request.json();
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!id) return NextResponse.json({ message: "Lead id is required." }, { status: 400 });
  const existing = (await listLeads()).find((item) => item.id === id);
  if (existing && !isAdmin(user)) {
    const agentKeys = [user.name, user.username].map((value) => value.toLowerCase());
    if (!agentKeys.includes((existing.agent ?? "").toLowerCase())) {
      return NextResponse.json({ message: "You can update only your own saved remarks." }, { status: 403 });
    }
  }
  const lead = await updateLead(id, isAdmin(user) ? payload : { ...payload, agent: user.name });
  return NextResponse.json({ lead, status: lead ? "updated" : "missing" }, { status: lead ? 200 : 404 });
}
