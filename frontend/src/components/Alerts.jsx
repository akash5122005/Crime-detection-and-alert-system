import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, Bot, Sparkles, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Alerts({ token }) {
  const [alerts, setAlerts] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch initial alerts
    fetch(`${apiUrl}/api/alerts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setAlerts(data))
    .catch(console.error);

    // Setup Socket.IO for real-time alerts
    const socket = io(apiUrl);
    socket.on('anomaly_alert', (newAlert) => {
      setAlerts(prev => [{ ...newAlert, isNew: true }, ...prev]);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-red-500/50 border-l-4 border-red-500`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-slate-100 uppercase tracking-wider">Critical Anomaly Detected!</p>
                <p className="mt-1 text-sm text-slate-400">{newAlert.crime_type} spike in Zone {newAlert.zone_id}</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
      
      setTimeout(() => {
        setAlerts(prev => prev.map(a => a.id === newAlert.id ? { ...a, isNew: false } : a));
      }, 2000);
    });

    return () => socket.disconnect();
  }, [token, apiUrl]);

  const explainAnomaly = async (alert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isExplaining: true } : a));
    try {
      const res = await fetch(`${apiUrl}/api/ai/explain-anomaly`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          zone_id: alert.zone_id,
          score: alert.score,
          crime_type: alert.crime_type,
          triggered_at: alert.triggered_at,
          recent_count: 5, // Mock value
          historical_avg: 2 // Mock value
        })
      });
      const data = await res.json();
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, explanation: data.explanation, recommendation: data.recommendation, isExplaining: false } : a));
    } catch (err) {
      toast.error('Failed to explain anomaly');
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isExplaining: false } : a));
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await fetch(`${apiUrl}/api/alerts/${id}/acknowledge`, {
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
        <div className="divide-y divide-slate-800">
          <AnimatePresence initial={false}>
            {alerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center text-slate-500"
              >
                No anomalies detected. System secure.
              </motion.div>
            ) : (
              alerts.map(alert => (
                <motion.div 
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 100, height: 0 }}
                  className={`relative p-5 flex items-center justify-between hover:bg-slate-800/50 transition-all duration-500 border-l-4 ${
                    alert.isNew ? 'bg-yellow-500/10 border-yellow-500' : 
                    alert.score > 0.8 ? 'border-red-500' : 
                    alert.score > 0.5 ? 'border-amber-500' : 'border-blue-500'
                  }`}
                >
                  <div className="w-1/4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Zone ID</p>
                    <p className="font-mono text-blue-400 font-bold">{alert.zone_id}</p>
                  </div>
                  <div className="w-1/4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Anomaly Type</p>
                    <p className="capitalize text-slate-100 font-semibold flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" />
                      {alert.crime_type}
                    </p>
                  </div>
                  <div className="w-1/4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Timestamp</p>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock size={14} />
                      {new Date(alert.triggered_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="w-1/4 text-right flex flex-col gap-2">
                    {!alert.acknowledged_at && (
                      <button 
                        onClick={() => handleAcknowledge(alert.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20 font-bold text-sm active:scale-95"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button 
                      onClick={() => explainAnomaly(alert)}
                      disabled={alert.isExplaining}
                      className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                    >
                      {alert.isExplaining ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                      {alert.explanation ? 'Re-Analyze' : 'Explain with AI'}
                    </button>
                  </div>

                  {/* AI Explanation Panel */}
                  <AnimatePresence>
                    {alert.explanation && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 z-10 bg-slate-800 border-x border-b border-slate-700 p-6 rounded-b-2xl shadow-2xl space-y-4"
                      >
                        <div>
                          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Bot size={12} /> AI Analysis
                          </p>
                          <p className="text-sm text-slate-200 leading-relaxed">{alert.explanation}</p>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl">
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Recommendation</p>
                          <p className="text-xs text-slate-300 italic">{alert.recommendation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
