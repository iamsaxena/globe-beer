import { NextRequest, NextResponse } from "next/server";
import { fallbackStates } from "@/lib/geo-data";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "India";
  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country })
    });
    const payload = await response.json();
    const states = Array.isArray(payload?.data?.states)
      ? payload.data.states.map((item: { name?: string }) => item.name).filter(Boolean).sort()
      : fallbackStates[country] ?? ["All regions"];
    return NextResponse.json({ states, source: response.ok ? "CountriesNow" : "fallback" });
  } catch {
    return NextResponse.json({ states: fallbackStates[country] ?? ["All regions"], source: "fallback" });
  }
}
