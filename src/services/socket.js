import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ [Socket.io Client] Connected to backend WS:', this.socket.id);
      this.isConnected = true;
      this.notifyListeners('connection_change', true);
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ [Socket.io Client] Disconnected from backend WS. Using fallback mode.');
      this.isConnected = false;
      this.notifyListeners('connection_change', false);
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
      this.notifyListeners('connection_change', false);
    });
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => cb(data));
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[Socket] Cannot emit '${event}', WS disconnected.`);
    }
  }
}

export const socketService = new SocketService();
