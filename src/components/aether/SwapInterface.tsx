import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { ArrowDownUp, Settings, Zap, Route, ChevronDown, Loader2, Check } from 'lucide-react';
import { ASSET_COLORS } from '@/lib/constants';
import { useAppContext } from '@/contexts/AppContext';
import AssetLogo from './AssetLogo';

interface SwapInterfaceProps {
  onSwap?: (from: string, to: string, amount: number) => void;
}

const tokens = [
  { symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum', price: 3890 },
  { symbol: 'USDC', name: 'USD Coin', chain: 'Ethereum', price: 1 },
  { symbol: 'SOL', name: 'Solana', chain: 'Solana', price: 185 },
  { symbol: 'MATIC', name: 'Polygon', chain: 'Polygon', price: 0.89 },
  { symbol: 'ARB', name: 'Arbitrum', chain: 'Arbitrum', price: 1.12 },
  { symbol: 'BTC', name: 'Bitcoin', chain: 'Bitcoin', price: 43120 },
  { symbol: 'XRP', name: 'XRP', chain: 'XRPL', price: 1.23 },
  { symbol: 'AVAX', name: 'Avalanche', chain: 'Avalanche', price: 42.30 },
];

const SwapInterface: React.FC<SwapInterfaceProps> = ({ onSwap }) => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapComplete, setSwapComplete] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const { hideBalances } = useAppContext();

  const toAmount = fromAmount ? (parseFloat(fromAmount) * fromToken.price / toToken.price).toFixed(6) : '';

  const handleSwap = async () => {
    if (!fromAmount) return;
    
    setIsSwapping(true);
    // Simulate swap
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsSwapping(false);
    setSwapComplete(true);
    onSwap?.(fromToken.symbol, toToken.symbol, parseFloat(fromAmount));
    
    setTimeout(() => {
      setSwapComplete(false);
      setFromAmount('');
    }, 2000);
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  const routeSteps = [
    { chain: fromToken.chain, action: 'Swap' },
    { chain: 'Bridge', action: 'Route' },
    { chain: toToken.chain, action: 'Receive' },
  ];

  const formatBalance = (balance: string) => {
    if (hideBalances) {
      return '••••••';
    }
    return balance;
  };

  const formatValue = (value: string) => {
    if (hideBalances) {
      return '••••••';
    }
    return `$${value}`;
  };

  return (
    <GlassCard glowColor="cyan" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Cross-Chain Swap
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showSettings ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'
          )}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-black/30 rounded-xl border border-white/10">
          <p className="text-sm text-gray-400 mb-2">Slippage Tolerance</p>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map((val) => (
              <button
                key={val}
                onClick={() => setSlippage(val)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm transition-all',
                  slippage === val
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                )}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="relative mb-2">
        <div className="bg-black/40 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-500">From</span>
            <span className={cn(
              "text-xs text-gray-500",
              hideBalances && "blur-sm select-none"
            )}>
              Balance: {formatBalance(`12.45 ${fromToken.symbol}`)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFromSelect(!showFromSelect)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              <AssetLogo 
                symbol={fromToken.symbol} 
                size={24} 
                color={ASSET_COLORS[fromToken.symbol] || '#00f0ff'}
              />
              <span className="font-semibold text-white">{fromToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-2xl font-bold text-white placeholder-gray-600 focus:outline-none"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            />
          </div>
          <div className={cn(
            "text-right text-xs text-gray-500 mt-1",
            hideBalances && fromAmount && "blur-sm select-none"
          )}>
            ≈ {formatValue(fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : '0.00')}
          </div>
        </div>

        {/* Token Select Dropdown */}
        {showFromSelect && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-20 max-h-64 overflow-y-auto">
            {tokens.filter(t => t.symbol !== toToken.symbol).map((token) => (
              <button
                key={token.symbol}
                onClick={() => { setFromToken(token); setShowFromSelect(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <AssetLogo 
                  symbol={token.symbol} 
                  size={32} 
                  color={ASSET_COLORS[token.symbol] || '#00f0ff'}
                />
                <div className="text-left">
                  <p className="font-semibold text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.chain}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Switch Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button
          onClick={switchTokens}
          className="p-3 bg-black border border-cyan-500/30 rounded-xl hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all group"
        >
          <ArrowDownUp className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      {/* To Token */}
      <div className="relative mt-2">
        <div className="bg-black/40 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-500">To</span>
            <span className={cn(
              "text-xs text-gray-500",
              hideBalances && "blur-sm select-none"
            )}>
              Balance: {formatBalance(`1,234.56 ${toToken.symbol}`)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowToSelect(!showToSelect)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              <AssetLogo 
                symbol={toToken.symbol} 
                size={24} 
                color={ASSET_COLORS[toToken.symbol] || '#00f0ff'}
              />
              <span className="font-semibold text-white">{toToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex-1 text-right text-2xl font-bold text-gray-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {toAmount || '0.0'}
            </div>
          </div>
          <div className={cn(
            "text-right text-xs text-gray-500 mt-1",
            hideBalances && toAmount && "blur-sm select-none"
          )}>
            ≈ {formatValue(toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00')}
          </div>
        </div>

        {/* Token Select Dropdown */}
        {showToSelect && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 z-20 max-h-64 overflow-y-auto">
            {tokens.filter(t => t.symbol !== fromToken.symbol).map((token) => (
              <button
                key={token.symbol}
                onClick={() => { setToToken(token); setShowToSelect(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <AssetLogo 
                  symbol={token.symbol} 
                  size={32} 
                  color={ASSET_COLORS[token.symbol] || '#00f0ff'}
                />
                <div className="text-left">
                  <p className="font-semibold text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.chain}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Route Visualization */}
      {fromAmount && (
        <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Optimal Route</span>
          </div>
          <div className="flex items-center justify-between">
            {routeSteps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <span className="text-xs text-cyan-400">{i + 1}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">{step.chain}</span>
                </div>
                {i < routeSteps.length - 1 && (
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-cyan-500/20 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Swap Details */}
      {fromAmount && (
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Rate</span>
            <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Network Fee</span>
            <span className={cn(
              "text-cyan-400",
              hideBalances && "blur-sm select-none"
            )}>
              {hideBalances ? '••••' : '~$2.45'}
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Slippage</span>
            <span>{slippage}%</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!fromAmount || isSwapping}
        className={cn(
          'w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
          !fromAmount
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : swapComplete
            ? 'bg-green-500 text-white'
            : isSwapping
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]'
        )}
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        {swapComplete ? (
          <>
            <Check className="w-5 h-5" />
            Swap Complete!
          </>
        ) : isSwapping ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Executing Swap...
          </>
        ) : !fromAmount ? (
          'Enter Amount'
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Swap Now
          </>
        )}
      </button>
    </GlassCard>
  );
};

export default SwapInterface;
