import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar } from 'lucide-react';
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

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-slate-900 rounded-2xl border-4 border-slate-800 flex items-center justify-center text-blue-500 shadow-2xl">
              <User size={64} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{userData.name}</h2>
              <p className="text-slate-400">Security Personnel ID: {userData.id?.slice(0, 8)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Address</p>
                  <p className="text-slate-200">{userData.email}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Access Level</p>
                  <p className="text-slate-200">{userData.role}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar size={16} />
                <span>Active since {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
