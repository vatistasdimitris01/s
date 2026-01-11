
/**
 * GEO-DROP WEBSOCKET SERVER (Node.js)
 * 
 * To run locally:
 * 1. npm install ws
 * 2. node server.js
 */

/*
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// In-memory user store
let users = new Map(); // sessionId -> User object

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

wss.on('connection', (ws) => {
  let userSessionId = null;

  ws.on('message', (message) => {
    try {
      const { type, payload } = JSON.parse(message);

      switch (type) {
        case 'UPDATE_LOCATION':
          userSessionId = payload.sessionId;
          users.set(userSessionId, {
            ...payload,
            ws,
            lastSeen: Date.now()
          });
          broadcastNearbyUpdates();
          break;

        case 'CHAT_MESSAGE':
          // Route chat messages to specific recipients
          const target = users.get(payload.to);
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
              type: 'CHAT_MESSAGE',
              payload: {
                from: payload.from,
                text: payload.text,
                timestamp: payload.timestamp
              }
            }));
          }
          break;
      }
    } catch (e) {
      console.error('Failed to parse message', e);
    }
  });

  ws.on('close', () => {
    if (userSessionId) {
      users.delete(userSessionId);
      broadcastNearbyUpdates();
    }
  });
});

function broadcastNearbyUpdates() {
  const activeUsers = Array.from(users.values());
  const now = Date.now();

  // Cleanup inactive
  for (const [id, user] of users.entries()) {
    if (now - user.lastSeen > 30000) {
      users.delete(id);
    }
  }

  // Send filtered lists to each user
  for (const user of users.values()) {
    if (user.ws.readyState === WebSocket.OPEN) {
      const nearby = activeUsers
        .filter(u => u.sessionId !== user.sessionId)
        .map(u => {
          const d = calculateDistance(
            user.location.latitude,
            user.location.longitude,
            u.location.latitude,
            u.location.longitude
          );
          return { ...u, distance: d, ws: undefined }; // Don't send WS object back
        })
        .filter(u => u.distance <= 100);

      user.ws.send(JSON.stringify({
        type: 'UPDATE_LIST',
        payload: nearby
      }));
    }
  }
}

console.log('GeoDrop Server running on ws://localhost:8080');
*/
