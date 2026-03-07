import type { WeatherData, AQIData, GeolocationData } from '../types/api.types';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AQI_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export class EnvService {
  /**
   * Fetch current weather and 7-day forecast
   */
  static async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
      hourly: 'temperature_2m,precipitation_probability,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
      timezone: 'auto'
    });

    const res = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    return res.json();
  }

  /**
   * Fetch Real-time AQI and historical pollutants
   */
  static async getAQI(lat: number, lon: number): Promise<AQIData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,dust,uv_index',
      hourly: 'us_aqi,pm10,pm2_5',
      timezone: 'auto'
    });

    const res = await fetch(`${AQI_API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch AQI data');
    return res.json();
  }

  /**
   * Search for cities and locations
   */
  static async searchLocation(query: string): Promise<GeolocationData[]> {
    const params = new URLSearchParams({
      name: query,
      count: '5',
      language: 'en',
      format: 'json'
    });

    const res = await fetch(`${GEOCODING_API_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search location');
    const data = await res.json();
    return data.results || [];
  }

  /**
   * Reverse Geocode coordinates to City Name via OSM Nominatim
   */
  static async reverseGeocode(lat: number, lon: number): Promise<GeolocationData> {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    if (!res.ok) throw new Error('Failed to reverse geocode');
    const data = await res.json();
    return {
      id: data.place_id || Math.random(),
      name: data.address?.city || data.address?.town || data.address?.village || data.name || 'Current Location',
      latitude: lat,
      longitude: lon,
      country: data.address?.country || 'Unknown',
      country_code: data.address?.country_code?.toUpperCase() || '',
      elevation: 0,
      feature_code: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      population: 0,
      admin1: data.address?.state || '',
      admin1_id: 0,
      country_id: 0
    };
  }
}
