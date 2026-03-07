import { useEnv } from '../../context/EnvContext';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  Sun, 
  Cloud, 
  CloudLightning 
} from 'lucide-react';
import './WeatherCards.css';

// WMO Weather interpretation codes
const getWeatherCondition = (code: number, isDay: number) => {
  if (code === 0) return { text: 'Clear Sky', icon: isDay ? <Sun size={48} className="weather-icon sun" /> : <Sun size={48} className="weather-icon moon" /> };
  if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', icon: <Cloud size={48} className="weather-icon cloud" /> };
  if (code >= 51 && code <= 67) return { text: 'Rain', icon: <CloudRain size={48} className="weather-icon rain" /> };
  if (code >= 95) return { text: 'Thunderstorm', icon: <CloudLightning size={48} className="weather-icon storm" /> };
  return { text: 'Cloudy', icon: <Cloud size={48} className="weather-icon cloud" /> };
};

const WeatherCards = () => {
  const { weather, loading } = useEnv();

  if (loading || !weather) {
    return (
      <div className="glass-panel weather-card-container loading">
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
    );
  }

  const { current } = weather;
  const condition = getWeatherCondition(current.weather_code, current.is_day);

  return (
    <div className="glass-panel weather-card-container">
      <div className="weather-header">
        <div className="weather-main-info">
          <div className="temp-display">
            <span className="temp-value">{Math.round(current.temperature_2m)}°</span>
            <span className="temp-feels">Feels like {Math.round(current.apparent_temperature)}°</span>
          </div>
          <div className="weather-status">
            {condition.icon}
            <span className="status-text">{condition.text}</span>
          </div>
        </div>
      </div>

      <div className="weather-metrics-grid">
        <div className="metric-box">
          <Droplets size={18} className="text-accent-info" />
          <div className="metric-info">
            <span className="metric-label">Humidity</span>
            <span className="metric-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>
        <div className="metric-box">
          <Wind size={18} className="text-secondary" />
          <div className="metric-info">
            <span className="metric-label">Wind</span>
            <span className="metric-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>
        <div className="metric-box">
          <Thermometer size={18} className="text-accent-warning" />
          <div className="metric-info">
            <span className="metric-label">Pressure</span>
            <span className="metric-value">{current.surface_pressure} hPa</span>
          </div>
        </div>
        <div className="metric-box">
          <CloudRain size={18} className="text-accent-primary" />
          <div className="metric-info">
            <span className="metric-label">Precipitation</span>
            <span className="metric-value">{current.precipitation} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCards;
