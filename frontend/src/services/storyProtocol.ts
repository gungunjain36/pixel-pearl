    // frontend/src/services/storyProtocol.ts
    import { StoryClient } from '@story-protocol/core-sdk';
    import { http } from 'viem'; // Use viem's http transport
    import { zoraSepolia } from '../utils/zora-config';
    import { WalletClient } from 'viem';

    // Initialize Story Protocol Client
    // Note: Story Protocol SDK might need specific RPC URLs or a signer
    const client = StoryClient.create({
        chainId: zoraSepolia.id,
        transport: http(zoraSepolia.rpcUrls.default.http[0])
    });

    export const registerIP = async (
      walletClient: WalletClient, // Use Viem WalletClient as signer
      name: string, // Name for the IP Asset
      description: string, // Description for the IP Asset
      ipfsHash: string, // IPFS URI for content
    ): Promise<string> => {
      try {
        // You MUST replace this with your actual IP Asset Type ID.
        // This is configured on Story Protocol itself for your project.
        // Example: "0x..." or a specific enum/string from your Story Protocol setup.
        // Check Story Protocol documentation for how to get/define your IP Asset Type.
        const ipAssetType = "0xYourStoryProtocolIPAssetTypeID"; // <--- REPLACE THIS

        // The signer should be the `account` from the Viem WalletClient
        const signerAddress = walletClient.account.address;

        const createIpResponse = await client.ipAsset.register({
          signer: walletClient, // Pass the Viem WalletClient directly
          params: {
            ipAssetType: ipAssetType,
            name: name,
            description: description,
            uri: ipfsHash, // Link to the IPFS content
            owner: signerAddress, // Owner of the IP
            // metadata: {}, // Optional metadata
          },
        });

        console.log("Story Protocol IP registration response:", createIpResponse);

        const ipId = createIpResponse.ipAssetId;
        if (!ipId) {
          console.warn("Could not directly extract IP ID from Story Protocol response. You might need to query it or parse tx receipt.");
          return createIpResponse.txHash || `pending-ip-${Date.now()}`;
        }

        return ipId; // This is the ID you'll store on your smart contract
      } catch (error) {
        console.error("Error registering IP with Story Protocol:", error);
        throw error;
      }
    };
    