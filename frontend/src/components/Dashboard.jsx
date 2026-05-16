import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { AlertTriangle, MapPin, Activity, CheckCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard({ token }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/incidents`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setIncidents(data))
    .catch(console.error);
  }, [token]);

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
    </div>
  );
}
