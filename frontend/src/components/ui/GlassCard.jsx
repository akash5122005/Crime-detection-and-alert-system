import React from 'react';

export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-glass/20 ${className}`}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(var(--blur-amount))",
        WebkitBackdropFilter: "blur(var(--blur-amount))",
        border: "1px solid var(--glass-border)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        padding: "1.5rem",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
