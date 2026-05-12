import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Incidents({ token }) {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/incidents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setIncidents(data))
    .catch(console.error);
  }, [token]);

  const filtered = incidents.filter(i => 
    i.type.toLowerCase().includes(search.toLowerCase()) || 
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Incident Log</h1>
        <Link to="/incidents/new" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors">
          <Plus size={20} />
          New Incident
        </Link>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search incidents..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="p-4 text-slate-400 font-semibold">Date</th>
              <th className="p-4 text-slate-400 font-semibold">Type</th>
              <th className="p-4 text-slate-400 font-semibold">Severity</th>
              <th className="p-4 text-slate-400 font-semibold">Status</th>
              <th className="p-4 text-slate-400 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filtered.map(inc => (
              <tr key={inc.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 text-slate-300">{new Date(inc.timestamp).toLocaleDateString()}</td>
                <td className="p-4 font-medium">{inc.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    inc.severity >= 4 ? 'bg-red-500/20 text-red-400' :
                    inc.severity === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    Level {inc.severity}
                  </span>
                </td>
                <td className="p-4 capitalize">{inc.status}</td>
                <td className="p-4 text-slate-400 truncate max-w-xs">{inc.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
