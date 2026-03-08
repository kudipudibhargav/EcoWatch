import { Map as MapIcon, Layers, MapPin, Wind, Droplets, Thermometer, Activity, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEnv } from '../context/EnvContext';
import { EnvService } from '../services/api.service';
import { useEffect, useState } from 'react';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 8); }, [center, map]);
  return null;
};

const ClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const getAqiLabel = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: '#10b981', emoji: '🟢' };
  if (aqi <= 100) return { label: 'Moderate', color: '#f59e0b', emoji: '🟡' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316', emoji: '🟠' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', emoji: '🔴' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#8b5cf6', emoji: '🟣' };
  return { label: 'Hazardous', color: '#7f1d1d', emoji: '🔴' };
};

const getEnvSummary = (aqi: number, temp: number, humidity: number, wind: number, locationName: string) => {
  const { label } = getAqiLabel(aqi);
  let advice = '';
  if (aqi <= 50) advice = 'Air quality is excellent. Perfect conditions for outdoor activities.';
  else if (aqi <= 100) advice = 'Air is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.';
  else if (aqi <= 150) advice = 'Sensitive groups (children, elderly, those with respiratory conditions) should limit outdoor activity.';
  else advice = 'Health alert: everyone may experience health effects. Avoid outdoor activities and wear a mask if going out.';

  const tempDesc = temp < 15 ? 'cool' : temp < 25 ? 'comfortable' : temp < 35 ? 'warm' : 'hot';
  const humidDesc = humidity < 30 ? 'dry' : humidity < 60 ? 'pleasant' : 'humid';

  return `${locationName} currently has ${label.toLowerCase()} air quality (AQI ${aqi}). The weather feels ${tempDesc} at ${temp}°C with ${humidDesc} air (${humidity}% humidity) and winds at ${wind} km/h. ${advice}`;
};

interface LocationSummary {
  lat: number;
  lng: number;
  name: string;
  aqi: number;
  temp: number;
  humidity: number;
  wind: number;
}

const MapDashboard = () => {
  const { location } = useEnv();
  const [clickedSummary, setClickedSummary] = useState<LocationSummary | null>(null);
  const [clickLoading, setClickLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const center: [number, number] = location
    ? [location.latitude, location.longitude]
    : [20.5937, 78.9629]; // Center of India as safe default

  const handleMapClick = async (lat: number, lng: number) => {
    setClickLoading(true);
    setShowPanel(true);
    setClickedSummary(null);

    try {
      // Parallel: reverse geocode + fetch AQI + weather
      const [reverseRes, aqiData, weatherData] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`).then(r => r.json()),
        EnvService.getAQI(lat, lng),
        EnvService.getWeather(lat, lng),
      ]);

      const name =
        reverseRes.address?.city ||
        reverseRes.address?.town ||
        reverseRes.address?.county ||
        reverseRes.address?.state ||
        reverseRes.display_name?.split(',')[0] ||
        'Selected Location';

      setClickedSummary({
        lat, lng, name,
        aqi: aqiData.current.us_aqi ?? 0,
        temp: Math.round(weatherData.current.temperature_2m ?? 0),
        humidity: weatherData.current.relative_humidity_2m ?? 0,
        wind: Math.round(weatherData.current.wind_speed_10m ?? 0),
      });
    } catch {
      setClickedSummary({ lat, lng, name: 'Selected Location', aqi: 0, temp: 0, humidity: 0, wind: 0 });
    } finally {
      setClickLoading(false);
    }
  };

  return (
    <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="dashboard-header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapIcon size={28} /> Global Geo Explorer
          </h1>
          <p className="subtitle">Click anywhere on the map to get real-time environmental data & analysis</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
        {/* Map */}
        <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0, minHeight: '400px' }}>
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={true}
            dragging={true}
            style={{ height: '100%', width: '100%', minHeight: '400px', background: '#0a0a0a', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} />
            <ClickHandler onMapClick={handleMapClick} />

            {/* Current location blue marker */}
            {location && (
              <Marker position={center}>
                <Popup>
                  <div style={{ padding: '0.5rem' }}>
                    <strong>{location.name}</strong> — Your current location
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Clicked location red marker */}
            {clickedSummary && (
              <Marker position={[clickedSummary.lat, clickedSummary.lng]} icon={redIcon}>
                <Popup>
                  <div style={{ padding: '0.5rem' }}>
                    <strong>📍 {clickedSummary.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>
                      AQI: {clickedSummary.aqi} | {clickedSummary.temp}°C
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Map layers legend */}
          <div style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 1000,
            background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            padding: '0.875rem', color: 'var(--text-primary)', minWidth: '160px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.85rem' }}>
              <Layers size={15} /> Map Layers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked readOnly /> AQI Overlay
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" disabled /> Temperature (Pro)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" disabled /> Wind Jets (Pro)
              </label>
            </div>
          </div>

          {/* Crosshair hint */}
          {!showPanel && (
            <div style={{
              position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 1000, background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
              padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)',
              pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <MapPin size={14} /> Click on any location to see environmental data
            </div>
          )}
        </div>

        {/* Environment Summary Panel */}
        {showPanel && (
          <div className="glass-panel fade-in" style={{
            width: '320px', flexShrink: 0, padding: '1.5rem', display: 'flex',
            flexDirection: 'column', gap: '1rem', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>
                📍 Environment Report
              </h3>
              <button onClick={() => setShowPanel(false)} style={{
                background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                cursor: 'pointer', padding: '4px'
              }}>
                <X size={18} />
              </button>
            </div>

            {clickLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: '56px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
                ))}
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center' }}>
                  Fetching real-time data...
                </p>
              </div>
            ) : clickedSummary ? (
              <>
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: `1px solid ${getAqiLabel(clickedSummary.aqi).color}30` }}>
                  <p style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>{getAqiLabel(clickedSummary.aqi).emoji}</p>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>{clickedSummary.name}</h2>
                  <span style={{ padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${getAqiLabel(clickedSummary.aqi).color}20`, color: getAqiLabel(clickedSummary.aqi).color }}>
                    {getAqiLabel(clickedSummary.aqi).label}
                  </span>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { icon: <Activity size={16} />, label: 'AQI Index', value: clickedSummary.aqi, color: getAqiLabel(clickedSummary.aqi).color },
                    { icon: <Thermometer size={16} />, label: 'Temperature', value: `${clickedSummary.temp}°C`, color: '#f97316' },
                    { icon: <Droplets size={16} />, label: 'Humidity', value: `${clickedSummary.humidity}%`, color: '#38bdf8' },
                    { icon: <Wind size={16} />, label: 'Wind Speed', value: `${clickedSummary.wind} km/h`, color: '#a78bfa' },
                  ].map(({ icon, label, value, color }) => (
                    <div key={label} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color, marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                        {icon} {label}
                      </div>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* AI-style summary text */}
                <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.06)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {getEnvSummary(clickedSummary.aqi, clickedSummary.temp, clickedSummary.humidity, clickedSummary.wind, clickedSummary.name)}
                  </p>
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: 0 }}>
                  {clickedSummary.lat.toFixed(4)}°, {clickedSummary.lng.toFixed(4)}° · Live data via Open-Meteo
                </p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDashboard;
