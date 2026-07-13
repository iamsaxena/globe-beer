import { NextResponse } from "next/server";
import { fallbackCountries } from "@/lib/geo-data";

export async function GET() {
  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/positions", { next: { revalidate: 86400 } });
    const payload = await response.json();
    const countries = Array.isArray(payload?.data)
      ? payload.data.map((item: { name?: string }) => item.name).filter(Boolean).sort()
      : fallbackCountries;
    return NextResponse.json({ countries, source: response.ok ? "CountriesNow" : "ISO fallback" });
  } catch {
    return NextResponse.json({ countries: fallbackCountries, source: "ISO fallback" });
  }
}
