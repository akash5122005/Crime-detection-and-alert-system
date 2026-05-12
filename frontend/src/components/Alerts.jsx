import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Alerts({ token }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch initial alerts
    fetch('http://localhost:5000/api/alerts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setAlerts(data))
    .catch(console.error);

    // Setup Socket.IO for real-time alerts
    const socket = io('http://localhost:5000');
    socket.on('anomaly_alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => socket.disconnect();
  }, [token]);

  const handleAcknowledge = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}/acknowledge`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged_at: new Date().toISOString() } : a));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <AlertCircle className="text-red-500" size={32} />
        Real-Time Anomaly Alerts
      </h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between font-semibold text-slate-400">
          <div className="w-1/4">Zone ID</div>
          <div className="w-1/4">Crime Type</div>
          <div className="w-1/4">Triggered At</div>
          <div className="w-1/4 text-right">Action</div>
        </div>
        <div className="divide-y divide-slate-700">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No anomalies detected.</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                <div className="w-1/4 font-mono text-blue-400">{alert.zone_id}</div>
                <div className="w-1/4 capitalize text-red-400 font-medium">{alert.crime_type}</div>
                <div className="w-1/4 flex items-center gap-2 text-slate-400">
                  <Clock size={16} />
                  {new Date(alert.triggered_at).toLocaleString()}
                </div>
                <div className="w-1/4 text-right">
                  {alert.acknowledged_at ? (
                    <span className="text-green-500 flex items-center justify-end gap-1">
                      <CheckCircle size={16} /> Acknowledged
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded transition-colors text-sm font-semibold"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
