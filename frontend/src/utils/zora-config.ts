import { zoraSepolia } from 'viem/chains';

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

export const CONTRACT_ADDRESSES = {
  // Add deployed contract addresses here
  PEARL_TOKEN: import.meta.env.VITE_PEARL_TOKEN_ADDRESS || '',
  MYSTERY_BOX: import.meta.env.VITE_MYSTERY_BOX_ADDRESS || '',
  MEME_CONTEST: import.meta.env.VITE_MEME_CONTEST_ADDRESS || '',
  PEARL_EXCHANGE: import.meta.env.VITE_PEARL_EXCHANGE_ADDRESS || ''
};

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
