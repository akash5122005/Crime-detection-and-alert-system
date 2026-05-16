import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Bell, Settings, Check, MapPin, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

export default function Profile({ token }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // In a real app, we'd fetch fresh data from /api/auth/me
        // For now, we use the token data
        setUserData({
          name: decoded.name || 'Security Officer',
          email: decoded.email || 'officer@safezone.com',
          role: decoded.role || 'Analyst',
          id: decoded.id
        });
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }
  }, [token]);

  if (!userData) return <div className="p-8 text-slate-400">Loading profile...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <User className="text-blue-500" size={32} />
        User Profile
      </h1>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-slate-800"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-8">
            <div className="w-32 h-32 bg-slate-950 rounded-3xl border-4 border-slate-900 flex items-center justify-center text-blue-500 shadow-2xl relative overflow-hidden group">
              <User size={64} className="relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-100">{userData.name}</h2>
                <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Operator ID: {userData.id?.slice(0, 12)}</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Role</p>
                  <p className="text-blue-400 font-bold text-sm">{userData.role}</p>
                </div>
                <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status</p>
                  <p className="text-green-500 font-bold text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bell className="text-blue-500" size={20} /> Intelligence Notifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'anomalies', label: 'Anomaly Spikes', icon: AlertTriangle, color: 'text-red-400' },
                  { id: 'citizen', label: 'New Citizen Reports', icon: User, color: 'text-blue-400' },
                  { id: 'weekly', label: 'Weekly AI Summary', icon: Calendar, color: 'text-purple-400' },
                  { id: 'patrol', label: 'Patrol Assignments', icon: MapPin, color: 'text-green-400' }
                ].map((pref) => (
                  <button 
                    key={pref.id}
                    className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-slate-900 rounded-lg ${pref.color}`}>
                        <pref.icon size={18} />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{pref.label}</span>
                    </div>
                    <div className="w-10 h-5 bg-blue-600 rounded-full relative flex items-center px-1">
                      <div className="w-3 h-3 bg-white rounded-full absolute right-1"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone Subscriptions */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="text-blue-500" size={20} /> Watchlist Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Zone 1 (Downtown)', 'Zone 4 (Residential)', 'Zone 7 (Industrial)'].map((zone, i) => (
                  <div key={i} className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-xs font-bold flex items-center gap-2">
                    <Check size={14} /> {zone}
                  </div>
                ))}
                <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-slate-500 hover:text-white text-xs font-bold transition-colors">
                  + Add Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
