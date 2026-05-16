import React, { useState } from 'react';
import { ShieldAlert, Send, CheckCircle, MapPin, Phone, User, Tag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitizenReport() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    type: 'Theft',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/citizen/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setTrackingId(data.tracking_id);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Report Submitted</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Thank you for helping keep the community safe. Your report has been sent to the SafeZone Command Center.
          </p>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Tracking Identifier</p>
            <p className="text-2xl font-mono font-bold text-blue-400">{trackingId}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            Submit Another Report
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex flex-col items-center mb-12">
          <div className="p-4 bg-blue-600/10 rounded-3xl mb-6 text-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Citizen Reporting Portal</h1>
          <p className="text-slate-500 mt-2 text-center max-w-md">
            Directly notify law enforcement of incidents in your area. Your contribution makes SafeZone more effective.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                <User size={14} /> Full Name (Optional)
              </label>
              <input 
                type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Anonymous"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                <Phone size={14} /> Phone (Optional)
              </label>
              <input 
                type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all"
                placeholder="+91 00000 00000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                <MapPin size={14} /> Location / Landmark
              </label>
              <input 
                required type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Bus stop, Anna Nagar"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                <Tag size={14} /> Incident Type
              </label>
              <select 
                value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all"
              >
                <option>Theft</option>
                <option>Assault</option>
                <option>Burglary</option>
                <option>Vandalism</option>
                <option>Chain Snatching</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
              <ShieldAlert size={14} /> Description of Event
            </label>
            <textarea 
              required rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Send size={24} />}
            {isLoading ? 'SUBMITTING...' : 'INITIALIZE EMERGENCY REPORT'}
          </button>

          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            By submitting, you agree that all information is truthful to your knowledge.
          </p>
        </form>
      </div>
    </div>
  );
}
