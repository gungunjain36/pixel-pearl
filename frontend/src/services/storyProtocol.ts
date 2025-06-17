import { StoryClient, type StoryConfig } from '@story-protocol/core-sdk';
import { http } from 'viem';
import { privateKeyToAccount, type Address } from 'viem/accounts';

// Configuration for Story Protocol client
const config: StoryConfig = {
  account: import.meta.env.VITE_WALLET_PRIVATE_KEY 
    ? privateKeyToAccount(`0x${import.meta.env.VITE_WALLET_PRIVATE_KEY}` as Address)
    : undefined,
  transport: http(import.meta.env.VITE_STORY_RPC_URL || 'https://aeneid.storyrpc.io'),
  chainId: "aeneid", // Story testnet chainId
};

const client = StoryClient.newClient(config);

interface RegisterIPParams {
  ipfsHash: string;
  title: string;
  description: string;
  creator: string;
}

export const registerIP = async (params: RegisterIPParams): Promise<string> => {
  try {
    console.log('Registering IP with Story Protocol:', params);
    
    // Create IP metadata following Story Protocol format
    const ipMetadata = {
      title: params.title,
      description: params.description,
      mediaUrl: `https://ipfs.io/ipfs/${params.ipfsHash}`,
      creator: params.creator,
      dateCreated: new Date().toISOString(),
      contentType: 'digital_art'
    };

    // Use mintAndRegisterIp which mints an NFT and registers it as IP Asset
    const response = await client.ipAsset.mintAndRegisterIp({
      spgNftContract: import.meta.env.VITE_NFT_CONTRACT_ADDRESS as Address || '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // Default Story testnet contract
      ipMetadata: {
        ipMetadataURI: `https://ipfs.io/ipfs/${params.ipfsHash}`,
        ipMetadataHash: `0x${Buffer.from(JSON.stringify(ipMetadata)).toString('hex').padStart(64, '0').slice(0, 64)}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${params.ipfsHash}`,
        nftMetadataHash: `0x${Buffer.from(JSON.stringify(ipMetadata)).toString('hex').padStart(64, '0').slice(0, 64)}`
      }
    });

    console.log('IP registered successfully:', response);
    return response.ipId || `ip_${Date.now()}`;
    
  } catch (error) {
    console.error('Error registering IP with Story Protocol:', error);
    // Return a placeholder IP ID for development
    return `temp_ip_${Date.now()}`;
  }
};

export const getIPDetails = async (ipId: string) => {
  try {
    // Use a simpler approach for development - just return a mock response
    console.log('Fetching IP details for:', ipId);
    return {
      ipId,
      owner: '0x',
      chainId: 'aeneid',
      tokenContract: '0x',
      tokenId: '0'
    };
  } catch (error) {
    console.error('Error fetching IP details:', error);
    return null;
  }
};

export const createLicense = async (ipId: string, licenseTermsId: string) => {
  try {
    // Use attachLicenseTerms to attach license terms to IP
    const license = await client.license.attachLicenseTerms({
      ipId: ipId as Address,
      licenseTermsId: licenseTermsId as Address
    });
    return license;
  } catch (error) {
    console.error('Error creating license:', error);
    return null;
  }
};
