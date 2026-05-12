import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      if (res.ok) navigate('/incidents');
      else alert('Failed to create incident');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Report New Incident</h1>
      
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-400 mb-2">Crime Type</label>
            <select 
              value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
            >
              <option>Theft</option>
              <option>Assault</option>
              <option>Burglary</option>
              <option>Vandalism</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-2">Severity (1-5)</label>
            <input 
              type="number" min="1" max="5" 
              value={form.severity} onChange={e => setForm({...form, severity: Number(e.target.value)})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-400 mb-2">Latitude</label>
            <input 
              type="number" step="any" 
              value={form.lat} onChange={e => setForm({...form, lat: Number(e.target.value)})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-2">Longitude</label>
            <input 
              type="number" step="any" 
              value={form.lng} onChange={e => setForm({...form, lng: Number(e.target.value)})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-2">Description</label>
          <textarea 
            rows="4"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-blue-500 outline-none"
            placeholder="Provide details about the incident..."
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
          <button type="button" onClick={() => navigate('/incidents')} className="px-6 py-2 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2 rounded-lg transition-colors">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
