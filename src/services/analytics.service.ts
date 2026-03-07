// analytics.service.ts

const ARCHIVE_WEATHER_URL = 'https://archive-api.open-meteo.com/v1/archive';

export class AnalyticsService {
  /**
   * Fetch historical weather and AQI for the past 7 days 
   */
  static async getHistoricalData(lat: number, lon: number) {
    // Calculate dates for the past 7 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 days ago

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      start_date: startStr,
      end_date: endStr,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max'
    });

    try {
      const res = await fetch(`${ARCHIVE_WEATHER_URL}?${params.toString()}`);
      if (!res.ok) throw new Error('Historical API failed');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
