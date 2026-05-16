import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Shield, TrendingUp, AlertTriangle, MapPin, Clock, Zap, Activity, ShieldCheck, User, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const CountUp = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });
  return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>;
};

export default function Dashboard({ token }) {
  const [incidents, setIncidents] = useState([]);
  const [aiReport, setAiReport] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/incidents`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setIncidents(data))
    .catch(console.error);
  }, [token]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ incidents })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiReport(data.analysis);
    } catch (err) {
      console.error(err);
      setAiReport('Failed to generate AI analysis. Please check your GROQ_API_KEY.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const kpis = [
    { title: 'Total Incidents', value: incidents.length, icon: <Activity className="text-blue-500" /> },
    { title: 'Open Cases', value: incidents.filter(i => i.status === 'open').length, icon: <AlertTriangle className="text-yellow-500" /> },
    { title: 'Resolved Cases', value: incidents.filter(i => i.status === 'closed').length, icon: <CheckCircle className="text-green-500" /> },
    { title: 'High Severity', value: incidents.filter(i => i.severity >= 4).length, icon: <MapPin className="text-red-500" /> },
  ];

  // Chart data for demo purposes
  const chartData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Crimes Reported',
      data: [12, 19, 3, 5, 2, 3, 10],
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.4
    }]
  };

  const doughnutData = {
    labels: ['Theft', 'Assault', 'Burglary', 'Vandalism'],
    datasets: [{
      data: [30, 15, 25, 30],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }
  };

  return (
    <div className="p-8 space-y-8">
      {/* KPIs with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-colors group"
          >
            <div className="p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">{kpi.icon}</div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{kpi.title}</p>
              <h3 className="text-3xl font-bold">
                <CountUp value={kpi.value} />
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Charts & Risk Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Crime Density Trend</h3>
            <select className="bg-slate-800 border-none rounded-lg px-3 py-1 text-sm font-bold text-slate-400 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl"
        >
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={24} /> High Risk Zones
          </h3>
          <div className="space-y-6">
            {[
              { name: 'Downtown', score: 85, trend: 'up', color: 'bg-red-500' },
              { name: 'Park Avenue', score: 42, trend: 'down', color: 'bg-yellow-500' },
              { name: 'Industrial East', score: 68, trend: 'stable', color: 'bg-orange-500' }
            ].map((zone, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-300">{zone.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${zone.score > 70 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {zone.score}% RISK
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${zone.score}%` }}
                    className={`h-full ${zone.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-400 transition-colors uppercase tracking-widest">
            View All Zones
          </button>
        </motion.div>
      </div>

      {/* Bottom Section: Activity Feed */}
      <div className="grid grid-cols-1 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="text-blue-500" size={24} /> Field Officer Activity
            </h3>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  {i}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { officer: 'Akash A.', action: 'Patrolling Zone 1', time: '2m ago', status: 'Active' },
              { officer: 'John D.', action: 'Investigating Theft', time: '15m ago', status: 'On Site' },
              { officer: 'Sarah K.', action: 'Emergency Response', time: 'Just now', status: 'Critical' },
              { officer: 'Mike L.', action: 'Admin Review', time: '1h ago', status: 'In HQ' }
            ].map((act, i) => (
              <div key={i} className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{act.officer}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{act.status}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3">{act.action}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                  <Clock size={12} />
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Analysis Section */}
      <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <ShieldAlert size={120} className="text-blue-500" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-blue-400" size={24} />
              AI Crime Intelligence
            </h3>
            <p className="text-slate-400 text-sm mt-1">Harnessing Llama 3 on Groq for real-time strategic analysis</p>
          </div>
          <button 
            onClick={generateAIAnalysis}
            disabled={isAnalyzing || incidents.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing Records...
              </>
            ) : (
              <>
                <Activity size={18} />
                Generate Intelligence Report
              </>
            )}
          </button>
        </div>

        {aiReport ? (
          <div className="bg-slate-900/50 rounded-xl p-6 border border-blue-500/20 text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-bold text-sm uppercase tracking-widest">
              <CheckCircle size={16} /> Analysis Complete
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm md:text-base">
              {aiReport}
            </pre>
          </div>
        ) : (
          <div className="bg-slate-900/30 rounded-xl p-12 border border-slate-700/50 border-dashed text-center text-slate-500">
            Click the button above to analyze current incident data for hotspots and recommendations.
          </div>
        )}
      </div>
    </div>
  );
}

import { ShieldAlert } from 'lucide-react';
