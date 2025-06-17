import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import useContracts from '../hooks/useContracts';

interface Meme {
  id: number;
  creator: string;
  ipfsHash: string;
  storyProtocolIPId: string;
  votes: number;
  submissionTime: number;
  exists: boolean;
  metadata?: {
    name: string;
    description: string;
    image: string;
  };
}

// Create data URL placeholders to avoid DNS issues
const createPlaceholderImage = (color: string, text: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="${color}"/>
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" dy="0.35em" fill="white" stroke="black" stroke-width="1">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const fallbackImage = createPlaceholderImage('#CCCCCC', 'Image Not Found');
const loadingImage = createPlaceholderImage('#E0E0E0', 'Loading...');

const ExploreMemes: React.FC = () => {
  const { isConnected } = useAccount();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingMeme, setVotingMeme] = useState<number | null>(null);

  const {
    voteForMeme,
    getContestResults,
    isPending,
    isConfirming,
    isConfirmed,
    error
  } = useContracts();

  const { data: contestResults } = getContestResults();

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        // This would be replaced with actual contract calls to get memes
        const mockMemes: Meme[] = [
          {
            id: 1,
            creator: '0x1234567890123456789012345678901234567890',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            storyProtocolIPId: 'story_123',
            votes: 42,
            submissionTime: Date.now() - 86400000,
            exists: true,
            metadata: {
              name: 'Doge to the Moon',
              description: 'Classic Doge meme with a crypto twist',
              image: createPlaceholderImage('#FFD700', '🐕 Doge Meme')
            }
          },
          {
            id: 2,
            creator: '0x2345678901234567890123456789012345678901',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
            storyProtocolIPId: 'story_124',
            votes: 35,
            submissionTime: Date.now() - 43200000,
            exists: true,
            metadata: {
              name: 'Pepe Trading NFTs',
              description: 'Pepe discovering the world of NFT trading',
              image: createPlaceholderImage('#00FF00', '🐸 Pepe NFT')
            }
          },
          {
            id: 3,
            creator: '0x3456789012345678901234567890123456789012',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
            storyProtocolIPId: 'story_125',
            votes: 28,
            submissionTime: Date.now() - 21600000,
            exists: true,
            metadata: {
              name: 'Wojak DeFi Emotions',
              description: 'The emotional journey of DeFi investing',
              image: createPlaceholderImage('#FF6B6B', '😱 Wojak DeFi')
            }
          }
        ];

        setMemes(mockMemes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching memes:', error);
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  const handleVote = async (memeId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }

    try {
      setVotingMeme(memeId);
      await voteForMeme(memeId);
      
      // Update local state to reflect the vote
      setMemes(prevMemes => 
        prevMemes.map(meme => 
          meme.id === memeId 
            ? { ...meme, votes: meme.votes + 1 }
            : meme
        )
      );
    } catch (error) {
      console.error('Voting failed:', error);
    } finally {
      setVotingMeme(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading memes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Explore Memes</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover trending memes, vote for your favorites, and help decide the next viral sensation!
        </p>
      </div>

      {/* Contest Results */}
      {contestResults && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-bold mb-2">🏆 Contest Results</h2>
          <p>Winning Meme ID: {String(contestResults[0] || 'N/A')}</p>
          <p>Winner: {String(contestResults[1] || 'N/A')}</p>
          <p>Total Votes: {String(contestResults[2] || 'N/A')}</p>
        </div>
      )}

      {/* Memes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {memes.map((meme) => (
          <div key={meme.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-square relative">
              <img
                src={meme.metadata?.image || loadingImage}
                alt={meme.metadata?.name || 'Meme'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImage;
                }}
              />
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
                #{meme.id}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {meme.metadata?.name || `Meme #${meme.id}`}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {meme.metadata?.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  <p>Creator: {meme.creator.slice(0, 6)}...{meme.creator.slice(-4)}</p>
                  <p>{formatTimeAgo(meme.submissionTime)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{meme.votes}</div>
                  <div className="text-sm text-gray-500">votes</div>
                </div>
              </div>
              
              <button
                onClick={() => handleVote(meme.id)}
                disabled={!isConnected || votingMeme === meme.id || isPending || isConfirming}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {votingMeme === meme.id 
                  ? 'Voting...' 
                  : isConnected 
                    ? '👍 Vote for this Meme' 
                    : 'Connect Wallet to Vote'
                }
              </button>
              
              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>IPFS: {meme.ipfsHash.slice(0, 8)}...</span>
                  <span>Story: {meme.storyProtocolIPId.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {memes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Memes Yet</h2>
          <p className="text-gray-600 mb-6">Be the first to submit a meme to the contest!</p>
          <a 
            href="/create-meme" 
            className="inline-block bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Create Your First Meme
          </a>
        </div>
      )}

      {/* Transaction Status */}
      {isPending && (
        <div className="fixed bottom-4 right-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg shadow-lg">
          <p>Vote submitted. Waiting for confirmation...</p>
        </div>
      )}

      {isConfirming && (
        <div className="fixed bottom-4 right-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg shadow-lg">
          <p>Vote confirming...</p>
        </div>
      )}

      {isConfirmed && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg">
          <p>Vote confirmed! 🎉</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg max-w-sm">
          <p>Error: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      )}

      {!isConnected && (
        <div className="fixed bottom-4 left-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg shadow-lg">
          <p>💡 Connect your wallet to vote for memes!</p>
        </div>
      )}
    </div>
  );
};

export default ExploreMemes;
