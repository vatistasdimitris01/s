
export enum DeviceType {
  MOBILE = 'mobile',
  DESKTOP = 'desktop'
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  sessionId: string;
  name: string;
  location: Location;
  deviceType: DeviceType;
  distance?: number;
  lastSeen: number;
}

export interface ServerMessage {
  type: 'UPDATE_LIST' | 'CHAT_MESSAGE' | 'SIGNALING' | 'FILE_TRANSFER';
  payload: any;
}

export interface SharedFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

export interface ChatMessage {
  from: string;
  text?: string;
  file?: SharedFile;
  timestamp: number;
}
