
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ShieldCheck } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface ChatProps {
  targetUser: User;
  currentUser: User;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  messages: ChatMessage[];
}

const Chat: React.FC<ChatProps> = ({ targetUser, currentUser, onClose, onSendMessage, messages }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white md:relative md:inset-auto md:h-[500px] md:w-full md:rounded-2xl md:shadow-2xl md:border md:border-slate-200 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <span className="font-bold">{targetUser.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-none">{targetUser.name}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> P2P SECURE
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-center max-w-[200px]">
              <p className="text-sm">Connection established! Say hi to {targetUser.name.split(' ')[0]}.</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === currentUser.sessionId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
              msg.from === currentUser.sessionId 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
