import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.GOOGLE_SHEETS_CLIENT_ID || !process.env.GOOGLE_SHEETS_CLIENT_SECRET) {
    return NextResponse.json(
      { status: "missing_credentials", message: "Google Sheets export requires GOOGLE_SHEETS_CLIENT_ID and GOOGLE_SHEETS_CLIENT_SECRET." },
      { status: 400 }
    );
  }
  return NextResponse.json({ status: "ready", message: "Google Sheets credentials detected. OAuth token storage is the next production step." });
}
