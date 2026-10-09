/**
 * Server-Sent Events (SSE) Real-time Service
 * Provides lightweight, high-performance real-time unidirectional event streaming
 * without third-party heavy dependencies like Socket.io.
 */

class SSEService {
  constructor() {
    // Set of Admin response streams
    this.adminClients = new Set();
    // Map of orderCode -> Set of customer response streams
    this.orderClients = new Map();

    // Heartbeat every 25 seconds to keep HTTP connections alive through proxies
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
  }

  /**
   * Subscribe an authenticated Admin client
   */
  subscribeAdmin(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering (Nginx)
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to AURA Admin Realtime Stream', timestamp: new Date() })}\n\n`);

    this.adminClients.add(res);

    req.on('close', () => {
      this.adminClients.delete(res);
    });
  }

  /**
   * Subscribe a customer tracking an individual order
   */
  subscribeOrder(orderCode, req, res) {
    const cleanCode = String(orderCode).trim().toUpperCase();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ message: `Subscribed to live tracking for ${cleanCode}`, orderCode: cleanCode })}\n\n`);

    if (!this.orderClients.has(cleanCode)) {
      this.orderClients.set(cleanCode, new Set());
    }

    const clientSet = this.orderClients.get(cleanCode);
    clientSet.add(res);

    req.on('close', () => {
      clientSet.delete(res);
      if (clientSet.size === 0) {
        this.orderClients.delete(cleanCode);
      }
    });
  }

  /**
   * Broadcast an event to all connected admin clients
   */
  broadcastToAdmin(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.adminClients) {
      try {
        client.write(payload);
      } catch (err) {
        this.adminClients.delete(client);
      }
    }
  }

  /**
   * Notify customer watching an order, and simultaneously notify admins
   */
  notifyOrderUpdate(orderCode, orderData) {
    if (!orderCode) return;
    const cleanCode = String(orderCode).trim().toUpperCase();
    const payload = `event: order_updated\ndata: ${JSON.stringify({ orderCode: cleanCode, order: orderData })}\n\n`;

    const clientSet = this.orderClients.get(cleanCode);
    if (clientSet) {
      for (const client of clientSet) {
        try {
          client.write(payload);
        } catch (err) {
          clientSet.delete(client);
        }
      }
    }

    // Always inform admins as well
    this.broadcastToAdmin('order_updated', { orderCode: cleanCode, order: orderData });
  }

  /**
   * Send periodic heartbeat comments (: keep-alive)
   */
  sendHeartbeat() {
    const ping = ': keep-alive\n\n';

    for (const client of this.adminClients) {
      try {
        client.write(ping);
      } catch (err) {
        this.adminClients.delete(client);
      }
    }

    for (const [code, set] of this.orderClients.entries()) {
      for (const client of set) {
        try {
          client.write(ping);
        } catch (err) {
          set.delete(client);
        }
      }
      if (set.size === 0) {
        this.orderClients.delete(code);
      }
    }
  }

  /**
   * Get stats for diagnostics
   */
  getStats() {
    let orderSubsCount = 0;
    for (const set of this.orderClients.values()) {
      orderSubsCount += set.size;
    }
    return {
      activeAdminConnections: this.adminClients.size,
      activeOrderTrackingRooms: this.orderClients.size,
      totalOrderSubscribers: orderSubsCount,
    };
  }
}

export const sseService = new SSEService();
