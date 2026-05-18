import React from 'react';

export default function GlassBadge({ children, variant = 'info', className = '', ...props }) {
  const getStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'info':
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <span 
      className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-sm select-none ${getStyles()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
