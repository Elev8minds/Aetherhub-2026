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

import React, { useState, useRef, useEffect } from 'react';



import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  Brain, Send, Loader2, Sparkles, TrendingUp, 
  ArrowRightLeft, PiggyBank, Zap, RefreshCw 
} from 'lucide-react';
import { PORTFOLIO_ASSETS } from '@/lib/constants';
import { useAppContext } from '@/contexts/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ type: string; label: string }>;
  timestamp: Date;
}

interface AIOptimizerProps {
  onAction?: (action: string) => void;
}

const AIOptimizer: React.FC<AIOptimizerProps> = ({ onAction }) => {
  const { hideBalances } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Aether AI. I\'m your intelligent portfolio optimizer powered by Grok. Ask me to analyze your holdings, find yield opportunities, or optimize your cross-chain allocations.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to mask sensitive values in AI responses
  const maskSensitiveContent = (content: string): string => {
    if (!hideBalances) return content;
    
    // Mask dollar amounts
    let masked = content.replace(/\$[\d,]+\.?\d*/g, '$••••••');
    // Mask percentages that might be returns/yields
    masked = masked.replace(/(\+|-)?\d+\.?\d*%/g, '••••%');
    // Mask token amounts
    masked = masked.replace(/\d+\.?\d*\s*(ETH|BTC|SOL|USDC|MATIC|ARB|USDT)/gi, '•••• $1');
    
    return masked;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('aether-ai', {
        body: {
          message: input,
          portfolio: PORTFOLIO_ASSETS.map(a => ({
            name: a.name,
            symbol: a.symbol,
            chain: a.chain,
            value: a.value,
            change24h: a.change24h
          })),
          context: `Total portfolio value: $${PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.value, 0).toLocaleString()}`
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        actions: data.actions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an issue. Please try again or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const actionIcons: Record<string, React.ReactNode> = {
    rebalance: <RefreshCw className="w-3 h-3" />,
    swap: <ArrowRightLeft className="w-3 h-3" />,
    invest: <PiggyBank className="w-3 h-3" />,
    yield: <TrendingUp className="w-3 h-3" />,
  };

  const quickPrompts = [
    { label: 'Optimize Portfolio', prompt: 'Analyze my portfolio and suggest optimizations for better risk-adjusted returns' },
    { label: 'Find Yields', prompt: 'What are the best yield opportunities for my holdings right now?' },
    { label: 'Risk Analysis', prompt: 'Provide a risk assessment of my current portfolio allocation' },
    { label: 'Rebalance', prompt: 'Should I rebalance my portfolio? Show me the optimal allocation' },
  ];

  return (
    <GlassCard glowColor="purple" className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Aether AI
                <Sparkles className="w-4 h-4 text-purple-400" />
              </h3>
              <p className="text-xs text-gray-500">Powered by Grok</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl p-4',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                  : 'bg-white/5 border border-white/10'
              )}
            >
              <p className={cn(
                "text-sm text-gray-200 whitespace-pre-wrap",
                hideBalances && message.role === 'assistant' && "select-none"
              )}>
                {message.role === 'assistant' 
                  ? maskSensitiveContent(message.content)
                  : message.content
                }
              </p>
              
              {/* Action Buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                  {message.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => onAction?.(action.type)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors"
                    >
                      {actionIcons[action.type]}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-[10px] text-gray-600 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-gray-400">Aether is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickPrompts.map((item, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(item.prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Aether anything..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'px-4 rounded-xl transition-all flex items-center justify-center',
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_20px_rgba(157,78,221,0.4)]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default AIOptimizer;
