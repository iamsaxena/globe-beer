import { NextRequest, NextResponse } from "next/server";
import { indiaDistricts } from "@/lib/geo-data";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "India";
  const state = request.nextUrl.searchParams.get("state") ?? "Maharashtra";

  if (country === "India" && indiaDistricts[state]) {
    return NextResponse.json({ districts: indiaDistricts[state], source: "India district registry fallback" });
  }

  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, state })
    });
    const payload = await response.json();
    const districts = Array.isArray(payload?.data) && payload.data.length > 0 ? payload.data.sort() : ["All districts"];
    return NextResponse.json({ districts, source: response.ok ? "CountriesNow cities" : "fallback" });
  } catch {
    return NextResponse.json({ districts: ["All districts"], source: "fallback" });
  }
}
