import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle, Target, Info, Layers, Maximize, MousePointer2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true, duration: 1.5 });
  return null;
}

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
  const [mapConfig, setMapConfig] = useState({ center: [40.7128, -74.0060], zoom: 12 });
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/incidents`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setIncidents(data))
    .catch(console.error);
  }, [token]);

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      <MapContainer 
        center={mapConfig.center} 
        zoom={mapConfig.zoom} 
        className="h-full w-full z-10"
        zoomControl={false}
      >
        <ChangeView center={mapConfig.center} zoom={mapConfig.zoom} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        {incidents.map(incident => (
          <Marker 
            key={incident.id} 
            position={[incident.lat, incident.lng]}
            eventHandlers={{
              click: () => setMapConfig({ center: [incident.lat, incident.lng], zoom: 16 })
            }}
          >
            <Popup className="custom-popup">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="p-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${incident.severity >= 4 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <span className="font-bold text-slate-900">{incident.type}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{incident.description}</p>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Zone: {incident.zone_id}
                </div>
              </motion.div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating UI Elements */}
      <div className="absolute top-6 right-6 z-[20] flex flex-col gap-4">
        <button 
          onClick={() => setMapConfig({ center: [40.7128, -74.0060], zoom: 12 })}
          className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all shadow-2xl hover:scale-105"
        >
          <Maximize size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isLegendOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-10 right-10 z-[20] w-64 bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Layers size={18} className="text-blue-500" /> Map Intelligence
              </h3>
              <button onClick={() => setIsLegendOpen(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></div>
                <span className="text-sm text-slate-300 font-medium">Critical Incident</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                <span className="text-sm text-slate-300 font-medium">Minor Incident</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500/20"></div>
                <span className="text-sm text-slate-300 font-medium">Safe Zone</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MousePointer2 size={12} />
                Click markers to investigate
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLegendOpen && (
        <button 
          onClick={() => setIsLegendOpen(true)}
          className="absolute bottom-10 right-10 z-[20] bg-slate-900/90 backdrop-blur-xl p-4 rounded-full border border-slate-700 shadow-2xl text-blue-500"
        >
          <Info size={24} />
        </button>
      )}
    </div>
  );
}
