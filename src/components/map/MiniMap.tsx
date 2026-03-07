import { useEffect } from 'react';
import { useEnv } from '../../context/EnvContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map as MapIcon, Crosshair } from 'lucide-react';
import './MiniMap.css';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically re-center map when location context changes
const MapUpdater = ({ lat, lon }: { lat: number, lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 10, { animate: true });
  }, [lat, lon, map]);
  return null;
};

const MiniMap = () => {
  const { location, aqi, weather } = useEnv();

  if (!location) {
    return (
       <div className="glass-panel map-container loading span-2">
         <div className="skeleton-graph"></div>
       </div>
    );
  }

  const position: [number, number] = [location.latitude, location.longitude];

  // CARTO Dark Matter map tiles for premium dark theme look
  const mapTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

  return (
    <div className="glass-panel map-container span-2">
      <div className="widget-header">
        <div className="header-title">
          <MapIcon size={18} className="text-secondary" />
          <h3>Global Geospatial Monitor</h3>
        </div>
        <button className="location-btn">
          <Crosshair size={14} /> Center
        </button>
      </div>
      
      <div className="leaflet-wrapper" style={{ zIndex: 1, position: 'relative', height: '100%' }}>
        <MapContainer center={position} zoom={10} scrollWheelZoom={true} dragging={true} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={mapTiles}
          />
          <MapUpdater lat={location.latitude} lon={location.longitude} />
          
          <Marker position={position}>
            <Popup className="premium-popup">
              <div className="popup-content">
                <strong>{location.name}</strong><br/>
                AQI: {aqi?.current.us_aqi || 'Loading'}<br/>
                Temp: {weather ? Math.round(weather.current.temperature_2m) : '--'}°C
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MiniMap;
