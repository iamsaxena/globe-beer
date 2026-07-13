import { NextRequest, NextResponse } from "next/server";

type Place = {
  name?: string;
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
};

async function placeDetails(place: Place, apiKey: string): Promise<Place> {
  const resourceName = place.name ?? (place.id ? `places/${place.id}` : "");
  if (!resourceName) return place;
  const referer = process.env.GOOGLE_MAPS_REFERER ?? process.env.NEXTAUTH_URL;

  const response = await fetch(`https://places.googleapis.com/v1/${resourceName}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,name,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,businessStatus,rating,userRatingCount,types",
      ...(referer ? { Referer: referer } : {})
    }
  });

  if (!response.ok) return place;
  return { ...place, ...await response.json() };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const { query, location, latitude, longitude } = await request.json();

  if (!apiKey) {
    return NextResponse.json({
      rows: [],
      source: "Google Places API",
      needsKey: true,
      message: "Google Maps real-time data requires GOOGLE_MAPS_API_KEY. Add it in Vercel Project Settings > Environment Variables, redeploy, then retry."
    });
  }

  try {
    const referer = process.env.GOOGLE_MAPS_REFERER ?? process.env.NEXTAUTH_URL;
    const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
    const body = {
      textQuery: hasCoordinates ? `${query} near me` : `${query} near ${location}`,
      maxResultCount: 20,
      ...(hasCoordinates ? {
        locationBias: {
          circle: {
            center: { latitude, longitude },
            radius: 10000
          }
        }
      } : {})
    };
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.name,places.displayName,places.formattedAddress,places.websiteUri,places.googleMapsUri,places.businessStatus,places.rating,places.userRatingCount,places.types",
        ...(referer ? { Referer: referer } : {})
      },
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({
        rows: [],
        source: "Google Places API",
        message: payload?.error?.message ?? "Google Places request failed."
      });
    }

    const places = Array.isArray(payload?.places) ? payload.places : [];
    const detailedPlaces = await Promise.all(places.map((place: Place) => placeDetails(place, apiKey)));
    const rows = detailedPlaces
      .map((place: Place) => ({
        id: place.id,
        name: place.displayName?.text ?? "Unnamed business",
        category: place.types?.[0] ?? query,
        address: place.formattedAddress ?? "",
        district: hasCoordinates ? "NearMe" : location,
        state: "",
        country: "",
        contactPerson: "Public Google listing",
        phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? "",
        email: "",
        website: place.websiteUri ?? "",
        maps: place.googleMapsUri ?? "",
        rating: place.rating ? String(place.rating) : "",
        reviewCount: place.userRatingCount ? String(place.userRatingCount) : "",
        status: place.businessStatus ?? "Public",
        source: hasCoordinates ? "NearMe · Google Places API" : "Google Places API",
        agent: "",
        leadStatus: "Not Contacted",
        actionable: "",
        notes: ""
      }))
      .filter((row: { phone: string }) => row.phone);

    return NextResponse.json({ rows, source: "Google Places API", message: `${rows.length} phone-verified records from ${places.length} Google Places results.` });
  } catch (error) {
    return NextResponse.json({
      rows: [],
      source: "Google Places API",
      message: error instanceof Error ? error.message : "Unable to fetch Google Places data"
    });
  }
}
