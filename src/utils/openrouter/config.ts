// OpenRouter configuration
export const openRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Digital Krishi Officer',
  },
};

// Validate configuration
export function validateOpenRouterConfig() {
  if (!openRouterConfig.apiKey) {
    throw new Error('OPENROUTER_API_KEY is required');
  }
  
  if (!openRouterConfig.baseURL) {
    throw new Error('NEXT_PUBLIC_OPENROUTER_BASE_URL is required');
  }
}

// Get configuration for client-side usage (without API key)
export function getClientConfig() {
  return {
    baseURL: openRouterConfig.baseURL,
    defaultHeaders: openRouterConfig.defaultHeaders,
  };
}

// Get configuration for server-side usage (with API key)
export function getServerConfig() {
  validateOpenRouterConfig();
  return openRouterConfig;
}
