    // frontend/src/components/ExploreMysteryCoins.tsx
    import React, { useState } from 'react';
    import { useAccount, useWalletClient } from 'wagmi';
    import { fetchZoraCoinDetails, tradeZoraCoin } from '../services/zora';
    import { Address, parseEther } from 'viem';
    import { formatEther } from 'ethers';

    interface ZoraCoinData {
      address: Address;
      name: string;
      symbol: string;
      tokenURI: string;
      creator: Address;
      pricePerToken: bigint;
      maxSupply: bigint;
      maxPerWallet: bigint;
      fundsRecipient: Address;
    }

    const ExploreMysteryCoins: React.FC = () => {
      const { address, isConnected } = useAccount();
      const { data: walletClient } = useWalletClient();
      const [coinAddressInput, setCoinAddressInput] = useState<string>('');
      const [selectedCoin, setSelectedCoin] = useState<ZoraCoinData | null>(null);
      const [quantityToBuy, setQuantityToBuy] = useState<string>('1');
      const [status, setStatus] = useState('');
      const [txHash, setTxHash] = useState<string | null>(null);

      const handleFetchCoinDetails = async () => {
        if (!coinAddressInput) {
          setStatus("Please enter a coin address.");
          return;
        }
        try {
          setStatus("Fetching coin details...");
          const details = await fetchZoraCoinDetails(coinAddressInput as Address);
          setSelectedCoin(details);
          setStatus("Coin details fetched!");
        } catch (error) {
          console.error("Error fetching coin details:", error);
          setStatus(`Error fetching coin details: ${error instanceof Error ? error.message : String(error)}`);
          setSelectedCoin(null);
        }
      };

      const handleBuyCoin = async () => {
        if (!isConnected || !walletClient || !selectedCoin || !quantityToBuy || parseFloat(quantityToBuy) <= 0) {
          setStatus("Please connect your wallet, select a coin, and enter a valid quantity.");
          return;
        }
        if (selectedCoin.pricePerToken === 0n) {
          setStatus("This coin appears to have a free mint, or price not loaded. Proceeding without ETH value.");
        }


        setStatus(`Buying ${quantityToBuy} of ${selectedCoin.symbol}...`);
        try {
          const quantityBigInt = BigInt(parseFloat(quantityToBuy));
          // Multiply quantity by 10^18 if the token has 18 decimals and quantity is a raw integer
          // Assuming `quantityToBuy` is a whole number here. If not, use parseUnits.
          const quantityWithDecimals = quantityBigInt * BigInt(10)**18; // Assuming CoinV4 has 18 decimals

          const totalEthAmount = selectedCoin.pricePerToken * quantityBigInt; // Total ETH needed for raw quantity

          const { txHash: tradeTxHash } = await tradeZoraCoin(
            walletClient,
            selectedCoin.address,
            quantityWithDecimals,
            totalEthAmount
          );

          setTxHash(tradeTxHash);
          setStatus(`Successfully bought ${quantityToBuy} ${selectedCoin.symbol}! Tx Hash: ${tradeTxHash}`);
        } catch (error) {
          console.error("Error buying coin:", error);
          setStatus(`Error buying coin: ${error instanceof Error ? error.message : String(error)}`);
          setTxHash(null);
        }
      };

      return (
        <div className="explore-mystery-coins">
          <h2>Explore Mysterious Box Coins</h2>
          <p>Enter a Zora CoinV4 address to view and buy "Mystery Box" content tokens.</p>

          <div className="form-group">
            <label htmlFor="coin-address-input">Coin Address:</label>
            <input
              type="text"
              id="coin-address-input"
              value={coinAddressInput}
              onChange={(e) => setCoinAddressInput(e.target.value)}
              placeholder="0x..."
            />
            <button onClick={handleFetchCoinDetails} disabled={!coinAddressInput}>
              Fetch Coin Details
            </button>
          </div>

          {selectedCoin && (
            <div className="coin-details-card">
              <h3>{selectedCoin.name} ({selectedCoin.symbol})</h3>
              <p>Address: {selectedCoin.address}</p>
              <p>Creator: {selectedCoin.creator.substring(0,6)}...{selectedCoin.creator.slice(-4)}</p>
              <p>Content: <a href={selectedCoin.tokenURI} target="_blank" rel="noopener noreferrer">View Content</a></p>
              <p>Price per Token: {formatEther(selectedCoin.pricePerToken)} ETH</p>
              <p>Max Supply: {selectedCoin.maxSupply.toString()}</p>
              <p>Max Per Wallet: {selectedCoin.maxPerWallet.toString()}</p>
              <p>Funds Recipient: {selectedCoin.fundsRecipient.substring(0,6)}...{selectedCoin.fundsRecipient.slice(-4)}</p>

              <div className="form-group">
                <label htmlFor="quantity-to-buy">Quantity to Buy:</label>
                <input
                  type="number"
                  id="quantity-to-buy"
                  value={quantityToBuy}
                  onChange={(e) => setQuantityToBuy(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>
              <button
                onClick={handleBuyCoin}
                disabled={!isConnected || !walletClient || parseFloat(quantityToBuy) <= 0 || !selectedCoin}
              >
                Buy Coin ({formatEther(selectedCoin.pricePerToken * BigInt(parseFloat(quantityToBuy || '0')))} ETH)
              </button>
            </div>
          )}

          {status && <p className="status-message">{status}</p>}
          {txHash && (
            <p>
              Transaction Hash: <a href={`https://sepolia.explorer.zora.energy/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
            </p>
          )}
        </div>
      );
    };

    export default ExploreMysteryCoins;
    