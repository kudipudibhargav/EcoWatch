export interface EarthquakeData {
  id: string;
  place: string;
  mag: number;
  time: number;
  tsunami: number;
  url: string;
  coords: [number, number, number];
}

const USGS_API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

export class EarthquakeService {
  /**
   * Fetch all global earthquakes from the past 24 hours from the USGS API
   */
  static async getEarthquakes(): Promise<EarthquakeData[]> {
    try {
      const res = await fetch(USGS_API_URL);
      if (!res.ok) throw new Error('Failed to fetch Earthquake data');
      const data = await res.json();
      
      // Parse USGS GeoJSON down to our interface
      return data.features.map((feature: any) => ({
        id: feature.id,
        place: feature.properties.place,
        mag: feature.properties.mag,
        time: feature.properties.time,
        tsunami: feature.properties.tsunami,
        url: feature.properties.url,
        coords: feature.geometry.coordinates // [longitude, latitude, depth]
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}
