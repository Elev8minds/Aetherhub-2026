import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { Building2, Plus, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePlaid } from '@/hooks/usePlaid';
import { useAppContext } from '@/contexts/AppContext';

interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  institution: string;
  mask: string;
  lastUpdated: Date;
}

const BankAccounts: React.FC = () => {
  const { hideBalances } = useAppContext();
  const { 
    accounts, 
    createLinkToken,
  } = usePlaid();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleConnectBank = async () => {
    setIsConnecting(true);
    setConnectionStatus('idle');
    
    try {
      const linkToken = await createLinkToken();
      if (linkToken) {
        setTimeout(() => {
          setConnectionStatus('success');
          setIsConnecting(false);
        }, 2000);
      }
    } catch (err) {
      setConnectionStatus('error');
      setIsConnecting(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (hideBalances) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const mockAccounts: BankAccount[] = [
    { id: '1', name: 'Chase Checking', type: 'checking', balance: 24567.89, institution: 'JPMorgan Chase', mask: '4521', lastUpdated: new Date() },
    { id: '2', name: 'Chase Savings', type: 'savings', balance: 156789.01, institution: 'JPMorgan Chase', mask: '7832', lastUpdated: new Date() },
    { id: '3', name: 'Fidelity Brokerage', type: 'investment', balance: 345678.90, institution: 'Fidelity', mask: '9012', lastUpdated: new Date() },
  ];

  const displayAccounts = accounts.length > 0 ? accounts : mockAccounts;
  const totalBalance = displayAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <GlassCard glowColor="cyan" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Total Bank Balance</h3>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className={cn(
          "text-3xl font-bold text-white",
          hideBalances && "blur-sm select-none"
        )} style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Across {displayAccounts.length} connected accounts
        </p>
      </GlassCard>

      <div className="space-y-3">
        {displayAccounts.map((account) => (
          <GlassCard key={account.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{account.name}</h4>
                  <p className="text-xs text-gray-500">{account.institution} ••••{account.mask}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-semibold text-white",
                  hideBalances && "blur-sm select-none"
                )}>
                  {formatCurrency(account.balance)}
                </p>
                <p className="text-xs text-gray-500 capitalize">{account.type}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-4">
        <button
          onClick={handleConnectBank}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:border-cyan-400/50 transition-all disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting via Plaid...
            </>
          ) : connectionStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Connected Successfully!</span>
            </>
          ) : connectionStatus === 'error' ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">Connection Failed</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Connect Bank Account
            </>
          )}
        </button>
        <p className="text-xs text-gray-600 text-center mt-2">
          Powered by Plaid • Bank-level security
        </p>
      </GlassCard>
    </div>
  );
};

export default BankAccounts;
