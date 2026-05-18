import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let socketInstance = null;

export function useSocket() {
  if (!socketInstance) {
    socketInstance = io(apiUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}
