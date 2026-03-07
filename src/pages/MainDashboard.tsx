import { useEnv } from '../context/EnvContext';
import AQIGauge from '../components/environment/AQIGauge';
import WeatherCards from '../components/environment/WeatherCards';
import PollutantsChart from '../components/environment/PollutantsChart';
import ForecastChart from '../components/analytics/ForecastChart';
import MiniMap from '../components/map/MiniMap';
import HealthAdvisory from '../components/health/HealthAdvisory';
import { Activity } from 'lucide-react';

const MainDashboard = () => {
  const { weather, aqi } = useEnv();
  
  // Calculate a mock EcoWatch score (Feature 8, Environmental Score Calculation)
  let ecoScore = 0;
  if (weather && aqi) {
     const aqiScore = Math.max(0, 100 - (aqi.current.us_aqi / 2));
     const tempScore = (weather.current.temperature_2m > 15 && weather.current.temperature_2m < 30) ? 100 : 60;
     ecoScore = Math.round((aqiScore * 0.7) + (tempScore * 0.3));
  }
  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient">Environmental Overview</h1>
          <p className="subtitle">Real-time data and predictive analytics</p>
        </div>
        <div className="score-badge">
          <Activity size={18} className="text-accent-success" />
          Eco Score: <span className="score-value">{ecoScore || '--'}</span><span className="score-max">/100</span>
        </div>
      </div>
      
      {/* Grid Container for Widgets */}
      <div className="dashboard-grid">
        <AQIGauge />
        <WeatherCards />
        <PollutantsChart />
        <ForecastChart />
        <HealthAdvisory />
        <MiniMap />
      </div>
    </div>
  );
};

export default MainDashboard;
