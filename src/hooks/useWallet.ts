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

import { useState, useEffect, useCallback } from 'react';

export type WalletType = 'metamask' | 'walletconnect' | 'phantom' | 'coinbase' | 'trust' | 'rainbow';

export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  installed: boolean;
  description: string;
}

export interface ConnectedWallet {
  type: WalletType;
  address: string;
  ensName?: string;
  chainId: number;
  chainName: string;
  balance?: string;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  wallets: ConnectedWallet[];
  primaryWallet: ConnectedWallet | null;
  error: string | null;
}

const STORAGE_KEY = 'aetherhub_wallet_state';

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BNB Chain',
  137: 'Polygon',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  8453: 'Base',
  324: 'zkSync Era',
  59144: 'Linea',
  534352: 'Scroll',
};

// Simulated ENS resolution (in production, use ethers.js or viem)
const resolveENS = async (address: string): Promise<string | undefined> => {
  // Simulate ENS lookup delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock ENS names for demo
  const mockENS: Record<string, string> = {
    '0x1234567890abcdef1234567890abcdef12345678': 'vitalik.eth',
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': 'vitalik.eth',
  };
  
  return mockENS[address.toLowerCase()];
};

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    wallets: [],
    primaryWallet: null,
    error: null,
  });

  // Detect installed wallets
  const detectWallets = useCallback((): WalletInfo[] => {
    const wallets: WalletInfo[] = [
      {
        type: 'metamask',
        name: 'MetaMask',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        installed: typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask,
        description: 'Connect using MetaMask browser extension',
      },
      {
        type: 'walletconnect',
        name: 'WalletConnect',
        icon: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
        installed: true, // Always available via QR
        description: 'Scan QR code with any WalletConnect wallet',
      },
      {
        type: 'phantom',
        name: 'Phantom',
        icon: 'https://phantom.app/img/phantom-logo.svg',
        installed: typeof window !== 'undefined' && !!(window as any).phantom?.solana,
        description: 'Connect using Phantom wallet',
      },
      {
        type: 'coinbase',
        name: 'Coinbase Wallet',
        icon: 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
        installed: typeof window !== 'undefined' && !!(window as any).coinbaseWalletExtension,
        description: 'Connect using Coinbase Wallet',
      },
      {
        type: 'trust',
        name: 'Trust Wallet',
        icon: 'https://trustwallet.com/assets/images/favicon.png',
        installed: typeof window !== 'undefined' && !!(window as any).trustwallet,
        description: 'Connect using Trust Wallet',
      },
      {
        type: 'rainbow',
        name: 'Rainbow',
        icon: 'https://avatars.githubusercontent.com/u/48327834?s=200&v=4',
        installed: false, // Mobile only
        description: 'Connect using Rainbow wallet',
      },
    ];
    
    return wallets;
  }, []);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.wallets && parsed.wallets.length > 0) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            wallets: parsed.wallets,
            primaryWallet: parsed.primaryWallet || parsed.wallets[0],
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load wallet state:', e);
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (state.isConnected && state.wallets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        wallets: state.wallets,
        primaryWallet: state.primaryWallet,
      }));
    }
  }, [state.isConnected, state.wallets, state.primaryWallet]);

  // Connect MetaMask
  const connectMetaMask = useCallback(async (): Promise<ConnectedWallet | null> => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum?.isMetaMask) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainId, 16);
      
      const address = accounts[0];
      const ensName = await resolveENS(address);
      
      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);

      return {
        type: 'metamask',
        address,
        ensName,
        chainId: chainIdNum,
        chainName: CHAIN_NAMES[chainIdNum] || `Chain ${chainIdNum}`,
        balance: balanceInEth,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to connect MetaMask');
    }
  }, []);

  // Connect Phantom (Solana)
  const connectPhantom = useCallback(async (): Promise<ConnectedWallet | null> => {
    const phantom = (window as any).phantom?.solana;
    
    if (!phantom) {
      throw new Error('Phantom is not installed');
    }

    try {
      const response = await phantom.connect();
      const address = response.publicKey.toString();
      
      return {
        type: 'phantom',
        address,
        chainId: 101, // Solana mainnet
        chainName: 'Solana',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to connect Phantom');
    }
  }, []);

  // Connect WalletConnect (simulated for demo)
  const connectWalletConnect = useCallback(async (): Promise<ConnectedWallet | null> => {
    // In production, use @walletconnect/modal or @web3modal/wagmi
    // This is a simulation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful connection
    const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return {
      type: 'walletconnect',
      address: mockAddress,
      chainId: 1,
      chainName: 'Ethereum',
      balance: (Math.random() * 10).toFixed(4),
    };
  }, []);

  // Main connect function
  const connect = useCallback(async (walletType: WalletType) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      let wallet: ConnectedWallet | null = null;

      switch (walletType) {
        case 'metamask':
          wallet = await connectMetaMask();
          break;
        case 'phantom':
          wallet = await connectPhantom();
          break;
        case 'walletconnect':
          wallet = await connectWalletConnect();
          break;
        case 'coinbase':
        case 'trust':
        case 'rainbow':
          // Simulate connection for demo
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockAddr = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
          wallet = {
            type: walletType,
            address: mockAddr,
            chainId: 1,
            chainName: 'Ethereum',
            balance: (Math.random() * 10).toFixed(4),
          };
          break;
      }

      if (wallet) {
        setState(prev => {
          const existingIndex = prev.wallets.findIndex(w => w.type === wallet!.type);
          let newWallets: ConnectedWallet[];
          
          if (existingIndex >= 0) {
            newWallets = [...prev.wallets];
            newWallets[existingIndex] = wallet!;
          } else {
            newWallets = [...prev.wallets, wallet!];
          }

          return {
            ...prev,
            isConnected: true,
            isConnecting: false,
            wallets: newWallets,
            primaryWallet: prev.primaryWallet || wallet,
          };
        });
      }

      return wallet;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
      return null;
    }
  }, [connectMetaMask, connectPhantom, connectWalletConnect]);

  // Disconnect wallet
  const disconnect = useCallback((walletType?: WalletType) => {
    setState(prev => {
      if (walletType) {
        const newWallets = prev.wallets.filter(w => w.type !== walletType);
        const newPrimary = prev.primaryWallet?.type === walletType 
          ? newWallets[0] || null 
          : prev.primaryWallet;
        
        if (newWallets.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        }

        return {
          ...prev,
          isConnected: newWallets.length > 0,
          wallets: newWallets,
          primaryWallet: newPrimary,
        };
      }

      // Disconnect all
      localStorage.removeItem(STORAGE_KEY);
      return {
        isConnected: false,
        isConnecting: false,
        wallets: [],
        primaryWallet: null,
        error: null,
      };
    });
  }, []);

  // Set primary wallet
  const setPrimaryWallet = useCallback((wallet: ConnectedWallet) => {
    setState(prev => ({ ...prev, primaryWallet: wallet }));
  }, []);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    const wallet = state.primaryWallet;
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    try {
      if (wallet.type === 'metamask' || wallet.type === 'coinbase' || wallet.type === 'trust') {
        const ethereum = (window as any).ethereum;
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [message, wallet.address],
        });
        return signature;
      }

      if (wallet.type === 'phantom') {
        const phantom = (window as any).phantom?.solana;
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await phantom.signMessage(encodedMessage, 'utf8');
        return Buffer.from(signedMessage.signature).toString('hex');
      }

      // Simulate for other wallets
      await new Promise(resolve => setTimeout(resolve, 1000));
      return '0x' + Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign message');
    }
  }, [state.primaryWallet]);

  // Sign transaction
  const signTransaction = useCallback(async (tx: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<string | null> => {
    const wallet = state.primaryWallet;
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    try {
      if (wallet.type === 'metamask' || wallet.type === 'coinbase' || wallet.type === 'trust') {
        const ethereum = (window as any).ethereum;
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: tx.to,
            value: tx.value || '0x0',
            data: tx.data || '0x',
          }],
        });
        return txHash;
      }

      // Simulate for other wallets
      await new Promise(resolve => setTimeout(resolve, 2000));
      return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign transaction');
    }
  }, [state.primaryWallet]);

  // Switch chain
  const switchChain = useCallback(async (chainId: number) => {
    const wallet = state.primaryWallet;
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    if (wallet.type === 'metamask' || wallet.type === 'coinbase' || wallet.type === 'trust') {
      const ethereum = (window as any).ethereum;
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        
        setState(prev => ({
          ...prev,
          primaryWallet: prev.primaryWallet ? {
            ...prev.primaryWallet,
            chainId,
            chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
          } : null,
        }));
      } catch (error: any) {
        throw new Error(error.message || 'Failed to switch chain');
      }
    }
  }, [state.primaryWallet]);

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect('metamask');
      } else {
        setState(prev => {
          const mmWalletIndex = prev.wallets.findIndex(w => w.type === 'metamask');
          if (mmWalletIndex >= 0) {
            const newWallets = [...prev.wallets];
            newWallets[mmWalletIndex] = {
              ...newWallets[mmWalletIndex],
              address: accounts[0],
            };
            return { ...prev, wallets: newWallets };
          }
          return prev;
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      const chainIdNum = parseInt(chainId, 16);
      setState(prev => {
        const mmWalletIndex = prev.wallets.findIndex(w => w.type === 'metamask');
        if (mmWalletIndex >= 0) {
          const newWallets = [...prev.wallets];
          newWallets[mmWalletIndex] = {
            ...newWallets[mmWalletIndex],
            chainId: chainIdNum,
            chainName: CHAIN_NAMES[chainIdNum] || `Chain ${chainIdNum}`,
          };
          return { ...prev, wallets: newWallets };
        }
        return prev;
      });
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return {
    ...state,
    detectWallets,
    connect,
    disconnect,
    setPrimaryWallet,
    signMessage,
    signTransaction,
    switchChain,
  };
};

// Export constants for WalletConnectModal
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 10, name: 'Optimism' },
  { id: 8453, name: 'Base' },
  { id: 56, name: 'BNB Chain' },
];

export const WALLET_INFO: Record<WalletType, { name: string; icon: string; color: string }> = {
  metamask: { name: 'MetaMask', icon: '🦊', color: '#E2761B' },
  walletconnect: { name: 'WalletConnect', icon: '🔗', color: '#3B99FC' },
  phantom: { name: 'Phantom', icon: '👻', color: '#AB9FF2' },
  coinbase: { name: 'Coinbase Wallet', icon: '🔵', color: '#0052FF' },
  trust: { name: 'Trust Wallet', icon: '🛡️', color: '#3375BB' },
  rainbow: { name: 'Rainbow', icon: '🌈', color: '#001E59' },
};

export default useWallet;
