# 🎭 ZoraFact - Decentralized Meme Contest Platform

**ZoraFact** is a Web3 platform built on Zora Sepolia that enables decentralized meme contests with integrated tokenomics, NFT minting, and IP protection.

## 🚀 Features

- **Meme Contest System**: Submit memes, vote with Pearl tokens, earn rewards
- **Pearl Token Economy**: Platform currency with ETH exchange capabilities
- **Zora Integration**: Mint memes as NFTs and create tradeable CoinV4 tokens
- **Story Protocol**: IP rights registration for meme content
- **IPFS Storage**: Decentralized content storage
- **Mystery Boxes**: Gamified content discovery and coining

## 🔧 Recent Fixes Applied

### Smart Contract Issues Fixed ✅
- **PearlToken.sol**: Fixed missing semicolon after pragma statement
- **Contract Spacing**: Improved code formatting and readability
- **Hardhat Config**: Updated chain ID and configuration

### Frontend Issues Fixed ✅
- **Wagmi v2 Migration**: Updated from deprecated wagmi v1 to v2 syntax
- **ConnectKit Integration**: Replaced RainbowKit with ConnectKit for wallet connections
- **Modern Hooks**: Updated to use `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`
- **Viem Integration**: Replaced ethers.js with viem for better type safety
- **Empty Components**: Implemented `ExploreMysteryCoins` and `MysteriousBox` components

### Configuration Improvements ✅
- **Environment Variables**: Added support for dynamic contract addresses
- **Chain Configuration**: Fixed Zora Sepolia chain ID (999999999)
- **Address Validation**: Added contract address validation utilities
- **Package Dependencies**: Updated to compatible versions

## 🛠 Tech Stack

**Blockchain**
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Zora Sepolia Testnet

**Frontend**
- React 19 + TypeScript
- Vite
- TailwindCSS
- Wagmi v2 + Viem
- ConnectKit

**Integrations**
- Zora Protocol SDK (Coins & Minting)
- Story Protocol SDK
- IPFS (via Infura)

## 📋 Prerequisites

- Node.js 18+
- Git
- Metamask or compatible Web3 wallet
- Zora Sepolia ETH for testing

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd zorafact

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
ZORA_SEPOLIA_RPC_URL=https://sepolia.rpc.zora.energy
PRIVATE_KEY=your_private_key_here
ZORA_EXPLORER_API_KEY=optional_zora_explorer_api_key

# Frontend Configuration
REACT_APP_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
REACT_APP_ZORA_API_KEY=optional_zora_api_key

# IPFS Configuration
REACT_APP_IPFS_PROJECT_ID=your_infura_ipfs_project_id
REACT_APP_IPFS_PROJECT_SECRET=your_infura_ipfs_project_secret

# Story Protocol Configuration
REACT_APP_STORY_PROTOCOL_API_KEY=your_story_protocol_api_key

# Contract Addresses (Update after deployment)
REACT_APP_PEARL_TOKEN_ADDRESS=
REACT_APP_MEME_CONTEST_ADDRESS=
REACT_APP_PEARL_EXCHANGE_ADDRESS=
REACT_APP_ZORA_MEME_NFT_COLLECTION_ADDRESS=
```

### 3. Deploy Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Zora Sepolia
npx hardhat run scripts/deploy.ts --network zoraSepolia

# Deploy Zora Meme Collection
npx hardhat run scripts/deployMemeCollection.ts --network zoraSepolia
```

### 4. Update Contract Addresses

After deployment, update your `.env` file with the deployed contract addresses.

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
zorafact/
├── contracts/                 # Smart contracts
│   ├── PearlToken.sol        # ERC20 platform token
│   ├── MemeContest.sol       # Contest mechanics
│   ├── PearlExchange.sol     # Token exchange
│   └── hardhat.config.js     # Hardhat configuration
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── services/         # Web3 integrations
│   │   ├── utils/           # Configuration
│   │   └── abi/             # Contract ABIs
├── scripts/                  # Deployment scripts
│   ├── deploy.ts            # Main deployment
│   └── deployMemeCollection.ts # Zora collection
└── README.md
```

## 🎮 How to Use

### For Creators
1. **Connect Wallet** - Use ConnectKit to connect your Web3 wallet
2. **Get Pearl Tokens** - Exchange ETH for PEARL in the Pearl Wallet
3. **Submit Memes** - Upload memes, pay 10 PEARL submission fee
4. **Mint NFTs** - Convert memes to NFTs on Zora
5. **Create Coins** - Transform content into tradeable ERC20 tokens

### For Voters
1. **Connect Wallet** - Connect to participate in contests
2. **Get Pearl Tokens** - Exchange ETH for PEARL tokens
3. **Vote on Memes** - Pay 1 PEARL to vote, earn 1 PEARL reward
4. **Explore Mystery Coins** - Discover and trade mystery content

### Contest Mechanics
- **Submission Fee**: 10 PEARL
- **Voting Fee**: 1 PEARL
- **Voting Reward**: 1 PEARL
- **Winner Reward**: 50 PEARL
- **Contest Duration**: 7 days (configurable)

## 🔐 Security Considerations

- Always verify contract addresses before interacting
- Start with small amounts when testing
- Keep private keys secure and never commit them
- Use testnet for development and testing

## 🌐 Supported Networks

- **Zora Sepolia Testnet** (Chain ID: 999999999)
- Localhost (for development)

## 📚 API Documentation

### Smart Contract Functions

**PearlToken**
- `mint(address to, uint256 amount)` - Mint new tokens (owner only)
- `burn(uint256 amount)` - Burn tokens
- Standard ERC20 functions

**MemeContest**
- `submitMeme(string ipfsHash, string storyProtocolIPId)` - Submit a meme
- `voteForMeme(uint256 memeId)` - Vote for a meme
- `getContestResults()` - Get contest winner
- `distributeWinnerRewards()` - Distribute rewards (owner only)

**PearlExchange**
- `exchangeEthForPearl()` - Exchange ETH for PEARL
- `exchangePearlForEth(uint256 pearlAmount)` - Exchange PEARL for ETH
- `setExchangeRate(uint256 newRate)` - Update exchange rate (owner only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔧 Troubleshooting

### Common Issues

**"Cannot connect to network"**
- Ensure you're on Zora Sepolia testnet
- Check RPC URL in wallet settings

**"Transaction failed"**
- Ensure sufficient ETH balance for gas
- Check if contract addresses are correctly set

**"Token not found"**
- Verify contract addresses in environment variables
- Ensure contracts are deployed and verified

**"Approval failed"**
- Ensure sufficient token balance
- Check if allowance is properly set

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Zora Protocol](https://zora.co/) for NFT and CoinV4 infrastructure
- [Story Protocol](https://www.story.foundation/) for IP rights management
- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract standards
- [Wagmi](https://wagmi.sh/) for React Web3 hooks

---

**Built with ❤️ for the decentralized meme economy**
