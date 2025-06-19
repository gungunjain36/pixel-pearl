import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import useContracts from '../hooks/useContracts';
import { CONTRACT_ADDRESSES } from '../utils/zora-config';

interface TransactionTiming {
  startTime: number;
  endTime?: number;
  type: 'exchange';
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
      
      console.log(`🎉 Transaction completed in ${duration.toFixed(1)} seconds!`);
      
      // Refresh balances after transaction completion
      setTimeout(() => {
        refetchEthBalance();
        refetchPearlBalance();
      }, 1000);
    }
  }, [isConfirmed, transactionTiming, hash]);

  const startTransactionTimer = () => {
    setTransactionTiming({
      startTime: Date.now(),
      type: 'exchange'
    });
  };

  const handleEthToPearl = async () => {
    if (!ethAmount) {
      alert('Please enter an ETH amount');
      return;
    }
    
    // Add detailed debugging
    console.log('🔍 Starting ETH to PEARL exchange debug...');
    console.log('- ETH Amount:', ethAmount);
    console.log('- Wallet Connected:', isConnected);
    console.log('- Address:', address);
    console.log('- Chain ID:', chainId);
    console.log('- Is Zora Sepolia:', isZoraSepolia);
    console.log('- Contract Address:', CONTRACT_ADDRESSES?.PEARL_EXCHANGE);
    
    if (!isConnected) {
      alert('Wallet not connected. Please connect your wallet first.');
      return;
    }
    
    if (!isZoraSepolia) {
      alert('Wrong network. Please switch to Zora Sepolia network.');
      return;
    }
    
    try {
      console.log('📝 About to call exchangeEthForPearl...');
      startTransactionTimer();
      await exchangeEthForPearl(ethAmount);
      console.log('✅ Exchange call completed');
      setEthAmount('');
    } catch (error) {
      console.error('❌ Exchange failed:', error);
      alert(`Exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  if (!isConnected) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
        {/* Animated Background */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-primary)' }}></div>
          <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full blur-3xl animate-pulse" style={{ background: 'var(--gradient-secondary)' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20">
          <div className="card p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              💎 Pearl Wallet
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
              Please connect your wallet to access Pearl Wallet features.
            </p>
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

      <div className="relative max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            💎 Pearl Wallet
          </h1>
          <p className="text-xl max-w-3xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            {isZoraSepolia ? 'Zora Sepolia Network - ' : ''}Exchange ETH for PEARL tokens and manage your wallet
          </p>
        </div>

        <div className="card p-8">
          {/* Balance Display */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl" style={{ background: 'var(--gradient-primary)', color: 'var(--primary-bg)' }}>
              <h3 className="text-lg font-semibold mb-2 font-['Space_Grotesk']">ETH Balance</h3>
              <p className="text-2xl font-bold font-['Inter']">
                {ethBalance ? formatEther(ethBalance.value).slice(0, 8) : '0'} ETH
              </p>
            </div>
            <div className="p-6 rounded-xl" style={{ background: 'var(--gradient-secondary)', color: 'var(--primary-bg)' }}>
              <h3 className="text-lg font-semibold mb-2 font-['Space_Grotesk']">Pearl Balance</h3>
              <p className="text-2xl font-bold font-['Inter']">
                {pearlBalance ? formatEther(pearlBalance as bigint).slice(0, 8) : '0'} PEARL
              </p>
            </div>
          </div>

          {/* Exchange Rate */}
          {exchangeRate && (
            <div className="card p-4 mb-8 text-center" style={{ borderColor: 'var(--neon-blue)' }}>
              <p className="font-semibold font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                Exchange Rate: 1 ETH = {exchangeRate.toString()} PEARL
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="card p-6 mb-8" style={{ borderColor: 'var(--neon-red)' }}>
              <div className="text-center">
                <p className="font-semibold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--neon-red)' }}>
                  ❌ Transaction Error
                </p>
                <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                  {error.message || 'An unknown error occurred'}
                </p>
                {error.message?.includes('PEARL_EXCHANGE') && (
                  <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--card-bg)', borderColor: 'var(--neon-yellow)', border: '2px solid' }}>
                    <p className="font-semibold text-sm font-['Inter']" style={{ color: 'var(--neon-yellow)' }}>💡 Fix Required:</p>
                    <p className="text-xs mt-1 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                      Create a .env file in the frontend directory and add your deployed contract addresses:
                    </p>
                    <code className="block mt-2 text-xs p-2 rounded font-mono" style={{ background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}>
                      VITE_PEARL_EXCHANGE_ADDRESS=YOUR_DEPLOYED_EXCHANGE_ADDRESS_HERE
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Network Warning */}
          {!isZoraSepolia && (
            <div className="card p-6 mb-8" style={{ borderColor: 'var(--neon-yellow)' }}>
              <div className="text-center">
                <p className="font-semibold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--neon-yellow)' }}>
                  ⚠️ Wrong Network
                </p>
                <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                  Please switch to Zora Sepolia network to use PEARL exchange functionality.
                </p>
              </div>
            </div>
          )}

          {/* Transaction Timing Display */}
          {transactionTiming && (
            <div className="card p-6 mb-8" style={{ borderColor: 'var(--neon-blue)' }}>
              <div className="text-center">
                <p className="font-semibold mb-2 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                  ⚡ Transaction in Progress
                </p>
                {transactionTiming.endTime ? (
                  <p className="font-semibold font-['Inter']" style={{ color: 'var(--neon-green)' }}>
                    ✅ Completed in {((transactionTiming.endTime - transactionTiming.startTime) / 1000).toFixed(1)} seconds!
                  </p>
                ) : (
                  <p className="font-['Inter']" style={{ color: 'var(--neon-blue)' }}>
                    ⏱️ Running for {((Date.now() - transactionTiming.startTime) / 1000).toFixed(1)} seconds...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Exchange Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* ETH to Pearl */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                Exchange ETH for PEARL
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    ETH Amount
                  </label>
                  <input
                    type="number"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    placeholder="0.1"
                    step="0.001"
                    className="input-field"
                  />
                </div>
                <button
                  onClick={handleEthToPearl}
                  disabled={!ethAmount || isPending || isConfirming}
                  className="btn-primary w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                >
                  {isPending || isConfirming ? 'Processing...' : '💎 Exchange ETH → PEARL'}
                </button>
              </div>
            </div>

            {/* Pearl to ETH */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
                Exchange PEARL for ETH
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                    PEARL Amount
                  </label>
                  <input
                    type="number"
                    value={pearlAmount}
                    onChange={(e) => setPearlAmount(e.target.value)}
                    placeholder="100"
                    step="1"
                    className="input-field"
                  />
                </div>
                <button
                  onClick={handlePearlToEth}
                  disabled={!pearlAmount || isPending || isConfirming}
                  className="btn-secondary w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
                >
                  {isPending || isConfirming ? 'Processing...' : 'Exchange PEARL → ETH'}
                </button>
              </div>
            </div>
          </div>

          {/* Transfer Section */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              Transfer PEARL Tokens
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                  Amount (PEARL)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="10"
                  step="1"
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={handleTransfer}
              disabled={!transferTo || !transferAmount || isPending || isConfirming}
              className="btn-ghost w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-['Inter']"
            >
              {isPending || isConfirming ? 'Processing...' : 'Transfer PEARL'}
            </button>
          </div>

          {/* Transaction Status */}
          {isPending && (
            <div className="mt-6 card p-4" style={{ borderColor: 'var(--neon-yellow)' }}>
              <p className="font-['Inter']" style={{ color: 'var(--neon-yellow)' }}>
                ⏳ Transaction submitted. Waiting for confirmation...
              </p>
            </div>
          )}

          {isConfirming && (
            <div className="mt-6 card p-4" style={{ borderColor: 'var(--neon-blue)' }}>
              <p className="font-['Inter']" style={{ color: 'var(--neon-blue)' }}>
                🔄 Transaction confirming...
              </p>
            </div>
          )}

          {isConfirmed && hash && (
            <div className="mt-6 card p-4" style={{ borderColor: 'var(--neon-green)' }}>
              <p className="font-['Inter']" style={{ color: 'var(--neon-green)' }}>✅ Transaction confirmed!</p>
              <p className="text-sm break-all mt-2 font-mono" style={{ color: 'var(--text-secondary)' }}>Hash: {hash}</p>
              <a 
                href={`https://sepolia.explorer.zora.energy/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all font-['Inter'] mt-2 inline-block"
                style={{ color: 'var(--neon-blue)' }}
              >
                View on Zora Explorer →
              </a>
            </div>
          )}

          {/* Wallet Info */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-sm font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Connected Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </p>
            {isZoraSepolia && (
              <p className="text-sm mt-1 font-['Inter']" style={{ color: 'var(--neon-blue)' }}>
                💜 Connected to Zora Sepolia Testnet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PearlWallet;
