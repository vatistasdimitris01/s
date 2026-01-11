
import React from 'react';
import { Smartphone, Monitor, ChevronRight, MapPin } from 'lucide-react';
import { User, DeviceType } from '../types';

interface UserCardProps {
  user: User;
  isClosest: boolean;
  onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, isClosest, onClick }) => {
  const getDistanceColor = (d: number = 0) => {
    if (d < 10) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (d < 50) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        isClosest 
          ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50' 
          : 'bg-white/50 border-slate-200 hover:border-indigo-200 hover:bg-white hover:shadow-sm'
      }`}
    >
      <div className="relative">
        <div className={`p-3 rounded-xl ${isClosest ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'} transition-colors`}>
          {user.deviceType === DeviceType.MOBILE ? (
            <Smartphone className="w-6 h-6" />
          ) : (
            <Monitor className="w-6 h-6" />
          )}
        </div>
        {isClosest && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        )}
      </div>

      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">{user.name}</h3>
          {isClosest && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              Closest
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <MapPin className="w-3 h-3" />
          <span>{user.deviceType === DeviceType.MOBILE ? 'Mobile Device' : 'Desktop Computer'}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className={`px-2 py-1 rounded-lg border text-xs font-bold ${getDistanceColor(user.distance)}`}>
          {user.distance?.toFixed(0)}m away
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </button>
  );
};

export default UserCard;
