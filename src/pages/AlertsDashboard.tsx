import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertTriangle, Waves, ExternalLink } from 'lucide-react';
import { EarthquakeService } from '../services/earthquake.service';
import type { EarthquakeData } from '../services/earthquake.service';
import { formatDistanceToNow } from 'date-fns';
import { useEnv } from '../context/EnvContext';

const AlertsDashboard = () => {
  const { location } = useEnv();
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate Haversine distance in km
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  useEffect(() => {
    const fetchQuakes = async () => {
      setLoading(true);
      const data = await EarthquakeService.getEarthquakes();
      // Filter out micro-quakes (magnitude < 2.5)
      let significantQuakes = data.filter(q => q.mag >= 2.5).sort((a, b) => b.time - a.time);
      
      // Filter to roughly a country/regional level (2500km radius)
      if (location) {
        significantQuakes = significantQuakes.filter(q => {
          const [lon, lat] = q.coords;
          const dist = getDistance(location.latitude, location.longitude, lat, lon);
          const isCountryMatch = q.place.toLowerCase().includes(location.country.toLowerCase());
          return dist <= 2500 || isCountryMatch;
        });
      }

      setEarthquakes(significantQuakes);
      setLoading(false);
    };
    
    fetchQuakes();
    const interval = setInterval(fetchQuakes, 300000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, [location]);

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 6) return 'var(--accent-danger)';
    if (mag >= 4.5) return 'var(--accent-warning)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <ShieldAlert size={28} className="text-accent-danger" /> Emergency Disaster Alerts
          </h1>
          <p className="subtitle">Real-time global Earthquake & Tsunami monitoring (USGS API)</p>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '70vh' }}>
          <div className="widget-header">
             <div className="header-title">
                <Activity size={18} className="text-accent-danger" />
                <h3>Significant Earthquakes ({location ? `Near ${location.country}` : 'Global'})</h3>
             </div>
             <div className="time-filter">
                <span className="active">Live Feed</span>
             </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                 Scanning global seismic networks...
              </div>
            ) : earthquakes.length === 0 ? (
               <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No significant earthquakes near {location?.name || 'your region'} in the past 24 hours.</div>
            ) : (
               earthquakes.map((quake) => (
                 <div key={quake.id} style={{
                   background: 'rgba(255,255,255,0.03)', 
                   borderLeft: `4px solid ${getMagnitudeColor(quake.mag)}`,
                   padding: '1rem',
                   borderRadius: 'var(--radius-md)',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '1rem'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                           {quake.place}
                        </h4>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                           {formatDistanceToNow(quake.time, { addSuffix: true })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                         <AlertTriangle size={16} color={getMagnitudeColor(quake.mag)} />
                         <span style={{ fontWeight: 700, fontSize: '1.25rem', color: getMagnitudeColor(quake.mag) }}>{quake.mag.toFixed(1)}</span>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                     {quake.tsunami === 1 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-info)', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                           <Waves size={16} /> TSUNAMI WARNING ISSUED
                        </span>
                     ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No Tsunami Threat</span>
                     )}
                     
                     <a href={quake.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                        USGS Report <ExternalLink size={14} />
                     </a>
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
