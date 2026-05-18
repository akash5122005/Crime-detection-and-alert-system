import React from 'react';

export default function GlassButton({ children, variant = 'primary', className = '', ...props }) {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600/30 hover:bg-indigo-600/50 border-indigo-500/35 text-indigo-200 shadow-glow/10';
      case 'danger':
        return 'bg-red-500/20 hover:bg-red-500/40 border-red-500/30 text-red-200 shadow-glow-danger/10';
      case 'success':
        return 'bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30 text-emerald-200 shadow-glow-success/10';
      case 'secondary':
      default:
        return 'bg-slate-800/30 hover:bg-slate-800/55 border-slate-700/40 text-slate-300';
    }
  };

  return (
    <button 
      className={`px-5 py-2.5 rounded-xl border font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] cursor-pointer backdrop-blur-md flex items-center justify-center gap-2 ${getStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
