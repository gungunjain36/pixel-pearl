# Pixel.Pearl - Web3 Meme Trendsetter Platform

![Pixel.Pearl](https://via.placeholder.com/800x200/7C3AED/FFFFFF?text=Pixel.Pearl+-+Web3+Meme+Platform)

## 🌟 Overview

Pixel.Pearl is a decentralized platform that transforms viral memes and digital content into valuable NFTs and tradeable coins. Built on cutting-edge Web3 technologies, it enables creators to monetize their content while maintaining intellectual property rights through blockchain-based protection.

## ✨ Features

### 🎨 **Meme Creation & IP Protection**
- Upload and create memes with built-in IP protection
- Integration with Story Protocol for on-chain IP registration
- Decentralized storage using IPFS via Pinata

### 🗳️ **Community Contests**
- Vote for your favorite memes in community-driven contests
- Earn rewards for participation and winning submissions
- Transparent, blockchain-based voting system

### 📦 **Mystery Boxes**
- Create mystery boxes containing hidden digital treasures
- Purchase boxes to reveal exclusive content
- Convert revealed content into tradeable CoinV4 tokens

### 🪙 **Coin Trading**
- Transform content into CoinV4 tokens using Zora Protocol
- Trade coins in a decentralized marketplace
- Real-time pricing and market data

### 💎 **Pearl Token Economy**
- Native PEARL token for platform transactions
- Exchange ETH for PEARL tokens
- Stake and earn rewards through platform participation

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Wagmi** for Ethereum wallet integration
- **React Router** for client-side navigation

### Blockchain Integration
- **Zora Protocol** for NFT and CoinV4 token creation
- **Story Protocol** for intellectual property protection
- **IPFS/Pinata** for decentralized file storage
- **Smart Contracts** for all core functionality

### Smart Contracts
- `PearlToken.sol` - ERC20 token for platform economy
- `MysteryBox.sol` - NFT contract for mystery boxes
- `MemeContest.sol` - Contest management and voting
- `PearlExchange.sol` - Token exchange functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MetaMask or other Web3 wallet
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gungunjain36/Pixel.Pearl.git
   cd Pixel.Pearl
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   # Pinata Configuration
   VITE_PINATA_JWT=your_pinata_jwt_token
   VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
   
   # Contract Addresses
   VITE_PEARL_TOKEN_ADDRESS=0x...
   VITE_MYSTERY_BOX_ADDRESS=0x...
   VITE_MEME_CONTEST_ADDRESS=0x...
   VITE_PEARL_EXCHANGE_ADDRESS=0x...
   
   # Story Protocol
   VITE_SPG_NFT_CONTRACT=0x...
   
   # WalletConnect (Optional)
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Application Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── CreateMeme.tsx
│   │   ├── ExploreMemes.tsx
│   │   ├── ExploreMysteryCoins.tsx
│   │   ├── CoinContent.tsx
│   │   ├── PearlWallet.tsx
│   │   ├── MysteriousBox.tsx
│   │   └── Navbar.tsx
│   ├── services/            # External service integrations
│   │   ├── ipfs.ts
│   │   ├── storyProtocol.ts
│   │   └── zora.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useContracts.ts
│   ├── utils/               # Utility functions and configs
│   │   ├── web3-config.ts
│   │   └── zora-config.ts
│   ├── abi/                 # Smart contract ABIs
│   │   ├── PearlToken.json
│   │   ├── MysteryBox.json
│   │   ├── MemeContest.json
│   │   └── PearlExchange.json
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
└── contracts/               # Smart contracts
    ├── MysteryBox.sol
    └── ZoraIntegration.sol
```

## 🎯 Core Features Deep Dive

### Creating Memes
1. Upload your meme image/content
2. Add title, description, and tags
3. Register IP with Story Protocol
4. Submit to contest or create mystery box

### Mystery Boxes
1. Create boxes with hidden content
2. Set mint price in PEARL tokens
3. Users purchase boxes to reveal content
4. Convert revealed content to tradeable coins

### Voting System
1. Browse submitted memes
2. Vote using PEARL tokens
3. Winners receive rewards
4. Community governance for contests

### Coin Trading
1. Convert mystery box content to CoinV4 tokens
2. Trade on integrated DEX
3. Real-time market data
4. Liquidity pools for price discovery

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## 🌐 Deployment

### Frontend Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service**
   - Vercel: `vercel --prod`
   - Netlify: Drag `dist` folder to dashboard
   - IPFS: Use services like Fleek or Pinata

### Smart Contract Deployment
1. Configure deployment network in `hardhat.config.js`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network <network>`
3. Update contract addresses in frontend `.env`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Demo**: [https://artifact-fun.vercel.app](https://artifact-fun.vercel.app)
- **Documentation**: [https://docs.artifact.fun](https://docs.artifact.fun)
- **Discord**: [https://discord.gg/artifact-fun](https://discord.gg/artifact-fun)
- **Twitter**: [@ArtifactFun](https://twitter.com/ArtifactFun)

## 🙏 Acknowledgments

- **Zora Protocol** for NFT and token infrastructure
- **Story Protocol** for IP protection capabilities
- **Pinata** for reliable IPFS pinning services
- **Wagmi** for excellent React/Ethereum integration
- The amazing Web3 community for inspiration and support

## 📞 Support

If you encounter any issues or have questions:

1. Check the [FAQ](docs/FAQ.md)
2. Join our [Discord](https://discord.gg/artifact-fun)
3. Open an issue on GitHub
4. Contact us at support@artifact.fun

---

**Built with ❤️ for the Web3 community**

Transform your memes into valuable digital assets with Artifact.fun! 🚀
