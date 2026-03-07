import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Rocket, MapPin } from 'lucide-react';

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const MapMover = ({ lat, lon }: { lat: number, lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lon], { animate: true });
  }, [lat, lon, map]);
  return null;
};

const ISSTracker = () => {
  const [issData, setIssData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch(ISS_API);
        const data = await res.json();
        setIssData(data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch ISS data");
        setLoading(false);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000); // 5s interval for smooth movement
    return () => clearInterval(interval);
  }, []);

  if (loading || !issData) {
    return (
      <div className="glass-panel map-container loading span-2">
        <div className="skeleton-graph"></div>
      </div>
    );
  }

  const { latitude, longitude, altitude, velocity } = issData;

  const mapTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="glass-panel map-container span-2">
      <div className="widget-header">
        <div className="header-title">
          <Rocket size={18} className="text-secondary" />
          <h3>ISS Real-Time Tracker</h3>
        </div>
        <div className="location-btn">
          <MapPin size={14} className="text-accent-primary"/> 
          <span>Alt: {Math.round(altitude)} km</span>
        </div>
      </div>
      
      <div className="leaflet-wrapper">
        <MapContainer center={[latitude, longitude]} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <TileLayer
            attribution='&copy; CARTO'
            url={mapTiles}
          />
          <MapMover lat={latitude} lon={longitude} />
          
          <Marker position={[latitude, longitude]} icon={issIcon}>
            <Popup className="premium-popup">
              <div className="popup-content">
                <strong>International Space Station</strong><br/>
                Lat: {latitude.toFixed(4)}<br/>
                Lon: {longitude.toFixed(4)}<br/>
                Speed: {Math.round(velocity)} km/h
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default ISSTracker;
