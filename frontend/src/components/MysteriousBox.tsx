import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ethers } from 'ethers';
import MysteryBoxABI from '../abi/MysteryBox.json';
import { registerIP } from '../services/storyProtocol';
import { uploadFileToIPFS } from '../services/ipfs';

const MYSTERY_BOX_ADDRESS = import.meta.env.REACT_APP_MYSTERY_BOX_ADDRESS;

interface ContentFile {
  file: File;
  type: 'story' | 'image' | 'audio' | 'video';
  preview?: string;
}

function MysteriousBox() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [contentFile, setContentFile] = useState<ContentFile | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mintPrice: '',
    contentType: 'story'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

  const createMysteryBox = async () => {
    if (!address || !contentFile) return;

    try {
      setIsCreating(true);

      // 1. Upload content to IPFS
      console.log('Uploading content to IPFS...');
      const contentUploadResult = await uploadFileToIPFS(contentFile.file);
      const ipfsHash = contentUploadResult.IpfsHash;

      // 2. Create metadata object
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: `https://ipfs.io/ipfs/${ipfsHash}`,
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
            trait_type: "Urashima Taro Collection",
            value: "Mystery Box"
          }
        ]
      };

      // 3. Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const metadataUploadResult = await uploadFileToIPFS(metadataFile);
      const metadataHash = metadataUploadResult.IpfsHash;

      // 4. Register IP with Story Protocol
      console.log('Registering IP with Story Protocol...');
      const ipId = await registerIP({
        ipfsHash: metadataHash,
        title: formData.title,
        description: formData.description,
        creator: address
      });

      // 5. Create mystery box NFT
      console.log('Creating mystery box NFT...');
      const mintPriceWei = ethers.parseEther(formData.mintPrice);

      writeContract({
        address: MYSTERY_BOX_ADDRESS as `0x${string}`,
        abi: MysteryBoxABI,
        functionName: 'createMysteryBox',
        args: [
          formData.contentType,
          metadataHash,
          ipId,
          mintPriceWei
        ]
      });

    } catch (error) {
      console.error('Error creating mystery box:', error);
      alert('Failed to create mystery box: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  // Handle transaction success
  if (isConfirmed && !creationSuccess) {
    setCreationSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#FFFBEA] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#131315] font-urbanist mb-4">
            🎭 Create Mystery Box
          </h1>
          <p className="text-[#131315]/60 text-lg font-urbanist max-w-2xl mx-auto">
            Inspired by the tale of Urashima Taro, create mysterious boxes containing your digital treasures. 
            Each box holds secrets that can be revealed by those who discover them.
          </p>
        </div>

        {/* Creation Form */}
        {!creationSuccess ? (
          <div className="bg-white rounded-2xl border border-[#9C9C9C] p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - File Upload */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[#131315] text-lg font-semibold font-urbanist mb-4">
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
                    className="block w-full aspect-square bg-[#FFFBEA] border-2 border-dashed border-[#EE5A0E] rounded-2xl cursor-pointer hover:border-[#0F62FE] transition-colors flex flex-col items-center justify-center"
                  >
                    {contentFile?.preview ? (
                      <img 
                        src={contentFile.preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <span className="text-[#131315]/60 font-urbanist">
                          Click to upload your content
                        </span>
                        <p className="text-sm text-[#131315]/40 mt-2">
                          Images, stories, audio, or documents
                        </p>
                      </div>
                    )}
                  </label>
                  
                  {contentFile && (
                    <div className="mt-4 p-4 bg-[#FFFBEA] rounded-xl border border-[#9C9C9C]">
                      <p className="text-sm text-[#131315]/80">
                        <strong>File:</strong> {contentFile.file.name}
                      </p>
                      <p className="text-sm text-[#131315]/80">
                        <strong>Type:</strong> {contentFile.type}
                      </p>
                      <p className="text-sm text-[#131315]/80">
                        <strong>Size:</strong> {(contentFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[#131315]/80 text-sm font-urbanist mb-2">
                    Mystery Box Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., The Dragon's Secret"
                    className="w-full px-4 py-3 bg-[#FFFBEA] text-[#131315] placeholder-[#131315]/40 rounded-xl border border-[#9C9C9C] focus:border-[#EE5A0E] focus:outline-none font-urbanist"
                  />
                </div>

                <div>
                  <label className="block text-[#131315]/80 text-sm font-urbanist mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what mysteries lie within..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#FFFBEA] text-[#131315] placeholder-[#131315]/40 rounded-xl border border-[#9C9C9C] focus:border-[#EE5A0E] focus:outline-none font-urbanist"
                  />
                </div>

                <div>
                  <label className="block text-[#131315]/80 text-sm font-urbanist mb-2">
                    Content Type
                  </label>
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#FFFBEA] text-[#131315] rounded-xl border border-[#9C9C9C] focus:border-[#EE5A0E] focus:outline-none font-urbanist"
                    aria-label="Content Type"
                  >
                    <option value="story">📖 Story/Text</option>
                    <option value="image">🖼️ Image/Art</option>
                    <option value="audio">🎵 Audio</option>
                    <option value="video">🎬 Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#131315]/80 text-sm font-urbanist mb-2">
                    Mint Price (PEARL tokens)
                  </label>
                  <input
                    type="number"
                    name="mintPrice"
                    value={formData.mintPrice}
                    onChange={handleInputChange}
                    placeholder="10"
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-3 bg-[#FFFBEA] text-[#131315] placeholder-[#131315]/40 rounded-xl border border-[#9C9C9C] focus:border-[#EE5A0E] focus:outline-none font-urbanist"
                  />
                </div>

                <button
                  onClick={createMysteryBox}
                  disabled={!isConnected || !contentFile || !formData.title || !formData.mintPrice || isCreating || isPending}
                  className={`w-full px-6 py-4 rounded-xl font-urbanist font-medium transition-all ${
                    !isConnected || !contentFile || !formData.title || !formData.mintPrice || isCreating || isPending
                      ? 'bg-[#9C9C9C]/50 text-[#131315]/60 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#EE5A0E] to-[#0F62FE] text-white hover:opacity-90'
                  }`}
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Mystery Box...
                    </div>
                  ) : isPending ? 'Confirming Transaction...' : isConfirming ? 'Processing...' : 'Create Mystery Box 🎭'}
                </button>

                {!isConnected && (
                  <p className="text-center text-sm text-[#131315]/60 font-urbanist">
                    Connect your wallet to create mystery boxes
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center bg-white rounded-2xl border border-[#9C9C9C] p-8 shadow-lg">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-[#131315] font-urbanist mb-4">
              Mystery Box Created Successfully!
            </h2>
            <p className="text-[#131315]/60 font-urbanist mb-8">
              Your mystery box has been sealed and registered with Story Protocol. 
              Others can now discover and unlock its secrets!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCreationSuccess(false);
                  setContentFile(null);
                  setFormData({ title: '', description: '', mintPrice: '', contentType: 'story' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#EE5A0E] to-[#0F62FE] text-white rounded-xl font-urbanist font-medium hover:opacity-90 transition-all"
              >
                Create Another Box
              </button>
              <button
                onClick={() => window.location.href = '/explore'}
                className="px-6 py-3 bg-[#FFFBEA] text-[#131315] border border-[#9C9C9C] rounded-xl font-urbanist font-medium hover:border-[#EE5A0E] transition-all"
              >
                Explore Mystery Boxes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MysteriousBox;
