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

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface AIResponse {
  response: string;
  actions: Array<{ type: string; label: string }>;
  timestamp: string;
}

interface Portfolio {
  name: string;
  symbol: string;
  chain: string;
  value: number;
  change24h: number;
}

export const useAetherAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);

  const askAether = useCallback(async (
    message: string, 
    portfolio?: Portfolio[], 
    context?: string
  ): Promise<AIResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('aether-ai', {
        body: { message, portfolio, context }
      });

      if (error) throw error;
      
      const response: AIResponse = {
        response: data.response,
        actions: data.actions || [],
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      setLastResponse(response);
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizePortfolio = useCallback(async (portfolio: Portfolio[]) => {
    return askAether(
      'Analyze my portfolio and provide specific optimization recommendations. Consider risk-adjusted returns, diversification, and current market conditions.',
      portfolio,
      `Total portfolio value: $${portfolio.reduce((sum, p) => sum + p.value, 0).toLocaleString()}`
    );
  }, [askAether]);

  const findYieldOpportunities = useCallback(async (portfolio: Portfolio[]) => {
    return askAether(
      'What are the best yield opportunities for my current holdings? Include both DeFi and RWA options with specific APY rates.',
      portfolio
    );
  }, [askAether]);

  const getRiskAnalysis = useCallback(async (portfolio: Portfolio[]) => {
    return askAether(
      'Provide a comprehensive risk analysis of my portfolio. Include concentration risk, correlation analysis, and specific recommendations to reduce risk.',
      portfolio
    );
  }, [askAether]);

  const suggestRebalancing = useCallback(async (portfolio: Portfolio[]) => {
    return askAether(
      'Should I rebalance my portfolio? If yes, provide specific allocation percentages and the trades needed to achieve optimal balance.',
      portfolio
    );
  }, [askAether]);

  return {
    isLoading,
    error,
    lastResponse,
    askAether,
    optimizePortfolio,
    findYieldOpportunities,
    getRiskAnalysis,
    suggestRebalancing,
  };
};
