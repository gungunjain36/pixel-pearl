import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import useContracts from '../hooks/useContracts';
import { CONTRACT_ADDRESSES } from '../utils/zora-config';
import { ipfsService } from '../services/ipfs';

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
    style?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  imageUrl?: string;
  isLoadingMetadata?: boolean;
}



const ExploreMemes: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingMeme, setVotingMeme] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'time' | 'creator'>('votes');
  const [currentPage, setCurrentPage] = useState(1);
  const [memesPerPage] = useState(6);

  const {
    voteForMeme,
    getContestResults,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isZoraSepolia
  } = useContracts();

  const { data: contestResults } = getContestResults();

  // Load metadata from IPFS
  const loadMemeMetadata = async (meme: Meme): Promise<Meme> => {
    if (!meme.ipfsHash || meme.metadata) {
      return meme;
    }

    try {
      const metadata = await ipfsService.getJSON(meme.ipfsHash);
      const imageUrl = metadata.image ? ipfsService.getFileUrl(metadata.image.replace('ipfs://', '')) : undefined;
      
      return {
        ...meme,
        metadata,
        imageUrl,
        isLoadingMetadata: false
      };
    } catch (error) {
      console.error(`Failed to load metadata for meme ${meme.id}:`, error);
      return {
        ...meme,
        isLoadingMetadata: false,
        imageUrl: createPlaceholderImage('#CCCCCC', `Meme #${meme.id}`)
      };
    }
  };

  // Create placeholder image
  const createPlaceholderImage = (color: string, text: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="${color}"/>
        <text x="200" y="200" font-family="Space Grotesk, Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" dy="0.35em" fill="white" stroke="black" stroke-width="1">
          ${text}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Fetch memes from contract
  useEffect(() => {
    const fetchMemes = async () => {
      if (!CONTRACT_ADDRESSES.MEME_CONTEST) {
        console.warn('⚠️ Meme Contest contract not configured. Using demo data.');
        // Use demo data when contract not configured
        const demoMemes: Meme[] = [
          {
            id: 1,
            creator: '0x1234567890123456789012345678901234567890',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            storyProtocolIPId: 'story_demo_1',
            votes: 42,
            submissionTime: Date.now() - 86400000,
            exists: true,
            metadata: {
              name: 'Doge to the Moon 🚀',
              description: 'Classic Doge meme with a crypto twist - such moon, very crypto!',
              image: 'QmDemo1',
              style: 'Classic Meme'
            },
            imageUrl: createPlaceholderImage('#FFD700', '🐕 DOGE MOON')
          },
          {
            id: 2,
            creator: '0x2345678901234567890123456789012345678901',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
            storyProtocolIPId: 'story_demo_2',
            votes: 35,
            submissionTime: Date.now() - 43200000,
            exists: true,
            metadata: {
              name: 'Pepe Trading NFTs 📈',
              description: 'Pepe discovers the world of NFT trading and goes wild!',
              image: 'QmDemo2',
              style: 'Dank Meme'
            },
            imageUrl: createPlaceholderImage('#00FF00', '🐸 PEPE NFT')
          },
          {
            id: 3,
            creator: address || '0x3456789012345678901234567890123456789012',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
            storyProtocolIPId: 'story_demo_3',
            votes: 28,
            submissionTime: Date.now() - 21600000,
            exists: true,
            metadata: {
              name: 'Wojak DeFi Emotions 😱',
              description: 'The emotional rollercoaster of DeFi investing',
              image: 'QmDemo3',
              style: 'Wholesome'
            },
            imageUrl: createPlaceholderImage('#FF6B6B', '😱 WOJAK DEFI')
          },
          {
            id: 4,
            creator: '0x4567890123456789012345678901234567890123',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ',
            storyProtocolIPId: 'story_demo_4',
            votes: 67,
            submissionTime: Date.now() - 172800000,
            exists: true,
            metadata: {
              name: 'Diamond Hands Forever 💎',
              description: 'When you hold through every dip and keep those diamond hands strong',
              image: 'QmDemo4',
              style: 'Classic Meme'
            },
            imageUrl: createPlaceholderImage('#B19CD9', '💎 DIAMOND HANDS')
          },
          {
            id: 5,
            creator: '0x5678901234567890123456789012345678901234',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdK',
            storyProtocolIPId: 'story_demo_5',
            votes: 15,
            submissionTime: Date.now() - 7200000,
            exists: true,
            metadata: {
              name: 'This is Fine (Gas Fees) 🔥',
              description: 'Everything is fine while paying $200 in gas fees',
              image: 'QmDemo5',
              style: 'Dank Meme'
            },
            imageUrl: createPlaceholderImage('#FF4444', '🔥 GAS FEES')
          }
        ];
        
        setMemes(demoMemes);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadedMemes: Meme[] = [];
        
        // Try to fetch memes starting from ID 1
        // In a real implementation, you'd have a way to get the total count
        for (let i = 1; i <= 10; i++) {
          try {
            // Since getMemeData is a hook, we need to fetch data differently
            // This would be implemented properly with a dynamic hook or state management
            console.log(`Contract fetching would happen here for meme ${i}...`);
            break; // For now, use demo data instead
          } catch (error) {
            console.warn(`No meme found with ID ${i}`);
            break; // Stop when we reach non-existent memes
          }
        }

        setMemes(loadedMemes);
        
        // Load metadata for each meme
        loadedMemes.forEach(async (meme) => {
          const memeWithMetadata = await loadMemeMetadata(meme);
          setMemes(prevMemes => 
            prevMemes.map(m => m.id === meme.id ? memeWithMetadata : m)
          );
        });

      } catch (error) {
        console.error('Error fetching memes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, [CONTRACT_ADDRESSES.MEME_CONTEST, address]);

  const handleVote = async (memeId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }

    if (!isZoraSepolia) {
      alert('Please switch to Zora Sepolia network to vote');
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
      alert(`Voting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVotingMeme(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isOwnedByUser = (creator: string) => {
    return address && creator.toLowerCase() === address.toLowerCase();
  };

  // Filter and sort memes
  const filteredMemes = memes.filter(meme =>
    meme.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meme.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meme.creator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMemes = [...filteredMemes].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'time':
        return b.submissionTime - a.submissionTime;
      case 'creator':
        return a.creator.localeCompare(b.creator);
      default:
        return b.votes - a.votes;
    }
  });

  // Pagination
  const indexOfLastMeme = currentPage * memesPerPage;
  const indexOfFirstMeme = indexOfLastMeme - memesPerPage;
  const currentMemes = sortedMemes.slice(indexOfFirstMeme, indexOfLastMeme);
  const totalPages = Math.ceil(sortedMemes.length / memesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
        {/* Animated Background */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-primary)' }}></div>
          <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-secondary)' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--neon-blue)' }}></div>
            <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">Loading memes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-primary)' }}></div>
        <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-secondary)' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            Discover Memes 🎭
          </h1>
          <p className="text-xl max-w-3xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            Explore trending memes, vote for your favorites, and help decide the next viral sensation!
          </p>
        </div>

        {/* Contest Results */}
        {contestResults && (
          <div className="card p-6 mb-8" style={{ background: 'var(--gradient-primary)', color: 'var(--primary-bg)' }}>
            <h2 className="text-2xl font-bold mb-2 font-['Space_Grotesk']">🏆 Contest Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-semibold font-['Inter']">Winning Meme ID</p>
                <p className="text-lg font-['Space_Grotesk']">{String(contestResults[0] || 'N/A')}</p>
              </div>
              <div>
                <p className="font-semibold font-['Inter']">Winner</p>
                <p className="text-lg font-mono">{contestResults[1] ? formatAddress(String(contestResults[1])) : 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold font-['Inter']">Total Votes</p>
                <p className="text-lg font-['Space_Grotesk']">{String(contestResults[2] || 'N/A')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                Search Memes
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or creator..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'votes' | 'time' | 'creator')}
                className="input-field"
                title="Sort memes by criteria"
                aria-label="Sort memes by criteria"
              >
                <option value="votes">Most Votes</option>
                <option value="time">Newest First</option>
                <option value="creator">Creator Address</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                Found {filteredMemes.length} meme{filteredMemes.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Memes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {currentMemes.map((meme) => (
            <div key={meme.id} className="card overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="aspect-square relative">
                <img
                  src={meme.imageUrl || createPlaceholderImage('#E0E0E0', 'Loading...')}
                  alt={meme.metadata?.name || `Meme #${meme.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = createPlaceholderImage('#CCCCCC', 'Image Error');
                  }}
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold font-['Inter']" 
                     style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '2px solid var(--neon-blue)' }}>
                  #{meme.id}
                </div>
                {isOwnedByUser(meme.creator) && (
                  <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-bold font-['Inter']"
                       style={{ background: 'var(--neon-green)', color: 'var(--primary-bg)' }}>
                    YOUR MEME
                  </div>
                )}
                {meme.isLoadingMetadata && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid var(--neon-blue)', borderTop: '2px solid transparent' }}></div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                  {meme.metadata?.name || `Meme #${meme.id}`}
                </h3>
                
                <p className="mb-4 text-sm font-['Inter'] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {meme.metadata?.description || 'No description available'}
                </p>

                {meme.metadata?.style && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium font-['Inter']"
                          style={{ background: 'var(--neon-purple)', color: 'var(--primary-bg)' }}>
                      {meme.metadata.style}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-['Inter']" style={{ color: 'var(--text-muted)' }}>
                    <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Creator: <span className="font-mono">{formatAddress(meme.creator)}</span>
                    </p>
                    <p>{formatTimeAgo(meme.submissionTime)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-['Space_Grotesk']" style={{ color: 'var(--neon-blue)' }}>
                      {meme.votes}
                    </div>
                    <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                      vote{meme.votes !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleVote(meme.id)}
                  disabled={!isConnected || votingMeme === meme.id || isPending || isConfirming || isOwnedByUser(meme.creator)}
                  className="btn-primary w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                >
                  {votingMeme === meme.id 
                    ? '🗳️ Voting...' 
                    : isOwnedByUser(meme.creator)
                      ? '🚫 Cannot vote for own meme'
                      : isConnected 
                        ? '👍 Vote for this Meme' 
                        : 'Connect Wallet to Vote'
                  }
                </button>
                
                {/* Additional Info */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between text-xs font-['Inter']" style={{ color: 'var(--text-muted)' }}>
                    <span>IPFS: {meme.ipfsHash.slice(0, 8)}...</span>
                    <span>Story: {meme.storyProtocolIPId.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all font-['Inter'] ${
                    currentPage === page ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredMemes.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              {searchTerm ? 'No Memes Found' : 'No Memes Yet'}
            </h2>
            <p className="mb-6 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm 
                ? `No memes match your search for "${searchTerm}"`
                : 'Be the first to submit a meme to the contest!'
              }
            </p>
            <div className="space-x-4">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-all font-['Inter']"
                >
                  Clear Search
                </button>
              )}
              <a 
                href="/create-meme" 
                className="btn-primary inline-block px-6 py-3 rounded-lg font-semibold transition-all font-['Inter']"
              >
                Create Your First Meme
              </a>
            </div>
          </div>
        )}

        {/* Network Warning */}
        {!isZoraSepolia && isConnected && (
          <div className="card p-6 text-center" style={{ borderColor: 'var(--neon-yellow)' }}>
            <p className="font-semibold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--neon-yellow)' }}>
              ⚠️ Wrong Network
            </p>
            <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Please switch to Zora Sepolia network to vote for memes.
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {isPending && (
          <div className="fixed bottom-4 right-4 p-4 card" style={{ borderColor: 'var(--neon-yellow)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-yellow)' }}>
              ⏳ Vote submitted. Waiting for confirmation...
            </p>
          </div>
        )}

        {isConfirming && (
          <div className="fixed bottom-4 right-4 p-4 card" style={{ borderColor: 'var(--neon-blue)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-blue)' }}>
              🔄 Vote confirming...
            </p>
          </div>
        )}

        {isConfirmed && (
          <div className="fixed bottom-4 right-4 p-4 card" style={{ borderColor: 'var(--neon-green)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-green)' }}>
              ✅ Vote confirmed! 🎉
            </p>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 p-4 card max-w-sm" style={{ borderColor: 'var(--neon-red)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-red)' }}>
              ❌ Error: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        )}

        {!isConnected && (
          <div className="fixed bottom-4 left-4 p-4 card" style={{ borderColor: 'var(--neon-yellow)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--text-primary)' }}>
              💡 Connect your wallet to vote for memes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreMemes;
