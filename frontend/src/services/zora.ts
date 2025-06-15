    // frontend/src/services/zora.ts
    import { ZDK } from "@zoralabs/zdk";
    import { createPublicClient, http, type PublicClient, type WalletClient, type Address } from 'viem';
    import { zoraSepolia } from '../utils/zora-config';

    // Initialize ZDK for general Zora data (if still needed, might be redundant with new SDKs)
    const zdk = new ZDK({
      // apiToken: process.env.REACT_APP_ZORA_API_KEY, // Consider if hitting rate limits from Zora's API
    });

    // Create Viem Public Client for read operations
    const publicClient: PublicClient = createPublicClient({
      chain: zoraSepolia,
      transport: http(zoraSepolia.rpcUrls.default.http[0]),
    });

    // Placeholder types for the Zora SDKs that we'll use when the correct packages are available
interface CoinCreateParams {
  name: string;
  symbol: string;
  initialSupply: bigint;
  createReferral: Address;
  initialTokenUri: string;
  mintRecipient: Address;
  tokenURI: string;
  publicSalePrice: bigint;
  presalePrice: bigint;
  maxSupply: bigint;
  maxPerWallet: bigint;
  fundsRecipient: Address;
}

interface TradeCoinParams {
  coinAddress: Address;
  quantity: bigint;
  value: bigint;
  recipient: Address;
  referral: Address;
}

interface MintParams {
  tokenContract: Address;
  tokenURI: string;
  quantity: bigint;
  minter: Address;
  mintReferral: Address;
}

interface CoinsClient {
  createCoin: {
    prepare: (params: CoinCreateParams) => Promise<{ request: unknown }>;
  };
  tradeCoin: {
    prepare: (params: TradeCoinParams) => Promise<{ request: unknown }>;
  };
  getOnchainCoinDetails: (params: { coinAddress: Address }) => Promise<{
    name: string;
    symbol: string;
    tokenUri: string;
    creator: Address;
  }>;
  getOnchainSaleDetails: (params: { coinAddress: Address }) => Promise<{
    publicSalePrice: bigint;
    maxSupply: bigint;
    maxPerWallet: bigint;
    fundsRecipient: Address;
  }>;
  getCoinCreateFromLogs: (params: { transactionReceipt: unknown }) => Promise<{ coin?: Address }>;
  walletClient?: WalletClient;
}

interface MintClient {
  mint: (params: MintParams) => Promise<{ request: unknown }>;
  walletClient?: WalletClient;
}

    // Mock clients for now - these will be replaced when the correct SDKs are properly configured
const createMockCoinsClient = (walletClient?: WalletClient | null): CoinsClient => ({
  createCoin: {
    prepare: async () => {
      throw new Error("Zora Coins SDK not properly configured. Please check your dependencies.");
    }
  },
  tradeCoin: {
    prepare: async (_params: TradeCoinParams) => {
      throw new Error("Zora Coins SDK not properly configured. Please check your dependencies.");
    }
  },
  getOnchainCoinDetails: async (_params: { coinAddress: Address }) => {
    throw new Error("Zora Coins SDK not properly configured. Please check your dependencies.");
  },
  getOnchainSaleDetails: async (_params: { coinAddress: Address }) => {
    throw new Error("Zora Coins SDK not properly configured. Please check your dependencies.");
  },
  getCoinCreateFromLogs: async (_params: { transactionReceipt: unknown }) => {
    throw new Error("Zora Coins SDK not properly configured. Please check your dependencies.");
  },
  walletClient: walletClient || undefined
});

const createMockMintClient = (walletClient?: WalletClient | null): MintClient => ({
  mint: async (_params: MintParams) => {
    throw new Error("Zora Protocol SDK not properly configured. Please check your dependencies.");
  },
  walletClient: walletClient || undefined
});

    // Create Zora Coins Client
    let coinsClientInstance: CoinsClient | null = null;
    export const getCoinsClient = (walletClient?: WalletClient | null): CoinsClient => {
      // Re-initialize if no client or a new walletClient is provided (useful when wallet changes)
      if (!coinsClientInstance || (walletClient && coinsClientInstance.walletClient !== walletClient)) {
        coinsClientInstance = createMockCoinsClient(walletClient);
      }
      return coinsClientInstance;
    };

    // Create Zora Mint Client
    let mintClientInstance: MintClient | null = null;
    export const getMintClient = (walletClient?: WalletClient | null): MintClient => {
        // Re-initialize if no client or a new walletClient is provided
        if (!mintClientInstance || (walletClient && mintClientInstance.walletClient !== walletClient)) {
            mintClientInstance = createMockMintClient(walletClient);
        }
        return mintClientInstance;
    };


    // --- Zora CoinV4 Specific Functions ---

    /**
     * Creates a new Zora CoinV4 ERC20 token.
     * @param walletClient The Viem WalletClient for the connected user.
     * @param name The name of the coin (e.g., "Part 1 of Urashima Story").
     * @param symbol The symbol of the coin (e.g., "URSMBOX").
     * @param contentURI IPFS URI pointing to the content (story part, image, etc.).
     * @param mintRecipient The address to receive the initial mint of the coin.
     * @returns The transaction hash and a placeholder for the coin address.
     */
    export const createZoraCoin = async (
      walletClient: WalletClient,
      name: string,
      symbol: string,
      contentURI: string,
      mintRecipient: Address
    ): Promise<{ txHash: string; coinAddress: Address }> => {
      const client = getCoinsClient(walletClient);
      if (!client) throw new Error("Coins client not initialized with wallet.");
      if (!walletClient.account?.address) throw new Error("Wallet client account not available.");

      try {
        const { request } = await client.createCoin.prepare({
          name,
          symbol,
          // Use realistic initial supply (e.g., 1 billion tokens, 10^18 multiplier for 18 decimals)
          initialSupply: BigInt(1_000_000_000) * (BigInt(10) ** BigInt(18)),
          createReferral: '0x0000000000000000000000000000000000000000',
          initialTokenUri: contentURI,
          mintRecipient,
          tokenURI: contentURI,
          publicSalePrice: 1_000_000_000_000_000n, // Example: 0.001 ETH price to mint each coin
          presalePrice: 1_000_000_000_000_000n,
          maxSupply: BigInt(10_000_000_000) * (BigInt(10) ** BigInt(18)), // Max supply for this specific coin
          maxPerWallet: BigInt(1_000_000_000) * (BigInt(10) ** BigInt(18)), // Max purchase per wallet for this coin
          fundsRecipient: walletClient.account.address,
        });

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash });

        // Getting the exact coin address from createCoin transaction:
        // This requires decoding the `NewCoin` event from the Zora Factory contract.
        const coinDeployment = await client.getCoinCreateFromLogs({ 
          transactionReceipt: await publicClient.waitForTransactionReceipt({ hash }) 
        });
        const createdCoinAddress = coinDeployment?.coin || '0x0000000000000000000000000000000000000000';

        return { txHash: hash, coinAddress: createdCoinAddress as Address };
      } catch (error) {
        console.error("Error creating Zora Coin:", error);
        throw error;
      }
    };

    /**
     * Buys/trades a Zora CoinV4 ERC20 token.
     * @param walletClient The Viem WalletClient for the connected user.
     * @param coinAddress The address of the CoinV4 ERC20 token to buy.
     * @param quantity The amount of tokens to buy (as bigint, with decimals).
     * @param ethAmount The ETH value to send for the purchase (as bigint).
     * @returns The transaction hash.
     */
    export const tradeZoraCoin = async (
      walletClient: WalletClient,
      coinAddress: Address,
      quantity: bigint,
      ethAmount: bigint
    ): Promise<{ txHash: string }> => {
      const client = getCoinsClient(walletClient);
      if (!client) throw new Error("Coins client not initialized with wallet.");
      if (!walletClient.account?.address) throw new Error("Wallet client account not available.");

      try {
        const { request } = await client.tradeCoin.prepare({
          coinAddress,
          quantity,
          value: ethAmount,
          recipient: walletClient.account.address,
          referral: '0x0000000000000000000000000000000000000000',
        });

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash });
        return { txHash: hash };
      } catch (error) {
        console.error("Error trading Zora Coin:", error);
        throw error;
      }
    };

    /**
     * Fetches details for a specific Zora CoinV4 token.
     * @param coinAddress The address of the CoinV4 ERC20 token.
     * @returns Detailed information about the coin including sale config.
     */
    export const fetchZoraCoinDetails = async (coinAddress: Address) => {
      const client = getCoinsClient(); // No walletClient needed for read
      if (!client) throw new Error("Coins client not initialized.");

      try {
        const details = await client.getOnchainCoinDetails({ coinAddress });
        const coinConfig = await client.getOnchainSaleDetails({
            coinAddress: coinAddress as Address,
        });
        // Combine all relevant details for convenience
        return {
            address: coinAddress,
            name: details.name,
            symbol: details.symbol,
            tokenURI: details.tokenUri,
            creator: details.creator,
            publicSalePrice: coinConfig.publicSalePrice,
            maxSupply: coinConfig.maxSupply,
            maxPerWallet: coinConfig.maxPerWallet,
            fundsRecipient: coinConfig.fundsRecipient,
            // You can add more fields from `details` or `coinConfig` as needed
        };
      } catch (error) {
        console.error("Error fetching Zora Coin details:", error);
        throw error;
      }
    };


    // --- Zora Meme NFT Minting Function ---

    interface NftMetadata {
        name: string;
        description: string;
        image: string; // IPFS URI to the image
        attributes?: { trait_type: string; value: string | number; }[];
    }

    /**
     * Mints an NFT into a pre-existing Zora ERC721Drop collection.
     * @param walletClient The Viem WalletClient for the connected user.
     * @param nftCollectionAddress The address of the Zora ERC721Drop contract.
     * @param metadataUri IPFS URI pointing to the NFT metadata JSON.
     * @param quantity The number of NFTs to mint (usually 1 for unique memes).
     * @returns The transaction hash.
     */
    export const mintMemeNFT = async (
      walletClient: WalletClient,
      nftCollectionAddress: Address,
      metadataUri: string,
      quantity: bigint
    ): Promise<{ txHash: string }> => {
      const client = getMintClient(walletClient);
      if (!client) throw new Error("Mint client not initialized with wallet.");
      if (!walletClient.account?.address) throw new Error("Wallet client account not available.");
      if (!nftCollectionAddress || nftCollectionAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error("NFT collection address is not configured in zora-config.ts.");
      }

      try {
        // Minting into a Zora ERC721Drop means calling its `mint` or `purchase` function.
        const { request } = await client.mint({
          tokenContract: nftCollectionAddress,
          tokenURI: metadataUri,
          quantity,
          minter: walletClient.account.address, // The address receiving the NFT
          mintReferral: '0x0000000000000000000000000000000000000000', // Optional: your platform's referral address
          // If the collection requires a payment, add `value: price * quantity` here.
          // This example assumes a free mint collection or price handled by the collection contract.
        });

        const hash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash });
        return { txHash: hash };
      } catch (error) {
        console.error("Error minting Meme NFT:", error);
        throw error;
      }
    };

    // Export the ZDK instance for other uses
    export { zdk };
    