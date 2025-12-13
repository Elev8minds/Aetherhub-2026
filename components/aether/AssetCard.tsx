import React from 'react';


import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import AssetLogo from './AssetLogo';
import { getAssetColor } from '@/lib/constants';

interface AssetCardProps {
  asset: {
    id: number;
    name: string;
    symbol: string;
    chain: string;
    balance: number;
    value: number;
    change24h: number;
    image?: string;
    color?: string;
  };
  onClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const isPositive = asset.change24h >= 0;
  const { hideBalances } = useAppContext();
  const assetColor = asset.color || getAssetColor(asset.symbol);

  const formatCurrency = (value: number) => {
    if (hideBalances) {
      return '••••••';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: number) => {
    if (hideBalances) {
      return '••••';
    }
    if (balance >= 1000) {
      return balance.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return balance.toLocaleString('en-US', { maximumFractionDigits: 4 });
  };

  const formatChange = (value: number) => {
    if (hideBalances) {
      return '••••';
    }
    return `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <GlassCard
      glowColor={isPositive ? 'green' : 'magenta'}
      onClick={onClick}
      className="p-4 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Use AssetLogo component with fallback to asset.image */}
            <AssetLogo
              symbol={asset.symbol}
              size={48}
              color={assetColor}
              className="ring-2 ring-white/10 rounded-xl"
            />
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-black/80 rounded text-cyan-400 border border-cyan-500/30">
              {asset.chain.slice(0, 3).toUpperCase()}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
              {asset.name}
            </h4>
            <p className="text-sm text-gray-500">{asset.symbol}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-500">Balance</span>
          <span className={cn(
            "font-mono text-sm text-gray-300",
            hideBalances && "blur-sm select-none"
          )}>
            {formatBalance(asset.balance)} {asset.symbol}
          </span>
        </div>
        
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-500">Value</span>
          <span 
            className={cn(
              "font-semibold text-white",
              hideBalances && "blur-sm select-none"
            )} 
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {formatCurrency(asset.value)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500">24h Change</span>
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-green-400' : 'text-red-400',
            hideBalances && "blur-sm select-none"
          )}>
            {!hideBalances && (
              isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )
            )}
            <span>{formatChange(asset.change24h)}</span>
          </div>
        </div>
      </div>

      {/* Hover effect glow */}
      <div className={cn(
        'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
        isPositive ? 'bg-gradient-to-t from-green-500/10 to-transparent' : 'bg-gradient-to-t from-red-500/10 to-transparent'
      )} />
    </GlassCard>
  );
};

export default AssetCard;
