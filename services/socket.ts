
import { ServerMessage, User, DeviceType } from '../types';
import { WS_URL } from '../constants';

export class SocketService {
  private socket: WebSocket | null = null;
  private onMessageCallback: (msg: ServerMessage) => void = () => {};
  private sessionId: string;
  private useMock: boolean = false;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    // For demonstration purposes, if the connection fails, we can fallback to BroadcastChannel
    // to simulate "nearby" devices across browser tabs.
    this.broadcastChannel = new BroadcastChannel('geodrop_mock');
    this.broadcastChannel.onmessage = (event) => {
      if (this.useMock) {
        this.onMessageCallback(event.data);
      }
    };
  }

  public connect(onMessage: (msg: ServerMessage) => void) {
    this.onMessageCallback = onMessage;
    
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('Connected to WebSocket server');
        this.useMock = false;
      };

      this.socket.onmessage = (event) => {
        const data: ServerMessage = JSON.parse(event.data);
        this.onMessageCallback(data);
      };

      this.socket.onerror = () => {
        console.warn('WebSocket error, switching to mock (BroadcastChannel) mode for multi-tab simulation.');
        this.useMock = true;
      };

      this.socket.onclose = () => {
        console.warn('WebSocket closed, switching to mock mode.');
        this.useMock = true;
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
      this.useMock = true;
    }
  }

  public send(type: string, payload: any) {
    const msg: ServerMessage = { type: type as any, payload };
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else if (this.useMock && this.broadcastChannel) {
      // Broadcast to other tabs to simulate a server broadcast
      this.broadcastChannel.postMessage(msg);
      // Also notify self for mock updates
      if (type === 'UPDATE_LOCATION') {
        // In a real server, it would handle the logic. 
        // For the mock, we simulate the "broadcast" part.
      }
    }
  }

  public disconnect() {
    this.socket?.close();
    this.broadcastChannel?.close();
  }
}
