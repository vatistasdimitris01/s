
import React from 'react';
import { Radio, Users } from 'lucide-react';

interface HeaderProps {
  userCount: number;
}

const Header: React.FC<HeaderProps> = ({ userCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">GeoDrop</h1>
          <p className="text-xs text-slate-500 font-medium">Nearby Discovery</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
        <Users className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-indigo-700">{userCount}</span>
      </div>
    </header>
  );
};

export default Header;
