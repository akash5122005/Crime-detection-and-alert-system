import React from 'react';

export default function GlassInput({ className = '', ...props }) {
  return (
    <input 
      className={`w-full bg-slate-950/40 border border-slate-800/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-indigo-500/80 focus:shadow-glow/10 transition-all duration-300 ${className}`}
      {...props}
    />
  );
}
