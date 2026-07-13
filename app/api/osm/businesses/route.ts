import { NextRequest, NextResponse } from "next/server";

const unitFilters: Record<string, string[]> = {
  Clinics: ['["amenity"~"clinic|doctors|dentist"]'],
  Hospitals: ['["amenity"="hospital"]'],
  Schools: ['["amenity"="school"]'],
  Colleges: ['["amenity"~"college|university"]'],
  Restaurants: ['["amenity"~"restaurant|cafe|fast_food"]'],
  Hotels: ['["tourism"~"hotel|guest_house|hostel"]'],
  Retail: ['["shop"]'],
  Manufacturing: ['["industrial"="factory"]', '["landuse"="industrial"]'],
  "IT Companies": ['["office"~"it|company"]'],
  "Real Estate": ['["office"="estate_agent"]'],
  "Law Firms": ['["office"="lawyer"]'],
  "CA Firms": ['["office"="accountant"]'],
  Construction: ['["office"="construction_company"]'],
  Startups: ['["office"="company"]'],
  NGOs: ['["office"="ngo"]'],
  Others: ['["name"]']
};

function tagsFor(unit: string) {
  return unitFilters[unit] ?? unitFilters.Others;
}

async function geocode(query: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "GlobeLeadGeneration/0.1 (Namahmi Labs Pvt. Ltd.)" },
    signal: controller.signal
  });
  clearTimeout(timeout);
  const payload = await response.json();
  const first = Array.isArray(payload) ? payload[0] : undefined;
  return first ? { lat: Number(first.lat), lon: Number(first.lon) } : { lat: 19.076, lon: 72.8777 };
}

async function fetchOverpass(query: string) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });
      const text = await response.text();
      clearTimeout(timeout);
      if (!response.ok || text.trim().startsWith("<")) continue;
      return JSON.parse(text);
    } catch {
      clearTimeout(timeout);
      continue;
    }
  }

  return { elements: [] };
}

export async function POST(request: NextRequest) {
  const { country, state, district, businessUnit } = await request.json();
  const areaName = [district, state, country].filter(Boolean).join(", ");
  const filters = tagsFor(businessUnit);
  const point = await geocode(areaName);
  const selectors = filters.flatMap((filter) => [
    `node(around:9000,${point.lat},${point.lon})${filter}["phone"];`,
    `node(around:9000,${point.lat},${point.lon})${filter}["contact:phone"];`,
    `way(around:9000,${point.lat},${point.lon})${filter}["phone"];`,
    `way(around:9000,${point.lat},${point.lon})${filter}["contact:phone"];`
  ]);
  const typedQuery = `
    [out:json][timeout:25];
    (
      ${selectors.join("\n")}
    );
    out center tags 50;
  `;
  const broadQuery = `
    [out:json][timeout:25];
    (
      node(around:12000,${point.lat},${point.lon})["name"]["phone"];
      node(around:12000,${point.lat},${point.lon})["name"]["contact:phone"];
      way(around:12000,${point.lat},${point.lon})["name"]["phone"];
      way(around:12000,${point.lat},${point.lon})["name"]["contact:phone"];
    );
    out center tags 50;
  `;

  try {
    const typedPayload = await fetchOverpass(typedQuery);
    const payload = (typedPayload.elements ?? []).length > 0 ? typedPayload : await fetchOverpass(broadQuery);
    const rows = (payload.elements ?? [])
      .map((item: { id: number; lat?: number; lon?: number; center?: { lat?: number; lon?: number }; tags?: Record<string, string> }) => {
        const tags = item.tags ?? {};
        const lat = item.lat ?? item.center?.lat ?? point.lat;
        const lon = item.lon ?? item.center?.lon ?? point.lon;
        const phone = tags.phone ?? tags["contact:phone"] ?? tags.mobile ?? tags["contact:mobile"];
        return {
          id: String(item.id),
          name: tags.name ?? "Unnamed public listing",
          category: tags.amenity ?? tags.shop ?? tags.office ?? businessUnit,
          address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], district].filter(Boolean).join(", "),
          district,
          state,
          country,
          contactPerson: tags.operator ?? "Public listing",
          phone,
          email: tags.email ?? tags["contact:email"] ?? "",
          website: tags.website ?? tags["contact:website"] ?? "",
          maps: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`,
          rating: "",
          reviewCount: "",
          status: "Public",
          source: (typedPayload.elements ?? []).length > 0 ? "OpenStreetMap / Overpass" : "OpenStreetMap / Overpass broad phone lookup",
          agent: "",
          leadStatus: "Not Contacted",
          actionable: "",
          notes: ""
        };
      })
      .filter((row: { phone?: string }) => Boolean(row.phone));

    return NextResponse.json({ rows, source: "OpenStreetMap / Overpass", area: areaName });
  } catch (error) {
    return NextResponse.json({ rows: [], source: "OpenStreetMap / Overpass", area: areaName, error: error instanceof Error ? error.message : "Unable to fetch live public data" }, { status: 200 });
  }
}
