import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { Zap, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface GasPrice {
  chain: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const GasPriceWidget: React.FC = () => {
  const [gasPrices, setGasPrices] = useState<GasPrice[]>([
    { chain: 'Ethereum', price: 12, unit: 'gwei', trend: 'down', color: '#627EEA' },
    { chain: 'Polygon', price: 45, unit: 'gwei', trend: 'stable', color: '#8247E5' },
    { chain: 'Arbitrum', price: 0.1, unit: 'gwei', trend: 'down', color: '#28A0F0' },
    { chain: 'Optimism', price: 0.05, unit: 'gwei', trend: 'stable', color: '#FF0420' },
    { chain: 'Base', price: 0.02, unit: 'gwei', trend: 'down', color: '#0052FF' },
    { chain: 'Solana', price: 0.00025, unit: 'SOL', trend: 'up', color: '#9945FF' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGasPrices(prev => prev.map(gas => ({
        ...gas,
        price: gas.price * (0.95 + Math.random() * 0.1),
        trend: Math.random() > 0.6 ? 'down' : Math.random() > 0.3 ? 'stable' : 'up',
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-400" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getGasLevel = (chain: string, price: number) => {
    if (chain === 'Ethereum') {
      if (price < 15) return { level: 'Low', color: 'text-green-400' };
      if (price < 30) return { level: 'Medium', color: 'text-yellow-400' };
      return { level: 'High', color: 'text-red-400' };
    }
    return { level: 'Low', color: 'text-green-400' };
  };

  return (
    <GlassCard glowColor="cyan" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Gas Prices
        </h3>
        <span className="text-[10px] text-gray-500">Live</span>
      </div>

      <div className="space-y-2">
        {gasPrices.map((gas, i) => {
          const { level, color } = getGasLevel(gas.chain, gas.price);
          return (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: gas.color }}
                />
                <span className="text-xs text-gray-400">{gas.chain}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white">
                  {gas.price < 1 ? gas.price.toFixed(4) : gas.price.toFixed(1)} {gas.unit}
                </span>
                {getTrendIcon(gas.trend)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-[10px] text-gray-600 text-center">
          Best time to transact: Now (Low gas)
        </p>
      </div>
    </GlassCard>
  );
};

export default GasPriceWidget;
