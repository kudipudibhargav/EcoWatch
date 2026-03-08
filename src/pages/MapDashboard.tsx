import { Map as MapIcon, Layers, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEnv } from '../context/EnvContext';
import { useEffect, useState } from 'react';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Red pin icon for clicked location
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Component to dynamically update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
  }, [center, map]);
  return null;
};

// Component to capture click events
const ClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapDashboard = () => {
  const { location, aqi, weather, searchLocation } = useEnv();
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [clickLoading, setClickLoading] = useState(false);

  const center: [number, number] = location ? [location.latitude, location.longitude] : [20.5937, 78.9629];
  const aqiValue = aqi?.current.us_aqi || 'N/A';
  const tempValue = weather ? Math.round(weather.current.temperature_2m) : 'N/A';

  const handleMapClick = async (lat: number, lng: number) => {
    setClickLoading(true);
    setClickedPoint({ lat, lng });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const name = data.address?.city || data.address?.town || data.address?.village || data.display_name?.split(',')[0] || 'Selected Location';
      setClickedPoint({ lat, lng, name });
      await searchLocation(name);
    } catch {
      setClickedPoint({ lat, lng, name: 'Selected Location' });
    } finally {
      setClickLoading(false);
    }
  };

  return (
    <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="dashboard-header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapIcon size={28} /> Advanced Geo Explorer
          </h1>
          <p className="subtitle">Click anywhere on the map to explore AQI &amp; weather for that location</p>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          dragging={true}
          style={{ height: '100%', width: '100%', background: '#0a0a0a', zIndex: 1, cursor: 'crosshair' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />
          <ClickHandler onMapClick={handleMapClick} />

          {/* Current location marker (blue) */}
          <Marker position={center}>
            <Popup>
              <div style={{ padding: '0.5rem', minWidth: '150px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a', fontWeight: 'bold' }}>{location?.name || 'Current Location'}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#333' }}>
                  <span>AQI:</span><span style={{ fontWeight: 'bold' }}>{aqiValue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                  <span>Temp:</span><span style={{ fontWeight: 'bold' }}>{tempValue}°C</span>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Clicked location marker (red) */}
          {clickedPoint && (
            <Marker position={[clickedPoint.lat, clickedPoint.lng]} icon={redIcon}>
              <Popup>
                <div style={{ padding: '0.5rem', minWidth: '150px' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a', fontWeight: 'bold' }}>
                    📍 {clickedPoint.name || 'Fetching...'}
                  </h3>
                  <div style={{ color: '#555', fontSize: '0.8rem' }}>
                    {clickLoading ? 'Loading data...' : `${clickedPoint.lat.toFixed(4)}, ${clickedPoint.lng.toFixed(4)}`}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Map Legend */}
        <div style={{
          position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
          background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
          padding: '1rem', color: 'var(--text-primary)', minWidth: '180px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            <Layers size={16} /> Map Layers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked readOnly /> AQI Overlay (Active)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" disabled /> Temperature (Pro)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" disabled /> Wind Jets (Pro)
            </label>
          </div>
          {clickedPoint && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {clickedPoint.name || `${clickedPoint.lat.toFixed(3)}, ${clickedPoint.lng.toFixed(3)}`}
              {clickLoading && ' (loading...)'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
