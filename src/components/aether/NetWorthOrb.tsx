import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';

interface NetWorthOrbProps {
  totalValue: number;
  change24h: number;
}

const NetWorthOrb: React.FC<NetWorthOrbProps> = ({ totalValue, change24h }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const { hideBalances } = useAppContext();

  useEffect(() => {
    if (hideBalances) {
      setDisplayValue(totalValue);
      return;
    }

    // Animate value counting up
    const duration = 2000;
    const steps = 60;
    const increment = totalValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalValue) {
        setDisplayValue(totalValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);

    return () => clearInterval(timer);
  }, [totalValue, hideBalances]);

  const formatCurrency = (value: number) => {
    if (hideBalances) {
      return '••••••';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatChange = (value: number) => {
    if (hideBalances) {
      return '••••';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full animate-pulse opacity-20 bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500 blur-3xl" />
      <div className="absolute inset-4 rounded-full animate-spin-slow opacity-30 border-2 border-dashed border-cyan-500/50" />
      <div className="absolute inset-8 rounded-full animate-spin-reverse opacity-40 border border-magenta-500/30" />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-cyan-400 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 10px #00f0ff',
          }}
        />
      ))}

      {/* Main orb */}
      <div className="absolute inset-12 rounded-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-magenta-500/20 animate-gradient" />
        
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/30 via-transparent to-transparent" />
        
        {/* Glass effect */}
        <div className="absolute inset-0 backdrop-blur-xl bg-black/40 border border-cyan-500/30 rounded-full" />
        
        {/* Holographic shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-xs uppercase tracking-[0.3em] text-cyan-400/80 mb-2 font-medium">
            Total Net Worth
          </span>
          <span 
            className={cn(
              "text-3xl font-bold bg-gradient-to-r from-cyan-400 via-white to-magenta-400 bg-clip-text text-transparent",
              hideBalances && "blur-sm select-none"
            )}
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              textShadow: hideBalances ? 'none' : '0 0 30px rgba(0, 240, 255, 0.5)',
            }}
          >
            {formatCurrency(displayValue)}
          </span>
          <div className={cn(
            'flex items-center gap-1 mt-2 text-sm font-medium',
            change24h >= 0 ? 'text-green-400' : 'text-red-400',
            hideBalances && "blur-sm select-none"
          )}>
            {!hideBalances && (
              <svg 
                className={cn('w-4 h-4', change24h < 0 && 'rotate-180')} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{formatChange(change24h)}</span>
            <span className="text-gray-500 text-xs">24h</span>
          </div>
        </div>
      </div>

      {/* Orbiting elements */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#00f0ff]" />
      </div>
      <div className="absolute inset-0 animate-spin-reverse" style={{ animationDuration: '15s' }}>
        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-magenta-400 shadow-[0_0_15px_#ff006e]" />
      </div>
    </div>
  );
};

export default NetWorthOrb;
