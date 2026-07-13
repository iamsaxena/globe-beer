import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabase: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)),
    googleMaps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    googleSheets: Boolean(process.env.GOOGLE_SHEETS_CLIENT_ID && process.env.GOOGLE_SHEETS_CLIENT_SECRET)
  });
}
