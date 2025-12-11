import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { Building2, Shield, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface RWACardProps {
  asset: {
    id: number;
    name: string;
    symbol: string;
    apy: number;
    tvl: string;
    minInvestment: number;
    status: string;
    description: string;
  };
  onInvest?: (asset: any, amount: number) => void;
}

const RWACard: React.FC<RWACardProps> = ({ asset, onInvest }) => {
  const [showInvest, setShowInvest] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { hideBalances } = useAppContext();

  const handleInvest = async () => {
    if (!amount || parseFloat(amount) < asset.minInvestment) return;
    
    setIsLoading(true);
    // Simulate investment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    onInvest?.(asset, parseFloat(amount));
    setIsLoading(false);
    setShowInvest(false);
    setAmount('');
  };

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

  const formatTVL = (value: string) => {
    if (hideBalances) {
      return '••••';
    }
    return `$${value}`;
  };

  const statusColors: Record<string, string> = {
    'Accredited': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Qualified': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Open': 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <GlassCard glowColor="gold" className="p-5 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Building2 className="w-full h-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white">{asset.name}</h4>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border',
                statusColors[asset.status]
              )}>
                {asset.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">{asset.description}</p>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">APY</p>
            <p className={cn(
              "text-lg font-bold text-green-400 flex items-center gap-1",
              hideBalances && "blur-sm select-none"
            )} style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {!hideBalances && <TrendingUp className="w-4 h-4" />}
              {hideBalances ? '••••' : `${asset.apy}%`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">TVL</p>
            <p className={cn(
              "text-lg font-bold text-white",
              hideBalances && "blur-sm select-none"
            )} style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {formatTVL(asset.tvl)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Min</p>
            <p className={cn(
              "text-sm font-semibold text-gray-300",
              hideBalances && "blur-sm select-none"
            )}>
              {formatCurrency(asset.minInvestment)}
            </p>
          </div>
        </div>

        {/* Investment Form */}
        {showInvest ? (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${hideBalances ? '••••' : formatCurrency(asset.minInvestment)}`}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-7 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInvest(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={isLoading || !amount || parseFloat(amount) < asset.minInvestment}
                className={cn(
                  'flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
                  isLoading || !amount || parseFloat(amount) < asset.minInvestment
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Investment'
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInvest(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-semibold hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all flex items-center justify-center gap-2 group"
          >
            Invest in {asset.symbol}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export default RWACard;
