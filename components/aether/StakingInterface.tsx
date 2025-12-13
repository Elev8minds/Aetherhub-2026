import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import AssetLogo from './AssetLogo';
import { ASSET_COLORS } from '@/lib/constants';
import {
  Coins,
  Lock,
  Unlock,
  TrendingUp,
  Clock,
  Wallet,
  Calculator,
  Gift,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Info,
  ArrowRight,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

// Staking pool data
const STAKING_POOLS = [
  {
    id: 'eth-staking',
    name: 'Ethereum 2.0',
    symbol: 'ETH',
    apy: 4.5,
    tvl: 12500000000,
    lockPeriods: [
      { days: 0, bonus: 0, label: 'Flexible' },
      { days: 30, bonus: 0.5, label: '30 Days' },
      { days: 90, bonus: 1.2, label: '90 Days' },
      { days: 180, bonus: 2.0, label: '180 Days' },
      { days: 365, bonus: 3.5, label: '1 Year' },
    ],
    minStake: 0.01,
    maxStake: 1000,
    userStaked: 5.234,
    pendingRewards: 0.0234,
    chain: 'Ethereum',
    riskLevel: 'Low',
    description: 'Stake ETH to secure the Ethereum network and earn rewards',
  },
  {
    id: 'sol-staking',
    name: 'Solana',
    symbol: 'SOL',
    apy: 7.2,
    tvl: 4200000000,
    lockPeriods: [
      { days: 0, bonus: 0, label: 'Flexible' },
      { days: 30, bonus: 0.8, label: '30 Days' },
      { days: 90, bonus: 1.5, label: '90 Days' },
      { days: 180, bonus: 2.5, label: '180 Days' },
    ],
    minStake: 1,
    maxStake: 50000,
    userStaked: 125.5,
    pendingRewards: 2.345,
    chain: 'Solana',
    riskLevel: 'Low',
    description: 'Delegate SOL to validators and earn staking rewards',
  },
  {
    id: 'matic-staking',
    name: 'Polygon',
    symbol: 'MATIC',
    apy: 5.8,
    tvl: 1800000000,
    lockPeriods: [
      { days: 0, bonus: 0, label: 'Flexible' },
      { days: 30, bonus: 0.6, label: '30 Days' },
      { days: 90, bonus: 1.3, label: '90 Days' },
    ],
    minStake: 10,
    maxStake: 100000,
    userStaked: 2500,
    pendingRewards: 45.67,
    chain: 'Polygon',
    riskLevel: 'Low',
    description: 'Stake MATIC to participate in network security',
  },
  {
    id: 'atom-staking',
    name: 'Cosmos Hub',
    symbol: 'ATOM',
    apy: 18.5,
    tvl: 890000000,
    lockPeriods: [
      { days: 21, bonus: 0, label: '21 Days (Unbonding)' },
      { days: 90, bonus: 2.0, label: '90 Days' },
      { days: 180, bonus: 4.0, label: '180 Days' },
    ],
    minStake: 1,
    maxStake: 10000,
    userStaked: 0,
    pendingRewards: 0,
    chain: 'Cosmos',
    riskLevel: 'Medium',
    description: 'Stake ATOM and participate in IBC governance',
  },
  {
    id: 'avax-staking',
    name: 'Avalanche',
    symbol: 'AVAX',
    apy: 8.9,
    tvl: 2100000000,
    lockPeriods: [
      { days: 14, bonus: 0, label: '14 Days' },
      { days: 30, bonus: 0.5, label: '30 Days' },
      { days: 90, bonus: 1.5, label: '90 Days' },
      { days: 365, bonus: 3.0, label: '1 Year' },
    ],
    minStake: 25,
    maxStake: 5000,
    userStaked: 45.8,
    pendingRewards: 1.234,
    chain: 'Avalanche',
    riskLevel: 'Low',
    description: 'Validate or delegate on Avalanche Primary Network',
  },
  {
    id: 'xrp-staking',
    name: 'XRP Liquidity',
    symbol: 'XRP',
    apy: 6.5,
    tvl: 650000000,
    lockPeriods: [
      { days: 0, bonus: 0, label: 'Flexible' },
      { days: 30, bonus: 0.5, label: '30 Days' },
      { days: 90, bonus: 1.0, label: '90 Days' },
    ],
    minStake: 100,
    maxStake: 1000000,
    userStaked: 5000,
    pendingRewards: 12.5,
    chain: 'XRPL',
    riskLevel: 'Low',
    description: 'Provide liquidity on XRPL AMM and earn rewards',
  },
];

// Token prices for calculations
const TOKEN_PRICES: Record<string, number> = {
  ETH: 3875.42,
  SOL: 186.75,
  MATIC: 0.89,
  ATOM: 9.45,
  AVAX: 42.30,
  XRP: 1.23,
  LP: 1.0,
};

interface StakingPool {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  tvl: number;
  lockPeriods: { days: number; bonus: number; label: string }[];
  minStake: number;
  maxStake: number;
  userStaked: number;
  pendingRewards: number;
  chain: string;
  riskLevel: string;
  description: string;
}

const StakingInterface: React.FC = () => {
  const { hideBalances } = useAppContext();
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(0);
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [expandedPool, setExpandedPool] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'name'>('apy');

  // Calculate total staked value
  const totalStakedValue = useMemo(() => {
    return STAKING_POOLS.reduce((sum, pool) => {
      const price = TOKEN_PRICES[pool.symbol] || 1;
      return sum + pool.userStaked * price;
    }, 0);
  }, []);

  // Calculate total pending rewards value
  const totalPendingRewardsValue = useMemo(() => {
    return STAKING_POOLS.reduce((sum, pool) => {
      const price = TOKEN_PRICES[pool.symbol] || 1;
      return sum + pool.pendingRewards * price;
    }, 0);
  }, []);

  // Filter and sort pools
  const filteredPools = useMemo(() => {
    let pools = [...STAKING_POOLS];
    
    if (filterRisk !== 'all') {
      pools = pools.filter(p => p.riskLevel.toLowerCase() === filterRisk.toLowerCase());
    }
    
    pools.sort((a, b) => {
      if (sortBy === 'apy') return b.apy - a.apy;
      if (sortBy === 'tvl') return b.tvl - a.tvl;
      return a.name.localeCompare(b.name);
    });
    
    return pools;
  }, [filterRisk, sortBy]);

  // Calculate estimated rewards
  const estimatedRewards = useMemo(() => {
    if (!selectedPool || !stakeAmount) return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    
    const amount = parseFloat(stakeAmount) || 0;
    const lockPeriod = selectedPool.lockPeriods[selectedLockPeriod];
    const effectiveApy = selectedPool.apy + (lockPeriod?.bonus || 0);
    
    const yearlyReward = amount * (effectiveApy / 100);
    const dailyReward = yearlyReward / 365;
    
    return {
      daily: dailyReward,
      weekly: dailyReward * 7,
      monthly: dailyReward * 30,
      yearly: yearlyReward,
    };
  }, [selectedPool, stakeAmount, selectedLockPeriod]);

  // Format currency
  const formatCurrency = (value: number) => {
    if (hideBalances) return '••••••';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Format token amount
  const formatTokenAmount = (amount: number, symbol: string) => {
    if (hideBalances) return '••••••';
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M ${symbol}`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K ${symbol}`;
    return `${amount.toFixed(4)} ${symbol}`;
  };

  // Handle stake
  const handleStake = useCallback(async () => {
    if (!selectedPool || !stakeAmount) return;
    
    setIsProcessing(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowSuccess(true);
    setStakeAmount('');
    
    setTimeout(() => setShowSuccess(false), 3000);
  }, [selectedPool, stakeAmount]);

  // Handle unstake
  const handleUnstake = useCallback(async () => {
    if (!selectedPool || !unstakeAmount) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowSuccess(true);
    setUnstakeAmount('');
    
    setTimeout(() => setShowSuccess(false), 3000);
  }, [selectedPool, unstakeAmount]);

  // Handle claim rewards
  const handleClaimRewards = useCallback(async (poolId: string) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  // Handle claim all rewards
  const handleClaimAllRewards = useCallback(async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in">
          <div className="flex items-center gap-3 px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-xl backdrop-blur-xl">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Transaction successful!</span>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glowColor="cyan" className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Staked</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {formatCurrency(totalStakedValue)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="green" className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending Rewards</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {formatCurrency(totalPendingRewardsValue)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="purple" className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Claim All</p>
                <p className="text-lg font-bold text-white">
                  {hideBalances ? '••••' : `${STAKING_POOLS.filter(p => p.pendingRewards > 0).length} pools`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClaimAllRewards}
              disabled={isProcessing || totalPendingRewardsValue === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                'Claim All'
              )}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Risk:</span>
          <div className="flex gap-1">
            {['all', 'low', 'medium', 'high'].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  filterRisk === risk
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                )}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'apy' | 'tvl' | 'name')}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="apy">Highest APY</option>
            <option value="tvl">Highest TVL</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Staking Pools */}
      <div className="space-y-4">
        {filteredPools.map((pool) => (
          <GlassCard
            key={pool.id}
            glowColor={pool.userStaked > 0 ? 'green' : 'cyan'}
            hover={false}
            className="overflow-hidden"
          >
            {/* Pool Header */}
            <div
              onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
              className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <AssetLogo 
                    symbol={pool.symbol} 
                    size={48} 
                    color={ASSET_COLORS[pool.symbol] || '#00f0ff'}
                    className="rounded-xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{pool.name}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRiskColor(pool.riskLevel))}>
                        {pool.riskLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{pool.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">APY</p>
                    <p className="text-xl font-bold text-green-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {hideBalances ? '••••' : `${pool.apy}%`}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">TVL</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(pool.tvl)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Your Stake</p>
                    <p className="text-lg font-semibold text-white">
                      {formatTokenAmount(pool.userStaked, pool.symbol)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Rewards</p>
                    <p className={cn('text-lg font-semibold', pool.pendingRewards > 0 ? 'text-green-400' : 'text-gray-500')}>
                      {formatTokenAmount(pool.pendingRewards, pool.symbol)}
                    </p>
                  </div>

                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    {expandedPool === pool.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Panel */}
            {expandedPool === pool.id && (
              <div className="border-t border-white/10 p-5 bg-black/20 animate-fade-in">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Stake/Unstake Panel */}
                  <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('stake');
                          setSelectedPool(pool);
                        }}
                        className={cn(
                          'flex-1 py-2 rounded-lg font-medium transition-all',
                          activeTab === 'stake'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                        )}
                      >
                        <Lock className="w-4 h-4 inline mr-2" />
                        Stake
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('unstake');
                          setSelectedPool(pool);
                        }}
                        className={cn(
                          'flex-1 py-2 rounded-lg font-medium transition-all',
                          activeTab === 'unstake'
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                        )}
                      >
                        <Unlock className="w-4 h-4 inline mr-2" />
                        Unstake
                      </button>
                    </div>

                    {activeTab === 'stake' ? (
                      <div className="space-y-4">
                        {/* Lock Period Selection */}
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Lock Period</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {pool.lockPeriods.map((period, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedLockPeriod(idx)}
                                className={cn(
                                  'p-3 rounded-xl text-center transition-all',
                                  selectedLockPeriod === idx
                                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                                    : 'bg-white/5 border border-white/10 hover:border-cyan-500/50'
                                )}
                              >
                                <p className="text-sm font-medium text-white">{period.label}</p>
                                {period.bonus > 0 && (
                                  <p className="text-xs text-green-400">+{period.bonus}% bonus</p>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Amount to Stake</label>
                            <span className="text-xs text-gray-500">
                              Balance: {hideBalances ? '••••' : `100 ${pool.symbol}`}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              placeholder={`Min: ${pool.minStake} ${pool.symbol}`}
                              className="w-full px-4 py-3 pr-24 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <button
                                onClick={() => setStakeAmount('100')}
                                className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                              >
                                MAX
                              </button>
                              <span className="text-gray-400 font-medium">{pool.symbol}</span>
                            </div>
                          </div>
                        </div>

                        {/* Effective APY */}
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Effective APY</span>
                            <span className="text-lg font-bold text-green-400">
                              {hideBalances ? '••••' : `${(pool.apy + (pool.lockPeriods[selectedLockPeriod]?.bonus || 0)).toFixed(2)}%`}
                            </span>
                          </div>
                        </div>

                        {/* Stake Button */}
                        <button
                          onClick={handleStake}
                          disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) < pool.minStake}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              Stake {pool.symbol}
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Unstake Amount Input */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Amount to Unstake</label>
                            <span className="text-xs text-gray-500">
                              Staked: {formatTokenAmount(pool.userStaked, pool.symbol)}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              value={unstakeAmount}
                              onChange={(e) => setUnstakeAmount(e.target.value)}
                              placeholder="0.00"
                              max={pool.userStaked}
                              className="w-full px-4 py-3 pr-24 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <button
                                onClick={() => setUnstakeAmount(pool.userStaked.toString())}
                                className="px-2 py-1 text-xs bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors"
                              >
                                MAX
                              </button>
                              <span className="text-gray-400 font-medium">{pool.symbol}</span>
                            </div>
                          </div>
                        </div>

                        {/* Unbonding Warning */}
                        {pool.lockPeriods[0]?.days > 0 && (
                          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-yellow-400 font-medium">Unbonding Period</p>
                              <p className="text-xs text-gray-400">
                                Your tokens will be locked for {pool.lockPeriods[0].days} days after unstaking
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Unstake Button */}
                        <button
                          onClick={handleUnstake}
                          disabled={isProcessing || !unstakeAmount || parseFloat(unstakeAmount) > pool.userStaked}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:shadow-[0_0_20px_rgba(255,0,110,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Unlock className="w-5 h-5" />
                              Unstake {pool.symbol}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rewards Calculator & Info */}
                  <div className="space-y-4">
                    {/* Rewards Calculator */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-cyan-400" />
                        Estimated Rewards
                      </h4>
                      
                      {stakeAmount && parseFloat(stakeAmount) > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-black/30">
                            <p className="text-xs text-gray-500">Daily</p>
                            <p className="text-sm font-semibold text-white">
                              {formatTokenAmount(estimatedRewards.daily, pool.symbol)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(estimatedRewards.daily * (TOKEN_PRICES[pool.symbol] || 1))}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-black/30">
                            <p className="text-xs text-gray-500">Weekly</p>
                            <p className="text-sm font-semibold text-white">
                              {formatTokenAmount(estimatedRewards.weekly, pool.symbol)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(estimatedRewards.weekly * (TOKEN_PRICES[pool.symbol] || 1))}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-black/30">
                            <p className="text-xs text-gray-500">Monthly</p>
                            <p className="text-sm font-semibold text-white">
                              {formatTokenAmount(estimatedRewards.monthly, pool.symbol)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(estimatedRewards.monthly * (TOKEN_PRICES[pool.symbol] || 1))}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <p className="text-xs text-green-400">Yearly</p>
                            <p className="text-sm font-semibold text-green-400">
                              {formatTokenAmount(estimatedRewards.yearly, pool.symbol)}
                            </p>
                            <p className="text-xs text-green-400/70">
                              {formatCurrency(estimatedRewards.yearly * (TOKEN_PRICES[pool.symbol] || 1))}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Enter an amount to see estimated rewards
                        </p>
                      )}
                    </div>

                    {/* Pending Rewards */}
                    {pool.pendingRewards > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Gift className="w-4 h-4 text-green-400" />
                            Pending Rewards
                          </h4>
                          <button
                            onClick={() => handleClaimRewards(pool.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          >
                            Claim
                          </button>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                              {formatTokenAmount(pool.pendingRewards, pool.symbol)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatCurrency(pool.pendingRewards * (TOKEN_PRICES[pool.symbol] || 1))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Accruing at</p>
                            <p className="text-sm text-green-400">
                              ~{formatTokenAmount((pool.userStaked * pool.apy / 100) / 365, pool.symbol)}/day
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pool Info */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-cyan-400" />
                        Pool Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Chain</span>
                          <span className="text-white">{pool.chain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Stake</span>
                          <span className="text-white">{pool.minStake} {pool.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Stake</span>
                          <span className="text-white">{pool.maxStake.toLocaleString()} {pool.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Level</span>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRiskColor(pool.riskLevel))}>
                            {pool.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredPools.length === 0 && (
        <GlassCard glowColor="cyan" className="p-12 text-center">
          <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No pools found</h3>
          <p className="text-gray-400">Try adjusting your filters to see available staking pools</p>
        </GlassCard>
      )}
    </div>
  );
};

export default StakingInterface;
