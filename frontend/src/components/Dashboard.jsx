import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Shield, TrendingUp, AlertTriangle, MapPin, Clock, Zap, Activity, ShieldCheck, User, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { useDashboardRefresh } from '../hooks/useRealtime';
import GlassCard from './ui/GlassCard';
import GlassButton from './ui/GlassButton';
import GlassBadge from './ui/GlassBadge';

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

  const fetchIncidents = () => {
    const authToken = token || localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/incidents`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    })
    .catch(console.error);
  };

  useEffect(() => {
    fetchIncidents();
  }, [token]);

  // Connect to PostgreSQL real-time listeners for live refreshing
  useDashboardRefresh(() => {
    fetchIncidents();
  });

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const authToken = token 
        || localStorage.getItem("accessToken") 
        || localStorage.getItem("token");

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
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
    { title: 'Total Incidents', value: incidents.length, icon: <Activity className="text-indigo-400" /> },
    { title: 'Open Cases', value: incidents.filter(i => i.status === 'open' || i.status === 'under_investigation').length, icon: <AlertTriangle className="text-amber-400" /> },
    { title: 'Resolved Cases', value: incidents.filter(i => i.status === 'closed').length, icon: <CheckCircle className="text-emerald-400" /> },
    { title: 'High Severity', value: incidents.filter(i => (i.severity || 0) >= 4).length, icon: <MapPin className="text-rose-400" /> },
  ];

  // Group incidents by day of the week dynamically
  const getIncidentsByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    incidents.forEach(incident => {
      const d = new Date(incident.timestamp || incident.created_at);
      const dayName = days[d.getDay()];
      if (counts[dayName] !== undefined) counts[dayName]++;
    });
    
    return days.map(day => ({ name: day, value: counts[day] }));
  };

  const chartData = getIncidentsByDay();

  // Group incidents by crime type dynamically
  const getIncidentsByType = () => {
    const types = {};
    incidents.forEach(incident => {
      const t = incident.type || 'Other';
      types[t] = (types[t] || 0) + 1;
    });
    
    const labels = Object.keys(types);
    const data = Object.values(types);
    
    if (labels.length === 0) {
      return {
        labels: ['Pending Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(255, 255, 255, 0.05)'],
          borderWidth: 0,
        }]
      };
    }
    
    const colors = ['#ef4444', '#f59e0b', '#6366f1', '#10b981', '#06b6d4', '#8b5cf6'];
    const backgroundColors = labels.map((_, index) => colors[index % colors.length]);
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      }]
    };
  };

  const doughnutData = getIncidentsByType();

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { weight: 'bold', size: 10 },
          padding: 10
        }
      }
    }
  };

  // Group zones dynamically for risk meters
  const getZoneRisks = () => {
    const zoneCounts = {};
    incidents.forEach(incident => {
      const zoneName = incident.zone_name || `Zone ${incident.zone_id || 'Alpha'}`;
      const severity = incident.severity || 1;
      zoneCounts[zoneName] = (zoneCounts[zoneName] || 0) + severity * 20;
    });
    
    const sortedZones = Object.entries(zoneCounts)
      .map(([name, score]) => ({
        name,
        score: Math.min(score, 100),
        color: score > 70 ? 'bg-rose-500' : score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
      
    if (sortedZones.length === 0) {
      return [
        { name: 'District Alpha', score: 20, color: 'bg-emerald-500' },
        { name: 'District Beta', score: 15, color: 'bg-emerald-500' }
      ];
    }
    return sortedZones;
  };

  const zonesList = getZoneRisks();

  return (
    <div className="p-8 space-y-8 select-none">
      {/* KPIs with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ease: "easeOut" }}
          >
            <GlassCard className="flex items-center gap-5 border border-slate-800/40 hover:border-indigo-500/30 group">
              <div className="p-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl group-hover:scale-110 group-hover:shadow-glow/10 transition-all duration-300">
                {kpi.icon}
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.15em]">{kpi.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-1">
                  <CountUp value={kpi.value} />
                </h3>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Charts & Risk Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Crime Density Trend (Area Chart) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-[430px] flex flex-col justify-between border border-slate-800/40">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Incident Distribution Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Active security monitoring timeline</p>
              </div>
              <GlassBadge variant="info">Live Analytics</GlassBadge>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="95%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 15, 30, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ color: '#c7d2fe' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Dynamic Zone Risk Indicators & Doughnut Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          {/* High Risk Zones */}
          <GlassCard className="flex-1 border border-slate-800/40 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-6">
                <ShieldCheck className="text-indigo-400" size={22} /> Risk Density Index
              </h3>
              <div className="space-y-5">
                {zonesList.map((zone, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-slate-300">{zone.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border border-transparent ${
                        zone.score > 70 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {zone.score}% RISK
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.score}%` }}
                        className={`h-full ${zone.color} shadow-glow/10`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Crime Category Breakdown (Doughnut Chart) */}
          <GlassCard className="h-[200px] border border-slate-800/40 p-4 flex flex-col">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Crime Categories</h4>
            <div className="flex-1 min-h-0 relative flex justify-center items-center">
              <Doughnut data={doughnutData} options={pieOptions} />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Field Officer Activity Feed */}
      <div className="grid grid-cols-1 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="border border-slate-800/40">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="text-indigo-400" size={22} /> Active Comm Patrol Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Live status updates from active patrol units</p>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                    P{i}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { officer: 'Akash A.', action: 'Patrolling Main Plaza', time: '2m ago', status: 'Active' },
                { officer: 'John D.', action: 'Investigating Incident #4521', time: '15m ago', status: 'On Site' },
                { officer: 'Sarah K.', action: 'Dispatch Center Coordination', time: 'Just now', status: 'Critical' },
                { officer: 'Mike L.', action: 'General Safety Review', time: '1h ago', status: 'In HQ' }
              ].map((act, i) => (
                <div key={i} className="bg-slate-950/20 p-5 rounded-2xl border border-slate-900/60 hover:border-indigo-500/25 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-indigo-100 transition-all duration-300">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-200">{act.officer}</p>
                      <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">{act.status}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3.5 font-medium leading-relaxed">{act.action}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-extrabold">
                    <Clock size={12} />
                    {act.time}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* AI Analysis Section */}
      <GlassCard className="border border-slate-800/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Shield size={200} className="text-indigo-500" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200">
              <Shield className="text-indigo-400" size={22} />
              AI Tactical intelligence Core
            </h3>
            <p className="text-slate-500 text-xs mt-1 font-semibold">Proactive crime hotspot classification models via Groq Llama 3</p>
          </div>
          <GlassButton 
            onClick={generateAIAnalysis}
            disabled={isAnalyzing || incidents.length === 0}
            variant="primary"
            className="px-6 py-3 text-xs"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-300/30 border-t-indigo-100 rounded-full animate-spin"></div>
                Analyzing Records...
              </>
            ) : (
              <>
                <Activity size={18} />
                Generate Tactical Report
              </>
            )}
          </GlassButton>
        </div>

        {aiReport ? (
          <div className="bg-slate-950/40 rounded-2xl p-6 border border-indigo-500/25 text-slate-300 leading-relaxed animate-slide-up duration-500">
            <div className="flex items-center gap-2 text-indigo-400 mb-4 font-extrabold text-xs uppercase tracking-[0.2em]">
              <CheckCircle size={16} /> Strategy Generated Successfully
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
              {aiReport}
            </pre>
          </div>
        ) : (
          <div className="bg-slate-950/20 rounded-2xl p-12 border border-slate-800/80 border-dashed text-center text-xs font-semibold text-slate-500">
            Select the action key above to trigger cognitive analytical scans across current operational incidents.
          </div>
        )}
      </GlassCard>
    </div>
  );
}

