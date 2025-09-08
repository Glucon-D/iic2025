import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterConfig } from "@/utils/openrouter/config";
import { databaseService } from "@/utils/appwrite/database";
import { SoilResponse } from "@/utils/types/soil.types";

// Initialize OpenRouter client
const openrouter = createOpenRouter({
  apiKey: openRouterConfig.apiKey,
  baseURL: openRouterConfig.baseURL,
  headers: openRouterConfig.defaultHeaders,
});

interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  forecast: Array<{
    date: string;
    temp_min: number;
    temp_max: number;
    humidity: number;
    conditions: string;
  }>;
}

// Get weather forecast for next 5 days
async function getWeatherForecast(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!OPENWEATHER_API_KEY) {
    throw new Error("OpenWeather API key not configured");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  // Process forecast data for next 5 days
  const forecast = data.list
    .slice(0, 40)
    .reduce((acc: any[], item: any, index: number) => {
      if (index % 8 === 0) {
        // Take one reading per day (every 8th item = 24 hours)
        acc.push({
          date: new Date(item.dt * 1000).toDateString(),
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          humidity: item.main.humidity,
          conditions: item.weather[0].description,
        });
      }
      return acc;
    }, []);

  return {
    temperature: data.list[0].main.temp,
    humidity: data.list[0].main.humidity,
    conditions: data.list[0].weather[0].description,
    forecast: forecast.slice(0, 5), // Next 5 days
  };
}

// Get soil data
async function getSoilData(lat: number, lon: number): Promise<SoilResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/soil/type?lat=${lat}&lon=${lon}&top_k=3`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch soil data");
    }

    return await response.json();
  } catch (error) {
    console.warn("Soil data fetch failed:", error);
    // Return mock soil data as fallback
    return {
      type: "Feature",
      geometry: {
        coordinates: [0, 0],
        type: "Point",
      },
      properties: {
        most_probable_soil_type: "Loamy soil",
        probabilities: [
          { soil_type: "Loamy soil", probability: 60 },
          { soil_type: "Clay soil", probability: 30 },
          { soil_type: "Sandy soil", probability: 10 },
        ],
      },
    };
  }
}

// Build personalized nudges prompt
function buildNudgesPrompt(
  userProfile: any,
  weather: WeatherData,
  soil: SoilResponse,
  location: { city: string; latitude: number; longitude: number }
): string {
  const language = userProfile.language || "english";
  const languageInstruction =
    language === "english"
      ? "Respond in English."
      : language === "malayalam"
      ? "Respond in Malayalam (മലയാളം). Use Malayalam script and include English terms in parentheses for technical words."
      : language === "hindi"
      ? "Respond in Hindi (हिंदी). Use Devanagari script and include English terms in parentheses for technical words."
      : "Respond in English.";

  const crops =
    userProfile.crop && userProfile.crop.length > 0
      ? userProfile.crop.join(", ")
      : "general farming";

  const soilTypes = soil.properties.probabilities
    ? soil.properties.probabilities
        .map((p) => `${p.soil_type} (${p.probability}%)`)
        .join(", ")
    : soil.properties.most_probable_soil_type;

  return `You are a friendly farming helper talking to a local farmer. Use VERY SIMPLE language that any farmer can understand.

🎯 TASK: Give 5 practical farming tips that this farmer can use today and in the coming days.
🌐 LANGUAGE: ${languageInstruction}

👤 FARMER PROFILE:
- Name: ${userProfile.username}
- Location: ${location.city}
- Farm Size: ${userProfile.farmsize || "Not specified"}
- Experience: ${userProfile.experience || "Not specified"}
- Crops: ${crops}

🌤️ WEATHER CONDITIONS:
Current: ${weather.conditions}, ${weather.temperature}°C, ${
    weather.humidity
  }% humidity

Next 5 Days Forecast:
${weather.forecast
  .map(
    (day, i) =>
      `Day ${i + 1} (${day.date}): ${day.conditions}, ${day.temp_min}-${
        day.temp_max
      }°C, ${day.humidity}% humidity`
  )
  .join("\n")}

🌱 SOIL INFORMATION:
Likely soil types: ${soilTypes}

📋 REQUIREMENTS:
- Provide exactly 5 practical tips, numbered 1-5
- Use VERY SIMPLE language that any farmer can understand
- NO scientific names or technical terms
- Make each tip actionable for the next few days
- Consider the weather forecast and soil conditions
- Focus on the farmer's specific crops: ${crops}
- Use **bold text** only for the main action
- Keep each tip short and easy to remember

✨ SIMPLE LANGUAGE GUIDELINES:
- Use everyday words: "plant disease" instead of "fungal pathogen"
- Use simple measurements: "2 cups per bucket" instead of "2ml per liter"
- Make it conversational like talking to a neighbor farmer
- Example: "**Check your plants daily** for yellow or brown spots on leaves"

Focus on practical advice for the weather conditions and crops mentioned.`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting nudges API call");

    const body = await request.json();
    const { userId, location } = body;
    console.log("Request body:", { userId, location });

    if (!userId || !location) {
      console.error("Missing required fields:", { userId, location });
      return NextResponse.json(
        { error: "User ID and location are required" },
        { status: 400 }
      );
    }

    // Get user profile from database
    console.log("Fetching user profile for userId:", userId);
    let userProfile = await databaseService.getUserByUserId(userId);
    if (!userProfile) {
      console.warn(
        "User profile not found for userId:",
        userId,
        "- using default profile"
      );
      // Use a default user profile for users who haven't completed onboarding
      userProfile = {
        userId,
        username: "Farmer",
        location: location.city || "Unknown",
        farmsize: "Small (1-5 acres)",
        crop: ["Rice", "Wheat"],
        experience: "Beginner",
        language: "english",
      } as any;
    }
    console.log("User profile:", {
      username: (userProfile as any).username,
      crop: (userProfile as any).crop,
    });

    // Validate OpenRouter configuration
    console.log("Validating OpenRouter config");
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing");
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Fetch weather data
    console.log("Fetching weather data for location:", location);
    let weather;
    try {
      weather = await getWeatherForecast(location.latitude, location.longitude);
      console.log("Weather data fetched successfully");
    } catch (weatherError) {
      console.error("Weather API failed:", weatherError);
      throw new Error(
        `Weather API failed: ${
          weatherError instanceof Error ? weatherError.message : "Unknown error"
        }`
      );
    }

    // Fetch soil data
    console.log("Fetching soil data for location:", location);
    let soil;
    try {
      soil = await getSoilData(location.latitude, location.longitude);
      console.log("Soil data fetched successfully");
    } catch (soilError) {
      console.error("Soil API failed:", soilError);
      throw new Error(
        `Soil API failed: ${
          soilError instanceof Error ? soilError.message : "Unknown error"
        }`
      );
    }

    // Build prompt
    const prompt = buildNudgesPrompt(userProfile, weather, soil, location);
    console.log("Prompt built, length:", prompt.length);

    // Generate nudges using OpenRouter Gemini 2.5 Flash Lite
    console.log("Calling OpenRouter API with model: google/gemini-2.5-flash");
    let result;
    try {
      result = await generateText({
        model: openrouter("google/gemini-2.5-flash"),
        messages: [{ role: "user", content: prompt }],
      });
      console.log(
        "OpenRouter API call successful, response length:",
        result.text.length
      );
    } catch (aiError) {
      console.error("OpenRouter API failed:", aiError);
      throw new Error(
        `OpenRouter API failed: ${
          aiError instanceof Error ? aiError.message : "Unknown error"
        }`
      );
    }

    // Parse nudges from response
    const nudgesText = result.text;
    const nudges = nudgesText
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(
        (line) =>
          line.length > 0 && !line.startsWith("🎯") && !line.startsWith("👤")
      );

    const responseData = {
      nudges: nudges.slice(0, 5), // Ensure exactly 5 nudges
      weather,
      soil,
      location: location.city,
      crops: (userProfile as any).crop || [],
    };

    console.log(
      "Response data prepared, nudges count:",
      responseData.nudges.length
    );
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("AI nudges generation failed:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error: "Failed to generate nudges",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 }
    );
  }
}
