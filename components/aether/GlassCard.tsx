import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'purple' | 'gold';
  hover?: boolean;
  onClick?: () => void;
}

const glowColors = {
  cyan: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] border-cyan-500/30',
  magenta: 'hover:shadow-[0_0_30px_rgba(255,0,110,0.3)] border-pink-500/30',
  green: 'hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] border-green-500/30',
  purple: 'hover:shadow-[0_0_30px_rgba(157,78,221,0.3)] border-purple-500/30',
  gold: 'hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] border-yellow-500/30',
};

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glowColor = 'cyan',
  hover = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02]',
        'border rounded-2xl overflow-hidden',
        'transition-all duration-500 ease-out',
        hover && 'hover:scale-[1.02] hover:bg-white/10 cursor-pointer',
        glowColors[glowColor],
        className
      )}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
      </div>
      
      {/* Hexagonal pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300f0ff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
