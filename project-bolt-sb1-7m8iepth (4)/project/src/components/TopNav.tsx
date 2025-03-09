import { Calendar, Dumbbell, Play, UserCircle, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-zinc-900 py-3 px-4 mb-6">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/session')}
          className={`flex flex-col items-center ${isActive('/session') ? 'text-primary' : 'text-zinc-500'}`}
        >
          <Play size={20} />
          <span className="text-xs mt-1">Session</span>
        </button>
        <button 
          onClick={() => navigate('/drills')}
          className={`flex flex-col items-center ${isActive('/drills') ? 'text-primary' : 'text-zinc-500'}`}
        >
          <Dumbbell size={20} />
          <span className="text-xs mt-1">Drills</span>
        </button>
        <button 
          onClick={() => navigate('/season')}
          className={`flex flex-col items-center ${isActive('/season') ? 'text-primary' : 'text-zinc-500'}`}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">Season</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center ${isActive('/profile') ? 'text-primary' : 'text-zinc-500'}`}
        >
          <UserCircle size={20} />
          <span className="text-xs mt-1">Profile</span>
        </button>
        <button 
          onClick={() => navigate('/contact')}
          className={`flex flex-col items-center ${isActive('/contact') ? 'text-primary' : 'text-zinc-500'}`}
        >
          <MessageCircle size={20} />
          <span className="text-xs mt-1">Contact Us</span>
        </button>
      </div>
    </div>
  );
}