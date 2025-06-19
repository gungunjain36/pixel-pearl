import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useWalletClient } from 'wagmi';
import { Link } from 'react-router-dom';
import MemeNFTService, { type MintProgress } from '../services/memeNFT';
import { storyProtocolService } from '../services/storyProtocol';

interface MemeStyle {
  name: string;
  description: string;
  icon: string;
}

const MEME_STYLES: MemeStyle[] = [
  {
    name: "Classic Meme",
    description: "Traditional viral-worthy memes that are relatable and funny",
    icon: "🎭"
  },
  {
    name: "Dank Meme",
    description: "Surreal, absurdist humor with deep-fried aesthetics",
    icon: "🌀"
  },
  {
    name: "Wholesome",
    description: "Heartwarming and positive memes that make people smile",
    icon: "💖"
  }
];

function CreateMeme() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: walletClient } = useWalletClient();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [acceptRoyalty, setAcceptRoyalty] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState<MintProgress | null>(null);
  const [creationResult, setCreationResult] = useState<{
    success: boolean;
    ipfsHash?: string;
    transactionHash?: string;
    nftContractAddress?: string;
    tokenId?: string;
    ipId?: string;
    explorerUrl?: string;
    error?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    socialLinks: '',
    tags: '' // comma-separated tags
  });
  const [selectedStyle, setSelectedStyle] = useState<'Classic Meme' | 'Dank Meme' | 'Wholesome'>('Classic Meme');

  // Initialize services when wallet connects
  useEffect(() => {
    if (isConnected && window.ethereum) {
      // Service is now auto-initialized
      storyProtocolService.initialize(window.ethereum);
    }
  }, [isConnected]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!imageFile) {
      alert('Please select an image');
      return false;
    }
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return false;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return false;
    }
    
    return true;
  };

  const createMeme = async () => {
    if (!validateForm() || !address || !walletClient) {
      if (!walletClient) {
        alert('Please connect your wallet first');
      }
      return;
    }

    setIsCreating(true);
    setCreationProgress(null);
    setCreationResult(null);

    try {
      const memeNFTService = new MemeNFTService();

      // Create the meme NFT with progress tracking
      const result = await memeNFTService.createMemeNFT(
        imageFile!,
        formData.title,
        formData.description,
        selectedStyle,
        walletClient,
        (progress) => {
          setCreationProgress(progress);
        }
      );

      setCreationResult({
        success: true,
        ipfsHash: result.ipfsHash,
        transactionHash: result.txHash,
        nftContractAddress: import.meta.env.VITE_ZORA_CONTRACT_ADDRESS,
        tokenId: result.tokenId,
        ipId: result.storyIpId,
        explorerUrl: `https://sepolia.explorer.zora.energy/tx/${result.txHash}`
      });

      console.log('Meme NFT created successfully:', result);

    } catch (error) {
      console.error('Error creating meme:', error);
      setCreationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = () => {
    if (!isConnected) {
      // Connect wallet using the first available connector
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    } else {
      setStep(prev => prev === 3 ? 3 : (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev === 1 ? 1 : (prev - 1) as 1 | 2 | 3);
  };

  const renderProgressBar = () => {
    if (!creationProgress) return null;

    const getProgressColor = () => {
      switch (creationProgress.step) {
        case 'error':
          return 'var(--neon-red)';
        case 'complete':
          return 'var(--neon-green)';
        default:
          return 'var(--gradient-primary)';
      }
    };

    return (
      <div className="mt-6 p-4 card">
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: 'var(--text-primary)' }} className="font-['Inter'] text-sm font-medium">
            {creationProgress.step}
          </span>
          <span style={{ color: 'var(--text-secondary)' }} className="font-['Inter'] text-sm">
            {creationProgress.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${creationProgress.progress}%`,
              background: getProgressColor()
            }}
          ></div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!creationResult) return null;

    if (creationResult.success) {
      return (
        <div className="mt-6 p-6 rounded-xl" style={{ background: 'var(--card-bg)', border: '2px solid var(--neon-green)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              Meme NFT Created Successfully!
            </h3>
            
            <div className="space-y-3 text-left">
              {creationResult.ipfsHash && (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>IPFS Hash:</strong>
                  <p style={{ color: 'var(--text-secondary)' }} className="font-mono text-sm break-all">
                    {creationResult.ipfsHash}
                  </p>
                </div>
              )}
              
              {creationResult.nftContractAddress && (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>NFT Contract:</strong>
                  <p style={{ color: 'var(--text-secondary)' }} className="font-mono text-sm break-all">
                    {creationResult.nftContractAddress}
                  </p>
                </div>
              )}
              
              {creationResult.ipId && (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Story Protocol IP ID:</strong>
                  <p style={{ color: 'var(--text-secondary)' }} className="font-mono text-sm break-all">
                    {creationResult.ipId}
                  </p>
                </div>
              )}
              
              {creationResult.transactionHash && (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Transaction:</strong>
                  <a 
                    href={creationResult.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono text-sm break-all hover:underline"
                    style={{ color: 'var(--neon-blue)' }}
                  >
                    {creationResult.transactionHash}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <Link 
                to="/explore-memes"
                className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all"
              >
                View All Memes
              </Link>
              <button
                onClick={() => {
                  setStep(1);
                  setImageFile(null);
                  setImagePreview(null);
                  setCreationResult(null);
                  setCreationProgress(null);
                  setFormData({
                    title: '',
                    description: '',
                    socialLinks: '',
                    tags: ''
                  });
                }}
                className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-6 p-6 rounded-xl" style={{ background: 'var(--card-bg)', border: '2px solid var(--neon-red)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--neon-red)' }}>
              Creation Failed
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
              {creationResult.error}
            </p>
            <button
              onClick={() => {
                setCreationResult(null);
                setCreationProgress(null);
              }}
              className="mt-4 btn-primary px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  };

  const renderStyleSelection = () => (
    <div className="space-y-4">
      <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-['Inter']">Select Meme Style</label>
      <div className="grid grid-cols-1 gap-3">
        {MEME_STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => setSelectedStyle(style.name as 'Classic Meme' | 'Dank Meme' | 'Wholesome')}
            className={`flex items-center p-4 rounded-xl transition-all ${
              selectedStyle === style.name
                ? 'btn-primary'
                : 'card border-2 hover:border-opacity-60'
            }`}
            style={{
              borderColor: selectedStyle === style.name ? 'var(--neon-blue)' : 'var(--border-color)'
            }}
          >
            <span className="text-2xl mr-3">{style.icon}</span>
            <div className="text-left">
              <div className="font-medium font-['Inter']" style={{ 
                color: selectedStyle === style.name ? 'var(--primary-bg)' : 'var(--text-primary)' 
              }}>
                {style.name}
              </div>
              <div className="text-sm opacity-80 font-['Inter']" style={{ 
                color: selectedStyle === style.name ? 'var(--primary-bg)' : 'var(--text-secondary)' 
              }}>
                {style.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

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
            Create Your Meme NFT
          </h1>
          <p className="text-xl max-w-3xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            Upload your meme, mint it as an NFT on Zora, and register it as intellectual property with Story Protocol
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= stepNum ? 'btn-primary' : 'card'
                }`} style={{
                  color: step >= stepNum ? 'var(--primary-bg)' : 'var(--text-secondary)'
                }}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 transition-all ${
                    step > stepNum ? 'bg-gradient-to-r' : ''
                  }`} style={{
                    background: step > stepNum ? 'var(--gradient-primary)' : 'var(--border-color)'
                  }}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="card p-8">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                  Upload Your Meme
                </h2>
                <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
                  Choose an image file to create your meme NFT
                </p>
              </div>

              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-opacity-60"
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => document.getElementById('imageInput')?.click()}
                >
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-lg font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                    Click to upload image
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Upload meme image"
                    title="Upload meme image"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'var(--neon-red)', color: 'var(--primary-bg)' }}
                  >
                    ×
                  </button>
                </div>
              )}

              {renderStyleSelection()}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                  Add Details
                </h2>
                <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
                  Provide information about your meme
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm font-medium mb-2 font-['Inter']">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter a catchy title for your meme"
                    required
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm font-medium mb-2 font-['Inter']">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe your meme, its context, or what makes it special"
                    required
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm font-medium mb-2 font-['Inter']">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="funny, viral, meme, comedy, trending"
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm font-medium mb-2 font-['Inter']">
                    Social Links (optional)
                  </label>
                  <input
                    type="text"
                    name="socialLinks"
                    value={formData.socialLinks}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Your social media or website"
                  />
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setAcceptRoyalty(!acceptRoyalty)}
                    className="flex items-center space-x-3"
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all`}
                         style={{ 
                           borderColor: acceptRoyalty ? 'var(--neon-green)' : 'var(--border-color)',
                           background: acceptRoyalty ? 'var(--neon-green)' : 'transparent'
                         }}>
                      {acceptRoyalty && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--primary-bg)' }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-primary)' }} className="font-['Inter']">
                      I accept that this meme may be used for derivatives with proper attribution
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                  Review & Create
                </h2>
                <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
                  Review your meme details and create your NFT
                </p>
              </div>

              {/* Preview */}
              <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={imagePreview || ''}
                      alt="Meme preview"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                        {formData.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
                        {formData.description}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium font-['Inter']" style={{ color: 'var(--text-primary)' }}>Style: </span>
                      <span style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">{selectedStyle}</span>
                    </div>
                    {formData.tags && (
                      <div>
                        <span className="font-medium font-['Inter']" style={{ color: 'var(--text-primary)' }}>Tags: </span>
                        <span style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">{formData.tags}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium font-['Inter']" style={{ color: 'var(--text-primary)' }}>Creator: </span>
                      <span style={{ color: 'var(--text-secondary)' }} className="font-['Inter'] font-mono text-sm">
                        {address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!isConnected && (
                <div className="card p-6 text-center" style={{ borderColor: 'var(--neon-yellow)' }}>
                  <p style={{ color: 'var(--text-primary)' }} className="font-['Inter'] mb-4">
                    Please connect your wallet to create the meme NFT
                  </p>
                </div>
              )}

              {renderProgressBar()}
              {renderResult()}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !imageFile}
                className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 1 ? 'Next' : step === 2 ? 'Review' : 'Create'}
              </button>
            ) : (
              <button
                onClick={createMeme}
                disabled={!isConnected || isCreating || !!creationResult}
                className="btn-primary px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : isConnected ? 'Create Meme NFT' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMeme; 