// Model configuration
const MODELS = {
  "google/gemini-2.5-flash": {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash Lite",
    provider: "Google",
    description:
      "Lightweight and fast Gemini model optimized for quick responses and cost-effectiveness",
    contextLength: 1000000,
    inputCost: 0.05,
    outputCost: 0.15,
    capabilities: ["text", "vision", "reasoning", "code", "multimodal"],
    recommended: true,
  },
};

// Default model
const DEFAULT_MODEL = "google/gemini-2.5-flash";

export const DEFAULT_MODELS = {
  GENERAL_CHAT: DEFAULT_MODEL,
  MALAYALAM_CHAT: DEFAULT_MODEL,
};

export { MODELS, DEFAULT_MODEL };
