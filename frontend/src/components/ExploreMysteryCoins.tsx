import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import useContracts from '../hooks/useContracts';
import { CONTRACT_ADDRESSES } from '../utils/zora-config';
import { ipfsService } from '../services/ipfs';

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
  owner?: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
    content_type: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}

const ExploreMysteryCoins: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingBox, setPurchasingBox] = useState<number | null>(null);
  const [convertingBox, setConvertingBox] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'revealed' | 'mystery' | 'owned'>('all');
  const boxesPerPage = 6;

  const {
    purchaseMysteryBox,
    convertToCoinV4,
    usePearlBalance,
    approvePearl,
    fetchMysteryBoxData,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isZoraSepolia,
    formatEther
  } = useContracts();

  // Get PEARL balance
  const { data: pearlBalance } = usePearlBalance();

  // Load mystery box metadata from IPFS
  const loadMysteryBoxMetadata = async (box: MysteryBox): Promise<MysteryBox> => {
    if (!box.ipfsHash || box.metadata) {
      return box;
    }

    try {
      const metadata = await ipfsService.getJSON(box.ipfsHash);
      return {
        ...box,
        metadata
      };
    } catch (error) {
      console.error(`Failed to load metadata for mystery box ${box.id}:`, error);
      return {
        ...box,
        metadata: {
          name: `Mystery Box #${box.id}`,
          description: 'Unable to load description',
          image: '',
          content_type: box.contentType
        }
      };
    }
  };

  // Fetch mystery boxes from contract
  useEffect(() => {
    const fetchMysteryBoxes = async () => {
      if (!CONTRACT_ADDRESSES.MYSTERY_BOX) {
        console.warn('⚠️ Mystery Box contract not configured. Please set VITE_MYSTERY_BOX_ADDRESS in your .env file.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadedBoxes: MysteryBox[] = [];
        
        // Fetch mystery boxes by iterating through IDs
        // In a real production app, you'd listen to MysteryBoxCreated events
        // But for now, we'll try to fetch the first 20 mystery boxes
        const maxBoxesToFetch = 20;
        
        for (let i = 0; i < maxBoxesToFetch; i++) {
          try {
            const { boxData, owner } = await fetchMysteryBoxData(i);
            
            if (boxData) {
              const box: MysteryBox = {
                id: Number(boxData.id),
                creator: boxData.creator,
                contentType: boxData.contentType,
                ipfsHash: boxData.ipfsHash,
                storyProtocolIPId: boxData.storyProtocolIPId,
                mintPrice: boxData.mintPrice,
                isRevealed: boxData.isRevealed,
                canBeCoined: boxData.canBeCoined,
                coinedTokenAddress: Number(boxData.coinedTokenAddress),
                owner: owner
              };
              
              // Load metadata asynchronously
              loadMysteryBoxMetadata(box).then(boxWithMetadata => {
                setMysteryBoxes(prev => {
                  const index = prev.findIndex(b => b.id === box.id);
                  if (index >= 0) {
                    const newBoxes = [...prev];
                    newBoxes[index] = boxWithMetadata;
                    return newBoxes;
                  }
                  return prev;
                });
              });
              
              loadedBoxes.push(box);
            }
          } catch (error) {
            // Box doesn't exist or failed to fetch, this is expected
            console.log(`Box ${i} doesn't exist or failed to fetch`);
          }
        }

        setMysteryBoxes(loadedBoxes);
        console.log(`✅ Loaded ${loadedBoxes.length} mystery boxes`);
        
      } catch (error) {
        console.error('Error fetching mystery boxes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMysteryBoxes();
  }, [CONTRACT_ADDRESSES.MYSTERY_BOX, address]);

  const handlePurchase = async (box: MysteryBox) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase');
      return;
    }

    if (!isZoraSepolia) {
      alert('Please switch to Zora Sepolia network to purchase mystery boxes');
      return;
    }

    if (box.owner && box.owner.toLowerCase() === address?.toLowerCase()) {
      alert('You cannot purchase your own mystery box');
      return;
    }

    try {
      setPurchasingBox(box.id);
      
      // First approve PEARL tokens for the purchase
      if (CONTRACT_ADDRESSES.MYSTERY_BOX) {
        await approvePearl(CONTRACT_ADDRESSES.MYSTERY_BOX, formatEther(box.mintPrice));
        // Wait a bit for approval to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      await purchaseMysteryBox(box.id);
      
      // Update local state
      setMysteryBoxes(prev => 
        prev.map(b => 
          b.id === box.id 
            ? { ...b, isRevealed: true, owner: address }
            : b
        )
      );
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPurchasingBox(null);
    }
  };

  const handleConvertToCoin = async (boxId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to convert');
      return;
    }

    if (!isZoraSepolia) {
      alert('Please switch to Zora Sepolia network to convert to CoinV4');
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
      alert(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setConvertingBox(null);
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'story': return '📚';
      case 'image': return '🎨';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      default: return '📦';
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'story': return 'var(--neon-blue)';
      case 'image': return 'var(--neon-purple)';
      case 'audio': return 'var(--neon-green)';
      case 'video': return 'var(--neon-yellow)';
      default: return 'var(--text-secondary)';
    }
  };

  const isOwnedByUser = (box: MysteryBox) => {
    return address && (
      (box.owner && box.owner.toLowerCase() === address.toLowerCase()) ||
      (box.creator && box.creator.toLowerCase() === address.toLowerCase())
    );
  };

  const canUserPurchase = (box: MysteryBox) => {
    return isConnected && !isOwnedByUser(box) && !box.isRevealed;
  };

  const canUserConvert = (box: MysteryBox) => {
    return isConnected && isOwnedByUser(box) && box.isRevealed && box.canBeCoined && box.coinedTokenAddress === 0;
  };

  // Filter boxes
  const filteredBoxes = mysteryBoxes.filter(box => {
    switch (filterType) {
      case 'revealed': return box.isRevealed;
      case 'mystery': return !box.isRevealed;
      case 'owned': return isOwnedByUser(box);
      default: return true;
    }
  });

  // Pagination
  const indexOfLastBox = currentPage * boxesPerPage;
  const indexOfFirstBox = indexOfLastBox - boxesPerPage;
  const currentBoxes = filteredBoxes.slice(indexOfFirstBox, indexOfLastBox);
  const totalPages = Math.ceil(filteredBoxes.length / boxesPerPage);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--neon-blue)' }}></div>
            <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">Loading mystery boxes...</p>
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
            Mystery Box Collection 📦
          </h1>
          <p className="text-xl max-w-3xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            Discover hidden digital treasures! Purchase mystery boxes to reveal exclusive content and convert them to tradeable coins.
          </p>
          
          {/* Balance Display */}
          {isConnected && pearlBalance !== undefined && (
            <div className="mt-6 card inline-block px-6 py-3">
              <p className="font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                💰 PEARL Balance: <span className="font-bold text-gradient">{formatEther(pearlBalance)} PEARL</span>
              </p>
            </div>
          )}

          {/* Create Mystery Box Button */}
          <div className="mt-6">
            <a
              href="/mystery-box"
              className="btn-primary inline-block px-6 py-3 rounded-xl font-semibold transition-all font-['Inter']"
            >
              Create Your Own Mystery Box 🎭
            </a>
          </div>
        </div>

        {/* Network Warning */}
        {isConnected && !isZoraSepolia && (
          <div className="card p-6 mb-8 text-center" style={{ borderColor: 'var(--neon-yellow)' }}>
            <p className="font-semibold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--neon-yellow)' }}>
              ⚠️ Wrong Network
            </p>
            <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Please switch to Zora Sepolia network to interact with mystery boxes.
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-['Space_Grotesk']" style={{ color: 'var(--neon-blue)' }}>{mysteryBoxes.length}</div>
            <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>Total Boxes</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-['Space_Grotesk']" style={{ color: 'var(--neon-green)' }}>{mysteryBoxes.filter(box => box.isRevealed).length}</div>
            <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>Revealed</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-['Space_Grotesk']" style={{ color: 'var(--neon-yellow)' }}>{mysteryBoxes.filter(box => !box.isRevealed).length}</div>
            <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>Mysterious</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-['Space_Grotesk']" style={{ color: 'var(--neon-purple)' }}>{mysteryBoxes.filter(box => box.coinedTokenAddress > 0).length}</div>
            <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>Coined</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <label className="block text-sm font-medium font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Filter:
            </label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Boxes', icon: '📦' },
                { value: 'mystery', label: 'Mystery', icon: '❓' },
                { value: 'revealed', label: 'Revealed', icon: '👁️' },
                { value: 'owned', label: 'My Boxes', icon: '👤' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setFilterType(filter.value as typeof filterType);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all font-['Inter'] ${
                    filterType === filter.value ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mystery Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {currentBoxes.map((box) => (
            <div key={box.id} className="card overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              {/* Image/Preview */}
              <div className="aspect-square relative flex items-center justify-center" style={{ background: 'var(--secondary-bg)' }}>
                {box.isRevealed && box.metadata?.image ? (
                  <img
                    src={box.metadata.image}
                    alt={box.metadata.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400/CCCCCC/000000?text=' + getContentTypeIcon(box.contentType);
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">{box.isRevealed ? getContentTypeIcon(box.contentType) : '❓'}</div>
                    <div className="text-lg font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                      {box.isRevealed ? 'REVEALED' : 'MYSTERY'}
                    </div>
                    <div className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                      {box.isRevealed ? 'Content Available' : 'Purchase to Reveal'}
                    </div>
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold font-['Inter']" 
                        style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    #{box.id}
                  </span>
                </div>
                
                {box.coinedTokenAddress > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold font-['Inter']" 
                          style={{ background: 'var(--neon-yellow)', color: 'var(--primary-bg)' }}>
                      🪙 COINED
                    </span>
                  </div>
                )}
                
                {isOwnedByUser(box) && (
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold font-['Inter']" 
                          style={{ background: 'var(--neon-green)', color: 'var(--primary-bg)' }}>
                      OWNED
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                    {box.metadata?.name || `Mystery Box #${box.id}`}
                  </h3>
                  <span className="text-sm font-semibold font-['Inter']" style={{ color: getContentTypeColor(box.contentType) }}>
                    {getContentTypeIcon(box.contentType)} {box.contentType.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm mb-4 font-['Inter'] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {box.metadata?.description || 'This mystery box contains hidden content waiting to be discovered.'}
                </p>

                <div className="space-y-2 mb-4 text-xs font-['Inter']" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex justify-between">
                    <span>Creator:</span>
                    <span className="font-mono">{formatAddress(box.creator)}</span>
                  </div>
                  {box.owner && box.owner !== box.creator && (
                    <div className="flex justify-between">
                      <span>Owner:</span>
                      <span className="font-mono">{formatAddress(box.owner)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold text-gradient">{formatEther(box.mintPrice)} PEARL</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  {canUserPurchase(box) && (
                    <button
                      onClick={() => handlePurchase(box)}
                      disabled={purchasingBox === box.id || isPending || isConfirming}
                      className="btn-primary w-full py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                    >
                      {purchasingBox === box.id ? '🛒 Purchasing...' : `🛒 Purchase for ${formatEther(box.mintPrice)} PEARL`}
                    </button>
                  )}
                  
                  {canUserConvert(box) && (
                    <button
                      onClick={() => handleConvertToCoin(box.id)}
                      disabled={convertingBox === box.id || isPending || isConfirming}
                      className="btn-secondary w-full py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                    >
                      {convertingBox === box.id ? '🪙 Converting...' : '🪙 Convert to CoinV4'}
                    </button>
                  )}
                  
                  {box.isRevealed && (
                    <button
                      onClick={() => {
                        if (box.metadata?.image) {
                          window.open(box.metadata.image, '_blank');
                        } else {
                          window.open(`https://ipfs.io/ipfs/${box.ipfsHash}`, '_blank');
                        }
                      }}
                      className="btn-ghost w-full py-2 px-4 rounded-lg font-semibold transition-all font-['Inter']"
                    >
                      👁️ View Content
                    </button>
                  )}
                  
                  {!isConnected && (
                    <div className="text-center text-xs font-['Inter']" style={{ color: 'var(--text-muted)' }}>
                      Connect wallet to interact
                    </div>
                  )}
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
        {filteredBoxes.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              No Mystery Boxes Found
            </h2>
            <p className="mb-6 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              {filterType === 'all' 
                ? 'No mystery boxes have been created yet.' 
                : `No ${filterType} mystery boxes found.`
              }
            </p>
            <div className="space-x-4">
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-all font-['Inter']"
                >
                  Show All Boxes
                </button>
              )}
              <a 
                href="/mystery-box" 
                className="btn-primary inline-block px-6 py-3 rounded-lg font-semibold transition-all font-['Inter']"
              >
                Create Mystery Box
              </a>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {isPending && (
          <div className="fixed bottom-4 right-4 p-4 card" style={{ borderColor: 'var(--neon-yellow)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-yellow)' }}>
              ⏳ Transaction submitted. Waiting for confirmation...
            </p>
          </div>
        )}

        {isConfirming && (
          <div className="fixed bottom-4 right-4 p-4 card" style={{ borderColor: 'var(--neon-blue)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-blue)' }}>
              🔄 Transaction confirming...
            </p>
          </div>
        )}

        {isConfirmed && (
          <div className="fixed bottom-4 right-4 p-4 card" style={{ borderColor: 'var(--neon-green)' }}>
            <p className="font-['Inter']" style={{ color: 'var(--neon-green)' }}>
              ✅ Transaction confirmed! 🎉
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
              💡 Connect your wallet to interact with mystery boxes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreMysteryCoins;
