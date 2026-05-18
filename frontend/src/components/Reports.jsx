import React, { useState } from 'react';
import { Calendar, FileText, Download, Loader2, Sparkles, Bot, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reports({ token }) {
  const [dateRange, setDateRange] = useState({ 
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const steps = ["Fetching incident data...", "Analysing patterns...", "Writing report..."];

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setLoadingStep(0);
    
    // Simulate steps
    const timer = setInterval(() => {
      setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 1500);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/ai/weekly-report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          start_date: dateRange.start,
          end_date: dateRange.end
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate intelligence report');
      }
      setReport(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error connecting to intelligence server.');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Intelligence Reports</h1>
          <p className="text-slate-500 mt-1">Generate comprehensive crime analysis using Llama 3</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <div className="flex flex-col px-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Start Date</span>
            <input 
              type="date" value={dateRange.start} 
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
              className="bg-transparent text-sm font-bold text-slate-100 outline-none"
            />
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex flex-col px-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">End Date</span>
            <input 
              type="date" value={dateRange.end} 
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
              className="bg-transparent text-sm font-bold text-slate-100 outline-none"
            />
          </div>
          <button 
            onClick={generateReport}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Generate AI Summary
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[400px] flex flex-col items-center justify-center bg-slate-900 rounded-3xl border border-slate-800 border-dashed"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Generating Strategic Intel</h3>
            <div className="flex flex-col items-center">
              {steps.map((step, i) => (
                <div key={i} className={`text-sm transition-all duration-500 flex items-center gap-2 ${i === loadingStep ? 'text-blue-400 font-bold scale-110' : 'text-slate-600'}`}>
                  {i < loadingStep ? <CheckCircle size={14} className="text-green-500" /> : <div className="w-3.5" />}
                  {step}
                </div>
              ))}
            </div>
          </motion.div>
        ) : report ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
          >
            {/* Report Header */}
            <div className="p-8 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-slate-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Bot size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Generated Intelligence Report</span>
                </div>
                <h2 className="text-2xl font-bold">Weekly Security Overview</h2>
                <p className="text-slate-500 mt-1">Period: {dateRange.start} to {dateRange.end}</p>
              </div>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700">
                <Download size={18} /> Export PDF
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Executive Summary */}
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" size={20} /> Executive Summary
                </h3>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed italic">
                  "{report.executive_summary}"
                </div>
              </section>

              {/* Top Zones */}
              <section>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} /> Critical Zones Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.top_zones.map((z, i) => (
                    <div key={i} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800 hover:border-red-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Zone</p>
                          <p className="text-xl font-bold text-blue-400">{z.zone}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          z.trend === 'worsening' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {z.trend}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Incidents</p>
                          <p className="text-lg font-bold">{z.count}</p>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Primary</p>
                          <p className="text-xs font-bold text-slate-300 truncate">{z.primary_crime}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{z.analysis}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommendations */}
              <section className="bg-blue-600/5 rounded-3xl p-8 border border-blue-600/20">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-blue-500" size={20} /> Actionable Recommendations
                </h3>
                <ul className="space-y-4">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300">{r}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="p-4 bg-slate-800/50 text-center border-t border-slate-800">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Generated at {new Date(report.generated_at).toLocaleString()} | SafeZone Strategic Unit
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed text-slate-500">
            {error ? (
              <div className="text-center p-6 max-w-md">
                <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-200 mb-2">Error Generating Report</h3>
                <p className="text-sm text-slate-400 mb-4">{error}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Try logging out and logging back in to refresh your authorization credentials.</p>
              </div>
            ) : (
              <>
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Select a date range and click generate to create a report.</p>
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { ShieldAlert } from 'lucide-react';
