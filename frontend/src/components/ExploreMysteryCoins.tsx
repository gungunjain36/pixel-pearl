import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import useContracts from '../hooks/useContracts';

interface MysteryBox {
  id: number;
  creator: string;
  contentType: string;
  ipfsHash: string;
  storyProtocolIPId: string;
  mintPrice: bigint;
  isRevealed: boolean;
  canBeCoined: boolean;
  coinedTokenAddress: number;
}

const ExploreMysteryCoins: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingBox, setPurchasingBox] = useState<number | null>(null);
  const [convertingBox, setConvertingBox] = useState<number | null>(null);

  const {
    purchaseMysteryBox,
    convertToCoinV4,
    formatEther,
    isPending,
    isConfirming,
    isConfirmed,
    error
  } = useContracts();

  // Mock data for demonstration
  useEffect(() => {
    const fetchMysteryBoxes = async () => {
      try {
        // This would be replaced with actual contract calls
        const mockBoxes: MysteryBox[] = [
          {
            id: 1,
            creator: '0x1234567890123456789012345678901234567890',
            contentType: 'digital_art',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            storyProtocolIPId: 'story_123',
            mintPrice: BigInt('50000000000000000000'), // 50 PEARL
            isRevealed: false,
            canBeCoined: true,
            coinedTokenAddress: 0
          },
          {
            id: 2,
            creator: '0x2345678901234567890123456789012345678901',
            contentType: 'meme',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
            storyProtocolIPId: 'story_124',
            mintPrice: BigInt('75000000000000000000'), // 75 PEARL
            isRevealed: true,
            canBeCoined: true,
            coinedTokenAddress: 0
          },
          {
            id: 3,
            creator: '0x3456789012345678901234567890123456789012',
            contentType: 'story',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
            storyProtocolIPId: 'story_125',
            mintPrice: BigInt('100000000000000000000'), // 100 PEARL
            isRevealed: false,
            canBeCoined: true,
            coinedTokenAddress: 0
          },
          {
            id: 4,
            creator: address || '0x4567890123456789012345678901234567890123',
            contentType: 'digital_art',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ',
            storyProtocolIPId: 'story_126',
            mintPrice: BigInt('120000000000000000000'), // 120 PEARL
            isRevealed: true,
            canBeCoined: true,
            coinedTokenAddress: 0
          }
        ];

        setMysteryBoxes(mockBoxes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mystery boxes:', error);
        setLoading(false);
      }
    };

    fetchMysteryBoxes();
  }, [address]);

  const handlePurchase = async (boxId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase');
      return;
    }

    try {
      setPurchasingBox(boxId);
      await purchaseMysteryBox(boxId);
      
      // Update local state
      setMysteryBoxes(prev => 
        prev.map(box => 
          box.id === boxId 
            ? { ...box, isRevealed: true }
            : box
        )
      );
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasingBox(null);
    }
  };

  const handleConvertToCoin = async (boxId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to convert');
      return;
    }

    try {
      setConvertingBox(boxId);
      await convertToCoinV4(boxId);
      
      // Update local state
      setMysteryBoxes(prev => 
        prev.map(box => 
          box.id === boxId 
            ? { ...box, canBeCoined: false, coinedTokenAddress: 1 }
            : box
        )
      );
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setConvertingBox(null);
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'meme': return '😂';
      case 'digital_art': return '🎨';
      case 'story': return '📚';
      case 'music': return '🎵';
      default: return '📦';
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'meme': return 'from-yellow-400 to-orange-500';
      case 'digital_art': return 'from-purple-400 to-pink-500';
      case 'story': return 'from-blue-400 to-indigo-500';
      case 'music': return 'from-green-400 to-teal-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const isOwnedByUser = (creator: string) => {
    return address && creator.toLowerCase() === address.toLowerCase();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mystery boxes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Mystery Coin Collection</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover hidden digital treasures! Purchase mystery boxes to reveal exclusive content and convert them to tradeable coins.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">{mysteryBoxes.length}</div>
          <div className="text-sm opacity-90">Total Boxes</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">{mysteryBoxes.filter(box => box.isRevealed).length}</div>
          <div className="text-sm opacity-90">Revealed</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">{mysteryBoxes.filter(box => !box.isRevealed).length}</div>
          <div className="text-sm opacity-90">Mysterious</div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-red-600 text-white p-6 rounded-lg text-center">
          <div className="text-3xl font-bold">{mysteryBoxes.filter(box => box.coinedTokenAddress > 0).length}</div>
          <div className="text-sm opacity-90">Coined</div>
        </div>
      </div>

      {/* Mystery Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mysteryBoxes.map((box) => (
          <div key={box.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
            <div className={`h-48 bg-gradient-to-br ${getContentTypeColor(box.contentType)} flex items-center justify-center relative`}>
              {box.isRevealed ? (
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">{getContentTypeIcon(box.contentType)}</div>
                  <div className="text-lg font-semibold">REVEALED</div>
                  <div className="text-sm opacity-90">Content Available</div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">❓</div>
                  <div className="text-lg font-semibold">MYSTERY</div>
                  <div className="text-sm opacity-90">Purchase to Reveal</div>
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4">
                <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                  #{box.id}
                </span>
              </div>
              
              {box.coinedTokenAddress > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    🪙 COINED
                  </span>
                </div>
              )}
              
              {isOwnedByUser(box.creator) && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    OWNED
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 capitalize">
                  {box.contentType.replace('_', ' ')} Box
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{formatEther(box.mintPrice).slice(0, 6)}</div>
                  <div className="text-sm text-gray-500">PEARL</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <p>Creator: {box.creator.slice(0, 6)}...{box.creator.slice(-4)}</p>
                <p>Type: {box.contentType.replace('_', ' ')}</p>
                <p>Status: {box.isRevealed ? 'Revealed' : 'Mystery'}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {!box.isRevealed && !isOwnedByUser(box.creator) && (
                  <button
                    onClick={() => handlePurchase(box.id)}
                    disabled={!isConnected || purchasingBox === box.id || isPending || isConfirming}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {purchasingBox === box.id 
                      ? 'Purchasing...' 
                      : isConnected 
                        ? '🛒 Purchase & Reveal' 
                        : 'Connect Wallet to Purchase'
                    }
                  </button>
                )}
                
                {box.isRevealed && isOwnedByUser(box.creator) && box.canBeCoined && box.coinedTokenAddress === 0 && (
                  <button
                    onClick={() => handleConvertToCoin(box.id)}
                    disabled={!isConnected || convertingBox === box.id || isPending || isConfirming}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {convertingBox === box.id 
                      ? 'Converting...' 
                      : '🪙 Convert to Coin'
                    }
                  </button>
                )}
                
                {box.isRevealed && (
                  <button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
                    onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${box.ipfsHash}`, '_blank')}
                  >
                    🔍 View Content
                  </button>
                )}
                
                {box.coinedTokenAddress > 0 && (
                  <div className="text-center p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-yellow-800 font-semibold">🎉 Converted to Tradeable Coin!</p>
                    <p className="text-xs text-yellow-600 mt-1">This content is now a CoinV4 token</p>
                  </div>
                )}
              </div>
              
              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>IPFS: {box.ipfsHash.slice(0, 8)}...</span>
                  <span>Story: {box.storyProtocolIPId.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mysteryBoxes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Mystery Boxes Yet</h2>
          <p className="text-gray-600 mb-6">Be the first to create a mystery box!</p>
          <a 
            href="/create-meme" 
            className="inline-block bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Create Your First Mystery Box
          </a>
        </div>
      )}

      {/* Transaction Status */}
      {isPending && (
        <div className="fixed bottom-4 right-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg shadow-lg">
          <p>Transaction submitted. Waiting for confirmation...</p>
        </div>
      )}

      {isConfirming && (
        <div className="fixed bottom-4 right-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg shadow-lg">
          <p>Transaction confirming...</p>
        </div>
      )}

      {isConfirmed && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg">
          <p>Transaction confirmed! 🎉</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg max-w-sm">
          <p>Error: {error.message}</p>
        </div>
      )}

      {!isConnected && (
        <div className="fixed bottom-4 left-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg shadow-lg">
          <p>💡 Connect your wallet to interact with mystery boxes!</p>
        </div>
      )}
    </div>
  );
};

export default ExploreMysteryCoins;
