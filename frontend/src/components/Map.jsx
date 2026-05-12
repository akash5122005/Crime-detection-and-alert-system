import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function CrimeMap({ token }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/incidents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setIncidents(data))
    .catch(console.error);
  }, [token]);

  return (
    <div className="h-full flex flex-col p-8">
      <h1 className="text-3xl font-bold mb-6">Real-Time Crime Map</h1>
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 shadow-xl z-0 relative">
        <MapContainer center={[40.75, -73.98]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {incidents.map((incident) => (
            <Marker key={incident.id} position={[incident.lat, incident.lng]}>
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold text-lg">{incident.type}</h3>
                  <p className="text-sm">Severity: <span className="font-semibold text-red-500">{incident.severity}/5</span></p>
                  <p className="text-sm text-gray-600 mt-2">{incident.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
