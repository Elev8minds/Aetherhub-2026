import React, { useState, useMemo, useCallback } from 'react';


import { useAppContext } from '@/contexts/AppContext';
import { useVRContext } from '@/contexts/VRContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWallet } from '@/hooks/useWallet';
import { PORTFOLIO_ASSETS, RWA_ASSETS, CHAINS, HERO_BG, getAssetColor } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Components
import MatrixRain from './aether/MatrixRain';

import AssetGallery3D from './aether/AssetGallery3D';
import Header from './aether/Header';
import Sidebar from './aether/Sidebar';
import NetWorthOrb from './aether/NetWorthOrb';
import GlassCard from './aether/GlassCard';
import AssetCard from './aether/AssetCard';
import RWACard from './aether/RWACard';
import SwapInterface from './aether/SwapInterface';
import StakingInterface from './aether/StakingInterface';
import AIOptimizer from './aether/AIOptimizer';
import VoiceCommand from './aether/VoiceCommand';
import BiometricAuth from './aether/BiometricAuth';
import BankAccounts from './aether/BankAccounts';
import ChainFilter from './aether/ChainFilter';
import PortfolioChart from './aether/PortfolioChart';
import Footer from './aether/Footer';
import WalletConnectModal from './aether/WalletConnectModal';
import VRConsentModal from './aether/VRConsentModal';
import PortfolioOrbVR from './aether/PortfolioOrbVR';
import VRAIInterface from './aether/VRAIInterface';
import AssetLogo from './aether/AssetLogo';


// Icons
import { 
  Wallet, TrendingUp, ArrowRightLeft, PiggyBank, 
  Brain, Mic, Sparkles, Zap, Shield,
  ChevronRight, Globe, Activity, Coins, Glasses,
  Lock, FileCheck, Fingerprint, Volume2, Hand, RotateCcw, ZoomIn
} from 'lucide-react';





const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const { 
    isVRSupported,
    isVRActive,
    vrConsentGiven,
    showConsentModal,
    setShowConsentModal,
    giveVRConsent,
    enterVR,
    exitVR,
    zkProofEnabled,
    vrDeviceInfo,
    logAuditEvent
  } = useVRContext();
  const isMobile = useIsMobile();
  
  // Wallet state
  const {
    isConnected: isWalletConnected,
    primaryWallet,
    disconnect: disconnectWallet,
  } = useWallet();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedChains, setSelectedChains] = useState<string[]>(CHAINS.map(c => c.id));
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate totals
  const totalNetWorth = useMemo(() => {
    const cryptoTotal = PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.value, 0);
    const bankTotal = 526935.80;
    return cryptoTotal + bankTotal;
  }, []);

  const totalChange24h = useMemo(() => {
    const totalValue = PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.value, 0);
    const weightedChange = PORTFOLIO_ASSETS.reduce((sum, a) => sum + (a.change24h * a.value / totalValue), 0);
    return weightedChange;
  }, []);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return PORTFOLIO_ASSETS.filter(asset => {
      const chainMatch = selectedChains.includes(asset.chain.toLowerCase());
      const searchMatch = !searchQuery || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return chainMatch && searchMatch;
    });
  }, [selectedChains, searchQuery]);

  // VR assets for 3D visualization with proper logos and colors
  const vrAssets = useMemo(() => {
    return PORTFOLIO_ASSETS.map(asset => ({
      symbol: asset.symbol,
      value: asset.value,
      color: asset.color || getAssetColor(asset.symbol),
      image: asset.image // The PortfolioOrbVR will use AssetLogo system for loading
    }));
  }, []);



  // Handlers
  const handleChainToggle = useCallback((chainId: string) => {
    setSelectedChains(prev => 
      prev.includes(chainId) 
        ? prev.filter(c => c !== chainId)
        : [...prev, chainId]
    );
  }, []);

  const handleVoiceCommand = useCallback((command: string) => {
    if (command.includes('optimize')) setActiveTab('ai');
    else if (command.includes('swap')) setActiveTab('swap');
    else if (command.includes('stake') || command.includes('staking')) setActiveTab('staking');
    else if (command.includes('earn') || command.includes('yield')) setActiveTab('earn');
    else if (command.includes('bank')) setActiveTab('banks');
    else if (command.includes('connect') || command.includes('wallet')) setShowWalletModal(true);
    else if (command.includes('vr') || command.includes('virtual')) {
      setActiveTab('vr-portfolio');
      logAuditEvent('VOICE_VR_COMMAND', { command });
    }
  }, [logAuditEvent]);

  const handleAIAction = useCallback((action: string) => {
    if (action === 'swap') setActiveTab('swap');
    if (action === 'stake' || action === 'staking') setActiveTab('staking');
    if (action === 'invest' || action === 'yield') setActiveTab('earn');
    if (action === 'connect') setShowWalletModal(true);
    if (action === 'vr') setActiveTab('vr-portfolio');
  }, []);


  const handleWalletConnected = useCallback((wallet: any) => {
    setIsAuthenticated(true);
  }, []);

  const handleDisconnectAll = useCallback(() => {
    disconnectWallet();
    setIsAuthenticated(false);
  }, [disconnectWallet]);

  const handleEnterVR = useCallback(async () => {
    if (!vrConsentGiven) {
      setShowConsentModal(true);
    } else {
      await enterVR();
    }
  }, [vrConsentGiven, setShowConsentModal, enterVR]);

  const handleVRConsent = useCallback(() => {
    giveVRConsent();
    enterVR();
  }, [giveVRConsent, enterVR]);

  const quickStats = [
    { label: 'Total Assets', value: '12', icon: Wallet, color: 'cyan' },
    { label: 'Active Chains', value: '6', icon: Globe, color: 'magenta' },
    { label: '24h Volume', value: '$12.4K', icon: Activity, color: 'green' },
    { label: 'AI Score', value: '94', icon: Brain, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <MatrixRain />
      <AssetGallery3D />
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-50 z-0" />
      
      <Header 
        onMenuToggle={toggleSidebar}
        isMenuOpen={sidebarOpen}
        onAuthClick={() => setShowAuthModal(true)}
        onWalletClick={() => setShowWalletModal(true)}
        isAuthenticated={isAuthenticated || isWalletConnected}
        netWorth={totalNetWorth}
        connectedWallet={primaryWallet}
        onDisconnect={handleDisconnectAll}
      />

      
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Main content - no sidebar padding since sidebar is now overlay only */}
      <main className="pt-20 pb-8 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <section className="relative py-8">
                <div 
                  className="absolute inset-0 opacity-20 rounded-3xl overflow-hidden"
                  style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f] rounded-3xl" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="text-center lg:text-left">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      <span className="bg-gradient-to-r from-cyan-400 via-white to-magenta-400 bg-clip-text text-transparent">
                        Welcome to AetherHub
                      </span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mb-6">
                      Your cross-chain financial command center. Manage 100+ chains, 
                      optimize with AI, and access institutional-grade RWA yields.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      {!isWalletConnected ? (
                        <button 
                          onClick={() => setShowWalletModal(true)}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
                        >
                          <Wallet className="w-5 h-5" />
                          Connect Wallet
                        </button>
                      ) : (
                        <button 
                          onClick={() => setActiveTab('ai')}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
                        >
                          <Brain className="w-5 h-5" />
                          Ask Aether AI
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveTab('vr-portfolio')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white font-semibold hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2"
                      >
                        <Glasses className="w-5 h-5" />
                        VR Portfolio
                      </button>
                      <button 
                        onClick={() => setActiveTab('voice')}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:border-magenta-400/50 transition-all flex items-center gap-2"
                      >
                        <Mic className="w-5 h-5" />
                        Voice Command
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <NetWorthOrb totalValue={totalNetWorth} change24h={totalChange24h} />
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, i) => (
                  <GlassCard key={i} glowColor={stat.color as any} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        stat.color === 'cyan' && 'bg-cyan-500/20',
                        stat.color === 'magenta' && 'bg-pink-500/20',
                        stat.color === 'green' && 'bg-green-500/20',
                        stat.color === 'purple' && 'bg-purple-500/20',
                      )}>
                        <stat.icon className={cn(
                          'w-5 h-5',
                          stat.color === 'cyan' && 'text-cyan-400',
                          stat.color === 'magenta' && 'text-pink-400',
                          stat.color === 'green' && 'text-green-400',
                          stat.color === 'purple' && 'text-purple-400',
                        )} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="text-xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </section>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PortfolioChart assets={PORTFOLIO_ASSETS} />
                </div>
                
                <div className="space-y-4">
                  <GlassCard glowColor="cyan" className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Connect Wallet', icon: Wallet, action: () => setShowWalletModal(true), color: 'cyan', show: !isWalletConnected },
                        { label: 'VR Portfolio', icon: Glasses, action: () => setActiveTab('vr-portfolio'), color: 'purple', show: true },
                        { label: 'Swap Tokens', icon: ArrowRightLeft, action: () => setActiveTab('swap'), color: 'cyan', show: true },
                        { label: 'Stake Tokens', icon: Coins, action: () => setActiveTab('staking'), color: 'green', show: true },
                        { label: 'Earn Yield', icon: PiggyBank, action: () => setActiveTab('earn'), color: 'green', show: true },
                        { label: 'AI Optimize', icon: Brain, action: () => setActiveTab('ai'), color: 'purple', show: true },
                      ].filter(a => a.show).map((action, i) => (
                        <button
                          key={i}
                          onClick={action.action}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <action.icon className={cn(
                              'w-5 h-5',
                              action.color === 'cyan' && 'text-cyan-400',
                              action.color === 'green' && 'text-green-400',
                              action.color === 'purple' && 'text-purple-400',
                              action.color === 'magenta' && 'text-pink-400',
                            )} />
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                              {action.label}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>

                  </GlassCard>

                  <GlassCard glowColor="green" className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Top Movers
                    </h3>
                    <div className="space-y-3">
                      {[...PORTFOLIO_ASSETS]
                        .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
                        .slice(0, 4)
                        .map((asset, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AssetLogo 
                                symbol={asset.symbol} 
                                size={32} 
                                color={asset.color}
                                className="rounded-lg"
                              />
                              <span className="text-white font-medium">{asset.symbol}</span>
                            </div>
                            <span className={cn(
                              'font-mono text-sm',
                              asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                            )}>
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                    </div>

                  </GlassCard>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    Your Assets
                  </h2>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assets..."
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors w-48"
                  />
                </div>
                
                <ChainFilter
                  selectedChains={selectedChains}
                  onChainToggle={handleChainToggle}
                  onSelectAll={() => setSelectedChains(CHAINS.map(c => c.id))}
                  onClearAll={() => setSelectedChains([])}
                />
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {filteredAssets.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Portfolio Overview
              </h2>
              <PortfolioChart assets={PORTFOLIO_ASSETS} />
              <ChainFilter
                selectedChains={selectedChains}
                onChainToggle={handleChainToggle}
                onSelectAll={() => setSelectedChains(CHAINS.map(c => c.id))}
                onClearAll={() => setSelectedChains([])}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          )}

          {/* VR Portfolio Tab */}
          {activeTab === 'vr-portfolio' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <Glasses className="w-7 h-7 text-cyan-400" />
                    VR Portfolio Viewer
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Immersive 3D visualization of your portfolio with WebXR support
                  </p>
                </div>
                
                {/* VR Status Badge */}
                <div className="flex items-center gap-3">
                  {isVRSupported ? (
                    <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">WebXR Ready</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-amber-400 text-sm font-medium">Desktop Mode</span>
                    </div>
                  )}
                  
                  {zkProofEnabled && (
                    <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">ZK Privacy</span>
                    </div>
                  )}
                </div>
              </div>

              {/* VR Portfolio Orb */}
              <PortfolioOrbVR
                totalValue={totalNetWorth}
                change24h={totalChange24h}
                assets={vrAssets}
                isVRMode={isVRActive}
                onEnterVR={handleEnterVR}
                onExitVR={exitVR}
                zkProofEnabled={zkProofEnabled}
              />

              {/* VR Info Cards */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <GlassCard glowColor="cyan" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Glasses className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-semibold">VR Compatibility</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Works with Meta Quest, Apple Vision Pro, and WebXR-enabled browsers.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Quest 3', 'Vision Pro', 'Chrome', 'Firefox'].map((device) => (
                      <span key={device} className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400 border border-white/10">
                        {device}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard glowColor="purple" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-white font-semibold">Security</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    TLS 1.3 encryption, ZK-proofs for privacy, no long-term data storage.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['TLS 1.3', 'ZK-SNARK', 'WebRTC DTLS'].map((tech) => (
                      <span key={tech} className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard glowColor="green" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-white font-semibold">Compliance</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    GDPR, MiCA, and SEC compliant with full audit trail via Sentry.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['GDPR', 'MiCA', 'SEC', 'Sentry'].map((reg) => (
                      <span key={reg} className="px-2 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 border border-green-500/30">
                        {reg}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>
              {/* Controls Guide */}
              <GlassCard glowColor="cyan" className="p-6 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Controls Guide</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { action: 'Rotate View', keys: 'Click + Drag', icon: RotateCcw },
                    { action: 'Zoom In/Out', keys: 'Scroll Wheel', icon: ZoomIn },
                    { action: 'Enter VR', keys: 'VR Button', icon: Glasses },
                    { action: 'Voice Command', keys: 'Say "Hey Aether"', icon: Mic },
                  ].map((control, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2">
                        <control.icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-white font-medium text-sm">{control.action}</p>
                      <p className="text-gray-500 text-xs">{control.keys}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Hand Gesture Controls */}
              <GlassCard glowColor="purple" className="p-6 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Hand className="w-5 h-5 text-purple-400" />
                  Hand Gesture Controls (VR Mode)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { gesture: 'Pinch', action: 'Zoom In/Out', desc: 'Bring thumb and index finger together' },
                    { gesture: 'Grab', action: 'Rotate View', desc: 'Make a fist and move hand' },
                    { gesture: 'Swipe', action: 'Navigate Assets', desc: 'Swipe left/right to switch assets' },
                    { gesture: 'Point', action: 'Select Asset', desc: 'Point at an asset to view details' },
                  ].map((control, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-400 font-medium">
                          {control.gesture}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm mb-1">{control.action}</p>
                      <p className="text-gray-500 text-xs">{control.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-cyan-400 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    First-time users will see an interactive tutorial when entering VR mode
                  </p>
                </div>
              </GlassCard>
            </div>
          )}


          {activeTab === 'swap' && (
            <div className="max-w-lg mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Cross-Chain Swap
              </h2>
              <SwapInterface />
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <span className="flex items-center justify-center gap-2">
                    <Coins className="w-6 h-6 text-cyan-400" />
                    DeFi Staking
                  </span>
                </h2>
                <p className="text-gray-400">
                  Stake your tokens to earn yield across multiple protocols and chains
                </p>
              </div>
              <StakingInterface />
            </div>
          )}


          {activeTab === 'earn' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Earn with RWA
                </h2>
                <p className="text-gray-400">
                  Access institutional-grade yields with tokenized real-world assets
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {RWA_ASSETS.map((asset) => (
                  <RWACard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Aether AI Optimizer
                </span>
              </h2>
              <AIOptimizer onAction={handleAIAction} />
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Connected Banks
              </h2>
              <BankAccounts />
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="max-w-lg mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Voice Control
              </h2>
              <VoiceCommand onCommand={handleVoiceCommand} />
            </div>
          )}


          {/* VR AI Assistant Tab */}
          {activeTab === 'vr-ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <Brain className="w-7 h-7 text-purple-400" />
                    VR AI Assistant
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Voice-controlled portfolio management with immersive AI responses
                  </p>
                </div>
                
                {/* Status Badges */}
                <div className="flex items-center gap-3">
                  {isVRActive ? (
                    <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-cyan-400 text-sm font-medium">VR Active</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">Voice Ready</span>
                    </div>
                  )}
                  
                  {zkProofEnabled && (
                    <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">ZK Privacy</span>
                    </div>
                  )}
                </div>
              </div>

              {/* VR AI Interface */}
              <VRAIInterface 
                onSwapRequest={(from, to, amount) => {
                  setActiveTab('swap');
                  logAuditEvent('VR_AI_SWAP_REQUEST', { from, to, amount });
                }}
                onOptimizeRequest={() => {
                  setActiveTab('ai');
                  logAuditEvent('VR_AI_OPTIMIZE_REQUEST', {});
                }}
              />

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <GlassCard glowColor="purple" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-white font-semibold">Voice Control</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Ask questions, execute swaps, and get recommendations using natural voice commands.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Portfolio Status', 'Swap Assets', 'Optimize'].map((cmd) => (
                      <span key={cmd} className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {cmd}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard glowColor="cyan" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-semibold">3D AI Panels</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    AI responses appear as floating 3D panels in VR space with spatial positioning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Arc Layout', 'Stack View', 'Float Mode'].map((layout) => (
                      <span key={layout} className="px-2 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {layout}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard glowColor="green" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-white font-semibold">Spatial Audio</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Immersive audio feedback with 3D positioning for AI responses and actions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['HRTF', 'Positional', 'Feedback'].map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 border border-green-500/30">
                        {feature}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Usage Guide */}
              <GlassCard glowColor="purple" className="p-6 mt-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Voice Commands Guide
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { command: '"What is my portfolio status?"', desc: 'Get overview of holdings and performance' },
                    { command: '"Swap 1 ETH to USDC"', desc: 'Execute cross-chain token swaps' },
                    { command: '"Optimize my portfolio"', desc: 'Get AI-powered optimization suggestions' },
                    { command: '"Show risk analysis"', desc: 'View detailed risk assessment' },
                    { command: '"Find yield opportunities"', desc: 'Discover best APY options' },
                    { command: '"Rebalance recommendations"', desc: 'Get rebalancing suggestions' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-cyan-400 font-mono text-sm mb-1">{item.command}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}


          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Analytics Dashboard
              </h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <PortfolioChart assets={PORTFOLIO_ASSETS} />
                <GlassCard glowColor="purple" className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Return', value: '+34.5%', color: 'green' },
                      { label: 'Sharpe Ratio', value: '1.82', color: 'cyan' },
                      { label: 'Max Drawdown', value: '-12.3%', color: 'red' },
                      { label: 'Win Rate', value: '68%', color: 'green' },
                    ].map((metric, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-400">{metric.label}</span>
                        <span className={cn(
                          'font-mono font-semibold',
                          metric.color === 'green' && 'text-green-400',
                          metric.color === 'cyan' && 'text-cyan-400',
                          metric.color === 'red' && 'text-red-400',
                        )}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Security Center
              </h2>
              <GlassCard glowColor="cyan" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <Shield className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="font-semibold text-white">Security Status: Excellent</p>
                      <p className="text-sm text-gray-400">All security features are enabled</p>
                    </div>
                  </div>
                  {[
                    { label: 'Passkey Authentication', enabled: true },
                    { label: 'Biometric Login', enabled: true },
                    { label: 'Hardware Wallet', enabled: isWalletConnected },
                    { label: 'Transaction Signing', enabled: true },
                    { label: '2FA Recovery', enabled: true },
                    { label: 'VR Session Encryption', enabled: true },
                    { label: 'ZK-Proof Privacy', enabled: zkProofEnabled },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">{feature.label}</span>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        feature.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Settings
              </h2>
              <GlassCard glowColor="cyan" className="p-6">
                <div className="space-y-6">
                  {[
                    { label: 'Dark Mode', value: 'Always On' },
                    { label: 'Currency', value: 'USD' },
                    { label: 'Language', value: 'English' },
                    { label: 'Notifications', value: 'Enabled' },
                    { label: 'Voice Assistant', value: 'Aether' },
                    { label: 'VR Mode', value: isVRSupported ? 'Available' : 'Not Supported' },
                    { label: 'ZK Privacy', value: zkProofEnabled ? 'Enabled' : 'Disabled' },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">{setting.label}</span>
                      <span className="text-cyan-400 font-medium">{setting.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Help & Support
              </h2>
              <GlassCard glowColor="cyan" className="p-6">
                <div className="space-y-4">
                  {[
                    { title: 'Getting Started', desc: 'Learn how to connect your wallet and start trading' },
                    { title: 'VR Portfolio Guide', desc: 'How to use the immersive VR portfolio viewer' },
                    { title: 'Cross-Chain Swaps', desc: 'How to swap tokens across different blockchains' },
                    { title: 'AI Optimizer', desc: 'Using Aether AI to optimize your portfolio' },
                    { title: 'RWA Investments', desc: 'Understanding tokenized real-world assets' },
                    { title: 'Security Best Practices', desc: 'Keep your assets safe with these tips' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full text-left p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </main>

      {/* Footer - no sidebar padding since sidebar is now overlay only */}
      <Footer />

      {/* Biometric Auth Modal */}
      {showAuthModal && (
        <BiometricAuth 
          onAuthenticated={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnected={handleWalletConnected}
      />

      {/* VR Consent Modal */}
      <VRConsentModal
        isOpen={showConsentModal}
        onConsent={handleVRConsent}
        onDecline={() => setShowConsentModal(false)}
        deviceInfo={vrDeviceInfo}
      />
    </div>
  );
};

export default AppLayout;
