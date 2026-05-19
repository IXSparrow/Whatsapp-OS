import React from 'react';
import clsx from 'clsx';
import { UserCircle } from 'lucide-react';
import { ProfileUser } from '../../hooks/useProfileData';

interface ProfileAvatarButtonProps {
  user?: ProfileUser | null;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  useInitial?: boolean; // If true, uses a colored circle with initial instead of UserCircle icon
}

export const ProfileAvatarButton: React.FC<ProfileAvatarButtonProps> = ({ 
  user, 
  isOpen, 
  onClick, 
  className,
  useInitial = false
}) => {
  const getInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <button 
      onClick={onClick}
      aria-label="Open profile menu"
      aria-expanded={isOpen}
      className={clsx(
        "relative transition-all cursor-pointer outline-none flex items-center justify-center pointer-events-auto z-10",
        isOpen ? "scale-105" : "hover:scale-105",
        useInitial ? "w-8 h-8 rounded-full shadow-lg" : "rounded-xl p-2 text-slate-500 hover:text-white",
        useInitial && (isOpen ? "ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border border-white/10 hover:border-white/20"),
        !useInitial && isOpen && "text-white",
        className
      )}
      style={useInitial ? {
        background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(59,130,246,0.8))'
      } : {}}
    >
      {useInitial ? (
        <span className="text-black font-black text-xs">{getInitial()}</span>
      ) : (
        <UserCircle 
          size={18} 
          className={clsx("transition-colors duration-300", isOpen && "text-emerald-400")} 
        />
      )}
      
      {/* Online Status Dot */}
      {user?.status === 'Online' && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
      )}
    </button>
  );
};
