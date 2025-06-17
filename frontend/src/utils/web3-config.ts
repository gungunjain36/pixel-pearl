import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, zoraSepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = createConfig({
  chains: [mainnet, sepolia, zoraSepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [zoraSepolia.id]: http('https://sepolia.rpc.zora.energy'),
  },
});

export const supportedChains = [
  {
    id: sepolia.id,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.sepolia.org'],
      },
      public: {
        http: ['https://rpc.sepolia.org'],
      },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
  },
  {
    id: zoraSepolia.id,
    name: 'Zora Sepolia',
    network: 'zora-sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia.rpc.zora.energy'],
      },
      public: {
        http: ['https://sepolia.rpc.zora.energy'],
      },
    },
    blockExplorers: {
      default: { name: 'Zora Explorer', url: 'https://sepolia.explorer.zora.energy' },
    },
    testnet: true,
  },
];

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
} 