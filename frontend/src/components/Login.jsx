import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('admin@safezone.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <ShieldAlert size={48} className="text-blue-500 mb-2" />
          <h1 className="text-3xl font-bold text-slate-100">SafeZone</h1>
          <p className="text-slate-400">Sign in to access the system</p>
        </div>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} 
                   className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} 
                   className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
