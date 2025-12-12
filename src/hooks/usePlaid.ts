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

interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
  balances: {
    available: number;
    current: number;
    limit: number | null;
  };
}

export const usePlaid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const createLinkToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('plaid-link', {
        body: { action: 'create_link_token' }
      });

      if (error) throw error;
      
      setLinkToken(data.link_token);
      return data.link_token;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exchangeToken = useCallback(async (publicToken: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('plaid-link', {
        body: { action: 'exchange_token', publicToken }
      });

      if (error) throw error;
      
      // Store access token securely (in production, store server-side)
      localStorage.setItem('plaid_access_token', data.access_token);
      
      return data.access_token;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAccounts = useCallback(async (accessToken?: string) => {
    setIsLoading(true);
    setError(null);
    
    const token = accessToken || localStorage.getItem('plaid_access_token');
    if (!token) {
      setError('No access token available');
      setIsLoading(false);
      return [];
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('plaid-link', {
        body: { action: 'get_accounts', accessToken: token }
      });

      if (error) throw error;
      
      setAccounts(data.accounts);
      return data.accounts;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBalance = useCallback(async (accessToken?: string) => {
    setIsLoading(true);
    setError(null);
    
    const token = accessToken || localStorage.getItem('plaid_access_token');
    if (!token) {
      setError('No access token available');
      setIsLoading(false);
      return [];
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('plaid-link', {
        body: { action: 'get_balance', accessToken: token }
      });

      if (error) throw error;
      
      setAccounts(data.accounts);
      return data.accounts;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    accounts,
    linkToken,
    createLinkToken,
    exchangeToken,
    getAccounts,
    getBalance,
  };
};
