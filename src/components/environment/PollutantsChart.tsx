import { useEnv } from '../../context/EnvContext';
import { useState } from 'react';
import { Activity, Wind } from 'lucide-react';
import './PollutantsChart.css';

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: 'var(--accent-success)' };
  if (aqi <= 100) return { label: 'Moderate', color: 'var(--accent-warning)' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'var(--accent-danger)' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#dc2626' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#991b1b' };
  return { label: 'Hazardous', color: '#7f1d1d' };
};

const getPolCategory = (name: string, val: number) => {
  let good = 0, mod = 0;
  if (name === 'PM2.5') { good = 12; mod = 35.4; }
  else if (name === 'PM10') { good = 54; mod = 154; }
  else if (name === 'CO') { good = 4.4; mod = 9.4; }
  else if (name === 'NO2') { good = 53; mod = 100; }
  else if (name === 'SO2') { good = 35; mod = 75; }
  else if (name === 'O3') { good = 54; mod = 70; }

  if (val <= good) return { label: 'Good', color: 'var(--accent-success)' };
  if (val <= mod) return { label: 'Moderate', color: 'var(--accent-warning)' };
  return { label: 'Unhealthy', color: 'var(--accent-danger)' };
};

const PollutantsChart = () => {
  const { aqi, loading } = useEnv();
  const [viewMode, setViewMode] = useState<'current' | '24h'>('current');

  if (loading || !aqi) {
    return (
      <div className="glass-panel pollutants-container span-2 loading">
        <div className="skeleton-graph"></div>
      </div>
    );
  }

  const { current, hourly } = aqi;
  
  const avg = (arr: number[]) => arr && arr.length > 0 ? arr.slice(0, 24).reduce((a, b) => a + b, 0) / 24 : 0;

  const dataToDisplay = viewMode === 'current' ? {
    aqi: current.us_aqi,
    pm25: current.pm2_5,
    pm10: current.pm10,
    co: current.carbon_monoxide,
    no2: current.nitrogen_dioxide,
    so2: current.sulphur_dioxide,
    o3: current.ozone,
  } : {
    aqi: Math.round(avg(hourly.us_aqi)),
    pm25: Math.round(avg(hourly.pm2_5)),
    pm10: Math.round(avg(hourly.pm10)),
    co: current.carbon_monoxide, // fallback if hourly CO isn't requested in API
    no2: current.nitrogen_dioxide,
    so2: current.sulphur_dioxide,
    o3: current.ozone,
  };

  const aqiStatus = getAQIStatus(dataToDisplay.aqi);

  const pollutants = [
    { key: 'PM2.5', name: 'PM2.5', val: dataToDisplay.pm25, unit: 'µg/m³' },
    { key: 'PM10', name: 'PM10', val: dataToDisplay.pm10, unit: 'µg/m³' },
    { key: 'CO', name: 'CO', val: dataToDisplay.co || 0, unit: 'µg/m³' },
    { key: 'NO2', name: 'NO2', val: dataToDisplay.no2, unit: 'µg/m³' },
    { key: 'SO2', name: 'SO2', val: dataToDisplay.so2, unit: 'µg/m³' },
    { key: 'O3', name: 'O3', val: dataToDisplay.o3, unit: 'µg/m³' },
  ];

  return (
    <div className="glass-panel pollutants-container span-2" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="widget-header">
        <div className="header-title">
          <Activity size={18} className="text-secondary" />
          <h3>Air Pollution Breakdown</h3>
        </div>
        <div className="time-filter">
          <span className={viewMode === 'current' ? "active" : ""} onClick={() => setViewMode('current')}>Current</span>
          <span className={viewMode === '24h' ? "active" : ""} onClick={() => setViewMode('24h')}>24h Avg</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        
        {/* Top AQI Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${aqiStatus.color}` }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                 <Wind size={24} color={aqiStatus.color} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                 <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Air Quality Index (AQI)</h4>
                 <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Overall health concern</p>
              </div>
           </div>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: aqiStatus.color }}>{dataToDisplay.aqi}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: aqiStatus.color, opacity: 0.9 }}>{aqiStatus.label}</div>
           </div>
        </div>

        {/* Pollutants Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
           {pollutants.map(p => {
              const cat = getPolCategory(p.name, p.val);
              return (
                 <div key={p.key} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderTop: `2px solid ${cat.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                       <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }}></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                       <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.val}</span>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{p.unit}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: cat.color, marginTop: '0.25rem', fontWeight: 500 }}>{cat.label}</div>
                 </div>
              );
           })}
        </div>

      </div>
    </div>
  );
};

export default PollutantsChart;
