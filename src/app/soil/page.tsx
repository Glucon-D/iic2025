"use client";

import { useState, useEffect } from "react";
import { SoilResponse, SoilApiError } from "@/utils/types/soil.types";

export default function SoilPage() {
  const [soilData, setSoilData] = useState<SoilResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [topK, setTopK] = useState<number>(3);

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        fetchSoilData(latitude, longitude, topK);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Fetch soil data from our API
  const fetchSoilData = async (lat: number, lon: number, top_k: number = 3) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        top_k: top_k.toString(),
      });

      const response = await fetch(`/api/soil/type?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        const errorData = data as SoilApiError;
        throw new Error(
          errorData.message || errorData.error || "Failed to fetch soil data"
        );
      }

      setSoilData(data as SoilResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (location) {
      fetchSoilData(location.lat, location.lon, topK);
    } else {
      getCurrentLocation();
    }
  };

  // Handle top_k change
  const handleTopKChange = (newTopK: number) => {
    setTopK(newTopK);
    if (location) {
      fetchSoilData(location.lat, location.lon, newTopK);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Soil Type Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover the soil type at your current location using AI-powered
            analysis
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Top K Results:
              </label>
              <select
                value={topK}
                onChange={(e) => handleTopKChange(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
              >
                {loading ? "Getting Location..." : "Get Current Location"}
              </button>

              {location && (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
                >
                  Refresh Data
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Location Info */}
        {location && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Current Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Latitude:
                </span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {location.lat.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Longitude:
                </span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {location.lon.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Soil Data Display */}
        {soilData && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Soil Analysis Results
            </h2>

            {/* Most Probable Soil Type */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Most Probable Soil Type
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  {soilData.properties.most_probable_soil_type}
                </p>
              </div>
            </div>

            {/* Probability Distribution */}
            {soilData.properties.probabilities &&
              soilData.properties.probabilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Probability Distribution (Top{" "}
                    {soilData.properties.probabilities.length})
                  </h3>
                  <div className="space-y-3">
                    {soilData.properties.probabilities.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.soil_type}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {item.probability.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Raw Data (for debugging) */}
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                View Raw API Response
              </summary>
              <pre className="mt-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(soilData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        {!soilData && !loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to Analyze Soil
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click "Get Current Location" to start analyzing the soil type at
              your location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
