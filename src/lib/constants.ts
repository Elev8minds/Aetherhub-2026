// AetherHub Constants and Data

export const HERO_BG = 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765314810177_3ccc1990.png';
export const USER_AVATAR = 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765314881999_79043d45.png';

// Cryptocurrency Logo Images - mapped by symbol
export const CRYPTO_LOGOS: Record<string, string> = {
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
  USDC: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390644953_6e10e07a.jpg',
  USDT: 'https://d64gsuwffb70l.cloudfront.net/6937b8fe973c9e4ed7b5be10_1765390611678_d1635a68.jpg',
};

// Legacy token images for backwards compatibility
export const TOKEN_IMAGES = [
  CRYPTO_LOGOS.ETH,
  CRYPTO_LOGOS.BTC,
  CRYPTO_LOGOS.SOL,
  CRYPTO_LOGOS.MATIC,
  CRYPTO_LOGOS.ARB,
  CRYPTO_LOGOS.BASE,
];

export const COLORS = {
  background: '#0a0a0f',
  cyan: '#00f0ff',
  magenta: '#ff006e',
  neonGreen: '#39ff14',
  purple: '#9d4edd',
  gold: '#ffd700',
};

// Asset colors by symbol for VR orbs
export const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  XRP: '#23292F',
  MATIC: '#8247E5',
  ARB: '#28A0F0',
  AVAX: '#E84142',
  OP: '#FF0420',
  ATOM: '#2E3148',
  BASE: '#0052FF',
  ZK: '#8C8DFC',
  STRK: '#EC796B',
  FTM: '#1969FF',
  USDC: '#2775CA',
  USDT: '#26A17B',
};

export const PORTFOLIO_ASSETS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', chain: 'Ethereum', balance: 12.4567, value: 48234.56, change24h: 3.24, image: CRYPTO_LOGOS.ETH, color: ASSET_COLORS.ETH },
  { id: 2, name: 'Bitcoin', symbol: 'BTC', chain: 'Bitcoin', balance: 1.2345, value: 52145.78, change24h: -1.23, image: CRYPTO_LOGOS.BTC, color: ASSET_COLORS.BTC },
  { id: 3, name: 'Solana', symbol: 'SOL', chain: 'Solana', balance: 234.567, value: 23456.78, change24h: 8.45, image: CRYPTO_LOGOS.SOL, color: ASSET_COLORS.SOL },
  { id: 4, name: 'XRP', symbol: 'XRP', chain: 'XRPL', balance: 15000, value: 18500.00, change24h: 5.67, image: CRYPTO_LOGOS.XRP, color: ASSET_COLORS.XRP },
  { id: 5, name: 'Polygon', symbol: 'MATIC', chain: 'Polygon', balance: 15678.9, value: 12345.67, change24h: 2.15, image: CRYPTO_LOGOS.MATIC, color: ASSET_COLORS.MATIC },
  { id: 6, name: 'Arbitrum', symbol: 'ARB', chain: 'Arbitrum', balance: 8765.43, value: 8765.43, change24h: -0.87, image: CRYPTO_LOGOS.ARB, color: ASSET_COLORS.ARB },
  { id: 7, name: 'Avalanche', symbol: 'AVAX', chain: 'Avalanche', balance: 456.78, value: 15678.90, change24h: 4.32, image: CRYPTO_LOGOS.AVAX, color: ASSET_COLORS.AVAX },
  { id: 8, name: 'Optimism', symbol: 'OP', chain: 'Optimism', balance: 3456.78, value: 6789.01, change24h: -2.45, image: CRYPTO_LOGOS.OP, color: ASSET_COLORS.OP },
  { id: 9, name: 'Cosmos', symbol: 'ATOM', chain: 'Cosmos', balance: 1234.56, value: 9876.54, change24h: 1.89, image: CRYPTO_LOGOS.ATOM, color: ASSET_COLORS.ATOM },
  { id: 10, name: 'Fantom', symbol: 'FTM', chain: 'Fantom', balance: 45678.9, value: 4567.89, change24h: 6.78, image: CRYPTO_LOGOS.FTM, color: ASSET_COLORS.FTM },
  { id: 11, name: 'zkSync', symbol: 'ZK', chain: 'zkSync Era', balance: 12345.67, value: 3456.78, change24h: 12.34, image: CRYPTO_LOGOS.ZK, color: ASSET_COLORS.ZK },
  { id: 12, name: 'Starknet', symbol: 'STRK', chain: 'Starknet', balance: 8901.23, value: 2345.67, change24h: -3.21, image: CRYPTO_LOGOS.STRK, color: ASSET_COLORS.STRK },
];

export const RWA_ASSETS = [
  { id: 1, name: 'BlackRock BUIDL', symbol: 'BUIDL', apy: 5.25, tvl: '528M', minInvestment: 100000, status: 'Accredited', description: 'Tokenized US Treasury Fund' },
  { id: 2, name: 'Ondo OUSG', symbol: 'OUSG', apy: 5.15, tvl: '234M', minInvestment: 100000, status: 'Accredited', description: 'Short-Term US Government Bonds' },
  { id: 3, name: 'Franklin OnChain', symbol: 'FOBXX', apy: 5.08, tvl: '412M', minInvestment: 50000, status: 'Qualified', description: 'US Government Money Fund' },
  { id: 4, name: 'Maple Finance', symbol: 'MPL', apy: 8.75, tvl: '156M', minInvestment: 10000, status: 'Open', description: 'Institutional Lending Pool' },
];

export const BANK_ACCOUNTS = [
  { id: 1, name: 'Chase Checking', type: 'checking', balance: 24567.89, institution: 'JPMorgan Chase' },
  { id: 2, name: 'Chase Savings', type: 'savings', balance: 156789.01, institution: 'JPMorgan Chase' },
  { id: 3, name: 'Fidelity Brokerage', type: 'investment', balance: 345678.90, institution: 'Fidelity' },
];

export const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', color: '#627EEA', logo: CRYPTO_LOGOS.ETH },
  { id: 'bitcoin', name: 'Bitcoin', color: '#F7931A', logo: CRYPTO_LOGOS.BTC },
  { id: 'solana', name: 'Solana', color: '#9945FF', logo: CRYPTO_LOGOS.SOL },
  { id: 'xrpl', name: 'XRPL', color: '#23292F', logo: CRYPTO_LOGOS.XRP },
  { id: 'polygon', name: 'Polygon', color: '#8247E5', logo: CRYPTO_LOGOS.MATIC },
  { id: 'arbitrum', name: 'Arbitrum', color: '#28A0F0', logo: CRYPTO_LOGOS.ARB },
  { id: 'base', name: 'Base', color: '#0052FF', logo: CRYPTO_LOGOS.BASE },
  { id: 'avalanche', name: 'Avalanche', color: '#E84142', logo: CRYPTO_LOGOS.AVAX },
  { id: 'optimism', name: 'Optimism', color: '#FF0420', logo: CRYPTO_LOGOS.OP },
  { id: 'cosmos', name: 'Cosmos', color: '#2E3148', logo: CRYPTO_LOGOS.ATOM },
  { id: 'fantom', name: 'Fantom', color: '#1969FF', logo: CRYPTO_LOGOS.FTM },
  { id: 'zksync', name: 'zkSync Era', color: '#8C8DFC', logo: CRYPTO_LOGOS.ZK },
  { id: 'starknet', name: 'Starknet', color: '#EC796B', logo: CRYPTO_LOGOS.STRK },
];

export const VOICE_COMMANDS = [
  { command: 'optimize portfolio', description: 'Run AI optimization on your portfolio' },
  { command: 'show net worth', description: 'Display total net worth breakdown' },
  { command: 'swap ETH to USDC', description: 'Execute a cross-chain swap' },
  { command: 'earn 10% risk-free', description: 'Find best RWA yields' },
  { command: 'connect bank', description: 'Link a new bank account via Plaid' },
  { command: 'show gas prices', description: 'Display current gas across chains' },
  { command: 'enter VR mode', description: 'Activate immersive VR portfolio view' },
  { command: 'show Bitcoin', description: 'Focus on BTC holdings in VR' },
  { command: 'analyze risk', description: 'Get AI risk assessment' },
];

// Helper function to get logo by symbol
export const getAssetLogo = (symbol: string): string => {
  return CRYPTO_LOGOS[symbol.toUpperCase()] || CRYPTO_LOGOS.ETH;
};

// Helper function to get color by symbol
export const getAssetColor = (symbol: string): string => {
  return ASSET_COLORS[symbol.toUpperCase()] || '#00f0ff';
};
