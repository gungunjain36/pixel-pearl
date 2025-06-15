#!/bin/bash

echo "🎭 Setting up ZoraFact project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version $(node -v) detected"

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
if npm install; then
    print_status "Contract dependencies installed"
else
    print_error "Failed to install contract dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    echo "Creating .env template..."
    cat > .env << 'EOL'
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
EOL
    print_status ".env template created"
    print_warning "Please update .env file with your actual values before deploying"
else
    print_status ".env file already exists"
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
cd contracts
if npx hardhat compile; then
    print_status "Smart contracts compiled successfully"
else
    print_error "Failed to compile smart contracts"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with actual values"
echo "2. Get Zora Sepolia ETH from a faucet"
echo "3. Deploy contracts: cd contracts && npx hardhat run scripts/deploy.ts --network zoraSepolia"
echo "4. Update contract addresses in .env"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
echo "📚 For detailed instructions, check the README.md file" 