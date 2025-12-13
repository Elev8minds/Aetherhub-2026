/**
 * AetherHub 2049™ - Elev8minds LLC
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * This software is the copyrighted property of Elev8minds LLC.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Trademarks: "AetherHub", "AetherHub 2049", and the AetherHub logo are owned by Elev8minds LLC.
 * For licensing inquiries: legal@elev8minds.com
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AetherHubLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the tagline */
  showTagline?: boolean;
  /** Layout direction - horizontal puts tagline to the right, vertical puts it below */
  layout?: 'horizontal' | 'vertical' | 'auto';
  /** Show only the icon (no text) */
  iconOnly?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const AetherHubLogo: React.FC<AetherHubLogoProps> = ({
  size = 'md',
  showTagline = true,
  layout = 'auto',
  iconOnly = false,
  className,
  onClick,
}) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Try to load the custom logo
  useEffect(() => {
    const checkLogo = async () => {
      // Try SVG first, then PNG
      const logoOptions = ['/logo.svg', '/logo.png'];
      
      for (const src of logoOptions) {
        try {
          const response = await fetch(src, { method: 'HEAD' });
          if (response.ok) {
            setLogoSrc(src);
            return;
          }
        } catch {
          // Continue to next option
        }
      }
      // No custom logo found, use fallback
      setLogoError(true);
    };

    checkLogo();
  }, []);

  // Size configurations
  const sizeConfig = {
    sm: {
      logo: 'w-8 h-8',
      logoFallback: 'w-8 h-8 text-sm',
      title: 'text-lg',
      tagline: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      logo: 'w-10 h-10',
      logoFallback: 'w-10 h-10 text-lg',
      title: 'text-xl',
      tagline: 'text-[10px]',
      gap: 'gap-3',
    },
    lg: {
      logo: 'w-12 h-12',
      logoFallback: 'w-12 h-12 text-xl',
      title: 'text-2xl',
      tagline: 'text-xs',
      gap: 'gap-3',
    },
    xl: {
      logo: 'w-16 h-16',
      logoFallback: 'w-16 h-16 text-2xl',
      title: 'text-3xl',
      tagline: 'text-sm',
      gap: 'gap-4',
    },
  };

  const config = sizeConfig[size];

  // Fallback logo (gradient "A" icon)
  const FallbackLogo = () => (
    <div 
      className={cn(
        config.logoFallback,
        'rounded-xl bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center',
        'shadow-[0_0_20px_rgba(0,240,255,0.3)]'
      )}
    >
      <span 
        className="text-white font-bold" 
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        A
      </span>
    </div>
  );

  // Custom logo image
  const CustomLogo = () => (
    <img
      src={logoSrc!}
      alt="AetherHub Logo"
      className={cn(
        config.logo,
        'object-contain',
        'drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]'
      )}
      onError={() => setLogoError(true)}
    />
  );

  const containerClasses = cn(
    'flex items-center',
    layout === 'vertical' ? 'flex-col' : layout === 'horizontal' ? 'flex-row' : 'flex-row md:flex-row',
    config.gap,
    onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
    className
  );

  const textContainerClasses = cn(
    layout === 'vertical' ? 'text-center' : 'text-left',
    layout === 'auto' && 'text-left'
  );

  if (iconOnly) {
    return (
      <div className={cn(onClick && 'cursor-pointer', className)} onClick={onClick}>
        {logoSrc && !logoError ? <CustomLogo /> : <FallbackLogo />}
      </div>
    );
  }

  return (
    <div className={containerClasses} onClick={onClick}>
      {/* Logo Icon */}
      <div className="relative flex-shrink-0">
        {logoSrc && !logoError ? <CustomLogo /> : <FallbackLogo />}
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-xl -z-10" />
      </div>

      {/* Text Content */}
      <div className={textContainerClasses}>
        {/* Main Title */}
        <h1 
          className={cn(
            config.title,
            'font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-magenta-400 bg-clip-text text-transparent',
            'tracking-wide'
          )}
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          AetherHub
        </h1>

        {/* Tagline */}
        {showTagline && (
          <p 
            className={cn(
              config.tagline,
              'font-bold uppercase tracking-[0.2em]',
              'text-cyan-400',
              'mt-0.5',
              // Cyberpunk glow effect
              'drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]'
            )}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Cross-chain Intelligence
          </p>
        )}
      </div>
    </div>
  );
};

export default AetherHubLogo;

// Also export a simple logo mark for compact spaces
export const AetherHubLogoMark: React.FC<{ 
  size?: number; 
  className?: string;
  onClick?: () => void;
}> = ({ 
  size = 40, 
  className,
  onClick 
}) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const checkLogo = async () => {
      const logoOptions = ['/logo.svg', '/logo.png'];
      
      for (const src of logoOptions) {
        try {
          const response = await fetch(src, { method: 'HEAD' });
          if (response.ok) {
            setLogoSrc(src);
            return;
          }
        } catch {
          // Continue
        }
      }
      setLogoError(true);
    };

    checkLogo();
  }, []);

  if (logoSrc && !logoError) {
    return (
      <img
        src={logoSrc}
        alt="AetherHub"
        width={size}
        height={size}
        className={cn(
          'object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]',
          onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
          className
        )}
        onClick={onClick}
        onError={() => setLogoError(true)}
      />
    );
  }

  return (
    <div 
      className={cn(
        'rounded-xl bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center',
        'shadow-[0_0_20px_rgba(0,240,255,0.3)]',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <span 
        className="text-white font-bold" 
        style={{ 
          fontFamily: 'Orbitron, sans-serif',
          fontSize: size * 0.5 
        }}
      >
        A
      </span>
    </div>
  );
};
