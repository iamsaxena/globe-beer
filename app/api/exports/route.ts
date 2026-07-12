import { NextRequest, NextResponse } from "next/server";
import { addExport, listExports } from "@/lib/server/store";

export async function GET() {
  return NextResponse.json({ exports: await listExports() });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const rows = Number(payload.rows ?? 0);

  const record = await addExport({
    name: String(payload.name ?? "Globe export"),
    export_type: String(payload.export_type ?? "CSV"),
    rows: Number.isFinite(rows) ? rows : 0,
    destination: String(payload.destination ?? "CSV"),
    status: String(payload.status ?? "Completed")
  });

  return NextResponse.json({ export: record, status: "recorded" });
}
