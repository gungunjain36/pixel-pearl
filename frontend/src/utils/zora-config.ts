    // frontend/src/utils/zora-config.ts
import { type Chain } from 'viem';

    export const zoraSepolia: Chain = {
      id: 999999999,
      name: 'Zora Sepolia Testnet',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://sepolia.rpc.zora.energy'] },
        public: { http: ['https://sepolia.rpc.zora.energy'] },
      },
      blockExplorers: {
        default: {
          name: 'Zora Sepolia Explorer',
          url: 'https://sepolia.explorer.zora.energy/',
        },
      },
      testnet: true,
    };

    export const CONTRACT_ADDRESSES = {
      pearlToken: process.env.REACT_APP_PEARL_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
      memeContest: process.env.REACT_APP_MEME_CONTEST_ADDRESS || "0x0000000000000000000000000000000000000000",
      pearlExchange: process.env.REACT_APP_PEARL_EXCHANGE_ADDRESS || "0x0000000000000000000000000000000000000000",
      zoraMemeNFTCollection: process.env.REACT_APP_ZORA_MEME_NFT_COLLECTION_ADDRESS || "0x0000000000000000000000000000000000000000",
    };

    export const validateContractAddresses = () => {
      const missingAddresses = [];
      
      if (CONTRACT_ADDRESSES.pearlToken === "0x0000000000000000000000000000000000000000") {
        missingAddresses.push('REACT_APP_PEARL_TOKEN_ADDRESS');
      }
      if (CONTRACT_ADDRESSES.memeContest === "0x0000000000000000000000000000000000000000") {
        missingAddresses.push('REACT_APP_MEME_CONTEST_ADDRESS');
      }
      if (CONTRACT_ADDRESSES.pearlExchange === "0x0000000000000000000000000000000000000000") {
        missingAddresses.push('REACT_APP_PEARL_EXCHANGE_ADDRESS');
      }
      if (CONTRACT_ADDRESSES.zoraMemeNFTCollection === "0x0000000000000000000000000000000000000000") {
        missingAddresses.push('REACT_APP_ZORA_MEME_NFT_COLLECTION_ADDRESS');
      }
      
      if (missingAddresses.length > 0) {
        console.warn('⚠️ Missing contract addresses in environment variables:', missingAddresses);
        console.warn('Please set these environment variables after deploying contracts.');
      }
      
      return missingAddresses.length === 0;
    };
    