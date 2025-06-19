import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import { createCreatorClient } from '@zoralabs/protocol-sdk';

// Configure Base client for production use
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

let walletClient: any = null;
let creatorClient: any = null;

// Initialize clients when wallet is available
export const initializeZoraClients = (walletProvider: any) => {
  walletClient = createWalletClient({
    chain: base,
    transport: custom(walletProvider)
  });

  creatorClient = createCreatorClient({ 
    chainId: base.id, 
    publicClient 
  });
};

interface MintNFTParams {
  contractAddress: string;
  tokenMetadataURI: string;
  mintToAddress: string;
  quantity?: number;
}

interface CreateCoinParams {
  name: string;
  symbol: string;
  description: string;
  imageURI: string;
  creatorAddress: string;
}

export const mintNFT = async (params: MintNFTParams) => {
  try {
    if (!creatorClient || !walletClient) {
      throw new Error('Zora clients not initialized. Please connect wallet first.');
    }

    console.log('Minting NFT on Zora:', params);

    const { request } = await creatorClient.mint({
      tokenContract: params.contractAddress as `0x${string}`,
      mintType: 'premint',
      tokenMetadataURI: params.tokenMetadataURI,
      mintToAddress: params.mintToAddress as `0x${string}`,
      quantityToMint: params.quantity || 1
    });

    const hash = await walletClient.writeContract(request);
    console.log('NFT minted successfully, transaction hash:', hash);
    
    return {
      success: true,
      transactionHash: hash,
      tokenId: null // Will be determined from transaction receipt
    };

  } catch (error) {
    console.error('Error minting NFT:', error);
    throw new Error('Failed to mint NFT: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const createCoinV4 = async (params: CreateCoinParams) => {
  try {
    if (!creatorClient || !walletClient) {
      throw new Error('Zora clients not initialized. Please connect wallet first.');
    }

    console.log('Creating CoinV4 token on Zora:', params);

    // Use Zora's Coins SDK to create a new CoinV4 token
    const { request } = await creatorClient.create1155({
      contract: {
        name: params.name,
        uri: params.imageURI,
      },
      token: {
        tokenMetadataURI: JSON.stringify({
          name: params.name,
          description: params.description,
          image: params.imageURI,
          attributes: [
            {
              trait_type: "Creator",
              value: params.creatorAddress
            },
            {
              trait_type: "Type",
              value: "Mystery Box Coin"
            }
          ]
        })
      },
      account: params.creatorAddress as `0x${string}`
    });

    const hash = await walletClient.writeContract(request);
    console.log('CoinV4 created successfully, transaction hash:', hash);
    
    return {
      success: true,
      transactionHash: hash,
      coinAddress: null // Will be determined from transaction receipt
    };

  } catch (error) {
    console.error('Error creating CoinV4:', error);
    throw new Error('Failed to create CoinV4: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getTokenDetails = async (contractAddress: string, tokenId: string) => {
  try {
    // Get token details from Zora API
    const response = await fetch(`https://api.zora.co/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetToken($address: String!, $tokenId: String!) {
            token(where: {address: $address, tokenId: $tokenId}) {
              tokenId
              tokenUrl
              metadata
              mintInfo {
                mintContext {
                  blockNumber
                  transactionHash
                }
              }
            }
          }
        `,
        variables: {
          address: contractAddress,
          tokenId: tokenId
        }
      })
    });

    const data = await response.json();
    return data.data?.token;

  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
};

export const createZoraDrop = async (params: {
  name: string;
  symbol: string;
  description: string;
  imageURI: string;
  creatorAddress: string;
}) => {
  try {
    if (!creatorClient || !walletClient) {
      throw new Error('Zora clients not initialized. Please connect wallet first.');
    }

    console.log('Creating Zora Drop collection:', params);

    const { request } = await creatorClient.createContract({
      contract: {
        name: params.name,
        uri: params.imageURI,
      },
      account: params.creatorAddress as `0x${string}`,
      contractType: "ERC721Drop"
    });

    const hash = await walletClient.writeContract(request);
    console.log('Zora Drop created successfully, transaction hash:', hash);
    
    return {
      success: true,
      transactionHash: hash,
      contractAddress: null // Will be determined from transaction receipt
    };

  } catch (error) {
    console.error('Error creating Zora Drop:', error);
    throw new Error('Failed to create Zora Drop: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Helper function to get contract address from transaction receipt
export const getContractAddressFromTx = async (txHash: string) => {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
    return receipt.contractAddress;
  } catch (error) {
    console.error('Error getting contract address:', error);
    return null;
  }
};
