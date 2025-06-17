import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface CoinToken {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  creator: string;
  totalSupply: string;
  currentPrice: string;
  marketCap: string;
  volume24h: string;
  description: string;
  imageUrl: string;
  originalMysteryBoxId: number;
  createdAt: string;
}

const CoinContent: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [coins, setCoins] = useState<CoinToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinToken | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  // Mock data for demonstration
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        // This would be replaced with actual blockchain calls
        const mockCoins: CoinToken[] = [
          {
            id: '1',
            name: 'Doge Moon Coin',
            symbol: 'DMOON',
            contractAddress: '0x1234567890123456789012345678901234567890',
            creator: '0x1234567890123456789012345678901234567890',
            totalSupply: '1000000',
            currentPrice: '0.025',
            marketCap: '25000',
            volume24h: '5420',
            description: 'The classic Doge meme transformed into a tradeable digital asset',
            imageUrl: 'https://via.placeholder.com/300x300/FFD700/000000?text=DOGE+MOON',
            originalMysteryBoxId: 1,
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Pepe NFT Coin',
            symbol: 'PNFT',
            contractAddress: '0x2345678901234567890123456789012345678901',
            creator: '0x2345678901234567890123456789012345678901',
            totalSupply: '500000',
            currentPrice: '0.045',
            marketCap: '22500',
            volume24h: '3280',
            description: 'Pepe exploring the NFT universe as a collectible coin',
            imageUrl: 'https://via.placeholder.com/300x300/00FF00/000000?text=PEPE+NFT',
            originalMysteryBoxId: 2,
            createdAt: '2024-01-16T14:45:00Z'
          },
          {
            id: '3',
            name: 'Wojak DeFi Coin',
            symbol: 'WDEFI',
            contractAddress: '0x3456789012345678901234567890123456789012',
            creator: address || '0x3456789012345678901234567890123456789012',
            totalSupply: '750000',
            currentPrice: '0.032',
            marketCap: '24000',
            volume24h: '4150',
            description: 'The emotional rollercoaster of DeFi investing immortalized',
            imageUrl: 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=WOJAK',
            originalMysteryBoxId: 4,
            createdAt: '2024-01-17T09:15:00Z'
          }
        ];

        setCoins(mockCoins);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coins:', error);
        setLoading(false);
      }
    };

    fetchCoins();
  }, [address]);

  const handleTrade = async (coin: CoinToken) => {
    if (!isConnected) {
      alert('Please connect your wallet to trade');
      return;
    }

    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      alert('Please enter a valid trade amount');
      return;
    }

    try {
      console.log(`${tradeType === 'buy' ? 'Buying' : 'Selling'} ${tradeAmount} ${coin.symbol}`);
      
      // This would integrate with actual DEX/trading protocol
      alert(`${tradeType === 'buy' ? 'Buy' : 'Sell'} order submitted for ${tradeAmount} ${coin.symbol}!`);
      
      setTradeAmount('');
      setSelectedCoin(null);
    } catch (error) {
      console.error('Trade failed:', error);
      alert('Trade failed. Please try again.');
    }
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(4);
  };

  const formatMarketCap = (marketCap: string) => {
    const value = parseFloat(marketCap);
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const isOwnedByUser = (creator: string) => {
    return address && creator.toLowerCase() === address.toLowerCase();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🪙 Pixel Pearl Coin Exchange</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Trade CoinV4 tokens created from mystery box content. Each coin represents a unique piece of digital culture.
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">{coins.length}</div>
          <div className="text-sm opacity-90">Active Coins</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">
            {formatMarketCap(
              coins.reduce((total, coin) => total + parseFloat(coin.marketCap), 0).toString()
            )}
          </div>
          <div className="text-sm opacity-90">Total Market Cap</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">
            {formatMarketCap(
              coins.reduce((total, coin) => total + parseFloat(coin.volume24h), 0).toString()
            )}
          </div>
          <div className="text-sm opacity-90">24h Volume</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">{coins.filter(coin => isOwnedByUser(coin.creator)).length}</div>
          <div className="text-sm opacity-90">Your Coins</div>
        </div>
      </div>

      {/* Coins Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Volume
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coins.map((coin) => (
                <tr key={coin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={coin.imageUrl}
                        alt={coin.name}
                        className="h-12 w-12 rounded-full mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/48x48/CCCCCC/000000?text=' + coin.symbol;
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {coin.name}
                          {isOwnedByUser(coin.creator) && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              YOUR COIN
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${formatPrice(coin.currentPrice)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatMarketCap(coin.marketCap)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatMarketCap(coin.volume24h)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedCoin(coin)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-2"
                    >
                      Trade
                    </button>
                    <button
                      onClick={() => window.open(`https://etherscan.io/address/${coin.contractAddress}`, '_blank')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      View Contract
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {coins.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🪙</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Coins Available</h2>
          <p className="text-gray-600 mb-6">No mystery boxes have been converted to coins yet.</p>
          <a 
            href="/mystery-coins" 
            className="inline-block bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Explore Mystery Boxes
          </a>
        </div>
      )}

      {/* Trading Modal */}
      {selectedCoin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Trade {selectedCoin.symbol}</h3>
                             <button
                 onClick={() => setSelectedCoin(null)}
                 className="text-gray-500 hover:text-gray-700"
                 title="Close"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>

            <div className="mb-6">
              <img
                src={selectedCoin.imageUrl}
                alt={selectedCoin.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h4 className="text-xl font-semibold text-center">{selectedCoin.name}</h4>
              <p className="text-gray-600 text-center text-sm mt-2">{selectedCoin.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    tradeType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({selectedCoin.symbol})
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Current Price:</span>
                  <span>${formatPrice(selectedCoin.currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Total:</span>
                  <span>
                    ${tradeAmount ? (parseFloat(tradeAmount) * parseFloat(selectedCoin.currentPrice)).toFixed(4) : '0.0000'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedCoin(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTrade(selectedCoin)}
                  disabled={!isConnected || !tradeAmount}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isConnected ? `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedCoin.symbol}` : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="fixed bottom-4 left-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg shadow-lg">
          <p>💡 Connect your wallet to trade coins!</p>
        </div>
      )}
    </div>
  );
};

export default CoinContent;
