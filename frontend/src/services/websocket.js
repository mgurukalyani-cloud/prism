/**
 * ChildGuard AI - WebSocket Client
 */

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.reconnectTimer = null;
    this.isConnected = false;
    this.url = this.getWebSocketUrl();
  }

  getWebSocketUrl() {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsProto = apiBase.startsWith('https') ? 'wss' : 'ws';
    const host = apiBase.replace(/^https?:\/\//, '');
    return `${wsProto}://${host}/ws/alerts`;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.notify({ type: 'connection_status', connected: true });
        console.log('[WebSocket] Connected to ChildGuard Alert Stream');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notify(data);
        } catch (e) {
          console.error('[WebSocket] Error parsing message:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.notify({ type: 'connection_status', connected: false });
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocket] Error encountered:', err);
        this.socket.close();
      };
    } catch (err) {
      console.warn('[WebSocket] Connection failed, retrying in 4s...', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(data) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

export const wsClient = new WebSocketClient();
