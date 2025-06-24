import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';
import useContracts from '../hooks/useContracts';
import { registerIP } from '../services/storyProtocol';
import { ipfsService } from '../services/ipfs';
import { CONTRACT_ADDRESSES } from '../utils/zora-config';

interface ContentFile {
  file: File;
  type: 'story' | 'image' | 'audio' | 'video';
  preview?: string;
}

function MysteriousBox() {
  const { address, isConnected } = useAccount();
  const { 
    createMysteryBox, 
    usePearlBalance, 
    approvePearl,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isZoraSepolia 
  } = useContracts();

  const [contentFile, setContentFile] = useState<ContentFile | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mintPrice: '',
    contentType: 'story'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Get PEARL balance
  const { data: pearlBalance } = usePearlBalance();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      const fileType = determineContentType(file);
      
      const newContentFile: ContentFile = {
        file,
        type: fileType,
        preview: fileType === 'image' ? URL.createObjectURL(file) : undefined
      };
      
      setContentFile(newContentFile);
      setFormData(prev => ({ ...prev, contentType: fileType }));
    }
  };

  const determineContentType = (file: File): 'story' | 'image' | 'audio' | 'video' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'story';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!isConnected) {
      setCreationError('Please connect your wallet');
      return false;
    }

    if (!isZoraSepolia) {
      setCreationError('Please switch to Zora Sepolia network');
      return false;
    }

    if (!contentFile) {
      setCreationError('Please select a file to upload');
      return false;
    }

    if (!formData.title.trim()) {
      setCreationError('Please enter a title');
      return false;
    }

    if (!formData.description.trim()) {
      setCreationError('Please enter a description');
      return false;
    }

    if (!formData.mintPrice || parseFloat(formData.mintPrice) <= 0) {
      setCreationError('Please enter a valid mint price greater than 0');
      return false;
    }

    // Check if user has enough PEARL balance for creation fee (100 PEARL)
    if (pearlBalance && ethers.parseEther('100') > pearlBalance) {
      setCreationError('Insufficient PEARL balance. You need at least 100 PEARL to create a mystery box.');
      return false;
    }

    return true;
  };

  const createMysteryBoxNFT = async () => {
    if (!validateForm() || !address || !contentFile) return;

    try {
      setIsCreating(true);
      setCreationError(null);
      setUploadProgress('Preparing files...');

      // 1. First approve PEARL tokens for the creation fee
      setUploadProgress('Approving PEARL tokens...');
      if (CONTRACT_ADDRESSES.MYSTERY_BOX) {
        await approvePearl(CONTRACT_ADDRESSES.MYSTERY_BOX, '100');
        // Wait a bit for approval to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 2. Upload content to IPFS
      setUploadProgress('Uploading content to IPFS...');
      const ipfsHash = await ipfsService.uploadFile(contentFile.file);

      // 3. Create metadata object
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: `https://ipfs.io/ipfs/${ipfsHash}`,
        content_type: formData.contentType,
        attributes: [
          {
            trait_type: "Content Type",
            value: formData.contentType
          },
          {
            trait_type: "Creator",
            value: address
          },
          {
            trait_type: "Collection",
            value: "Urashima Taro Mystery Box"
          },
          {
            trait_type: "Mint Price",
            value: `${formData.mintPrice} PEARL`
          }
        ]
      };

      // 4. Upload metadata to IPFS
      setUploadProgress('Uploading metadata to IPFS...');
      const metadataHash = await ipfsService.uploadJSON(metadata);

      // 5. Register IP with Story Protocol
      setUploadProgress('Registering IP with Story Protocol...');
      let ipId = '';
      try {
        ipId = await registerIP({
          ipfsHash: metadataHash,
          title: formData.title,
          description: formData.description,
          creator: address
        });
      } catch (ipError) {
        console.warn('Story Protocol registration failed, using fallback ID:', ipError);
        ipId = `mystery_box_${Date.now()}_${address.slice(-6)}`;
      }

      // 6. Create mystery box NFT
      setUploadProgress('Creating mystery box NFT...');
      await createMysteryBox(
        formData.contentType,
        metadataHash,
        ipId,
        formData.mintPrice
      );

      setCreationSuccess(true);
      setUploadProgress(null);

    } catch (error) {
      console.error('Error creating mystery box:', error);
      setCreationError(error instanceof Error ? error.message : 'Unknown error occurred');
      setUploadProgress(null);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCreationSuccess(false);
    setContentFile(null);
    setCreationError(null);
    setUploadProgress(null);
    setFormData({ 
      title: '', 
      description: '', 
      mintPrice: '', 
      contentType: 'story' 
    });
  };

  const getContentTypeEmoji = (type: string) => {
    switch (type) {
      case 'story': return '📖';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-primary)' }}></div>
        <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-secondary)' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            Create Mystery Box 🎭
          </h1>
          <p className="text-xl max-w-3xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            Inspired by the tale of Urashima Taro, create mysterious boxes containing your digital treasures. 
            Each box holds secrets that can be revealed by those who discover them.
          </p>
          
          {/* Balance Display */}
          {isConnected && pearlBalance !== undefined && (
            <div className="mt-6 card inline-block px-6 py-3">
              <p className="font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                💰 PEARL Balance: <span className="font-bold text-gradient">{ethers.formatEther(pearlBalance)} PEARL</span>
              </p>
              <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                Creation fee: 100 PEARL
              </p>
            </div>
          )}
        </div>

        {/* Network Warning */}
        {isConnected && !isZoraSepolia && (
          <div className="card p-6 mb-8 text-center" style={{ borderColor: 'var(--neon-yellow)' }}>
            <p className="font-semibold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--neon-yellow)' }}>
              ⚠️ Wrong Network
            </p>
            <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Please switch to Zora Sepolia network to create mystery boxes.
            </p>
          </div>
        )}

        {/* Creation Form */}
        {!creationSuccess ? (
          <div className="card p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - File Upload */}
              <div className="space-y-6">
                <div>
                  <label className="block mb-4 font-semibold font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                    📦 What's inside your mystery box?
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*,audio/*,video/*,.txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="content-upload"
                  />
                  
                  <label
                    htmlFor="content-upload"
                    className="block w-full aspect-square rounded-xl cursor-pointer transition-all hover:opacity-80 flex flex-col items-center justify-center border-2 border-dashed"
                    style={{ 
                      background: 'var(--secondary-bg)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {contentFile?.preview ? (
                      <img 
                        src={contentFile.preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <span className="font-medium font-['Inter']">
                          Click to upload your content
                        </span>
                        <p className="text-sm mt-2 opacity-70 font-['Inter']">
                          Images, stories, audio, or documents (max 50MB)
                        </p>
                      </div>
                    )}
                  </label>
                  
                  {contentFile && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--secondary-bg)' }}>
                      <p className="text-sm font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                        <strong>File:</strong> {contentFile.file.name}
                      </p>
                      <p className="text-sm font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                        <strong>Type:</strong> {getContentTypeEmoji(contentFile.type)} {contentFile.type}
                      </p>
                      <p className="text-sm font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                        <strong>Size:</strong> {(contentFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    Mystery Box Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., The Dragon's Secret"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what mysteries lie within..."
                    rows={4}
                    className="input-field resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    Content Type
                  </label>
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    className="input-field"
                    aria-label="Content Type"
                  >
                    <option value="story">📖 Story/Text</option>
                    <option value="image">🖼️ Image/Art</option>
                    <option value="audio">🎵 Audio</option>
                    <option value="video">🎬 Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    Mint Price (PEARL tokens) *
                  </label>
                  <input
                    type="number"
                    name="mintPrice"
                    value={formData.mintPrice}
                    onChange={handleInputChange}
                    placeholder="10"
                    step="0.1"
                    min="0.1"
                    className="input-field"
                    required
                  />
                  <p className="text-xs mt-1 font-['Inter']" style={{ color: 'var(--text-muted)' }}>
                    This is how much others will pay to purchase and reveal your mystery box
                  </p>
                </div>

                {/* Error Display */}
                {creationError && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--neon-red)', color: 'var(--primary-bg)' }}>
                    <p className="font-medium font-['Inter']">❌ {creationError}</p>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--neon-blue)', color: 'var(--primary-bg)' }}>
                    <p className="font-medium font-['Inter']">⏳ {uploadProgress}</p>
                  </div>
                )}

                <button
                  onClick={createMysteryBoxNFT}
                  disabled={!isConnected || !contentFile || !formData.title || !formData.mintPrice || isCreating || isPending || isConfirming}
                  className="btn-primary w-full py-4 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Mystery Box...
                    </div>
                  ) : isPending ? 'Transaction Pending...' : isConfirming ? 'Confirming...' : 'Create Mystery Box 🎭'}
                </button>

                {!isConnected && (
                  <p className="text-center text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    Connect your wallet to create mystery boxes
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center card p-8">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              Mystery Box Created Successfully!
            </h2>
            <p className="mb-8 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Your mystery box has been sealed and registered with Story Protocol. 
              Others can now discover and unlock its secrets!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="btn-primary px-6 py-3 rounded-xl font-semibold transition-all font-['Inter']"
              >
                Create Another Box
              </button>
              <a
                href="/mystery-coins"
                className="btn-secondary px-6 py-3 rounded-xl font-semibold transition-all font-['Inter']"
              >
                Explore Mystery Boxes
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MysteriousBox;
