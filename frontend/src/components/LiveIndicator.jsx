import React, { useEffect, useState } from 'react';
import { useSocket } from '../stores/socketStore';

export default function LiveIndicator() {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('just now');

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleAnyEvent = () => setLastUpdated(new Date());

    setIsConnected(socket.connected);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('dashboard:refresh', handleAnyEvent);
    socket.on('incident:new', handleAnyEvent);
    socket.on('alert:new', handleAnyEvent);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('dashboard:refresh', handleAnyEvent);
      socket.off('incident:new', handleAnyEvent);
      socket.off('alert:new', handleAnyEvent);
    };
  }, [socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date() - lastUpdated) / 1000);
      if (seconds < 5) setTimeAgo('just now');
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-full shadow-lg shadow-black/20 select-none">
      <div className="relative flex h-2.5 w-2.5">
        {isConnected ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </>
        )}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
        {isConnected ? 'System Live' : 'Disconnected'}
      </span>
      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
      <span className="text-[10px] text-slate-500 font-mono font-semibold">
        Refreshed: {timeAgo}
      </span>
    </div>
  );
}
