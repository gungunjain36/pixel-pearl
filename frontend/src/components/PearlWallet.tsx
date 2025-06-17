import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import useContracts from '../hooks/useContracts';

interface TransactionTiming {
  startTime: number;
  endTime?: number;
  type: 'normal' | 'fast' | 'instant';
  hash?: string;
}

const PearlWallet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [ethAmount, setEthAmount] = useState('');
  const [pearlAmount, setPearlAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transactionTiming, setTransactionTiming] = useState<TransactionTiming | null>(null);

  const {
    usePearlBalance,
    exchangeEthForPearl,
    exchangePearlForEth,
    fastExchangeEthForPearl,
    instantExchangeEthForPearl,
    transferPearl,
    getExchangeRate,
    formatEther,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    chainId,
    isZoraSepolia
  } = useContracts();

  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
  });

  const { data: pearlBalance, refetch: refetchPearlBalance } = usePearlBalance();
  const { data: exchangeRate } = getExchangeRate();

  // Monitor transaction completion times and refresh balances
  useEffect(() => {
    if (isConfirmed && transactionTiming && !transactionTiming.endTime) {
      const endTime = Date.now();
      const duration = (endTime - transactionTiming.startTime) / 1000;
      setTransactionTiming(prev => prev ? { ...prev, endTime, hash } : null);
      
      console.log(`🎉 Transaction completed in ${duration.toFixed(1)} seconds using ${transactionTiming.type} speed!`);
      
      // Refresh balances after transaction completion
      setTimeout(() => {
        refetchEthBalance();
        refetchPearlBalance();
      }, 1000);
    }
  }, [isConfirmed, transactionTiming, hash]);

  const startTransactionTimer = (type: 'normal' | 'fast' | 'instant') => {
    setTransactionTiming({
      startTime: Date.now(),
      type
    });
  };

  const handleEthToPearl = async () => {
    if (!ethAmount) return;
    try {
      startTransactionTimer('normal');
      await exchangeEthForPearl(ethAmount);
      setEthAmount('');
    } catch (error) {
      console.error('Exchange failed:', error);
      setTransactionTiming(null);
    }
  };

  const handleFastEthToPearl = async () => {
    if (!ethAmount) return;
    try {
      startTransactionTimer('fast');
      await fastExchangeEthForPearl(ethAmount);
      setEthAmount('');
    } catch (error) {
      console.error('Fast exchange failed:', error);
      setTransactionTiming(null);
    }
  };

  const handleInstantEthToPearl = async () => {
    if (!ethAmount) return;
    try {
      startTransactionTimer('instant');
      await instantExchangeEthForPearl(ethAmount);
      setEthAmount('');
    } catch (error) {
      console.error('Instant exchange failed:', error);
      setTransactionTiming(null);
    }
  };

  const handlePearlToEth = async () => {
    if (!pearlAmount) return;
    try {
      await exchangePearlForEth(pearlAmount);
      setPearlAmount('');
    } catch (error) {
      console.error('Exchange failed:', error);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return;
    try {
      await transferPearl(transferTo, transferAmount);
      setTransferTo('');
      setTransferAmount('');
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  const getSpeedEmoji = (type: string) => {
    switch (type) {
      case 'normal': return '🐢';
      case 'fast': return '⚡';
      case 'instant': return '🔥';
      default: return '⏱️';
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pearl Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access Pearl Wallet features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          ⚡ Pearl Wallet {isZoraSepolia ? '- Zora Sepolia' : ''}
        </h2>
        
        {/* Balance Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">ETH Balance</h3>
            <p className="text-2xl font-bold">
              {ethBalance ? formatEther(ethBalance.value).slice(0, 8) : '0'} ETH
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Pearl Balance</h3>
            <p className="text-2xl font-bold">
              {pearlBalance ? formatEther(pearlBalance).slice(0, 8) : '0'} PEARL
            </p>
          </div>
        </div>

        {/* Exchange Rate */}
        {exchangeRate && (
          <div className="bg-gray-100 p-4 rounded-lg mb-8 text-center">
            <p className="text-gray-700 font-semibold">
              Exchange Rate: 1 ETH = {exchangeRate.toString()} PEARL
            </p>
          </div>
        )}

        {/* Transaction Timing Display */}
        {transactionTiming && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg mb-8">
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-2">
                {getSpeedEmoji(transactionTiming.type)} Transaction in Progress - {transactionTiming.type.toUpperCase()} Speed
              </p>
              {transactionTiming.endTime ? (
                <p className="text-green-600 font-semibold">
                  ✅ Completed in {((transactionTiming.endTime - transactionTiming.startTime) / 1000).toFixed(1)} seconds!
                </p>
              ) : (
                <p className="text-blue-600">
                  ⏱️ Running for {((Date.now() - transactionTiming.startTime) / 1000).toFixed(1)} seconds...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Exchange Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* ETH to Pearl */}
          <div className="border border-gray-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Exchange ETH for PEARL</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ETH Amount
                </label>
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="0.1"
                  step="0.001"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleEthToPearl}
                  disabled={!ethAmount || isPending || isConfirming}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending || isConfirming ? 'Processing...' : '🐢 Normal Exchange'}
                </button>
                <button
                  onClick={handleFastEthToPearl}
                  disabled={!ethAmount || isPending || isConfirming}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isPending || isConfirming ? 'Processing Fast...' : '⚡ Fast Exchange'}
                </button>
                <button
                  onClick={handleInstantEthToPearl}
                  disabled={!ethAmount || isPending || isConfirming}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isPending || isConfirming ? 'Processing Instantly...' : '🔥 Instant Exchange'}
                </button>
              </div>
            </div>
          </div>

          {/* Pearl to ETH */}
          <div className="border border-gray-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Exchange PEARL for ETH</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PEARL Amount
                </label>
                <input
                  type="number"
                  value={pearlAmount}
                  onChange={(e) => setPearlAmount(e.target.value)}
                  placeholder="100"
                  step="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handlePearlToEth}
                disabled={!pearlAmount || isPending || isConfirming}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending || isConfirming ? 'Processing...' : 'Exchange PEARL → ETH'}
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="border border-gray-200 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Transfer PEARL Tokens</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PEARL)
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="10"
                step="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleTransfer}
            disabled={!transferTo || !transferAmount || isPending || isConfirming}
            className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending || isConfirming ? 'Processing...' : 'Transfer PEARL'}
          </button>
        </div>

        {/* Transaction Status */}
        {isPending && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <p>⏳ Transaction submitted. Waiting for confirmation...</p>
          </div>
        )}

        {isConfirming && (
          <div className="mt-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            <p>🔄 Transaction confirming...</p>
          </div>
        )}

        {isConfirmed && hash && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <p>✅ Transaction confirmed!</p>
            <p className="text-sm break-all">Hash: {hash}</p>
            <a 
              href={`https://sepolia.explorer.zora.energy/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View on Zora Explorer →
            </a>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p>❌ Error: {error.message}</p>
          </div>
        )}

        {/* Wallet Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Connected Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </p>
          {isZoraSepolia && (
            <p className="text-sm text-purple-600 mt-1">
              💜 Connected to Zora Sepolia Testnet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PearlWallet;
