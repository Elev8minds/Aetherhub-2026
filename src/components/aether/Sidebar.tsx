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

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Wallet, ArrowRightLeft, PiggyBank, 
  Brain, Building2, Settings, HelpCircle, Mic, 
  BarChart3, Shield, Globe, Zap, Menu, X,
  Eye, EyeOff, Coins, Glasses, Fingerprint
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useVRContext } from '@/contexts/VRContext';


interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { sidebarOpen, openSidebar, closeSidebar, hideBalances, toggleHideBalances } = useAppContext();
  const { 
    isVRSupported, 
    isVRActive, 
    vrConsentGiven,
    zkProofEnabled,
    toggleVR,
    toggleZKProof,
    setShowConsentModal,
    vrDeviceInfo
  } = useVRContext();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'vr-portfolio', label: 'VR Portfolio', icon: Glasses },
    { id: 'vr-ai', label: 'VR AI Assistant', icon: Brain },
    { id: 'swap', label: 'Swap', icon: ArrowRightLeft },
    { id: 'staking', label: 'Staking', icon: Coins },
    { id: 'earn', label: 'RWA Yield', icon: PiggyBank },
    { id: 'ai', label: 'AI Advisor', icon: Brain },
    { id: 'banks', label: 'Banks', icon: Building2 },
  ];

  const toolsNavItems = [
    { id: 'voice', label: 'Voice Control', icon: Mic },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];


  const handleNavClick = (id: string) => {
    onTabChange(id);
    closeSidebar();
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <button
      onClick={() => handleNavClick(item.id)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
        activeTab === item.id
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white shadow-[0_0_20px_rgba(0,240,255,0.1)]'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      )}
    >
      <item.icon className={cn(
        'w-5 h-5 transition-colors',
        activeTab === item.id ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'
      )} />
      <span className="font-medium">{item.label}</span>
      {item.id === 'vr-portfolio' && isVRActive && (
        <span className="ml-auto px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          LIVE
        </span>
      )}
      {activeTab === item.id && !isVRActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
      )}
    </button>
  );

  const HideBalancesToggle = () => (
    <button
      onClick={toggleHideBalances}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
        hideBalances
          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      )}
    >
      {hideBalances ? (
        <EyeOff className="w-5 h-5 text-amber-400" />
      ) : (
        <Eye className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
      )}
      <span className="font-medium">Hide Balances</span>
      <div className={cn(
        'ml-auto w-10 h-5 rounded-full transition-all relative',
        hideBalances ? 'bg-amber-500/30' : 'bg-white/10'
      )}>
        <div className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full transition-all',
          hideBalances 
            ? 'right-0.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' 
            : 'left-0.5 bg-gray-500'
        )} />
      </div>
    </button>
  );

  const ZKProofToggle = () => (
    <button
      onClick={toggleZKProof}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
        zkProofEnabled
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      )}
    >
      <Fingerprint className={cn(
        'w-5 h-5 transition-colors',
        zkProofEnabled ? 'text-purple-400' : 'text-gray-600 group-hover:text-purple-400'
      )} />
      <span className="font-medium">ZK Privacy</span>
      <div className={cn(
        'ml-auto w-10 h-5 rounded-full transition-all relative',
        zkProofEnabled ? 'bg-purple-500/30' : 'bg-white/10'
      )}>
        <div className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full transition-all',
          zkProofEnabled 
            ? 'right-0.5 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
            : 'left-0.5 bg-gray-500'
        )} />
      </div>
    </button>
  );

  const VRModeToggle = () => (
    <button
      onClick={() => {
        if (!vrConsentGiven) {
          setShowConsentModal(true);
        } else {
          toggleVR();
        }
      }}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
        isVRActive
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      )}
    >
      <Glasses className={cn(
        'w-5 h-5 transition-colors',
        isVRActive ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'
      )} />
      <div className="flex flex-col items-start">
        <span className="font-medium">VR Mode</span>
        {vrDeviceInfo && (
          <span className="text-[10px] text-gray-600">{vrDeviceInfo.name}</span>
        )}
      </div>
      <div className={cn(
        'ml-auto w-10 h-5 rounded-full transition-all relative',
        isVRActive ? 'bg-cyan-500/30' : 'bg-white/10'
      )}>
        <div className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full transition-all',
          isVRActive 
            ? 'right-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)]' 
            : 'left-0.5 bg-gray-500'
        )} />
      </div>
    </button>
  );

  const SidebarContent = () => (
    <>
      {/* Main Navigation */}
      <nav className="space-y-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Tools Section */}
      <div className="mt-6">
        <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Tools
        </p>
        <nav className="space-y-1">
          {toolsNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>
      </div>

      {/* VR & Privacy Section */}
      <div className="mt-6">
        <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          VR & Privacy
        </p>
        <nav className="space-y-1">
          {isVRSupported && <VRModeToggle />}
          <ZKProofToggle />
          <HideBalancesToggle />
        </nav>
      </div>

      {/* VR Status */}
      {isVRSupported && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Glasses className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-gray-400">WebXR Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isVRActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
            )} />
            <span className="text-xs text-gray-500">
              {isVRActive ? 'VR Session Active' : 'Ready for VR'}
            </span>
          </div>
          {vrDeviceInfo && (
            <p className="text-[10px] text-gray-600 mt-1">
              {vrDeviceInfo.type} • {vrDeviceInfo.capabilities.length} modes
            </p>
          )}
        </div>
      )}

      {/* Chain Status */}
      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-gray-400">Connected Chains</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {['ETH', 'SOL', 'MATIC', 'ARB', 'BASE', 'OP'].map((chain) => (
            <span
              key={chain}
              className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400 border border-green-500/30"
            >
              {chain}
            </span>
          ))}
        </div>
      </div>

      {/* Gas Tracker */}
      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-400">Gas</span>
          </div>
          <span className="text-xs text-green-400">Low</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            12
          </span>
          <span className="text-xs text-gray-500">gwei</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6 border-t border-white/5 pt-4">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger Menu Button - Always visible in top-left corner */}
      <button
        onClick={openSidebar}
        className="fixed top-4 left-4 z-50 p-3 bg-black/70 backdrop-blur-xl rounded-full border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-black/90 transition-all shadow-lg shadow-cyan-500/10"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-cyan-400" />
      </button>

      {/* Slide-in Sidebar - Works on ALL devices */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop - Closes sidebar when clicked */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            {/* Slide-in Menu Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-black/95 backdrop-blur-xl border-r border-cyan-500/30 z-[70] flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                  {/* Custom Logo */}
                  <img 
                    src="/logo.svg" 
                    alt="AetherHub" 
                    className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    onError={(e) => {
                      // Fallback to PNG if SVG fails
                      const target = e.target as HTMLImageElement;
                      if (target.src.endsWith('.svg')) {
                        target.src = '/logo.png';
                      } else {
                        // Final fallback - hide image and show text only
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div>
                    <h2 
                      className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent" 
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      AetherHub
                    </h2>
                    <p 
                      className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      Cross-chain Intelligence
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeSidebar}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              
              {/* Scrollable Content - Only this area scrolls */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                <SidebarContent />
              </div>
              
              {/* Fixed Footer - Version */}
              <div className="flex-shrink-0 p-4 border-t border-white/5 bg-black/30">
                <p className="text-xs text-gray-700 text-center">AetherHub v2.1.0 VR</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
