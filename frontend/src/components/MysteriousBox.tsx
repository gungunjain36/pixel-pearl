import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createZoraCoin } from '../services/zora';
import { uploadToIpfs } from '../services/ipfs';

interface MysteriousBoxProps {
  content?: string;
  contentType?: 'image' | 'text' | 'video';
  isRevealed?: boolean;
  onReveal?: () => void;
}

const MysteriousBox: React.FC<MysteriousBoxProps> = ({
  content,
  contentType = 'text',
  isRevealed = false,
  onReveal
}) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [coinName, setCoinName] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('');

  const handleReveal = () => {
    if (onReveal) {
      onReveal();
    }
  };

  const handleCreateCoin = async () => {
    if (!walletClient || !isConnected || !content) {
      setStatus('Please connect your wallet and ensure content is available');
      return;
    }

    if (!coinName || !coinSymbol) {
      setStatus('Please enter coin name and symbol');
      return;
    }

    try {
      setLoading(true);
      setStatus('Creating coin from mysterious content...');

      // Upload content to IPFS
      const ipfsHash = await uploadToIpfs(content);
      const contentURI = `ipfs://${ipfsHash}`;

      // Create Zora Coin
      const result = await createZoraCoin(
        walletClient,
        coinName,
        coinSymbol,
        contentURI,
        address!
      );

      setStatus(`Successfully created coin! TX: ${result.txHash}, Address: ${result.coinAddress}`);
    } catch (error) {
      console.error('Error creating coin:', error);
      setStatus(`Error creating coin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-lg p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center">🎁 Mysterious Box</h2>
        
        <div className="relative mb-8">
          {!isRevealed ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-12 text-center border-4 border-dashed border-purple-400">
              <div className="text-8xl mb-4">📦</div>
              <p className="text-xl mb-6">Something mysterious awaits inside...</p>
              <button
                onClick={handleReveal}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔓 Reveal Mystery
              </button>
            </div>
          ) : (
            <div className="bg-white text-gray-800 rounded-lg p-8 text-center border-4 border-gold">
              <div className="mb-4">
                <span className="text-4xl">✨</span>
                <h3 className="text-2xl font-bold text-purple-600 mt-2">Mystery Revealed!</h3>
              </div>
              
              {contentType === 'image' && content && (
                <img 
                  src={content} 
                  alt="Mysterious content" 
                  className="max-w-full h-auto rounded-lg mb-4 mx-auto"
                />
              )}
              
              {contentType === 'text' && content && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-lg">{content}</p>
                </div>
              )}
              
              {contentType === 'video' && content && (
                <video 
                  src={content} 
                  controls 
                  className="max-w-full h-auto rounded-lg mb-4 mx-auto"
                />
              )}

              {!content && (
                <div className="bg-gray-100 p-8 rounded-lg mb-4">
                  <p className="text-lg text-gray-600">
                    🎭 Your mysterious content will appear here...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {isRevealed && isConnected && (
          <div className="bg-white text-gray-800 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">💎 Coin This Mystery</h3>
            <p className="text-gray-600 mb-4">
              Transform this mysterious content into a tradeable Zora CoinV4 token!
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coin Name
                </label>
                <input
                  type="text"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  placeholder="e.g., Mystery Meme #1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coin Symbol
                </label>
                <input
                  type="text"
                  value={coinSymbol}
                  onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., MM1"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <button
                onClick={handleCreateCoin}
                disabled={loading || !coinName || !coinSymbol}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {loading ? 'Creating Coin...' : '🚀 Create Coin'}
              </button>
            </div>
          </div>
        )}

        {!isConnected && isRevealed && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-6 rounded">
            <p className="font-bold">Connect Your Wallet</p>
            <p>Connect your wallet to transform this mystery into a tradeable coin!</p>
          </div>
        )}

        {status && (
          <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-md">
            <p className="text-blue-800 text-sm">{status}</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 How Mysterious Boxes Work</h3>
        <div className="space-y-3 text-gray-600">
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 font-bold">1.</span>
            <p>Click "Reveal Mystery" to uncover the hidden content inside the box</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 font-bold">2.</span>
            <p>Once revealed, you can "coin" the content into a Zora CoinV4 ERC20 token</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 font-bold">3.</span>
            <p>Your coined content becomes tradeable on the mystery coins market</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MysteriousBox;
