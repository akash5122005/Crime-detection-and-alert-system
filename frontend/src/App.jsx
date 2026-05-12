import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Map as MapIcon, LayoutDashboard, LogOut, AlertCircle, FileText, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CrimeMap from './components/Map';
import Login from './components/Login';
import Alerts from './components/Alerts';
import Incidents from './components/Incidents';
import NewIncident from './components/NewIncident';
import Admin from './components/Admin';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname.startsWith(to) ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
    >
      <Icon size={20} /> {children}
    </Link>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-2xl mb-8">
          <ShieldAlert size={32} />
          SafeZone
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink to="/map" icon={MapIcon}>Crime Map</NavLink>
          <NavLink to="/incidents" icon={FileText}>Incidents</NavLink>
          <NavLink to="/alerts" icon={AlertCircle}>Alerts</NavLink>
          <NavLink to="/admin" icon={Settings}>Admin Panel</NavLink>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-400 hover:bg-slate-700 rounded-lg transition-colors mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/map" element={<CrimeMap token={token} />} />
          <Route path="/alerts" element={<Alerts token={token} />} />
          <Route path="/incidents" element={<Incidents token={token} />} />
          <Route path="/incidents/new" element={<NewIncident token={token} />} />
          <Route path="/admin" element={<Admin token={token} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
