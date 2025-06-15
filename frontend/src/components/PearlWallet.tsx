    // frontend/src/components/PearlWallet.tsx
    import React, { useState } from 'react';
    import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
    import { formatUnits, parseEther, parseUnits } from 'viem';
    import { CONTRACT_ADDRESSES } from '../utils/zora-config';
    import PearlTokenABI from '../abi/PearlToken.json';
    import PearlExchangeABI from '../abi/PearlExchange.json';

    const PearlWallet: React.FC = () => {
      const { address, isConnected } = useAccount();
      const [pearlAmountToSwap, setPearlAmountToSwap] = useState<string>('');
      const [ethAmountToSwap, setEthAmountToSwap] = useState<string>('');
      const [status, setStatus] = useState('');
      
      const { writeContract } = useWriteContract();

      // Read Pearl Token balance
      const { data: pearlBalanceData, refetch: refetchPearlBalance } = useBalance({
        address: address,
        token: CONTRACT_ADDRESSES.pearlToken as `0x${string}`,
        query: {
          enabled: isConnected,
          refetchInterval: 5000, // Auto-refetch every 5 seconds
        },
      });
      const pearlBalance = pearlBalanceData ? formatUnits(pearlBalanceData.value, 18) : '0';

      // Read Exchange Rate
      const { data: exchangeRateRaw } = useReadContract({
        address: CONTRACT_ADDRESSES.pearlExchange as `0x${string}`,
        abi: PearlExchangeABI.abi,
        functionName: 'pearlPerEthRate',
        query: {
          enabled: isConnected,
          refetchInterval: 10000, // Refetch every 10 seconds
        },
      });
      const pearlPerEthRate = exchangeRateRaw ? Number(formatUnits(exchangeRateRaw as bigint, 0)) : 0;

      const handlePearlToEthSwap = async () => {
        if (!isConnected || !pearlAmountToSwap || parseFloat(pearlAmountToSwap) <= 0) {
          setStatus("Please connect wallet and enter a valid Pearl amount.");
          return;
        }

        try {
          setStatus("Approving Pearl tokens...");
          
          // First approve Pearl tokens
          const approveHash = await writeContract({
            address: CONTRACT_ADDRESSES.pearlToken as `0x${string}`,
            abi: PearlTokenABI.abi,
            functionName: 'approve',
            args: [CONTRACT_ADDRESSES.pearlExchange, parseUnits(pearlAmountToSwap, 18)],
          });

          setStatus("Approval submitted. Waiting for confirmation...");
          
          // Wait for approval transaction
          // Note: In a real app, you'd wait for the approval transaction to complete
          // before executing the swap
          
          setTimeout(async () => {
            setStatus("Now swapping Pearl for ETH...");
            const swapHash = await writeContract({
              address: CONTRACT_ADDRESSES.pearlExchange as `0x${string}`,
              abi: PearlExchangeABI.abi,
              functionName: 'exchangePearlForEth',
              args: [parseUnits(pearlAmountToSwap, 18)],
            });

            setStatus(`Swap transaction submitted: ${swapHash}`);
            setPearlAmountToSwap('');
            refetchPearlBalance();
          }, 3000);

        } catch (error) {
          console.error('Error swapping Pearl to ETH:', error);
          setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      const handleEthToPearlSwap = async () => {
        if (!isConnected || !ethAmountToSwap || parseFloat(ethAmountToSwap) <= 0) {
          setStatus("Please connect wallet and enter a valid ETH amount.");
          return;
        }

        try {
          setStatus("Swapping ETH for Pearl...");
          
          const hash = await writeContract({
            address: CONTRACT_ADDRESSES.pearlExchange as `0x${string}`,
            abi: PearlExchangeABI.abi,
            functionName: 'exchangeEthForPearl',
            value: parseEther(ethAmountToSwap),
          });

          setStatus(`Swap transaction submitted: ${hash}`);
          
          // Clear inputs on success
          setTimeout(() => {
            setEthAmountToSwap('');
            refetchPearlBalance();
          }, 2000);

        } catch (error) {
          console.error('Error swapping ETH to Pearl:', error);
          setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
            <h1 className="text-4xl font-bold mb-4">💎 Pearl Wallet</h1>
            <p className="text-xl">Manage your Pearl tokens and exchange with ETH</p>
          </div>

          {!isConnected && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
              <p className="font-bold">Connect Your Wallet</p>
              <p>Please connect your wallet to manage your Pearl tokens.</p>
            </div>
          )}

          {isConnected && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Balance Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Your Balance</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-gray-600">Pearl Balance:</span>
                    <span className="font-bold text-blue-600">{pearlBalance} PEARL</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-bold text-green-600">1 ETH = {pearlPerEthRate} PEARL</span>
                  </div>
                </div>
              </div>

              {/* Exchange Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔄 Exchange</h2>
                
                {/* Pearl to ETH */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Pearl → ETH</h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Pearl Amount"
                      value={pearlAmountToSwap}
                      onChange={(e) => setPearlAmountToSwap(e.target.value)}
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {pearlAmountToSwap && pearlPerEthRate > 0 && (
                      <p className="text-sm text-gray-600">
                        ≈ {(parseFloat(pearlAmountToSwap) / pearlPerEthRate).toFixed(6)} ETH
                      </p>
                    )}
                    <button
                      onClick={handlePearlToEthSwap}
                      disabled={!isConnected || parseFloat(pearlAmountToSwap) <= 0}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Swap Pearl for ETH
                    </button>
                  </div>
                </div>

                {/* ETH to Pearl */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">ETH → Pearl</h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="ETH Amount"
                      value={ethAmountToSwap}
                      onChange={(e) => setEthAmountToSwap(e.target.value)}
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {ethAmountToSwap && pearlPerEthRate > 0 && (
                      <p className="text-sm text-gray-600">
                        ≈ {(parseFloat(ethAmountToSwap) * pearlPerEthRate).toFixed(2)} PEARL
                      </p>
                    )}
                    <button
                      onClick={handleEthToPearlSwap}
                      disabled={!isConnected || parseFloat(ethAmountToSwap) <= 0}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Swap ETH for Pearl
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-md">
              <p className="text-blue-800">{status}</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ℹ️ How Pearl Exchange Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🪙 Pearl Tokens</h3>
                <p className="text-gray-600">
                  Pearl (PEARL) is the native utility token of the Artifact.fun platform. 
                  Use it to participate in meme contests, vote on submissions, and earn rewards.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">🔄 Exchange Rates</h3>
                <p className="text-gray-600">
                  Exchange rates are set by the contract owner and may change based on market conditions. 
                  Always check the current rate before making a swap.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default PearlWallet;
    