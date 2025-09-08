// AI Nudges service for generating personalized farming advice

interface UserProfile {
  userId: string;
  username: string;
  location: string;
  farmsize?: string;
  crop?: string[];
  experience?: string;
  language?: string;
}

interface LocationData {
  city: string;
  latitude: number;
  longitude: number;
}

interface NudgesRequest {
  userProfile: UserProfile;
  location: LocationData;
}

interface NudgesResponse {
  nudges: string[];
  weather: any;
  soil: any;
  location: string;
  crops: string[];
}

class AINotesService {
  private readonly OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API;

  // Get location using OpenCage geocoding
  async getLocationFromGPS(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            if (!this.OPENCAGE_API_KEY) {
              resolve({ city: "Unknown", latitude, longitude });
              return;
            }

            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${this.OPENCAGE_API_KEY}`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const city =
                  result.components.city ||
                  result.components.town ||
                  result.components.village ||
                  result.components.county ||
                  "Unknown";

                resolve({ city, latitude, longitude });
                return;
              }
            }

            resolve({ city: "Unknown", latitude, longitude });
          } catch (error) {
            console.warn("GPS geocoding failed:", error);
            resolve(null);
          }
        },
        () => {
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }

  // Generate AI nudges using API route
  async generateNudges(request: NudgesRequest): Promise<NudgesResponse> {
    try {
      const { userProfile, location } = request;

      const response = await fetch('/api/nudges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.userId,
          location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate nudges');
      }

      return await response.json();
    } catch (error) {
      console.error("AI nudges generation failed:", error);
      throw error;
    }
  }
}

export const aiNudgesService = new AINotesService();
