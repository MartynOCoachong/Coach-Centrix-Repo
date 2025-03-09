import { Calendar, Dumbbell, Play, UserCircle, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 py-2">
      <div className="flex justify-around items-center max-w-6xl mx-auto px-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
            isActive('/dashboard') 
              ? 'text-[#AAFF00]' 
              : 'text-zinc-500 hover:text-[#AAFF00]/70'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => navigate('/session')}
          className={`flex flex-col items-center justify-center w-20 h-20 transition-colors ${
            isActive('/session') 
              ? 'text-[#AAFF00]' 
              : 'text-zinc-500 hover:text-[#AAFF00]/70'
          }`}
        >
          <Play size={24} />
          <span className="text-xs mt-1">Session</span>
        </button>
        <button 
          onClick={() => navigate('/drills')}
          className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
            isActive('/drills') 
              ? 'text-[#AAFF00]' 
              : 'text-zinc-500 hover:text-[#AAFF00]/70'
          }`}
        >
          <Dumbbell size={24} />
          <span className="text-xs mt-1">Drills</span>
        </button>
        <button 
          onClick={() => navigate('/season')}
          className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
            isActive('/season') 
              ? 'text-[#AAFF00]' 
              : 'text-zinc-500 hover:text-[#AAFF00]/70'
          }`}
        >
          <Calendar size={24} />
          <span className="text-xs mt-1">Season</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${
            isActive('/profile') 
              ? 'text-[#AAFF00]' 
              : 'text-zinc-500 hover:text-[#AAFF00]/70'
          }`}
        >
          <UserCircle size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}