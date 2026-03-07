import { useEnv } from '../../context/EnvContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Info } from 'lucide-react';
import './AQIGauge.css';

const AQIGauge = () => {
  const { aqi, loading } = useEnv();

  if (loading || !aqi) {
    return (
      <div className="glass-panel aqi-gauge-container loading">
        <div className="skeleton-circle indicator-pulse"></div>
      </div>
    );
  }

  const currentAQI = aqi.current.us_aqi;
  
  // Custom Gauge styling logic
  let status = 'Good';
  let color = 'var(--accent-success)';
  if (currentAQI > 50 && currentAQI <= 100) {status = 'Moderate'; color = 'var(--accent-warning)';}
  else if (currentAQI > 100 && currentAQI <= 150) {status = 'Unhealthy for Sensitive'; color = 'var(--accent-danger)';}
  else if (currentAQI > 150) {status = 'Unhealthy'; color = '#991B1B';} // Darker red

  // Pie chart data for a semi-circle gauge (total 180 degrees)
  const data = [
    { name: 'Value', value: currentAQI > 300 ? 300 : currentAQI }, // Cap for display
    { name: 'Remaining', value: 300 - (currentAQI > 300 ? 300 : currentAQI) }
  ];

  return (
    <div className="glass-panel aqi-gauge-container">
      <div className="widget-header">
        <h3>Air Quality Index</h3>
        <Info size={16} className="text-secondary" />
      </div>

      <div className="gauge-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              <Cell key="cell-0" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
              <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="gauge-content">
          <span className="aqi-value" style={{ color }}>{currentAQI}</span>
          <span className="aqi-status">{status}</span>
        </div>
      </div>

      <div className="aqi-details">
        {currentAQI > 100 && (
          <div className="health-alert">
            <AlertTriangle size={14} />
            <span>Health Warning Issued</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AQIGauge;
