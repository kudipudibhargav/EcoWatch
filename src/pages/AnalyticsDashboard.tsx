import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Droplets } from 'lucide-react';
import { useEnv } from '../context/EnvContext';
import { AnalyticsService } from '../services/analytics.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const AnalyticsDashboard = () => {
  const { location } = useEnv();
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!location) return;
      setLoading(true);
      const res = await AnalyticsService.getHistoricalData(location.latitude, location.longitude);
      
      if (res && res.daily) {
        // Format for Recharts
        const formatted = res.daily.time.map((date: string, index: number) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          maxTemp: res.daily.temperature_2m_max[index],
          minTemp: res.daily.temperature_2m_min[index],
          rain: res.daily.precipitation_sum[index]
        }));
        setHistoricalData(formatted);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [location?.latitude, location?.longitude]);

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient-purple" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <BarChart2 size={28} /> Environmental Analytics
          </h1>
          <p className="subtitle">7-Day Historical Trends for {location?.name || 'your location'}</p>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem', height: '400px' }}>
          <div className="widget-header">
             <div className="header-title">
               <TrendingUp size={18} className="text-accent-warning" />
               <h3>Temperature Trends (Past 7 Days)</h3>
             </div>
          </div>
          
          <div style={{ width: '100%', height: '300px', marginTop: '1rem' }}>
            {loading ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading historical data...</div>
            ) : historicalData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No historical data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(val) => `${val}°`} />
                  <RechartsTooltip 
                    contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="maxTemp" name="Max Temp (°C)" stroke="var(--accent-warning)" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="minTemp" name="Min Temp (°C)" stroke="var(--accent-info)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem', height: '400px' }}>
          <div className="widget-header">
             <div className="header-title">
               <Droplets size={18} className="text-accent-primary" />
               <h3>Precipitation Volume (Past 7 Days)</h3>
             </div>
          </div>
          
          <div style={{ width: '100%', height: '300px', marginTop: '1rem' }}>
            {loading ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading historical data...</div>
            ) : historicalData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No historical data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(val) => `${val}mm`} />
                  <RechartsTooltip 
                    contentStyle={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="stepAfter" dataKey="rain" name="Rainfall (mm)" stroke="var(--accent-primary)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
