import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const top_k = searchParams.get("top_k");

    // Validate required parameters
    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Validate lat/lon format
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude format" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: "Latitude must be between -90 and 90" },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180" },
        { status: 400 }
      );
    }

    // Build query parameters for the external API
    const params = new URLSearchParams({
      lon: longitude.toString(),
      lat: latitude.toString(),
    });

    if (top_k) {
      const topKValue = parseInt(top_k);
      if (!isNaN(topKValue) && topKValue > 0) {
        params.append("top_k", topKValue.toString());
      }
    }

    // Fetch data from the external soil API
    const response = await fetch(
      `https://api.openepi.io/soil/type?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `External API error: ${response.status} ${response.statusText}`
      );
    }

    const soilData = await response.json();

    // Return the soil data
    return NextResponse.json(soilData);
  } catch (error) {
    console.error("Soil API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch soil data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
