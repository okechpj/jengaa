import { io } from 'socket.io-client';
import api from './api';

let socket = null;

export function connectSocket(token) {
  if (socket && socket.connected) return socket;
  const url = import.meta.env.baseURL || 'http://localhost:3000' || 'https://jengaa.onrender.com';
  socket = io(url, {
    auth: { token }
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export default {
  connectSocket,
  disconnectSocket,
  getSocket
};
