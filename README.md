# AetherHub Superapp 2049

A futuristic cyberpunk-themed cross-chain portfolio management application with VR support.

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **3D/VR**: React Three Fiber + WebXR
- **State**: React Context + TanStack Query
- **Animations**: Framer Motion
- **Backend**: Supabase Edge Functions

## Features

- 🎨 **Futuristic Cyberpunk UI** - Matrix rain, neon glows, glass morphism
- 🥽 **VR Portfolio Viewer** - WebXR support for Meta Quest, Vision Pro
- 🤖 **Grok-4 Heavy AI** - Portfolio optimization and voice commands
- 🔗 **Multi-Chain Support** - Ethereum, Solana, XRP Ledger, and 10+ chains
- 🏦 **Bank Integration** - Plaid Sandbox/Production support
- 💳 **Cold Wallet Support** - Arculus, Ledger, Trezor via WalletConnect
- 🔐 **Institutional Security** - ZK-proofs, consent modals, Sentry audit logs
- 🎤 **Voice Commands** - Natural language portfolio control

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── index.html              # Entry HTML file
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with routing
│   ├── index.css          # Global styles + Tailwind
│   ├── components/
│   │   ├── AppLayout.tsx  # Main app layout
│   │   ├── AetherHubApp.tsx
│   │   ├── aether/        # Feature components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NetWorthOrb.tsx
│   │   │   ├── PortfolioOrbVR.tsx
│   │   │   ├── AIOptimizer.tsx
│   │   │   └── ...
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/
│   │   ├── AppContext.tsx
│   │   └── VRContext.tsx
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── usePlaid.ts
│   │   └── useAetherAI.ts
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── pages/
│       ├── Index.tsx
│       └── NotFound.tsx
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## Environment Variables

For production, set these in Vercel:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PLAID_ENV=sandbox|production
```

## Deployment

This project is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel --prod
```

The `vercel.json` file is configured for Vite SPA with proper rewrites and security headers.

## License

MIT
