/**
 * AssetLogo - Efficient, scalable logo support for all crypto assets
 * 
 * Priority order:
 * 1. CoinGecko API (primary) - High quality, comprehensive coverage
 * 2. Trust Wallet registry (fallback) - Open source, reliable
 * 3. Local fallbacks - For BTC, ETH, XRP, RLUSD, and common tokens
 * 
 * Features:
 * - Lazy loading with IntersectionObserver
 * - In-memory caching to prevent redundant fetches
 * - Automatic retry with fallback sources
 * - No bundle size increase (logos loaded on-demand)
 * - Future-proof: new assets appear automatically
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';



// CoinGecko coin ID mapping for common tokens
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  XRP: 'ripple',
  RLUSD: 'ripple-usd',
  MATIC: 'matic-network',
  ARB: 'arbitrum',
  AVAX: 'avalanche-2',
  OP: 'optimism',
  ATOM: 'cosmos',
  BASE: 'base-protocol',
  ZK: 'zksync',
  STRK: 'starknet',
  FTM: 'fantom',
  USDC: 'usd-coin',
  USDT: 'tether',
  BNB: 'binancecoin',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  DOT: 'polkadot',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
  MKR: 'maker',
  CRV: 'curve-dao-token',
  LDO: 'lido-dao',
  APE: 'apecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
  JUP: 'jupiter-exchange-solana',
  RENDER: 'render-token',
  INJ: 'injective-protocol',
  SUI: 'sui',
  SEI: 'sei-network',
  TIA: 'celestia',
  NEAR: 'near',
  APT: 'aptos',
  IMX: 'immutable-x',
  MANA: 'decentraland',
  SAND: 'the-sandbox',
  AXS: 'axie-infinity',
  GALA: 'gala',
  ENS: 'ethereum-name-service',
  GRT: 'the-graph',
  FIL: 'filecoin',
  ICP: 'internet-computer',
  HBAR: 'hedera-hashgraph',
  VET: 'vechain',
  ALGO: 'algorand',
  XLM: 'stellar',
  XMR: 'monero',
  ETC: 'ethereum-classic',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  TRX: 'tron',
  TON: 'the-open-network',
  KAS: 'kaspa',
  RUNE: 'thorchain',
  STX: 'stacks',
  EGLD: 'elrond-erd-2',
  FLOW: 'flow',
  KAVA: 'kava',
  ROSE: 'oasis-network',
  ZEC: 'zcash',
  MINA: 'mina-protocol',
  CELO: 'celo',
  ONE: 'harmony',
  QTUM: 'qtum',
  ZIL: 'zilliqa',
  ICX: 'icon',
  ONT: 'ontology',
  WAVES: 'waves',
  XTZ: 'tezos',
  NEO: 'neo',
  EOS: 'eos',
  IOTA: 'iota',
  XEM: 'nem',
  DASH: 'dash',
  DCR: 'decred',
  SC: 'siacoin',
  ZEN: 'horizen',
  RVN: 'ravencoin',
  DGB: 'digibyte',
  BTG: 'bitcoin-gold',
  COMP: 'compound-governance-token',
  SNX: 'havven',
  YFI: 'yearn-finance',
  SUSHI: 'sushi',
  '1INCH': '1inch',
  BAL: 'balancer',
  CAKE: 'pancakeswap-token',
  DYDX: 'dydx',
  GMX: 'gmx',
  PENDLE: 'pendle',
  BLUR: 'blur',
  MAGIC: 'magic',
  RDNT: 'radiant-capital',
  WLD: 'worldcoin-wld',
  PYTH: 'pyth-network',
  JTO: 'jito-governance-token',
  W: 'wormhole',
  ENA: 'ethena',
  ONDO: 'ondo-finance',
  EIGEN: 'eigenlayer',
  ZRO: 'layerzero',
};

// Trust Wallet chain mappings for contract-based tokens
const TRUST_WALLET_CHAINS: Record<string, { chain: string; address: string }> = {
  USDC: { chain: 'ethereum', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  USDT: { chain: 'ethereum', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  LINK: { chain: 'ethereum', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  UNI: { chain: 'ethereum', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  AAVE: { chain: 'ethereum', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
  MKR: { chain: 'ethereum', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' },
  SHIB: { chain: 'ethereum', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  MATIC: { chain: 'ethereum', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0' },
  ARB: { chain: 'arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548' },
  OP: { chain: 'optimism', address: '0x4200000000000000000000000000000000000042' },
};

// Local fallback logos (already in the app)
const LOCAL_FALLBACKS: Record<string, string> = {
  BTC: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390441736_1aaea983.png',
  ETH: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390360403_8683a24f.jpg',
  SOL: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390376888_0ffe16d5.jpg',
  XRP: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390394807_f45ad01d.jpg',
  MATIC: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390474206_0555043f.png',
  ARB: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390513643_9073c1f5.png',
  AVAX: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390530153_15378f20.jpg',
  OP: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390611678_d1635a68.jpg',
  ATOM: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390627859_8f46dc2e.jpg',
  BASE: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390644953_6e10e07a.jpg',
  ZK: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390686821_97015b36.png',
  STRK: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390722486_d87aa96d.png',
  FTM: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390753700_819e172c.png',
};

// Global in-memory cache for loaded images
const imageCache = new Map<string, HTMLImageElement>();
const urlCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<HTMLImageElement | null>>();

// Generate CoinGecko logo URL
const getCoinGeckoLogoUrl = (symbol: string): string | null => {
  const coinId = COINGECKO_IDS[symbol.toUpperCase()];
  if (!coinId) return null;
  // Use CoinGecko's CDN for logos (no API key needed)
  return `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`;
};

// Generate Trust Wallet logo URL
const getTrustWalletLogoUrl = (symbol: string): string | null => {
  const mapping = TRUST_WALLET_CHAINS[symbol.toUpperCase()];
  if (!mapping) return null;
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${mapping.chain}/assets/${mapping.address}/logo.png`;
};

// Get local fallback URL
const getLocalFallbackUrl = (symbol: string): string | null => {
  return LOCAL_FALLBACKS[symbol.toUpperCase()] || null;
};

// Generate a simple SVG placeholder with the symbol
const generatePlaceholderSvg = (symbol: string, color: string = '#00f0ff'): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.4" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="url(#grad)" stroke="${color}" stroke-width="2"/>
      <text x="64" y="72" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${symbol.slice(0, 4)}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Load an image from a URL with timeout
 */
const loadImageFromUrl = (url: string, timeout: number = 5000): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      img.src = '';
      resolve(null);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(null);
    };
    
    img.src = url;
  });
};

/**
 * Fetch logo URL from CoinGecko API for unknown tokens
 */
const fetchCoinGeckoLogo = async (symbol: string): Promise<string | null> => {
  try {
    // First check if we have a known ID
    const coinId = COINGECKO_IDS[symbol.toUpperCase()];
    if (coinId) {
      return `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`;
    }
    
    // Search CoinGecko for the symbol
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${symbol.toLowerCase()}`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const coin = data.coins?.find((c: any) => 
      c.symbol?.toUpperCase() === symbol.toUpperCase()
    );
    
    if (coin?.large) {
      return coin.large;
    }
    
    return null;
  } catch (error) {
    console.warn(`CoinGecko fetch failed for ${symbol}:`, error);
    return null;
  }
};

/**
 * Main function to get asset logo with fallback chain
 * Returns a promise that resolves to an HTMLImageElement or null
 */
export const getAssetLogoImage = async (
  symbol: string,
  color: string = '#00f0ff'
): Promise<HTMLImageElement | null> => {
  const normalizedSymbol = symbol.toUpperCase();
  
  // Check cache first
  if (imageCache.has(normalizedSymbol)) {
    return imageCache.get(normalizedSymbol)!;
  }
  
  // Check if already loading
  if (loadingPromises.has(normalizedSymbol)) {
    return loadingPromises.get(normalizedSymbol)!;
  }
  
  // Create loading promise
  const loadPromise = (async (): Promise<HTMLImageElement | null> => {
    // Priority 1: Local fallback (fastest, most reliable)
    const localUrl = getLocalFallbackUrl(normalizedSymbol);
    if (localUrl) {
      const img = await loadImageFromUrl(localUrl, 3000);
      if (img) {
        imageCache.set(normalizedSymbol, img);
        urlCache.set(normalizedSymbol, localUrl);
        return img;
      }
    }
    
    // Priority 2: CoinGecko (comprehensive coverage)
    try {
      const coinGeckoUrl = await fetchCoinGeckoLogo(normalizedSymbol);
      if (coinGeckoUrl) {
        const img = await loadImageFromUrl(coinGeckoUrl, 5000);
        if (img) {
          imageCache.set(normalizedSymbol, img);
          urlCache.set(normalizedSymbol, coinGeckoUrl);
          return img;
        }
      }
    } catch (e) {
      console.warn(`CoinGecko failed for ${normalizedSymbol}`);
    }
    
    // Priority 3: Trust Wallet registry
    const trustWalletUrl = getTrustWalletLogoUrl(normalizedSymbol);
    if (trustWalletUrl) {
      const img = await loadImageFromUrl(trustWalletUrl, 5000);
      if (img) {
        imageCache.set(normalizedSymbol, img);
        urlCache.set(normalizedSymbol, trustWalletUrl);
        return img;
      }
    }
    
    // Priority 4: Generate placeholder SVG
    const placeholderUrl = generatePlaceholderSvg(normalizedSymbol, color);
    const img = await loadImageFromUrl(placeholderUrl, 1000);
    if (img) {
      imageCache.set(normalizedSymbol, img);
      urlCache.set(normalizedSymbol, placeholderUrl);
      return img;
    }
    
    return null;
  })();
  
  loadingPromises.set(normalizedSymbol, loadPromise);
  
  try {
    const result = await loadPromise;
    return result;
  } finally {
    loadingPromises.delete(normalizedSymbol);
  }
};

/**
 * Get cached logo URL for a symbol (synchronous, returns null if not cached)
 */
export const getCachedLogoUrl = (symbol: string): string | null => {
  return urlCache.get(symbol.toUpperCase()) || null;
};

/**
 * Get cached image for a symbol (synchronous, returns null if not cached)
 */
export const getCachedLogoImage = (symbol: string): HTMLImageElement | null => {
  return imageCache.get(symbol.toUpperCase()) || null;
};

/**
 * Preload logos for multiple symbols
 */
export const preloadAssetLogos = async (
  symbols: string[],
  colors?: Record<string, string>
): Promise<Map<string, HTMLImageElement>> => {
  const results = new Map<string, HTMLImageElement>();
  
  await Promise.all(
    symbols.map(async (symbol) => {
      const color = colors?.[symbol.toUpperCase()] || '#00f0ff';
      const img = await getAssetLogoImage(symbol, color);
      if (img) {
        results.set(symbol.toUpperCase(), img);
      }
    })
  );
  
  return results;
};

/**
 * Clear the logo cache (useful for memory management)
 */
export const clearLogoCache = (): void => {
  imageCache.clear();
  urlCache.clear();
  loadingPromises.clear();
};

/**
 * Get the best available logo URL for a symbol (async)
 */
export const getAssetLogoUrl = async (
  symbol: string,
  color: string = '#00f0ff'
): Promise<string> => {
  const normalizedSymbol = symbol.toUpperCase();
  
  // Check URL cache first
  if (urlCache.has(normalizedSymbol)) {
    return urlCache.get(normalizedSymbol)!;
  }
  
  // Try local fallback first
  const localUrl = getLocalFallbackUrl(normalizedSymbol);
  if (localUrl) {
    urlCache.set(normalizedSymbol, localUrl);
    return localUrl;
  }
  
  // Try CoinGecko
  try {
    const coinGeckoUrl = await fetchCoinGeckoLogo(normalizedSymbol);
    if (coinGeckoUrl) {
      urlCache.set(normalizedSymbol, coinGeckoUrl);
      return coinGeckoUrl;
    }
  } catch (e) {
    // Continue to fallbacks
  }
  
  // Try Trust Wallet
  const trustWalletUrl = getTrustWalletLogoUrl(normalizedSymbol);
  if (trustWalletUrl) {
    urlCache.set(normalizedSymbol, trustWalletUrl);
    return trustWalletUrl;
  }
  
  // Generate placeholder
  const placeholderUrl = generatePlaceholderSvg(normalizedSymbol, color);
  urlCache.set(normalizedSymbol, placeholderUrl);
  return placeholderUrl;
};

// ============================================
// React Component for displaying asset logos
// ============================================

interface AssetLogoProps {
  symbol: string;
  size?: number;
  className?: string;
  color?: string;
  showFallback?: boolean;
}

const AssetLogo: React.FC<AssetLogoProps> = ({
  symbol,
  size = 32,
  className = '',
  color = '#00f0ff',
  showFallback = true,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lazy load using IntersectionObserver
  useEffect(() => {
    const loadLogo = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const url = await getAssetLogoUrl(symbol, color);
        setLogoUrl(url);
      } catch (error) {
        console.warn(`Failed to load logo for ${symbol}:`, error);
        setHasError(true);
        if (showFallback) {
          setLogoUrl(generatePlaceholderSvg(symbol, color));
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Check if already cached
    const cachedUrl = getCachedLogoUrl(symbol);
    if (cachedUrl) {
      setLogoUrl(cachedUrl);
      setIsLoading(false);
      return;
    }

    // Set up intersection observer for lazy loading
    if (imgRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadLogo();
            observerRef.current?.disconnect();
          }
        },
        { rootMargin: '50px' }
      );
      
      observerRef.current.observe(imgRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      loadLogo();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [symbol, color, showFallback]);

  if (isLoading && !logoUrl) {
    return (
      <div
        className={`animate-pulse bg-gray-700 rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={logoUrl || generatePlaceholderSvg(symbol, color)}
      alt={`${symbol} logo`}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setLogoUrl(generatePlaceholderSvg(symbol, color));
        }
      }}
    />
  );
};

export default AssetLogo;

// ============================================
// Hook for using asset logos in canvas/WebGL
// ============================================

export interface UseAssetLogosResult {
  images: Map<string, HTMLImageElement>;
  isLoading: boolean;
  getImage: (symbol: string) => HTMLImageElement | null;
  preload: (symbols: string[]) => Promise<void>;
}

export const useAssetLogos = (
  initialSymbols: string[] = [],
  colors?: Record<string, string>
): UseAssetLogosResult => {
  const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialLogos = async () => {
      setIsLoading(true);
      const loadedImages = await preloadAssetLogos(initialSymbols, colors);
      setImages(loadedImages);
      setIsLoading(false);
    };

    if (initialSymbols.length > 0) {
      loadInitialLogos();
    } else {
      setIsLoading(false);
    }
  }, [initialSymbols.join(','), JSON.stringify(colors)]);

  const getImage = useCallback((symbol: string): HTMLImageElement | null => {
    return images.get(symbol.toUpperCase()) || getCachedLogoImage(symbol);
  }, [images]);

  const preload = useCallback(async (symbols: string[]): Promise<void> => {
    const newImages = await preloadAssetLogos(symbols, colors);
    setImages(prev => {
      const merged = new Map(prev);
      newImages.forEach((img, key) => merged.set(key, img));
      return merged;
    });
  }, [colors]);

  return { images, isLoading, getImage, preload };
};
