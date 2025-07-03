export interface UserData {
  firstName: string;
  email: string;
  city?: string;
}

export interface UserSubmissionData extends UserData {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
}

export interface WeatherData {
  temperature_2m: number[];
  weathercode: number[];
  time: string[];
}

export interface WeatherApiResponse {
  hourly: WeatherData;
  timezone: string;
}

export interface ClothingRecommendation {
  outfit: string;
  reason: string;
}