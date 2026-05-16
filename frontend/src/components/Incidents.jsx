import React, { useEffect, useState } from 'react';
import { FileText, Search, Plus, Filter, MoreVertical, X, MapPin, Calendar, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Incidents({ token }) {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/incidents`, {
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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="p-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Type</th>
              <th className="p-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Severity</th>
              <th className="p-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Zone</th>
              <th className="p-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Status</th>
              <th className="p-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredIncidents.map((incident, i) => (
              <motion.tr 
                key={incident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedIncident(incident)}
                className="hover:bg-slate-800/50 cursor-pointer transition-all hover:scale-[1.005] group"
              >
                <td className="p-4">
                  <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{incident.type}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">{incident.description}</div>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} className={`w-1.5 h-4 rounded-full ${s <= incident.severity ? 'bg-red-500' : 'bg-slate-700'}`}></div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-mono text-sm text-blue-400">{incident.zone_id}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    incident.status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                    'bg-green-500/10 text-green-500 border border-green-500/20'
                  }`}>
                    {incident.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  {new Date(incident.timestamp).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedIncident && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Incident Details</h2>
                <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8 flex-1 overflow-auto">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Type</p>
                      <p className="text-xl font-bold">{selectedIncident.type}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">"{selectedIncident.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Tag size={14} /> Severity
                    </p>
                    <p className="text-lg font-bold text-red-500">{selectedIncident.severity} / 5</p>
                  </div>
                  <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin size={14} /> Zone
                    </p>
                    <p className="text-lg font-bold text-blue-400 font-mono">{selectedIncident.zone_id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-400">
                    <Calendar size={18} />
                    <span>Reported on {new Date(selectedIncident.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <User size={18} />
                    <span>Officer ID: {selectedIncident.reported_by}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-auto border-t border-slate-800 flex gap-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                  Update Status
                </button>
                <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
