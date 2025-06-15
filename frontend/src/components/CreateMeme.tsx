    // frontend/src/components/CreateMeme.tsx
    import React, { useState } from 'react';
    import { useAccount, useWalletClient, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
    import { parseUnits } from 'ethers';
    import { uploadToIpfs } from '../services/ipfs';
    import { registerIP } from '../services/storyProtocol';
    import { mintMemeNFT } from '../services/zora';
    import { CONTRACT_ADDRESSES } from '../utils/zora-config';
    import MemeContestABI from '../abiMemeContest.json';
    import PearlTokenABI from '../abi/PearlToken.json';
    import { Address } from 'viem';

    const CreateMeme: React.FC = () => {
      const { address, isConnected } = useAccount();
      const { data: walletClient } = useWalletClient();
      const [file, setFile] = useState<File | null>(null);
      const [memeName, setMemeName] = useState('');
      const [memeDescription, setMemeDescription] = useState('');
      const [ipfsHash, setIpfsHash] = useState<string | null>(null);
      const [storyProtocolIPId, setStoryProtocolIPId] = useState<string | null>(null);

      const [status, setStatus] = useState('');

      // State for Contest Submission Flow
      const [submissionApproved, setSubmissionApproved] = useState(false);

      // 1. Prepare to approve Pearl Token for submission fee
      const submissionFeeAmount = parseUnits("10", 18); // Example: 10 PEARL fee
      const { config: approveSubmissionConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESSES.pearlToken as `0x${string}`,
        abi: PearlTokenABI.abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.memeContest, submissionFeeAmount],
        enabled: isConnected && ipfsHash !== null && storyProtocolIPId !== null && !submissionApproved,
      });
      const { data: approveSubmissionData, write: approveSubmissionPearl } = useContractWrite(approveSubmissionConfig);
      const { isLoading: isApprovingSubmission, isSuccess: isSubmissionApprovedSuccess } = useWaitForTransaction({
        hash: approveSubmissionData?.hash,
      });

      React.useEffect(() => {
        if (isSubmissionApprovedSuccess) {
            setSubmissionApproved(true);
            setStatus("Pearl tokens approved for contest submission. Submitting meme to contest...");
            // Automatically trigger submitMeme once approval is successful
            submitMemeToContest?.();
        }
      }, [isSubmissionApprovedSuccess]);


      // 2. Prepare to submit meme to contest
      const { config: submitMemeContestConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESSES.memeContest as `0x${string}`,
        abi: UrashimaTaroMemeContestABI.abi,
        functionName: 'submitMeme',
        args: [ipfsHash!, storyProtocolIPId!], // Use non-null assertion as enabled only if they exist
        enabled: isConnected && submissionApproved && ipfsHash !== null && storyProtocolIPId !== null,
      });
      const { data: submitMemeData, write: submitMemeToContest } = useContractWrite(submitMemeContestConfig);
      const { isLoading: isSubmittingMeme, isSuccess: isMemeSubmitted } = useWaitForTransaction({
        hash: submitMemeData?.hash,
      });

      React.useEffect(() => {
        if (isMemeSubmitted) {
          setStatus("Meme successfully submitted to contest!");
        }
      }, [isMemeSubmitted]);

      // State for NFT Minting Flow
      const [nftMintTxHash, setNftMintTxHash] = useState<string | null>(null);
      const [isMintingNft, setIsMintingNft] = useState(false);

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
        }
      };

      const handleProcessMeme = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !walletClient || !address || !file || !memeName || !memeDescription) {
          setStatus("Please connect wallet, fill all fields, and select a file.");
          return;
        }

        setStatus("Uploading meme to IPFS...");
        try {
          const memeIpfsHash = await uploadToIpfs(file);
          setIpfsHash(memeIpfsHash);
          setStatus(`Meme IPFS Uploaded: ${memeIpfsHash}. Registering with Story Protocol...`);

          // Register content with Story Protocol
          const ipId = await registerIP(
            walletClient,
            memeName,
            memeDescription,
            memeIpfsHash,
          );
          setStoryProtocolIPId(ipId);
          setStatus(`Story Protocol IP Registered: ${ipId}. Ready to submit to contest and mint NFT.`);

        } catch (error) {
          console.error("Failed to process meme:", error);
          setStatus(`Error processing meme: ${error instanceof Error ? error.message : String(error)}`);
          setIpfsHash(null);
          setStoryProtocolIPId(null);
        }
      };

      // NEW: Handle Minting Meme as NFT
      const handleMintMemeNFT = async () => {
        if (!isConnected || !walletClient || !address || !ipfsHash || !memeName || !memeDescription) {
          setNftMintStatus("Please process meme first (requires IPFS hash) and connect wallet.");
          return;
        }
        if (!CONTRACT_ADDRESSES.zoraMemeNFTCollection || CONTRACT_ADDRESSES.zoraMemeNFTCollection === '0x0000000000000000000000000000000000000000') {
            setNftMintStatus("Error: Zora Meme NFT Collection address is not configured. Please deploy it first.");
            return;
        }

        setIsMintingNft(true);
        setNftMintStatus("Preparing NFT metadata and minting...");
        try {
          // 1. Create NFT Metadata JSON (ERC721 standard)
          const nftMetadata = {
            name: memeName,
            description: memeDescription + " - A collectible meme from Artifact.fun!",
            image: ipfsHash, // Direct link to your meme image on IPFS
            attributes: [
              { trait_type: "Creator", value: address },
              { trait_type: "Platform", value: "Artifact.fun" },
              { trait_type: "Story Protocol IP ID", value: storyProtocolIPId || "N/A" },
            ],
          };

          // 2. Upload NFT Metadata JSON to IPFS
          const metadataBlob = new Blob([JSON.stringify(nftMetadata)], { type: 'application/json' });
          const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
          const metadataIpfsUri = await uploadToIpfs(metadataFile);

          // 3. Mint the NFT using Zora SDK
          const { txHash: mintTxHash } = await mintMemeNFT(
            walletClient,
            CONTRACT_ADDRESSES.zoraMemeNFTCollection as Address,
            metadataIpfsUri,
            1n // Mint 1 NFT for this meme
          );

          setNftMintTxHash(mintTxHash);
          setNftMintStatus(`Meme NFT successfully minted! Tx Hash: ${mintTxHash}`);

        } catch (error) {
          console.error("Failed to mint Meme NFT:", error);
          setNftMintStatus(`Error minting NFT: ${error instanceof Error ? error.message : String(error)}`);
          setNftMintTxHash(null);
        } finally {
            setIsMintingNft(false);
        }
      };


      return (
        <div className="create-meme">
          <h2>Create and Tokenize Your Meme</h2>
          <p>Upload your meme, register its IP, and then either submit it to the contest or mint it as an NFT!</p>

          <form onSubmit={handleProcessMeme}>
            <div className="form-group">
              <label htmlFor="meme-file">Meme Image/GIF:</label>
              <input type="file" id="meme-file" onChange={handleFileChange} accept="image/*" required />
            </div>
            <div className="form-group">
              <label htmlFor="meme-name">Meme Name:</label>
              <input
                type="text"
                id="meme-name"
                value={memeName}
                onChange={(e) => setMemeName(e.target.value)}
                placeholder="e.g., Urashima's Waving Cat"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="meme-description">Description:</label>
              <textarea
                id="meme-description"
                value={memeDescription}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your meme, its story, or significance."
                rows={3}
                required
              ></textarea>
            </div>
            <button type="submit" disabled={!isConnected || !walletClient || !file || !memeName || !memeDescription || ipfsHash !== null}>
              Process Meme (Upload & Register IP)
            </button>
          </form>

          {status && <p className="status-message">{status}</p>}

          {/* Section for Contest Submission */}
          {ipfsHash && storyProtocolIPId && ( // Only show if meme is processed
            <div className="contest-submission-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3>2. Submit to Meme Contest (Requires {parseUnits("10", 18).toString()} PEARL)</h3>
              <p>
                To enter the contest, you need to approve our contract to spend {parseUnits("10", 18).toString()} PEARL for the submission fee.
              </p>
              {!submissionApproved && (
                <button
                  onClick={() => approveSubmissionPearl?.()}
                  disabled={!isConnected || !approveSubmissionPearl || isApprovingSubmission || isSubmittingMeme}
                >
                  {isApprovingSubmission ? 'Approving PEARL...' : 'Approve PEARL for Contest'}
                </button>
              )}
              {submissionApproved && !isMemeSubmitted && (
                <button
                  onClick={() => submitMemeToContest?.()}
                  disabled={!isConnected || !submitMemeToContest || isSubmittingMeme}
                >
                  {isSubmittingMeme ? 'Submitting Meme...' : 'Submit Meme to Contest'}
                </button>
              )}
              {submitMemeData?.hash && (
                <p>
                  Contest Submission Tx:{' '}
                  <a href={`https://sepolia.explorer.zora.energy/tx/${submitMemeData.hash}`} target="_blank" rel="noopener noreferrer">
                    {submitMemeData.hash}
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Section for NFT Minting */}
          {ipfsHash && storyProtocolIPId && ( // Only show if meme is processed
            <div className="nft-minting-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3>3. Tokenize Meme as NFT (Optional)</h3>
              <p>Mint your meme as a unique collectible NFT on Zora. (Assuming free mint for this demo)</p>
              <button
                onClick={handleMintMemeNFT}
                disabled={!isConnected || !walletClient || isMintingNft || nftMintTxHash !== null}
              >
                {isMintingNft ? 'Minting NFT...' : 'Mint Meme NFT'}
              </button>
              {nftMintStatus && <p className="status-message">{nftMintStatus}</p>}
              {nftMintTxHash && (
                <p>
                  NFT Mint Tx:{' '}
                  <a href={`https://sepolia.explorer.zora.energy/tx/${nftMintTxHash}`} target="_blank" rel="noopener noreferrer">
                    {nftMintTxHash}
                  </a>
                </p>
              )}
              {CONTRACT_ADDRESSES.zoraMemeNFTCollection && (
                    <p>
                        View Collection:{' '}
                        <a href={`https://sepolia.explorer.zora.energy/collection/${CONTRACT_ADDRESSES.zoraMemeNFTCollection}`} target="_blank" rel="noopener noreferrer">
                            {CONTRACT_ADDRESSES.zoraMemeNFTCollection}
                        </a>
                    </p>
                )}
            </div>
          )}
        </div>
      );
    };

    export default CreateMeme;
    