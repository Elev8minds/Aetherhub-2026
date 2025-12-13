import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';
import { 
  X, Wallet, Check, Loader2, Copy, ExternalLink, 
  AlertCircle, ChevronRight, Shield, Zap, Globe,
  Smartphone, QrCode, ArrowLeft, Pen
} from 'lucide-react';
import { 
  WalletType, 
  ConnectedWallet, 
  SUPPORTED_CHAINS,
  WALLET_INFO 
} from '@/hooks/useWallet';
import { useAppContext } from '@/contexts/AppContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: WalletType) => Promise<void>;
  onDisconnect: () => void;
  onSwitchChain: (chainId: number) => Promise<void>;
  onSignMessage: (message: string) => Promise<string | null>;
  connectedWallet: ConnectedWallet | null;
  isConnecting: boolean;
  installedWallets: WalletType[];
  error: string | null;
}

type ModalView = 'select' | 'connecting' | 'connected' | 'qrcode' | 'sign';

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  onSwitchChain,
  onSignMessage,
  connectedWallet,
  isConnecting,
  installedWallets,
  error,
}) => {
  const [view, setView] = useState<ModalView>('select');
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [copied, setCopied] = useState(false);
  const [messageToSign, setMessageToSign] = useState('');
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const { hideBalances } = useAppContext();

  useEffect(() => {
    if (isOpen) {
      if (connectedWallet) {
        setView('connected');
      } else {
        setView('select');
      }
    }
  }, [isOpen, connectedWallet]);

  useEffect(() => {
    if (isConnecting) {
      setView('connecting');
    }
  }, [isConnecting]);

  const handleWalletSelect = async (walletType: WalletType) => {
    setSelectedWallet(walletType);
    if (walletType === 'walletconnect') {
      setView('qrcode');
    }
    await onConnect(walletType);
  };

  const handleCopyAddress = () => {
    if (connectedWallet?.address) {
      navigator.clipboard.writeText(connectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignMessage = async () => {
    if (!messageToSign.trim()) return;
    setIsSigning(true);
    const signature = await onSignMessage(messageToSign);
    setSignedMessage(signature);
    setIsSigning(false);
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

  if (!isOpen) return null;

  const walletList: WalletType[] = ['metamask', 'walletconnect', 'phantom', 'coinbase', 'trust', 'rainbow'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <GlassCard glowColor="cyan" className="w-full max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {view !== 'select' && view !== 'connected' && (
              <button
                onClick={() => setView(connectedWallet ? 'connected' : 'select')}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <h3 className="text-lg font-semibold text-white">
              {view === 'select' && 'Connect Wallet'}
              {view === 'connecting' && 'Connecting...'}
              {view === 'connected' && 'Wallet Connected'}
              {view === 'qrcode' && 'Scan QR Code'}
              {view === 'sign' && 'Sign Message'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Wallet Selection View */}
          {view === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Choose your preferred wallet to connect to AetherHub
              </p>
              
              {walletList.map((walletType) => {
                const info = WALLET_INFO[walletType];
                const isInstalled = installedWallets.includes(walletType);
                
                return (
                  <button
                    key={walletType}
                    onClick={() => handleWalletSelect(walletType)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${info.color}20` }}
                      >
                        {info.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">{info.name}</p>
                        <p className="text-xs text-gray-500">
                          {isInstalled ? 'Detected' : walletType === 'walletconnect' ? 'Scan QR Code' : 'Not installed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isInstalled && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          Ready
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </button>
                );
              })}

              {/* Security Note */}
              <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Secure Connection</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your keys stay in your wallet. We never have access to your funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connecting View */}
          {view === 'connecting' && selectedWallet && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Connecting to {WALLET_INFO[selectedWallet].name}
              </h4>
              <p className="text-sm text-gray-500">
                Please approve the connection request in your wallet
              </p>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                <Zap className="w-3 h-3" />
                <span>This may take a few seconds</span>
              </div>
            </div>
          )}

          {/* QR Code View (for WalletConnect) */}
          {view === 'qrcode' && (
            <div className="text-center py-4">
              <div className="w-48 h-48 mx-auto mb-6 rounded-2xl bg-white p-4 flex items-center justify-center">
                <QrCode className="w-full h-full text-black" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Scan with your wallet
              </h4>
              <p className="text-sm text-gray-500">
                Open your mobile wallet and scan the QR code to connect
              </p>
              
              <div className="mt-6 flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                  <Smartphone className="w-4 h-4" />
                  Open App
                </button>
              </div>
            </div>
          )}

          {/* Connected View */}
          {view === 'connected' && connectedWallet && (
            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {connectedWallet.ensName || 'Connected Wallet'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 font-mono">
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    {connectedWallet.chainName}
                  </span>
                  {connectedWallet.balance && (
                    <>
                      <span className="text-gray-700">•</span>
                      <span className={cn(
                        "text-xs text-gray-500",
                        hideBalances && "blur-sm select-none"
                      )}>
                        {formatBalance(connectedWallet.balance)} {connectedWallet.chainName === 'Solana' ? 'SOL' : 'ETH'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Chain Selector */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Switch Network</p>
                <div className="grid grid-cols-3 gap-2">
                  {SUPPORTED_CHAINS.slice(0, 6).map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => onSwitchChain(chain.id)}
                      className={cn(
                        'p-2 rounded-lg text-xs font-medium transition-all',
                        connectedWallet.chainId === chain.id
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                      )}
                    >
                      {chain.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setView('sign')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all"
                >
                  <Pen className="w-4 h-4" />
                  Sign Message
                </button>
                
                <button
                  onClick={() => {
                    onDisconnect();
                    setView('select');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}

          {/* Sign Message View */}
          {view === 'sign' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Message to Sign</label>
                <textarea
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  placeholder="Enter a message to sign with your wallet..."
                  className="w-full h-32 p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <button
                onClick={handleSignMessage}
                disabled={!messageToSign.trim() || isSigning}
                className={cn(
                  'w-full flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-all',
                  messageToSign.trim() && !isSigning
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                )}
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Pen className="w-4 h-4" />
                    Sign Message
                  </>
                )}
              </button>

              {signedMessage && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="text-xs text-green-400 mb-1">Signature</p>
                  <p className="text-xs text-gray-400 font-mono break-all">
                    {signedMessage}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(signedMessage);
                    }}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Signature
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Logo */}
        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/logo.svg" 
              alt="AetherHub" 
              className="w-5 h-5 object-contain drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.svg')) {
                  target.src = '/logo.png';
                } else {
                  target.style.display = 'none';
                }
              }}
            />
            <span className="text-xs text-gray-500">Powered by</span>
            <span 
              className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              AetherHub
            </span>
            <span 
              className="text-[8px] font-bold uppercase tracking-wider text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]"
            >
              Cross-chain Intelligence
            </span>
          </div>
        </div>

      </GlassCard>
    </div>
  );
};

export default WalletConnectModal;
