import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterConfig } from "@/utils/openrouter/config";
import { databaseService } from "@/utils/appwrite/database";
import { SoilResponse } from "@/utils/types/soil.types";

const openrouter = createOpenRouter({
  apiKey: openRouterConfig.apiKey,
  baseURL: openRouterConfig.baseURL,
  headers: openRouterConfig.defaultHeaders,
});

// Message types for our API
interface APIMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{
    type: "text";
    text: string;
  } | {
    type: "image";
    image: string;
  }>;
}

// Weather and context interfaces
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
async function getWeatherForecast(lat: number, lon: number): Promise<WeatherData> {
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
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/soil/type?lat=${lat}&lon=${lon}&top_k=3`
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
        coordinates: [lon, lat],
        type: "Point",
      },
      properties: {
        most_probable_soil_type: "Laterite soil",
        probabilities: [
          { soil_type: "Laterite soil", probability: 60 },
          { soil_type: "Alluvial soil", probability: 25 },
          { soil_type: "Red soil", probability: 15 },
        ],
      },
    };
  }
}

// Build enhanced system prompt with context
function buildEnhancedSystemPrompt(
  userProfile: any,
  weather?: WeatherData,
  soil?: SoilResponse,
  location?: { city: string; latitude: number; longitude: number }
): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });

  let systemPrompt = `You are an expert agricultural AI assistant specifically designed for farmers in India. You provide personalized, context-aware farming advice based on real-time data.

**CURRENT CONTEXT:**
📅 Date & Time: ${currentDate}, ${currentTime} (IST)
👤 Farmer: ${userProfile.username} from ${userProfile.location || location?.city || 'Unknown location'}
🏡 Farm Size: ${userProfile.farmsize || 'Not specified'}
🌱 Experience: ${userProfile.experience || 'Not specified'}
🌾 Current Crops: ${userProfile.crop?.join(', ') || 'Not specified'}`;

  if (weather) {
    systemPrompt += `

🌤️ CURRENT WEATHER:
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Conditions: ${weather.conditions}

📊 5-DAY FORECAST:
${weather.forecast.map((day, i) =>
  `Day ${i + 1} (${day.date}): ${day.conditions}, ${day.temp_min}-${day.temp_max}°C, ${day.humidity}% humidity`
).join('\n')}`;
  }

  if (soil) {
    systemPrompt += `

🌍 SOIL ANALYSIS:
- Primary Soil Type: ${soil.properties.most_probable_soil_type}
- Soil Probabilities:
${soil.properties.probabilities?.map(p =>
  `  • ${p.soil_type}: ${p.probability}%`
).join('\n') || '  • No detailed probabilities available'}`;
  }

  systemPrompt += `

**INSTRUCTIONS:**
- Provide personalized farming advice based on the above context
- Consider current weather conditions and forecast in your recommendations
- Take into account the soil type for crop and fertilizer suggestions
- Respond in the same language as the user's input
- Be practical and actionable in your advice
- Include specific timing recommendations when relevant
- Consider the farmer's experience level in your explanations
- Analyze images of crops, pests, and farming conditions when provided
- Focus on sustainable and cost-effective farming practices`;

  return systemPrompt;
}

function prepareContextMessages(messages: APIMessage[]): APIMessage[] {
  if (messages.length === 0) return [];

  const lastMessages = messages.slice(-10);
  const contextMessages: APIMessage[] = [];
  const userMsgs: APIMessage[] = [];
  const assistantMsgs: APIMessage[] = [];

  lastMessages.forEach((msg) => {
    if (msg.role === "user") userMsgs.push(msg);
    else if (msg.role === "assistant") assistantMsgs.push(msg);
  });

  const userCount = Math.min(5, userMsgs.length);
  const assistantCount = Math.min(5, assistantMsgs.length);
  const pairs = Math.min(userCount, assistantCount);

  for (let i = 0; i < pairs; i++) {
    contextMessages.push(userMsgs[userMsgs.length - pairs + i]);
    contextMessages.push(assistantMsgs[assistantMsgs.length - pairs + i]);
  }

  if (userMsgs.length > pairs) {
    for (let i = pairs; i < userCount; i++) {
      contextMessages.push(userMsgs[userMsgs.length - userCount + i]);
    }
  }

  return contextMessages.length > 0
    ? contextMessages
    : [messages[messages.length - 1]];
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, location } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const contextMessages = prepareContextMessages(messages);
    let enhancedSystemPrompt = "You are a helpful AI assistant for agricultural queries. You can analyze images of crops, pests, and farming conditions. Respond in the same language as the user's input. Provide clear, concise responses about farming, crops, diseases, and agricultural practices.";

    // If userId is provided, fetch context data for enhanced prompts
    if (userId) {
      try {
        // Get user profile
        const userProfile = await databaseService.getUserByUserId(userId);

        if (userProfile) {
          let weather: WeatherData | undefined;
          let soil: SoilResponse | undefined;
          let userLocation = location;

          // If location coordinates are provided, fetch weather and soil data
          if (location?.latitude && location?.longitude) {
            try {
              const [weatherData, soilData] = await Promise.allSettled([
                getWeatherForecast(location.latitude, location.longitude),
                getSoilData(location.latitude, location.longitude),
              ]);

              if (weatherData.status === 'fulfilled') {
                weather = weatherData.value;
              }

              if (soilData.status === 'fulfilled') {
                soil = soilData.value;
              }
            } catch (error) {
              console.warn('Failed to fetch weather/soil data:', error);
            }
          }

          // Build enhanced system prompt with context
          enhancedSystemPrompt = buildEnhancedSystemPrompt(userProfile, weather, soil, userLocation);
        }
      } catch (error) {
        console.warn('Failed to fetch user context:', error);
        // Continue with basic prompt if context fetch fails
      }
    }

    const result = streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      messages: contextMessages as any,
      system: enhancedSystemPrompt,
      temperature: 0.7,
      maxRetries: 2,
    });

    // Return the streaming response with proper headers
    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
