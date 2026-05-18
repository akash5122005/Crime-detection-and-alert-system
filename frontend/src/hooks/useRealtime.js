import { useEffect } from "react";
import { useSocket } from "../stores/socketStore";

export function useRealtimeIncidents(onNew, onUpdate) {
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    if (onNew) socket.on("incident:new", onNew);
    if (onUpdate) socket.on("incident:updated", onUpdate);
    return () => {
      if (onNew) socket.off("incident:new", onNew);
      if (onUpdate) socket.off("incident:updated", onUpdate);
    };
  }, [socket, onNew, onUpdate]);
}

export function useRealtimeAlerts(onNew) {
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    if (onNew) socket.on("alert:new", onNew);
    return () => {
      if (onNew) socket.off("alert:new", onNew);
    };
  }, [socket, onNew]);
}

export function useDashboardRefresh(callback) {
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    if (callback) socket.on("dashboard:refresh", callback);
    return () => {
      if (callback) socket.off("dashboard:refresh", callback);
    };
  }, [socket, callback]);
}
