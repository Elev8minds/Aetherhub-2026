import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Brain, X, Sparkles, ArrowRightLeft, TrendingUp, 
  AlertTriangle, CheckCircle, Loader2, Volume2
} from 'lucide-react';

interface AIMessage {
  id: string;
  content: string;
  type: 'response' | 'recommendation' | 'action' | 'warning' | 'success';
  actions?: Array<{ type: string; label: string; onClick?: () => void }>;
  timestamp: Date;
  position?: { x: number; y: number; z: number };
  isProcessing?: boolean;
}

interface VRAITextPanelProps {
  messages: AIMessage[];
  onDismiss: (id: string) => void;
  onActionClick: (action: string, messageId: string) => void;
  isVRMode: boolean;
  spatialLayout?: 'arc' | 'stack' | 'float';
}

const VRAITextPanel: React.FC<VRAITextPanelProps> = ({
  messages,
  onDismiss,
  onActionClick,
  isVRMode,
  spatialLayout = 'arc'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  // Calculate 3D positions for panels in VR mode
  const getPanelPosition = (index: number, total: number) => {
    if (!isVRMode) {
      return { x: 0, y: index * 10, z: 0, rotateY: 0, scale: 1 };
    }

    switch (spatialLayout) {
      case 'arc': {
        const arcAngle = Math.PI * 0.6; // 108 degrees arc
        const startAngle = -arcAngle / 2;
        const angleStep = total > 1 ? arcAngle / (total - 1) : 0;
        const angle = startAngle + index * angleStep;
        const radius = 300;
        return {
          x: Math.sin(angle) * radius,
          y: (index - total / 2) * 20,
          z: Math.cos(angle) * radius - radius,
          rotateY: -angle * (180 / Math.PI),
          scale: 1 - Math.abs(index - total / 2) * 0.05
        };
      }
      case 'stack': {
        return {
          x: index * 30,
          y: -index * 40,
          z: -index * 50,
          rotateY: index * 5,
          scale: 1 - index * 0.05
        };
      }
      case 'float':
      default: {
        return {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 100,
          z: -100 - Math.random() * 100,
          rotateY: (Math.random() - 0.5) * 20,
          scale: 0.9 + Math.random() * 0.2
        };
      }
    }
  };

  const getTypeStyles = (type: AIMessage['type']) => {
    switch (type) {
      case 'recommendation':
        return {
          border: 'border-purple-500/50',
          glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
          icon: <Sparkles className="w-5 h-5 text-purple-400" />,
          bg: 'from-purple-500/20 to-purple-900/20'
        };
      case 'action':
        return {
          border: 'border-cyan-500/50',
          glow: 'shadow-[0_0_30px_rgba(0,240,255,0.3)]',
          icon: <ArrowRightLeft className="w-5 h-5 text-cyan-400" />,
          bg: 'from-cyan-500/20 to-cyan-900/20'
        };
      case 'warning':
        return {
          border: 'border-amber-500/50',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          bg: 'from-amber-500/20 to-amber-900/20'
        };
      case 'success':
        return {
          border: 'border-emerald-500/50',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          bg: 'from-emerald-500/20 to-emerald-900/20'
        };
      default:
        return {
          border: 'border-white/20',
          glow: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
          icon: <Brain className="w-5 h-5 text-white" />,
          bg: 'from-white/10 to-gray-900/20'
        };
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full',
        isVRMode ? 'h-[500px] perspective-[1000px]' : 'space-y-4'
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => {
          const position = getPanelPosition(index, messages.length);
          const styles = getTypeStyles(message.type);
          const isHovered = hoveredPanel === message.id;

          return (
            <motion.div
              key={message.id}
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                x: isVRMode ? position.x : 0,
                y: isVRMode ? position.y - 50 : -20,
                z: isVRMode ? position.z - 100 : 0,
                rotateY: isVRMode ? position.rotateY : 0
              }}
              animate={{ 
                opacity: 1, 
                scale: isHovered ? position.scale * 1.05 : position.scale,
                x: isVRMode ? position.x : 0,
                y: isVRMode ? position.y : 0,
                z: isVRMode ? (isHovered ? position.z + 50 : position.z) : 0,
                rotateY: isVRMode ? position.rotateY : 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5,
                y: isVRMode ? position.y + 100 : 20,
                z: isVRMode ? position.z - 100 : 0
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 20,
                mass: 0.8
              }}
              className={cn(
                'rounded-2xl border backdrop-blur-xl overflow-hidden',
                'bg-gradient-to-br',
                styles.bg,
                styles.border,
                isVRMode && styles.glow,
                isVRMode ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px]' : 'w-full'
              )}
              style={{
                transformStyle: 'preserve-3d',
                transform: isVRMode 
                  ? `translate3d(${position.x}px, ${position.y}px, ${position.z}px) rotateY(${position.rotateY}deg)`
                  : undefined
              }}
              onMouseEnter={() => setHoveredPanel(message.id)}
              onMouseLeave={() => setHoveredPanel(null)}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    'bg-gradient-to-br from-white/10 to-white/5'
                  )}>
                    {message.isProcessing ? (
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    ) : (
                      styles.icon
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white capitalize">
                      {message.type === 'response' ? 'Aether AI' : message.type}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isVRMode && (
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  <button 
                    onClick={() => onDismiss(message.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className={cn(
                  'text-sm text-gray-200 leading-relaxed',
                  message.isProcessing && 'animate-pulse'
                )}>
                  {message.isProcessing ? 'Processing your request...' : message.content}
                </p>

                {/* Actions */}
                {message.actions && message.actions.length > 0 && !message.isProcessing && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          action.onClick?.();
                          onActionClick(action.type, message.id);
                        }}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                          'bg-gradient-to-r from-cyan-500/20 to-purple-500/20',
                          'border border-cyan-500/30 hover:border-cyan-400/50',
                          'text-cyan-400 hover:text-cyan-300',
                          'transition-all duration-200',
                          'hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                        )}
                      >
                        {action.type === 'swap' && <ArrowRightLeft className="w-4 h-4" />}
                        {action.type === 'optimize' && <TrendingUp className="w-4 h-4" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* VR Depth indicator */}
              {isVRMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                  <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
                  <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Empty state */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'flex flex-col items-center justify-center text-center p-8',
            isVRMode ? 'absolute inset-0' : ''
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isVRMode ? 'VR AI Assistant Ready' : 'AI Assistant Ready'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {isVRMode 
              ? 'Use voice commands or gestures to interact with your portfolio in immersive 3D space.'
              : 'Ask questions about your portfolio, request swaps, or get AI recommendations.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VRAITextPanel;
