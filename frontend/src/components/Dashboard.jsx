import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { AlertTriangle, MapPin, Activity, CheckCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

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

  // Dummy chart data for demo purposes
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">System Analytics</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg">{kpi.icon}</div>
            <div>
              <p className="text-slate-400 text-sm">{kpi.title}</p>
              <h3 className="text-2xl font-bold">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Crime Trends (Last 7 Days)</h3>
          <Line data={lineData} options={chartOptions} />
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <h3 className="text-lg font-semibold w-full text-left mb-4">Incidents by Category</h3>
          <div className="w-2/3">
            <Doughnut data={doughnutData} options={pieOptions} />
          </div>
        </div>
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
