import { useEnv } from '../../context/EnvContext';
import { useState, useRef } from 'react';
import { TrendingUp, CloudRain, Sun, Cloud, CloudLightning, CloudSnow, ChevronRight, ChevronLeft } from 'lucide-react';
import './ForecastChart.css';

const getWeatherIcon = (code: number, size = 24) => {
  if (code <= 3) return <Sun size={size} className="text-accent-warning" />;
  if (code <= 48) return <Cloud size={size} className="text-secondary" />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain size={size} className="text-accent-primary" />;
  if (code >= 71 && code <= 77) return <CloudSnow size={size} style={{ color: 'var(--text-primary)' }} />;
  if (code >= 95) return <CloudLightning size={size} className="text-accent-danger" />;
  return <Cloud size={size} className="text-secondary" />;
};

const ForecastChart = () => {
  const { weather, loading } = useEnv();
  const [viewMode, setViewMode] = useState<'temp' | 'rain'>('temp');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (loading || !weather) {
    return (
      <div className="glass-panel forecast-container loading span-2">
        <div className="skeleton-graph"></div>
      </div>
    );
  }

  // Parse hourly data for the next 24 hours
  const currentHourIndex = weather.hourly.time.findIndex(t => new Date(t).getTime() >= new Date().getTime() - 3600000);
  const startIndex = currentHourIndex !== -1 ? Math.max(0, currentHourIndex) : 0;
  
  const hourlyData = weather.hourly.time.slice(startIndex, startIndex + 24).map((time, index) => {
    const rawTime = new Date(time);
    let timeLabel = rawTime.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    if (index === 0) timeLabel = 'Now';

    return {
      time: timeLabel,
      temp: Math.round(weather.hourly.temperature_2m[startIndex + index]),
      chanceOfRain: weather.hourly.precipitation_probability[startIndex + index],
      code: weather.hourly.weather_code[startIndex + index] || 0
    };
  });

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="glass-panel forecast-container span-2" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="widget-header">
        <div className="header-title">
          {viewMode === 'temp' ? <TrendingUp size={18} className="text-secondary" /> : <CloudRain size={18} className="text-accent-primary" />}
          <h3>{viewMode === 'temp' ? '24-Hour Temperature Forecast' : '24-Hour Rain Probability'}</h3>
        </div>
        <div className="time-filter">
          <span className={viewMode === 'temp' ? "active" : ""} onClick={() => setViewMode('temp')}>Temp</span>
          <span className={viewMode === 'rain' ? "active" : ""} onClick={() => setViewMode('rain')}>Rain %</span>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: '1.5rem', flex: 1, display: 'flex', alignItems: 'center' }}>
        
        <button onClick={scrollLeft} className="scroll-btn left">
           <ChevronLeft size={20} />
        </button>

        <div 
           ref={scrollRef}
           className="hourly-forecast-scroll" 
           style={{ 
             display: 'flex', 
             overflowX: 'auto', 
             gap: '1rem', 
             paddingBottom: '1rem', 
             scrollBehavior: 'smooth',
             width: '100%',
             scrollbarWidth: 'none', // Firefox
             msOverflowStyle: 'none' // IE/Edge
           }}
        >
          {hourlyData.map((hour, i) => (
            <div key={i} className="hourly-item" style={{ 
               minWidth: '80px', 
               display: 'flex', 
               flexDirection: 'column', 
               alignItems: 'center', 
               background: i === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', 
               padding: '1rem', 
               borderRadius: 'var(--radius-md)',
               border: i === 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
               transition: 'all 0.3s ease'
            }}>
              <span style={{ fontSize: '0.875rem', color: i === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', marginBottom: '0.75rem', fontWeight: i === 0 ? 600 : 400 }}>
                 {hour.time}
              </span>
              
              <div style={{ margin: '0.5rem 0' }}>
                 {getWeatherIcon(hour.code, 28)}
              </div>
              
              <span style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                 {hour.temp}°
              </span>
              
              {viewMode === 'rain' && (
                 <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <CloudRain size={10} /> {hour.chanceOfRain}%
                 </span>
              )}
            </div>
          ))}
        </div>

        <button onClick={scrollRight} className="scroll-btn right">
           <ChevronRight size={20} />
        </button>

      </div>
    </div>
  );
};

export default ForecastChart;
