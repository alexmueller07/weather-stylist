import { WeatherApiResponse, ClothingRecommendation } from '../types';

export const fetchWeatherData = async (
  latitude: number,
  longitude: number,
  timezone: string
): Promise<WeatherApiResponse> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=${encodeURIComponent(timezone)}&forecast_days=1`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return response.json();
};

export const getClothingRecommendation = (
  highTemp: number,
  lowTemp: number,
  weatherCode: number
): ClothingRecommendation => {
  // Weather code interpretation (simplified)
  const isRainy = weatherCode >= 61 && weatherCode <= 67;
  const isSnowy = weatherCode >= 71 && weatherCode <= 77;
  const isCloudy = weatherCode >= 2 && weatherCode <= 3;
  
  let outfit = '';
  let reason = '';
  
  if (highTemp >= 80) {
    outfit = 'light shorts, a breathable t-shirt, and sandals';
    reason = "It's going to be hot today, so stay cool and comfortable";
  } else if (highTemp >= 70) {
    outfit = 'comfortable pants or shorts with a light long-sleeve shirt';
    reason = "Perfect weather for a versatile outfit";
  } else if (highTemp >= 60) {
    outfit = 'jeans with a sweater or light jacket';
    reason = "Mild temperatures call for comfortable layers";
  } else if (highTemp >= 45) {
    outfit = 'warm pants, a sweater, and a medium jacket';
    reason = "It's getting chilly, so bundle up a bit";
  } else if (highTemp >= 30) {
    outfit = 'warm layers, a heavy coat, scarf, and gloves';
    reason = "Cold weather ahead - stay warm and cozy";
  } else {
    outfit = 'your warmest winter gear, including thermal layers, heavy coat, hat, scarf, and insulated boots';
    reason = "It's freezing out there - dress for extreme cold";
  }
  
  // Adjust for weather conditions
  if (isRainy) {
    outfit += ' with a waterproof jacket or umbrella';
    reason += ' with rain protection';
  } else if (isSnowy) {
    outfit += ' with waterproof boots and extra warm layers';
    reason += ' and snow gear';
  } else if (isCloudy) {
    outfit += ' (and maybe bring a light jacket just in case)';
    reason += ' with cloud cover';
  }
  
  return { outfit, reason };
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°F`;
};

export const getWeatherDescription = (weatherCode: number): string => {
  const weatherDescriptions: { [key: number]: string } = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'foggy',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    71: 'slight snow',
    73: 'moderate snow',
    75: 'heavy snow',
    80: 'slight rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    95: 'thunderstorm',
    96: 'thunderstorm with slight hail',
    99: 'thunderstorm with heavy hail',
  };
  
  return weatherDescriptions[weatherCode] || 'unknown weather';
};