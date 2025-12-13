import React from 'react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import AssetLogo from './AssetLogo';
import { ASSET_COLORS } from '@/lib/constants';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  asset: string;
  fromAsset?: string;
  toAsset?: string;
  amount: number;
  value: number;
  chain: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'swap', asset: 'ETH → USDC', fromAsset: 'ETH', toAsset: 'USDC', amount: 2.5, value: 9725, chain: 'Ethereum', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'completed', hash: '0x1234...5678' },
  { id: '2', type: 'receive', asset: 'SOL', amount: 50, value: 9250, chain: 'Solana', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'completed', hash: '0x2345...6789' },
  { id: '3', type: 'send', asset: 'MATIC', amount: 1000, value: 890, chain: 'Polygon', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), status: 'completed', hash: '0x3456...7890' },
  { id: '4', type: 'swap', asset: 'BTC → ETH', fromAsset: 'BTC', toAsset: 'ETH', amount: 0.1, value: 4312, chain: 'Bitcoin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'pending', hash: '0x4567...8901' },
  { id: '5', type: 'receive', asset: 'ARB', amount: 500, value: 560, chain: 'Arbitrum', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), status: 'completed', hash: '0x5678...9012' },
  { id: '6', type: 'send', asset: 'XRP', amount: 2500, value: 3075, chain: 'XRPL', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), status: 'completed', hash: '0x6789...0123' },
  { id: '7', type: 'receive', asset: 'AVAX', amount: 25, value: 1057.50, chain: 'Avalanche', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), status: 'completed', hash: '0x7890...1234' },
];

// Helper to extract the main asset symbol from transaction
const getAssetSymbol = (tx: Transaction): string => {
  if (tx.type === 'swap' && tx.fromAsset) {
    return tx.fromAsset;
  }
  // For non-swap transactions, extract symbol from asset string
  return tx.asset.split(' ')[0].replace('→', '').trim();
};

const TransactionHistory: React.FC = () => {
  const { hideBalances } = useAppContext();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4" />;
      case 'receive': return <ArrowDownLeft className="w-4 h-4" />;
      case 'swap': return <RefreshCw className="w-4 h-4" />;
      default: return null;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'send': return 'bg-red-500/20 text-red-400';
      case 'receive': return 'bg-green-500/20 text-green-400';
      case 'swap': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    if (hideBalances) {
      return '••••••';
    }
    return `${type === 'receive' ? '+' : ''}${amount.toLocaleString()}`;
  };

  const formatValue = (value: number) => {
    if (hideBalances) {
      return '••••••';
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <GlassCard glowColor="cyan" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Recent Transactions
        </h3>
        <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((tx) => {
          const assetSymbol = getAssetSymbol(tx);
          const assetColor = ASSET_COLORS[assetSymbol] || '#00f0ff';
          
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Asset Logo with transaction type indicator */}
                <div className="relative">
                  <AssetLogo 
                    symbol={assetSymbol} 
                    size={40} 
                    color={assetColor}
                    className="rounded-xl"
                  />
                  {/* Transaction type badge */}
                  <div className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                    getIconColor(tx.type)
                  )}>
                    {getIcon(tx.type)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{tx.asset}</p>
                    {tx.type === 'swap' && tx.toAsset && (
                      <AssetLogo 
                        symbol={tx.toAsset} 
                        size={16} 
                        color={ASSET_COLORS[tx.toAsset] || '#00f0ff'}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{tx.chain} • {formatTime(tx.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={cn(
                    'font-mono font-medium',
                    tx.type === 'receive' ? 'text-green-400' : 'text-white',
                    hideBalances && 'blur-sm select-none'
                  )}>
                    {formatAmount(tx.amount, tx.type)}
                  </p>
                  <p className={cn(
                    'text-xs text-gray-500',
                    hideBalances && 'blur-sm select-none'
                  )}>
                    {formatValue(tx.value)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full',
                    tx.status === 'completed' && 'bg-green-500/20 text-green-400',
                    tx.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                    tx.status === 'failed' && 'bg-red-500/20 text-red-400',
                  )}>
                    {tx.status}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default TransactionHistory;
