import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { EnvService } from '../services/api.service';
import { useAuth } from './AuthContext';
import type { WeatherData, AQIData, GeolocationData } from '../types/api.types';

interface EnvContextType {
  weather: WeatherData | null;
  aqi: AQIData | null;
  location: GeolocationData | null;
  loading: boolean;
  error: string | null;
  searchLocation: (query: string) => Promise<GeolocationData[]>;
  setLocation: (loc: GeolocationData) => void;
  refreshData: () => Promise<void>;
}

const EnvContext = createContext<EnvContextType | undefined>(undefined);

// Default coordinates (New Delhi as fallback)
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.2090;

export const EnvProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [location, setLocationState] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, aqiData] = await Promise.all([
        EnvService.getWeather(lat, lon),
        EnvService.getAQI(lat, lon)
      ]);
      setWeather(weatherData);
      setAqi(aqiData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch environmental data');
    } finally {
      setLoading(false);
    }
  };

  const setLocation = (loc: GeolocationData) => {
    setLocationState(loc);
  };

  const refreshData = async () => {
    if (location) {
      await fetchData(location.latitude, location.longitude);
    } else {
      await fetchData(DEFAULT_LAT, DEFAULT_LON);
    }
  };

  useEffect(() => {
    // Wait until authentication is resolved and a user is present
    if (authLoading || !currentUser) {
      setLoading(true);
      return;
    }

    // Component Mount triggers initial fetch
    if (location) {
       fetchData(location.latitude, location.longitude);
    } else {
      // Attempt generic location init from Browser
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              // Reverse geocode the user's real browser coordinates into a named location
              const res = await EnvService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
              if (res) {
                 setLocationState(res);
              } else {
                 throw new Error("Could not reverse geocode coordinates");
              }
            } catch(e) {
               setDefaultLocation();
            }
          },
          () => {
            console.warn("Geolocation permission denied/failed. Using default.");
            setDefaultLocation();
          },
          { timeout: 10000 } // 10 second timeout for GPS location fetch
        );
      } else {
        setDefaultLocation();
      }
    }

    function setDefaultLocation() {
      fetchData(DEFAULT_LAT, DEFAULT_LON);
      setLocationState({
         id: 0,
         name: 'New Delhi',
         latitude: DEFAULT_LAT,
         longitude: DEFAULT_LON,
         country: 'India',
         country_code: 'IN',
         elevation: 216,
         feature_code: 'PCLC',
         timezone: 'Asia/Kolkata',
         population: 31870000,
         admin1: 'Delhi',
         admin1_id: 1273293,
         country_id: 1269750
      });
    }
  }, [location?.latitude, location?.longitude, currentUser, authLoading]);

  return (
    <EnvContext.Provider
      value={{
        weather,
        aqi,
        location,
        loading,
        error,
        searchLocation: EnvService.searchLocation,
        setLocation,
        refreshData
      }}
    >
      {children}
    </EnvContext.Provider>
  );
};

export const useEnv = () => {
  const context = useContext(EnvContext);
  if (context === undefined) {
    throw new Error('useEnv must be used within an EnvProvider');
  }
  return context;
};
