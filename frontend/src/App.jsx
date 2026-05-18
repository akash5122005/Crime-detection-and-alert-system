import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Map as MapIcon, LayoutDashboard, LogOut, AlertCircle, FileText, Settings, User, FileBarChart } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CrimeMap from './components/Map';
import Login from './components/Login';
import Alerts from './components/Alerts';
import Incidents from './components/Incidents';
import NewIncident from './components/NewIncident';
import Admin from './components/Admin';
import Profile from './components/Profile';
import AIChat from './components/AIChat';
import Reports from './components/Reports';
import LiveIndicator from './components/LiveIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Sun, Moon, Bell, Menu, X, Command as CommandIcon, Search, FilePlus, AlertTriangle } from 'lucide-react';
import { Command } from 'cmdk';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        navigate('/incidents/new');
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 select-none ${
        location.pathname.startsWith(to) 
          ? 'bg-indigo-600/20 border-indigo-500/35 text-indigo-300 shadow-glow/10 font-bold' 
          : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon size={20} className="shrink-0" />
      <AnimatePresence mode="wait">
        {!isSidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="whitespace-nowrap"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-transparent text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarCollapsed ? '80px' : '256px' }}
        className="bg-slate-950/40 backdrop-blur-md border-r border-slate-900/80 p-4 flex flex-col relative transition-colors duration-300 shadow-xl z-20"
      >
        <div className="flex items-center gap-3 text-indigo-500 font-extrabold text-2xl mb-8 overflow-hidden pl-1 select-none">
          <ShieldAlert size={32} className="shrink-0 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
              >
                SafeZone
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <nav className="flex-1 space-y-2.5">
          <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink to="/map" icon={MapIcon}>Crime Map</NavLink>
          <NavLink to="/incidents" icon={FileText}>Incidents</NavLink>
          <NavLink to="/alerts" icon={AlertCircle}>Alerts</NavLink>
          <NavLink to="/reports" icon={FileBarChart}>Intelligence Reports</NavLink>
          <NavLink to="/admin" icon={Settings}>Admin Panel</NavLink>
          <NavLink to="/profile" icon={User}>My Profile</NavLink>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-900 mb-4 overflow-hidden">
           <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group">
              <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-indigo-100 font-extrabold shadow-lg shadow-indigo-600/25 border border-indigo-400/20">
                {JSON.parse(localStorage.getItem('user'))?.name?.charAt(0) || 'U'}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-slate-200 group-hover:text-slate-100">{JSON.parse(localStorage.getItem('user'))?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{JSON.parse(localStorage.getItem('user'))?.role?.replace('_', ' ') || 'Analyst'}</p>
                </div>
              )}
           </Link>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 rounded-xl transition-all font-semibold cursor-pointer">
          <LogOut size={20} className="shrink-0" /> 
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-8 bg-indigo-600 border border-indigo-400/30 text-indigo-100 rounded-full p-1.5 shadow-lg shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        >
          {isSidebarCollapsed ? <Menu size={14} /> : <X size={14} />}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Navbar */}
        <header className="h-16 bg-slate-950/20 backdrop-blur-md border-b border-slate-900/60 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4 text-slate-500">
            <CommandIcon size={18} className="text-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400 select-none">
              Press <kbd className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] font-bold font-mono">Ctrl+K</kbd> to search
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <LiveIndicator />
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all text-slate-400 hover:text-indigo-400 cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-950 animate-ping"></span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-950"></span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard token={token} />} />
                <Route path="/map" element={<CrimeMap token={token} />} />
                <Route path="/alerts" element={<Alerts token={token} />} />
                <Route path="/incidents" element={<Incidents token={token} />} />
                <Route path="/incidents/new" element={<NewIncident token={token} />} />
                <Route path="/admin" element={<Admin token={token} />} />
                <Route path="/profile" element={<Profile token={token} />} />
                <Route path="/reports" element={<Reports token={token} />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AIChat token={token} />

      {/* Command Palette */}
      <Command.Dialog 
        open={isCommandPaletteOpen} 
        onOpenChange={setIsCommandPaletteOpen}
        label="Global Command Palette"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-slate-700 gap-3">
            <Search size={18} className="text-slate-500" />
            <Command.Input 
              placeholder="Type a command or search..." 
              className="bg-transparent border-none outline-none text-slate-100 flex-1 text-lg"
            />
          </div>
          
          <Command.List className="p-2 max-h-[300px] overflow-auto">
            <Command.Empty className="p-8 text-center text-slate-500">No results found.</Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs font-bold text-slate-500 px-2 py-2 uppercase tracking-widest">
              <CommandItem onSelect={() => { navigate('/dashboard'); setIsCommandPaletteOpen(false); }}>
                <LayoutDashboard size={16} /> Go to Dashboard
              </CommandItem>
              <CommandItem onSelect={() => { navigate('/map'); setIsCommandPaletteOpen(false); }}>
                <MapIcon size={16} /> Go to Crime Map
              </CommandItem>
              <CommandItem onSelect={() => { navigate('/incidents'); setIsCommandPaletteOpen(false); }}>
                <FileText size={16} /> View Incidents
              </CommandItem>
              <CommandItem onSelect={() => { navigate('/alerts'); setIsCommandPaletteOpen(false); }}>
                <AlertCircle size={16} /> View Alerts
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs font-bold text-slate-500 px-2 py-2 uppercase tracking-widest mt-2 border-t border-slate-800">
              <CommandItem onSelect={() => { navigate('/incidents/new'); setIsCommandPaletteOpen(false); }}>
                <FilePlus size={16} /> Report New Incident
              </CommandItem>
              <CommandItem onSelect={() => { handleLogout(); setIsCommandPaletteOpen(false); }}>
                <LogOut size={16} className="text-red-400" /> Logout
              </CommandItem>
            </Command.Group>
          </Command.List>
        </motion.div>
      </Command.Dialog>
    </div>
  );
}

function CommandItem({ children, onSelect }) {
  return (
    <Command.Item 
      onSelect={onSelect}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-800 text-slate-300 aria-selected:bg-slate-800 aria-selected:text-white transition-colors"
    >
      {children}
    </Command.Item>
  );
}

export default App;
