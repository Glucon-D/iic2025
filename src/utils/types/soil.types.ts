export interface SoilProbability {
  soil_type: string;
  probability: number;
}

export interface SoilProperties {
  most_probable_soil_type: string;
  probabilities?: SoilProbability[];
}

export interface SoilResponse {
  type: string;
  properties: SoilProperties;
}

export interface SoilApiError {
  error: string;
  message?: string;
}

export interface SoilApiRequest {
  lat: number;
  lon: number;
  top_k?: number;
}
