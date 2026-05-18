import React, { useState } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import GlassCard from './ui/GlassCard';
import GlassInput from './ui/GlassInput';
import GlassButton from './ui/GlassButton';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('akash8975015@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/google`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ token: idToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Cool Radar Animation Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute w-[800px] h-[800px] border border-indigo-500/10 rounded-full animate-[ping_4s_ease-out_infinite]"></div>
        <div className="absolute w-[600px] h-[600px] border border-indigo-500/10 rounded-full animate-[ping_4s_ease-out_infinite_1s]"></div>
        <div className="absolute w-[400px] h-[400px] border border-indigo-500/15 rounded-full animate-[ping_4s_ease-out_infinite_2s]"></div>
        <div className="absolute w-[200px] h-[200px] border border-indigo-500/20 rounded-full"></div>
        {/* Sweeping line */}
        <div className="absolute w-[400px] h-[2px] bg-gradient-to-r from-indigo-500/40 to-transparent origin-left animate-[spin_4s_linear_infinite]"></div>
      </div>

      <GlassCard className="relative z-10 w-full max-w-md p-8 shadow-glass animate-slide-up border border-slate-700/30">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-full mb-4 border border-indigo-500/20 shadow-glow/10">
            <ShieldAlert size={48} className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">SafeZone</h1>
          <p className="text-slate-500 mt-1.5 text-xs font-bold uppercase tracking-[0.25em]">Global Security Network</p>
        </div>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl mb-6 text-sm font-semibold animate-fade-in">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] mb-6 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-800/80 flex-1"></div>
          <span className="text-slate-600 text-xs font-bold tracking-wider">OR</span>
          <div className="h-px bg-slate-800/80 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email / Comm Link</label>
            <GlassInput 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="officer@safezone.net"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Security Code</label>
            <GlassInput 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
          </div>
          
          <GlassButton 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
            className="w-full py-4 mt-6 hover:scale-[1.01]"
          >
            <LogIn size={20} className="animate-pulse" />
            Initialize Access
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
