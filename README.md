# AetherHub 2049™

> **AetherHub 2049™** and the AetherHub logo are trademarks of Elev8minds LLC.  
> Copyright © 2025 Elev8minds LLC. All rights reserved.

A futuristic cyberpunk-themed cross-chain portfolio management application with VR support.

---

## ⚖️ Legal Notice

This software and associated documentation files (the "Software") are the copyrighted property of **Elev8minds LLC**. Unauthorized copying, modification, distribution, or use of the Software, in whole or in part, is strictly prohibited without prior written permission from Elev8minds LLC.

**Trademarks:** "AetherHub", "AetherHub 2049", and the AetherHub logo (including any stylized versions) are owned by Elev8minds LLC and may not be used without express written permission.

**For licensing inquiries:** [legal@elev8minds.com](mailto:legal@elev8minds.com)

---

## 🔗 On-Chain Provenance Verification

The ownership and authenticity of this codebase can be verified via a SHA-256 hash registered on-chain.

### How to Verify Ownership

1. **Generate the SHA-256 hash of the codebase:**

   ```bash
   # On macOS/Linux - hash the entire src directory
   find src -type f -exec sha256sum {} \; | sort | sha256sum
   
   # Or create a tarball and hash it
   tar -cf - src/ | sha256sum
   
   # Alternative: Hash individual key files
   sha256sum src/main.tsx src/App.tsx src/components/AetherHubApp.tsx
   ```

2. **Verify on Base (Ethereum L2):**
   
   The codebase hash is registered on Base mainnet at:
   - **Contract:** `0x...` *(Elev8minds Provenance Registry)*
   - **Transaction:** View on [BaseScan](https://basescan.org)
   
   ```solidity
   // Provenance Registry Contract
   function verifyCodebaseHash(bytes32 hash) public view returns (
     address owner,
     uint256 timestamp,
     string memory projectName
   );
   ```

3. **Verify on Ethereum Mainnet:**
   
   Alternatively, verify on Ethereum L1:
   - **ENS:** `aetherhub.eth`
   - **Contract:** `0x...` *(Elev8minds IP Registry)*

### Provenance Data Structure

```json
{
  "project": "AetherHub 2049",
  "version": "1.0.0",
  "owner": "Elev8minds LLC",
  "hash_algorithm": "SHA-256",
  "registered_on": ["Base", "Ethereum"],
  "timestamp": "2025-01-XX",
  "contact": "legal@elev8minds.com"
}
```

### Why On-Chain Provenance?

- **Immutable Proof:** Blockchain registration provides tamper-proof evidence of ownership
- **Timestamped:** Cryptographic proof of when the code was created/registered
- **Decentralized:** No single point of failure for ownership verification
- **Legal Evidence:** Admissible as evidence in intellectual property disputes

---

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

---

## License

**PROPRIETARY - ALL RIGHTS RESERVED**

This software is NOT open source. All rights are reserved by Elev8minds LLC.

See the [Legal Notice](#%EF%B8%8F-legal-notice) section above for details.

For licensing inquiries, contact: [legal@elev8minds.com](mailto:legal@elev8minds.com)

---

*AetherHub 2049™ © 2025 Elev8minds LLC. All rights reserved.*
