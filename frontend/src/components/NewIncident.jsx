import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Sparkles, Loader2, CheckCircle, AlertTriangle, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewIncident({ token }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'Theft',
    severity: 3,
    lat: 40.75,
    lng: -73.98,
    zone_id: 'Zone1',
    description: ''
  });
  const [rawText, setRawText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(prev => [...prev, ...files].slice(0, 5));
  };
  const handleAiAssist = async () => {
    if (!rawText.trim()) return;
    setIsAiLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/ai/parse-incident`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ raw_description: rawText })
      });
      const data = await res.json();
      
      const newForm = {
        ...form,
        type: data.crime_type.charAt(0).toUpperCase() + data.crime_type.slice(1),
        severity: data.severity,
        description: data.description,
        // Assuming location_hint would normally be mapped to lat/lng in a real app
      };
      setForm(newForm);
      setAutoFilledFields(['type', 'severity', 'description']);
    } catch (err) {
      setError('AI Assist failed. Please try manual entry.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    selectedPhotos.forEach(photo => formData.append('photos', photo));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/incidents`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });
      if (res.ok) navigate('/incidents');
      else setError('Failed to create incident');
    } catch (error) {
      console.error(error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-3xl font-bold">Report New Incident</h1>
      </div>
      
      {/* AI Assist Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-slate-900 border border-blue-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={100} className="text-blue-500" />
        </div>
        
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Sparkles className="text-blue-400" size={20} />
          AI Incident Assistant
        </h2>
        <textarea 
          rows="2"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Example: guy on bike snatched phone near bus stop midnight..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 mb-4"
        />
        <button 
          onClick={handleAiAssist}
          disabled={isAiLoading || !rawText.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isAiLoading ? 'Analyzing...' : 'Auto-Fill with AI'}
        </button>
      </motion.div>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Crime Type</label>
            <select 
              value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className={`w-full bg-slate-800 border rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all ${
                autoFilledFields.includes('type') ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700'
              }`}
            >
              <option>Theft</option>
              <option>Assault</option>
              <option>Burglary</option>
              <option>Vandalism</option>
              <option>Other</option>
            </select>
            {autoFilledFields.includes('type') && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                <CheckCircle size={8} /> AI
              </span>
            )}
          </div>
          <div className="relative">
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Severity (1-5)</label>
            <input 
              type="number" min="1" max="5" 
              value={form.severity} onChange={e => setForm({...form, severity: Number(e.target.value)})}
              className={`w-full bg-slate-800 border rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all ${
                autoFilledFields.includes('severity') ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700'
              }`}
            />
            {autoFilledFields.includes('severity') && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                <CheckCircle size={8} /> AI
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Latitude</label>
            <input 
              type="number" step="any" 
              value={form.lat} onChange={e => setForm({...form, lat: Number(e.target.value)})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Longitude</label>
            <input 
              type="number" step="any" 
              value={form.lng} onChange={e => setForm({...form, lng: Number(e.target.value)})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Detailed Description</label>
          <textarea 
            rows="4"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className={`w-full bg-slate-800 border rounded-xl p-4 text-slate-100 focus:border-blue-500 outline-none transition-all ${
              autoFilledFields.includes('description') ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700'
            }`}
            placeholder="Provide additional context..."
          />
          {autoFilledFields.includes('description') && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <CheckCircle size={8} /> AI Generated
            </span>
          )}
        </div>

        {/* Evidence Photos */}
        <div>
          <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Evidence Photos (Max 5)</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {selectedPhotos.map((photo, i) => (
              <div key={i} className="relative aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="preview" />
                <button 
                  onClick={() => setSelectedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedPhotos.length < 5 && (
              <label className="aspect-square bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all">
                <Camera size={24} className="mb-2" />
                <span className="text-[10px] font-bold uppercase">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ x: -10 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20"
          >
            <AlertTriangle size={16} />
            {error}
          </motion.div>
        )}

        <div className="flex justify-end gap-4 pt-8 border-t border-slate-800">
          <button type="button" onClick={() => navigate('/incidents')} className="px-6 py-3 rounded-xl text-slate-500 hover:text-slate-100 font-bold transition-colors uppercase tracking-widest text-xs">
            Cancel
          </button>
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-10 py-3 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95">
            Submit Intelligence Report
          </button>
        </div>
      </form>
    </div>
  );
}
