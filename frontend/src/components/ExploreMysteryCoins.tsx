/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { tradeZoraCoin } from '../services/zora';
import { parseEther } from 'viem';

interface CoinData {
  address: string;
  name: string;
  symbol: string;
  price: string;
  supply: string;
  description: string;
  image?: string;
}

const ExploreMysteryCoins: React.FC = () => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('0.001');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data - in a real app, you'd fetch this from Zora's API or subgraph
  useEffect(() => {
    const mockCoins: CoinData[] = [
      {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        name: 'Mystery Meme #1',
        symbol: 'MM1',
        price: '0.001',
        supply: '1000000',
        description: 'A mysterious meme waiting to be discovered...',
      },
      {
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        name: 'Enigma Coin',
        symbol: 'ENIGMA',
        price: '0.0015',
        supply: '500000',
        description: 'The secrets within this coin are yet to be revealed.',
      },
      {
        address: '0x9876543210fedcba9876543210fedcba98765432',
        name: 'Hidden Gem',
        symbol: 'HIDDEN',
        price: '0.002',
        supply: '250000',
        description: 'Only the brave dare to explore this hidden treasure.',
      }
    ];
    setCoins(mockCoins);
  }, []);

  const handlePurchaseCoin = async (coin: CoinData) => {
    if (!walletClient || !isConnected) {
      setStatus('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setStatus('Purchasing coin...');

      const ethAmount = parseEther(purchaseAmount);
      const quantity = BigInt(Math.floor(parseFloat(purchaseAmount) / parseFloat(coin.price) * 1e18));

      const result = await tradeZoraCoin(
        walletClient,
        coin.address as `0x${string}`,
        quantity,
        ethAmount
      );

      setStatus(`Successfully purchased ${coin.symbol}! TX: ${result.txHash}`);
    } catch (error) {
      console.error('Error purchasing coin:', error);
      setStatus(`Error purchasing coin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">🔮 Explore Mystery Coins</h1>
        <p className="text-xl">
          Discover and trade mysterious Zora CoinV4 tokens created from meme content.
          Each coin holds secrets waiting to be unlocked!
        </p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Connect Your Wallet</p>
          <p>Please connect your wallet to explore and purchase mystery coins.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coins.map((coin, index) => (
          <div
            key={coin.address}
            className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
          >
            <div className="mb-4">
              <div className="w-full h-48 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-6xl">🎭</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{coin.name}</h3>
              <p className="text-gray-600 text-sm">{coin.symbol}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold">{coin.price} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supply:</span>
                <span className="font-bold">{parseInt(coin.supply).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 text-sm mt-3">{coin.description}</p>
            </div>

            {isConnected && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handlePurchaseCoin(coin)}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Purchasing...' : `Purchase ${coin.symbol}`}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {status && (
        <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-md">
          <p className="text-blue-800">{status}</p>
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How Mystery Coins Work</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🎯 What are Mystery Coins?</h3>
            <p className="text-gray-600">
              Mystery Coins are Zora CoinV4 ERC20 tokens created from meme content. 
              Each coin represents a unique piece of content that's been "coined" on the platform.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 How to Trade</h3>
            <p className="text-gray-600">
              Purchase coins with ETH to own a piece of the mystery content. 
              The more popular a coin becomes, the more valuable it may become.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreMysteryCoins;
