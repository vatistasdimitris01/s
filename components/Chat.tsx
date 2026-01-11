
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ShieldCheck, Paperclip, FileText, Download, Loader2 } from 'lucide-react';
import { User, ChatMessage, SharedFile } from '../types';

interface ChatProps {
  targetUser: User;
  currentUser: User;
  onClose: () => void;
  onSendMessage: (text: string, file?: SharedFile) => void;
  messages: ChatMessage[];
}

const Chat: React.FC<ChatProps> = ({ targetUser, currentUser, onClose, onSendMessage, messages }) => {
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const sharedFile: SharedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64Data,
      };
      onSendMessage('', sharedFile);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = (file: SharedFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white md:absolute md:inset-auto md:bottom-20 md:right-4 md:h-[550px] md:w-[400px] md:rounded-3xl md:shadow-2xl md:border md:border-slate-200 animate-in slide-in-from-bottom duration-300 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <span className="font-bold text-lg">{targetUser.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-none">{targetUser.name}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> P2P Secure
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
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <div className="p-6 bg-white rounded-3xl shadow-sm text-center max-w-[240px] border border-slate-100">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">Secure connection ready.</p>
              <p className="text-xs text-slate-400 mt-1">Send a message or drop a file to start sharing.</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === currentUser.sessionId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] overflow-hidden ${
              msg.from === currentUser.sessionId 
                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm'
            }`}>
              {msg.text && <div className="px-4 py-2 text-sm">{msg.text}</div>}
              {msg.file && (
                <div className={`p-3 flex items-center gap-3 ${msg.text ? 'border-t border-white/10' : ''}`}>
                  <div className={`p-2 rounded-lg ${msg.from === currentUser.sessionId ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{msg.file.name}</p>
                    <p className={`text-[10px] ${msg.from === currentUser.sessionId ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {formatSize(msg.file.size)}
                    </p>
                  </div>
                  <button 
                    onClick={() => msg.file && handleDownload(msg.file)}
                    className={`p-1.5 rounded-md transition-colors ${
                      msg.from === currentUser.sessionId 
                        ? 'hover:bg-white/20 text-white' 
                        : 'hover:bg-slate-200 text-indigo-600'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isUploading && (
          <div className="flex justify-end">
            <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Encrypting file...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none max-h-32"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
