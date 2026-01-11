
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Search, Info, AlertCircle } from 'lucide-react';
import { User, DeviceType, ServerMessage, ChatMessage } from './types';
import { NEARBY_THRESHOLD_METERS } from './constants';
import { calculateDistance, getDeviceType, generateName } from './utils/geo';
import { SocketService } from './services/socket';
import Header from './components/Header';
import UserCard from './components/UserCard';
import Chat from './components/Chat';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'requesting' | 'ready' | 'error'>('requesting');

  // We use a ref for the socket service to avoid re-renders triggering connections
  const socketRef = React.useRef<SocketService | null>(null);

  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const handleSocketMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'UPDATE_LIST': {
        const users: User[] = msg.payload;
        // Logic: Filter users by proximity (if the server didn't do it) and exclude self
        if (currentUser) {
          const processed = users
            .filter(u => u.sessionId !== sessionId)
            .map(u => ({
              ...u,
              distance: calculateDistance(
                currentUser.location.latitude,
                currentUser.location.longitude,
                u.location.latitude,
                u.location.longitude
              )
            }))
            .filter(u => (u.distance || 0) <= NEARBY_THRESHOLD_METERS)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setNearbyUsers(processed);
        }
        break;
      }
      case 'CHAT_MESSAGE': {
        const chatMsg: ChatMessage = msg.payload;
        const otherId = chatMsg.from === sessionId ? activeChatId : chatMsg.from;
        if (otherId) {
          setMessages(prev => ({
            ...prev,
            [otherId]: [...(prev[otherId] || []), chatMsg]
          }));
        }
        break;
      }
    }
  }, [sessionId, currentUser, activeChatId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setStatus('error');
      return;
    }

    const userName = generateName();
    const device = getDeviceType();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newUser: User = {
          sessionId,
          name: userName,
          deviceType: device as DeviceType,
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          },
          lastSeen: Date.now()
        };
        
        setCurrentUser(newUser);
        setStatus('ready');

        // Send location update to "server"
        if (socketRef.current) {
          socketRef.current.send('UPDATE_LOCATION', newUser);
        }
      },
      (err) => {
        console.error(err);
        setError("Location access denied. Please enable location to find people nearby.");
        setStatus('error');
      },
      { enableHighAccuracy: true }
    );

    // Initialize socket
    socketRef.current = new SocketService(sessionId);
    socketRef.current.connect(handleSocketMessage);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleSendMessage = (text: string) => {
    if (!activeChatId || !socketRef.current || !currentUser) return;
    
    const chatMsg: ChatMessage = {
      from: sessionId,
      text,
      timestamp: Date.now()
    };

    // Send to "server" which would route it to the other user
    socketRef.current.send('CHAT_MESSAGE', { to: activeChatId, ...chatMsg });
    
    // Add to local state immediately
    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), chatMsg]
    }));
  };

  const activeChatUser = useMemo(() => 
    nearbyUsers.find(u => u.sessionId === activeChatId),
    [nearbyUsers, activeChatId]
  );

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col bg-slate-50 relative">
      <Header userCount={nearbyUsers.length + (currentUser ? 1 : 0)} />

      <main className="flex-1 p-4 pb-12 overflow-y-auto">
        {status === 'requesting' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
              <MapPin className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Locating...</h2>
              <p className="text-slate-500 max-w-[250px]">Setting up your beacon to discover nearby devices.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Permission Required</h2>
              <p className="text-slate-500">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'ready' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search Radar Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 overflow-hidden shadow-xl shadow-indigo-100">
              <div className="relative z-10 flex flex-col items-center text-center space-y-4 py-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full scale-[2.5] opacity-20 animate-ping"></div>
                  <div className="absolute inset-0 bg-white/20 rounded-full scale-[1.8] opacity-40 animate-pulse"></div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
                    <Search className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-white text-xl font-bold">Scanning for Users</h2>
                  <p className="text-indigo-100 text-sm font-medium opacity-80">
                    Discovering devices within {NEARBY_THRESHOLD_METERS}m
                  </p>
                </div>
              </div>
              {/* Decorative patterns */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  People Nearby
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">{nearbyUsers.length} found</span>
              </div>

              {nearbyUsers.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center text-center space-y-3">
                  <Info className="w-8 h-8 text-slate-300" />
                  <p className="text-slate-400 text-sm font-medium">No one nearby right now.<br/>Invite a friend to open this link!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyUsers.map((user, idx) => (
                    <UserCard 
                      key={user.sessionId} 
                      user={user} 
                      isClosest={idx === 0}
                      onClick={() => setActiveChatId(user.sessionId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Modal */}
      {activeChatId && activeChatUser && currentUser && (
        <Chat
          targetUser={activeChatUser}
          currentUser={currentUser}
          messages={messages[activeChatId] || []}
          onClose={() => setActiveChatId(null)}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Bottom Sticky Tips */}
      <div className="fixed bottom-0 inset-x-0 p-4 pointer-events-none">
        <div className="max-w-xl mx-auto flex justify-center">
          <div className="bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-full shadow-lg text-[10px] text-slate-500 font-medium flex items-center gap-2 pointer-events-auto">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            CONNECTED AS <span className="text-slate-900 font-bold tracking-tight">{currentUser?.name.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
