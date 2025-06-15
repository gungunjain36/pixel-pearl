    // frontend/src/components/CoinContent.tsx
    import React, { useState } from 'react';
    import { useAccount, useWalletClient } from 'wagmi';
    import { uploadToIpfs } from '../services/ipfs';
    import { createZoraCoin } from '../services/zora';
    import { Address } from 'viem';

    const CoinContent: React.FC = () => {
      const { address, isConnected } = useAccount();
      const { data: walletClient } = useWalletClient();
      const [file, setFile] = useState<File | null>(null);
      const [coinName, setCoinName] = useState('');
      const [coinSymbol, setCoinSymbol] = useState('');
      const [status, setStatus] = useState('');
      const [txHash, setTxHash] = useState<string | null>(null);
      const [newCoinAddress, setNewCoinAddress] = useState<Address | null>(null);

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
        }
      };

      const handleCoinContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !walletClient || !address || !file || !coinName || !coinSymbol) {
          setStatus("Please connect your wallet, fill all fields, and select a file.");
          return;
        }

        setStatus("Uploading content to IPFS...");
        try {
          const ipfsUrl = await uploadToIpfs(file);
          setStatus(`IPFS Uploaded: ${ipfsUrl}. Creating Zora Coin...`);

          const { txHash: creationTxHash, coinAddress } = await createZoraCoin(
            walletClient,
            coinName,
            coinSymbol,
            ipfsUrl,
            address // Creator receives initial mint
          );

          setTxHash(creationTxHash);
          setNewCoinAddress(coinAddress);
          setStatus(`Zora Coin "${coinName}" creation transaction sent! Tx Hash: ${creationTxHash}.
                     Coin Address: ${coinAddress}.`);

          // Reset form
          setFile(null);
          setCoinName('');
          setCoinSymbol('');

        } catch (error) {
          console.error("Failed to coin content:", error);
          setStatus(`Error coining content: ${error instanceof Error ? error.message : String(error)}`);
          setTxHash(null);
          setNewCoinAddress(null);
        }
      };

      return (
        <div className="coin-content">
          <h2>Coin Your Mysterious Box Content</h2>
          <p>Convert your story part or picture into a unique, tradable Zora CoinV4 ERC20 token.</p>
          <form onSubmit={handleCoinContent}>
            <div className="form-group">
              <label htmlFor="content-file">Content (Image/Story Part):</label>
              <input type="file" id="content-file" onChange={handleFileChange} accept="image/*, .txt, .pdf" required />
            </div>
            <div className="form-group">
              <label htmlFor="coin-name">Coin Name (e.g., "Urashima Story Part 1"):</label>
              <input
                type="text"
                id="coin-name"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                placeholder="e.g., Urashima's First Mystery"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="coin-symbol">Coin Symbol (e.g., "URSMP1"):</label>
              <input
                type="text"
                id="coin-symbol"
                value={coinSymbol}
                onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., URSMBOX"
                maxLength={10}
                required
              />
            </div>
            <button type="submit" disabled={!isConnected || !walletClient || !file || !coinName || !coinSymbol}>
              Coin My Content
            </button>
          </form>
          {status && <p className="status-message">{status}</p>}
          {txHash && (
            <p>
              Transaction Hash: <a href={`https://sepolia.explorer.zora.energy/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
            </p>
          )}
          {newCoinAddress && newCoinAddress !== '0x0000000000000000000000000000000000000000' && (
            <p>
              New Coin Address: <a href={`https://sepolia.explorer.zora.energy/token/${newCoinAddress}`} target="_blank" rel="noopener noreferrer">{newCoinAddress}</a>
            </p>
          )}
        </div>
      );
    };

    export default CoinContent;
    