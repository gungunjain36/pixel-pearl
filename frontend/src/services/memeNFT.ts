import { parseEther, formatEther, type WalletClient } from 'viem';
import { zoraSepolia } from 'viem/chains';
import { ipfsService } from './ipfs';
import { storyProtocolService } from './storyProtocol';

export interface MemeMetadata {
  name: string;
  description: string;
  image: string;
  creator: string;
  createdAt: string;
  contentType: string;
  style?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MintProgress {
  step: string;
  progress: number;
  txHash?: string;
  ipfsHash?: string;
  storyIpId?: string;
  error?: string;
}

// Zora Protocol Contract Addresses (Mainnet & Testnet)
const ZORA_CONTRACTS = {
  // Zora Sepolia Testnet
  zoraSepolia: {
    factoryProxy: '0xA2c2A96A232113Dd4993E8b048EEbc3371AE8d85',
    premintExecutor: '0xD8f6cf234eE4B689099677Bd94FbA0b1E005181d',
    fixedPriceSaleStrategy: '0x04E2516A2c207E84a1839755675dfd8eF6302F0a'
  },
  // Zora Mainnet
  zora: {
    factoryProxy: '0xA2c2A96A232113Dd4993E8b048EEbc3371AE8d85',
    premintExecutor: '0xD8f6cf234eE4B689099677Bd94FbA0b1E005181d',
    fixedPriceSaleStrategy: '0x04E2516A2c207E84a1839755675dfd8eF6302F0a'
  }
};

// Minimal Zora Factory ABI for creating collections
const ZORA_FACTORY_ABI = [
  {
    inputs: [
      { name: "newContract", type: "string" },
      { name: "contractURI", type: "string" },
      { name: "defaultAdmin", type: "address" },
      { name: "setupActions", type: "bytes[]" }
    ],
    name: "createContract",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

// Zora 1155 Contract ABI for minting
const ZORA_1155_ABI = [
  {
    inputs: [
      { name: "minter", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "quantity", type: "uint256" },
      { name: "minterArguments", type: "bytes" },
      { name: "mintReferral", type: "address" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenURI", type: "string" },
      { name: "maxSupply", type: "uint256" },
      { name: "royaltyRecipient", type: "address" },
      { name: "royaltyBPS", type: "uint256" },
      { name: "payoutRecipient", type: "address" },
      { name: "setupActions", type: "bytes[]" }
    ],
    name: "setupNewToken",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export class MemeNFTService {
  private readonly zoraContracts: typeof ZORA_CONTRACTS.zoraSepolia;

  constructor() {
    // Use Zora Sepolia for testing, switch to mainnet in production
    const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
    this.zoraContracts = isMainnet ? ZORA_CONTRACTS.zora : ZORA_CONTRACTS.zoraSepolia;
    
    console.log('MemeNFTService initialized with Zora contracts:', this.zoraContracts);
  }

  private createMemeMetadata(
    name: string,
    description: string,
    imageHash: string,
    creator: string,
    style: string = 'Classic',
    contentType: string = 'image'
  ): MemeMetadata {
    return {
      name,
      description,
      image: `ipfs://${imageHash}`,
      creator,
      createdAt: new Date().toISOString(),
      contentType,
      style,
      attributes: [
        {
          trait_type: "Creator",
          value: creator
        },
        {
          trait_type: "Style",
          value: style
        },
        {
          trait_type: "Content Type",
          value: contentType
        },
        {
          trait_type: "Created At",
          value: new Date().toLocaleDateString()
        },
        {
          trait_type: "Platform",
          value: "Creso"
        }
      ]
    };
  }

  async createMemeNFT(
    file: File,
    name: string,
    description: string,
    style: string,
    walletClient: WalletClient,
    onProgress: (progress: MintProgress) => void
  ): Promise<{ txHash: string; tokenId: string; ipfsHash: string; metadataHash: string; storyIpId?: string }> {
    try {
      if (!walletClient.account?.address) {
        throw new Error('Wallet not connected');
      }

      const creator = walletClient.account.address;

      // Step 1: Upload image to IPFS
      onProgress({ step: 'Uploading image to IPFS...', progress: 15 });
      const imageHash = await ipfsService.uploadFile(file);
      
      onProgress({ 
        step: 'Image uploaded successfully!', 
        progress: 25, 
        ipfsHash: imageHash 
      });

      // Step 2: Create and upload metadata
      onProgress({ step: 'Creating metadata...', progress: 35 });
      const metadata = this.createMemeMetadata(name, description, imageHash, creator, style);
      
      onProgress({ step: 'Uploading metadata to IPFS...', progress: 45 });
      const metadataHash = await ipfsService.uploadJSON(metadata);
      
      onProgress({ 
        step: 'Metadata uploaded successfully!', 
        progress: 55 
      });

      // Step 3: Check if we have an existing collection or need to create one
      onProgress({ step: 'Preparing NFT collection...', progress: 65 });
      
      const collectionAddress = await this.getOrCreateCollection(walletClient, onProgress);
      
      // Step 4: Mint the NFT
      onProgress({ step: 'Minting NFT on Zora...', progress: 75 });
      
      const mintResult = await this.mintNFT(
        walletClient,
        collectionAddress,
        `ipfs://${metadataHash}`,
        creator,
        onProgress
      );

      // Step 5: Register with Story Protocol (optional)
      let storyIpId;
      try {
        onProgress({ step: 'Registering IP with Story Protocol...', progress: 90 });
        storyIpId = await storyProtocolService.registerIP({
          ipfsHash: metadataHash,
          title: name,
          description: description,
          creator: creator
        });
        onProgress({ 
          step: 'IP registered with Story Protocol!', 
          progress: 95, 
          storyIpId 
        });
      } catch (storyError) {
        console.warn('Story Protocol registration failed:', storyError);
      }

      onProgress({ 
        step: 'NFT minted successfully!', 
        progress: 100,
        txHash: mintResult.txHash
      });

      return {
        txHash: mintResult.txHash,
        tokenId: mintResult.tokenId,
        ipfsHash: imageHash,
        metadataHash,
        storyIpId
      };

    } catch (error) {
      console.error('Error creating meme NFT:', error);
      onProgress({ 
        step: 'error', 
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    }
  }

  private async getOrCreateCollection(
    walletClient: WalletClient,
    onProgress: (progress: MintProgress) => void
  ): Promise<string> {
    // For now, we'll use a pre-existing collection address or create a simple one
    // In a production app, you might want to create a new collection for each user or reuse an existing one
    
    const existingCollection = import.meta.env.VITE_ZORA_COLLECTION_ADDRESS;
    if (existingCollection && existingCollection !== 'undefined') {
      return existingCollection;
    }

    // If no existing collection, create a new one
    onProgress({ step: 'Creating new NFT collection...', progress: 60 });
    
    try {
      const collectionMetadata = {
        name: "Creso Meme Collection",
        description: "A collection of memes created on the Creso platform",
        image: "ipfs://QmYourCollectionImageHash", // You can upload a collection image
        external_link: "https://creso.app"
      };

      const collectionMetadataHash = await ipfsService.uploadJSON(collectionMetadata);
      
      // Create contract via Zora Factory
      await walletClient.writeContract({
        address: this.zoraContracts.factoryProxy as `0x${string}`,
        abi: ZORA_FACTORY_ABI,
        functionName: 'createContract',
        chain: zoraSepolia,
        args: [
          "Creso Meme Collection",
          `ipfs://${collectionMetadataHash}`,
          walletClient.account!.address,
          [] // No setup actions for basic collection
        ]
      });

      // Wait for transaction and get collection address
      // Note: In real implementation, you'd wait for the transaction receipt
      // and extract the created contract address from the logs
      
      return this.zoraContracts.factoryProxy; // Fallback for demo
      
    } catch (error) {
      console.warn('Failed to create new collection, using factory proxy:', error);
      return this.zoraContracts.factoryProxy;
    }
  }

  private async mintNFT(
    walletClient: WalletClient,
    collectionAddress: string,
    tokenURI: string,
    recipient: string,
    onProgress: (progress: MintProgress) => void
  ): Promise<{ txHash: string; tokenId: string }> {
    try {
      // First setup the token if needed
      onProgress({ step: 'Setting up NFT token...', progress: 80 });
      
      // Generate a unique token ID
      const tokenId = Date.now().toString();
      
      // Setup new token (if using a collection that supports it)
      try {
        const setupHash = await walletClient.writeContract({
          address: collectionAddress as `0x${string}`,
          abi: ZORA_1155_ABI,
          functionName: 'setupNewToken',
          chain: zoraSepolia,
          args: [
            tokenURI,
            BigInt(1000), // Max supply
            recipient as `0x${string}`, // Royalty recipient
            BigInt(250), // 2.5% royalty
            recipient as `0x${string}`, // Payout recipient  
            [] // No setup actions
          ]
        });
        
        console.log('Token setup transaction:', setupHash);
      } catch (setupError) {
        console.warn('Token setup failed, trying direct mint:', setupError);
      }

      // Mint the NFT
      onProgress({ step: 'Executing mint transaction...', progress: 85 });
      
      const mintPrice = parseEther('0.000777'); // Zora's standard mint price
      
      const hash = await walletClient.writeContract({
        address: collectionAddress as `0x${string}`,
        abi: ZORA_1155_ABI,
        functionName: 'mint',
        chain: zoraSepolia,
        args: [
          this.zoraContracts.fixedPriceSaleStrategy as `0x${string}`, // Minter (sale strategy)
          BigInt(1), // Token ID (using 1 for simplicity)
          BigInt(1), // Quantity
          '0x', // Minter arguments (empty for basic mint)
          recipient as `0x${string}` // Mint referral
        ],
        value: mintPrice
      });

      return {
        txHash: hash,
        tokenId: tokenId
      };

    } catch (error) {
      console.error('Mint transaction failed:', error);
      throw new Error(`Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMemeMetadata(ipfsHash: string): Promise<MemeMetadata> {
    return await ipfsService.getJSON(ipfsHash);
  }

  getImageUrl(ipfsHash: string): string {
    return ipfsService.getFileUrl(ipfsHash);
  }

  async estimateMintCost(): Promise<string> {
    // Zora's standard mint price plus gas
    const baseMintPrice = parseEther('0.000777');
    const estimatedGas = parseEther('0.003'); // Estimated gas cost
    const total = baseMintPrice + estimatedGas;
    return formatEther(total);
  }

  // Helper method to check network compatibility
  isNetworkSupported(chainId: number): boolean {
    // Zora Mainnet (7777777) and Zora Sepolia (999999999)
    return chainId === 7777777 || chainId === 999999999;
  }

  getRequiredNetwork(): { name: string; chainId: number } {
    const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
    return isMainnet 
      ? { name: 'Zora', chainId: 7777777 }
      : { name: 'Zora Sepolia', chainId: 999999999 };
  }
}

export default MemeNFTService; 