import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bell, Settings, User, Wallet, 
  ChevronDown, LogOut, Shield, Copy, Check,
  ExternalLink, Eye, EyeOff
} from 'lucide-react';
import { USER_AVATAR } from '@/lib/constants';
import { ConnectedWallet } from '@/hooks/useWallet';
import { useAppContext } from '@/contexts/AppContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  onAuthClick: () => void;
  onWalletClick: () => void;
  isAuthenticated: boolean;
  netWorth: number;
  connectedWallet?: ConnectedWallet | null;
  onDisconnect?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onAuthClick,
  onWalletClick,
  isAuthenticated,
  netWorth,
  connectedWallet,
  onDisconnect,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [copied, setCopied] = useState(false);
  const { hideBalances, toggleHideBalances } = useAppContext();

  const notifications = [
    { id: 1, title: 'Portfolio Alert', message: 'ETH up 5% in the last hour', time: '2m ago', type: 'success' },
    { id: 2, title: 'Yield Opportunity', message: 'New 8.5% APY on USDC', time: '15m ago', type: 'info' },
    { id: 3, title: 'Transaction Complete', message: 'Swap executed successfully', time: '1h ago', type: 'success' },
  ];

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    if (hideBalances) {
      return '••••';
    }
    return balance;
  };

  const handleCopyAddress = () => {
    if (connectedWallet?.address) {
      navigator.clipboard.writeText(connectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWalletConnected = !!connectedWallet;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - with left padding for hamburger button (always visible now) */}
          <div className="flex items-center gap-4 pl-14">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>A</span>
                </div>
                <div className={cn(
                  'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black',
                  isWalletConnected ? 'bg-green-400' : 'bg-gray-500'
                )} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  AetherHub
                </h1>
                <p className="text-[10px] text-gray-500 -mt-1">Cross-Chain Intelligence</p>
              </div>
            </div>
          </div>

          {/* Center - Net Worth (Desktop) */}
          {(isAuthenticated || isWalletConnected) && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400">Net Worth:</span>
              <span 
                className={cn(
                  "font-bold text-white",
                  hideBalances && "blur-sm select-none"
                )} 
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {formatCurrency(netWorth)}
              </span>
              <button
                onClick={toggleHideBalances}
                className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                title={hideBalances ? 'Show balances' : 'Hide balances'}
              >
                {hideBalances ? (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500 hover:text-white" />
                )}
              </button>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isWalletConnected ? (
              <>
                {/* Wallet Button */}
                <button
                  onClick={onWalletClick}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-white">
                    {connectedWallet.ensName || formatAddress(connectedWallet.address)}
                  </span>
                  <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-white/10">
                    {connectedWallet.chainName}
                  </span>
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-2 h-2 rounded-full mt-2',
                                notif.type === 'success' ? 'bg-green-400' : 'bg-cyan-400'
                              )} />
                              <div>
                                <p className="text-sm font-medium text-white">{notif.title}</p>
                                <p className="text-xs text-gray-500">{notif.message}</p>
                                <p className="text-xs text-gray-600 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all"
                  >
                    <img
                      src={USER_AVATAR}
                      alt="User"
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <ChevronDown className={cn(
                      'w-4 h-4 text-gray-500 transition-transform hidden sm:block',
                      showUserMenu && 'rotate-180'
                    )} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/10">
                        <p className="font-semibold text-white">
                          {connectedWallet.ensName || 'Connected Wallet'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500 font-mono">
                            {formatAddress(connectedWallet.address)}
                          </p>
                          <button
                            onClick={handleCopyAddress}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                          >
                            {copied ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => window.open(`https://etherscan.io/address/${connectedWallet.address}`, '_blank')}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            {connectedWallet.chainName}
                          </span>
                          {connectedWallet.balance && (
                            <span className={cn(
                              "text-xs text-gray-500",
                              hideBalances && "blur-sm select-none"
                            )}>
                              {formatBalance(connectedWallet.balance)} {connectedWallet.chainName === 'Solana' ? 'SOL' : 'ETH'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={onWalletClick}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Wallet className="w-4 h-4" />
                          Manage Wallets
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                          <Shield className="w-4 h-4" />
                          Security
                        </button>
                        <button 
                          onClick={toggleHideBalances}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {hideBalances ? (
                            <>
                              <Eye className="w-4 h-4" />
                              Show Balances
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide Balances
                            </>
                          )}
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <button 
                          onClick={onDisconnect}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onWalletClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
