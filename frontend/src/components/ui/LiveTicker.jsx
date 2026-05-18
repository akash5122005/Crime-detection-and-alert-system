import React, { useEffect, useState } from 'react';
import { useSocket } from '../../stores/socketStore';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function LiveTicker({ token }) {
  const socket = useSocket();
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    const authToken = token || localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/incidents`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const sorted = [...data]
          .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
          .slice(0, 5);
        setTickerItems(sorted);
      }
    })
    .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const handleNewIncident = (incident) => {
      setTickerItems(prev => [incident, ...prev.slice(0, 4)]);
    };

    socket.on('incident:new', handleNewIncident);
    return () => {
      socket.off('incident:new', handleNewIncident);
    };
  }, [socket]);

  if (tickerItems.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-slate-950/40 border border-slate-900/60 rounded-2xl py-3.5 px-4 backdrop-blur-md flex items-center gap-4 relative shadow-inner shadow-black/10 select-none">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl animate-pulse shrink-0">
        <ShieldAlert size={14} />
        Live Ticker
      </div>
      <div className="h-4 w-px bg-slate-800 shrink-0"></div>
      
      <div className="flex-1 overflow-hidden relative">
        <div className="flex items-center gap-12 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
          {tickerItems.map((item, i) => {
            const timeStr = new Date(item.timestamp || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={item.id || i} className="inline-flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer hover:text-indigo-400 transition-colors">
                <AlertTriangle size={14} className={item.severity >= 4 ? "text-rose-400" : "text-amber-400"} />
                <span className="text-slate-500 font-bold uppercase tracking-wider">[{timeStr}]</span>
                <span className="text-slate-100 font-extrabold">{item.type}</span>
                <span className="text-slate-500">in</span>
                <span className="text-indigo-300 font-bold">{item.zone_name || `Zone ${item.zone_id || 'Alpha'}`}</span>
                <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-extrabold rounded-md text-slate-400">
                  SEV {item.severity || 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
