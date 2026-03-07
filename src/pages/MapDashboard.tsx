import { Map as MapIcon, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEnv } from '../context/EnvContext';
import { useEffect } from 'react';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
  }, [center, map]);
  return null;
};

const MapDashboard = () => {
  const { location, aqi, weather } = useEnv();

  const center: [number, number] = location ? [location.latitude, location.longitude] : [28.6139, 77.2090];
  const aqiValue = aqi?.current.us_aqi || 'N/A';
  const tempValue = weather ? Math.round(weather.current.temperature_2m) : 'N/A';

  return (
    <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="dashboard-header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <MapIcon size={28} /> Advanced Geo Explorer
          </h1>
          <p className="subtitle">Real-time Environmental Data Spatial Overlays</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
        <MapContainer 
          center={center} 
          zoom={10} 
          scrollWheelZoom={true}
          dragging={true}
          style={{ height: '100%', width: '100%', background: '#0a0a0a', zIndex: 1 }}
        >
          {/* CARTO Dark Matter TileLayer for stunning dark mode maps */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          
          <Marker position={center}>
            <Popup>
              <div style={{ padding: '0.5rem', minWidth: '150px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a', fontWeight: 'bold' }}>{location?.name || 'Current Location'}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#333' }}>
                  <span>AQI:</span>
                  <span style={{ fontWeight: 'bold' }}>{aqiValue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                  <span>Temp:</span>
                  <span style={{ fontWeight: 'bold' }}>{tempValue}°C</span>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Map Legend / Controls */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000, 
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          color: 'var(--text-primary)'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
             <Layers size={16} /> Map Layers
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
               <input type="checkbox" checked readOnly /> AQI Heatmap (Active)
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
               <input type="checkbox" disabled /> Temperature (Pro)
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
               <input type="checkbox" disabled /> Live Wind Jets (Pro)
             </label>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
