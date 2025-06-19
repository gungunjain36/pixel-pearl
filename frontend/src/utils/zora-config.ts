import { zoraSepolia } from 'viem/chains';
// import dotenv from 'dotenv';

export const ZORA_CONFIG = {
  chain: zoraSepolia,
  rpcUrl: 'https://sepolia.rpc.zora.energy',
  explorer: 'https://sepolia.explorer.zora.energy',
  name: 'Zora Sepolia Testnet',
  chainId: 999999999,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  }
};

// Debug environment variables
const debugEnvVars = () => {
  console.log('🔍 Environment Variables Debug:');
  console.log('VITE_PEARL_TOKEN_ADDRESS:', import.meta.env.VITE_PEARL_TOKEN_ADDRESS);
  console.log('VITE_PEARL_EXCHANGE_ADDRESS:', import.meta.env.VITE_PEARL_EXCHANGE_ADDRESS);
  console.log('VITE_MYSTERY_BOX_ADDRESS:', import.meta.env.VITE_MYSTERY_BOX_ADDRESS);
  console.log('VITE_MEME_CONTEST_ADDRESS:', import.meta.env.VITE_MEME_CONTEST_ADDRESS);
};

// Call debug function in development
if (import.meta.env.DEV) {
  debugEnvVars();
}

export const CONTRACT_ADDRESSES = {
  // IMPORTANT: You need to update these with your actual deployed contract addresses
  PEARL_TOKEN: import.meta.env.VITE_PEARL_TOKEN_ADDRESS || '',
  MYSTERY_BOX: import.meta.env.VITE_MYSTERY_BOX_ADDRESS || '',
  MEME_CONTEST: import.meta.env.VITE_MEME_CONTEST_ADDRESS || '',
  PEARL_EXCHANGE: import.meta.env.VITE_PEARL_EXCHANGE_ADDRESS || ''
};

// Validate contract addresses
export const validateContractAddresses = () => {
  const missing: string[] = [];
  
  // Check for non-zero addresses (excluding placeholders)
  if (!CONTRACT_ADDRESSES.PEARL_TOKEN || CONTRACT_ADDRESSES.PEARL_TOKEN === '0x0000000000000000000000000000000000000000') {
    missing.push('VITE_PEARL_TOKEN_ADDRESS');
  }
  if (!CONTRACT_ADDRESSES.PEARL_EXCHANGE || CONTRACT_ADDRESSES.PEARL_EXCHANGE === '0x0000000000000000000000000000000000000000') {
    missing.push('VITE_PEARL_EXCHANGE_ADDRESS');
  }
  
  // Mystery Box and Meme Contest are optional for now
  if (!CONTRACT_ADDRESSES.MYSTERY_BOX || CONTRACT_ADDRESSES.MYSTERY_BOX === '0x0000000000000000000000000000000000000000') {
    console.warn('⚠️  Mystery Box contract not deployed yet');
  }
  if (!CONTRACT_ADDRESSES.MEME_CONTEST || CONTRACT_ADDRESSES.MEME_CONTEST === '0x0000000000000000000000000000000000000000') {
    console.warn('⚠️  Meme Contest contract not deployed yet');
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing essential contract addresses:', missing);
    console.error('📝 Please update your .env file with these variables:');
    missing.forEach(envVar => {
      console.error(`${envVar}=YOUR_CONTRACT_ADDRESS_HERE`);
    });
    return false;
  }
  
  console.log('✅ Essential contract addresses configured correctly');
  console.log('💰 PEARL Token:', CONTRACT_ADDRESSES.PEARL_TOKEN);
  console.log('🔄 PEARL Exchange:', CONTRACT_ADDRESSES.PEARL_EXCHANGE);
  return true;
};

// Validate on module load
if (import.meta.env.DEV) {
  validateContractAddresses();
}

export const ZORA_API_ENDPOINTS = {
  graphql: 'https://api.zora.co/graphql',
  collection: 'https://api.zora.co/collections',
  token: 'https://api.zora.co/tokens'
};

export const STORY_PROTOCOL_CONFIG = {
  chainId: 'iliad',
  rpcUrl: 'https://testnet.storyrpc.io',
  explorer: 'https://testnet.story.foundation',
  spgNftContract: import.meta.env.VITE_SPG_NFT_CONTRACT || ''
};

export const PINATA_CONFIG = {
  jwt: import.meta.env.VITE_PINATA_JWT || '',
  gateway: import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
  apiUrl: 'https://api.pinata.cloud'
};
