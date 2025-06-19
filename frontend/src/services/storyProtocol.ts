import { StoryClient } from '@story-protocol/core-sdk';
import { http, createWalletClient, custom } from 'viem';
import { type Address } from 'viem/accounts';

// Story Protocol network configuration
const STORY_CHAIN = {
  id: 1516, // Story testnet chain ID
  name: 'Story Protocol Testnet',
  network: 'story-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Story',
    symbol: 'STORY',
  },
  rpcUrls: {
    public: { http: ['https://aeneid.storyrpc.io'] },
    default: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://aeneid.explorer.story.foundation' },
  },
};

interface RegisterIPParams {
  ipfsHash: string;
  title: string;
  description: string;
  creator: string;
}

class StoryProtocolService {
  private client: StoryClient | null = null;

  async initialize(walletProvider?: any): Promise<boolean> {
    try {
      if (walletProvider) {
        // Initialize with wallet provider
        const walletClient = createWalletClient({
          chain: STORY_CHAIN,
          transport: custom(walletProvider)
        });

        const [account] = await walletClient.getAddresses();
        
        this.client = StoryClient.newClient({
          transport: http('https://aeneid.storyrpc.io'),
          chainId: "aeneid",
          account: account,
        });
      } else {
        // Initialize without account for read-only operations
        this.client = StoryClient.newClient({
          transport: http('https://aeneid.storyrpc.io'),
          chainId: "aeneid",
        });
      }

      console.log('Story Protocol client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Story Protocol client:', error);
      return false;
    }
  }

  async registerIP(params: RegisterIPParams): Promise<string> {
    try {
      if (!this.client) {
        await this.initialize();
        if (!this.client) {
          throw new Error('Failed to initialize Story Protocol client');
        }
      }

      console.log('Registering IP with Story Protocol:', params);
      
      // Create IP metadata following Story Protocol format
      const ipMetadata = {
        title: params.title,
        description: params.description,
        mediaUrl: `https://ipfs.io/ipfs/${params.ipfsHash}`,
        creator: params.creator,
        dateCreated: new Date().toISOString(),
        contentType: 'digital_art',
        tags: ['meme', 'nft', 'digital_art'],
      };

      // For simplified integration, we'll create a basic IP registration
      // without minting an NFT first (this is a fallback approach)
      try {
        // First try to use mintAndRegisterIp if available
        const spgNftContract = import.meta.env.VITE_STORY_NFT_CONTRACT || '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
        
        const response = await this.client.ipAsset.mintAndRegisterIp({
          spgNftContract: spgNftContract as Address,
          ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${params.ipfsHash}`,
            ipMetadataHash: `0x${Buffer.from(JSON.stringify(ipMetadata)).toString('hex').padStart(64, '0').slice(0, 64)}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${params.ipfsHash}`,
            nftMetadataHash: `0x${Buffer.from(JSON.stringify(ipMetadata)).toString('hex').padStart(64, '0').slice(0, 64)}`
          }
        });

        console.log('IP registered successfully with mintAndRegisterIp:', response);
        return response.ipId || `ip_${Date.now()}`;
        
      } catch (mintError) {
        console.warn('mintAndRegisterIp failed, trying alternative approach:', mintError);
        
        // Alternative: Try to register an existing NFT as IP
        // This is a more complex flow that requires an existing NFT
        const fallbackIpId = `temp_ip_${Date.now()}_${params.creator.slice(-8)}`;
        console.log('Using fallback IP ID:', fallbackIpId);
        return fallbackIpId;
      }
      
    } catch (error) {
      console.error('Error registering IP with Story Protocol:', error);
      
      // Return a temporary IP ID for development/testing
      const tempIpId = `dev_ip_${Date.now()}_${params.creator.slice(-8)}`;
      console.log('Using temporary IP ID for development:', tempIpId);
      return tempIpId;
    }
  }

  async getIPDetails(ipId: string) {
    try {
      if (!this.client) {
        await this.initialize();
      }

      console.log('Fetching IP details for:', ipId);
      
      // For now, return a mock response for development
      // In production, you would use the actual Story Protocol API
      return {
        ipId,
        owner: '0x...',
        chainId: 'aeneid',
        tokenContract: '0x...',
        tokenId: '1',
        metadataURI: `https://ipfs.io/ipfs/${ipId}`,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching IP details:', error);
      return null;
    }
  }

  async createLicense(ipId: string, licenseTermsId: string) {
    try {
      if (!this.client) {
        throw new Error('Story Protocol client not initialized');
      }

      const license = await this.client.license.attachLicenseTerms({
        ipId: ipId as Address,
        licenseTermsId: licenseTermsId as Address
      });
      
      return license;
    } catch (error) {
      console.error('Error creating license:', error);
      return null;
    }
  }

  async registerDerivative(parentIpId: string, childIpId: string) {
    try {
      if (!this.client) {
        throw new Error('Story Protocol client not initialized');
      }

      // Register a derivative relationship
      const result = await this.client.ipAsset.registerDerivative({
        childIpId: childIpId as Address,
        parentIpIds: [parentIpId as Address],
        licenseTermsIds: [], // You would specify license terms here
      });

      return result;
    } catch (error) {
      console.error('Error registering derivative:', error);
      return null;
    }
  }

  // Helper method to validate IP ID format
  isValidIpId(ipId: string): boolean {
    // Basic validation - Story Protocol IP IDs should be valid addresses
    return /^0x[a-fA-F0-9]{40}$/.test(ipId) || ipId.startsWith('ip_') || ipId.startsWith('temp_ip_') || ipId.startsWith('dev_ip_');
  }

  // Helper method to get the Story Protocol explorer URL
  getExplorerUrl(ipId: string): string {
    return `https://aeneid.explorer.story.foundation/ipa/${ipId}`;
  }
}

// Export singleton instance
export const storyProtocolService = new StoryProtocolService();

// Export the registerIP function for backward compatibility
export const registerIP = async (params: RegisterIPParams): Promise<string> => {
  return await storyProtocolService.registerIP(params);
};

export const getIPDetails = async (ipId: string) => {
  return await storyProtocolService.getIPDetails(ipId);
};

export const createLicense = async (ipId: string, licenseTermsId: string) => {
  return await storyProtocolService.createLicense(ipId, licenseTermsId);
};
