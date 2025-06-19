import React, { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { zoraSepolia } from 'wagmi/chains';

interface NetworkStatus {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  chainId: number | undefined;
  hasBalance: boolean;
  balance: string;
}

const NetworkChecker: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isCorrectNetwork: false,
    chainId: undefined,
    hasBalance: false,
    balance: '0'
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      const isCorrectNetwork = chainId === zoraSepolia.id;
      
      // Mock balance check for demo
      const balance = '0.1'; // In a real app, you'd fetch this from the blockchain
      const hasBalance = parseFloat(balance) > 0.001;

      setNetworkStatus({
        isConnected,
        isCorrectNetwork,
        chainId,
        hasBalance,
        balance
      });

      // Show checker if there are issues
      setIsVisible(!isConnected || !isCorrectNetwork || !hasBalance);
    };

    checkNetworkStatus();
  }, [isConnected, chainId, address]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: zoraSepolia.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? '✅' : '❌';
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'var(--neon-green)' : 'var(--neon-red)';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <div className="card p-4 border-2" style={{ borderColor: 'var(--neon-yellow)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            Network Status
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Wallet Connected:</span>
            <span style={{ color: getStatusColor(networkStatus.isConnected) }}>
              {getStatusIcon(networkStatus.isConnected)} {networkStatus.isConnected ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Correct Network:</span>
            <span style={{ color: getStatusColor(networkStatus.isCorrectNetwork) }}>
              {getStatusIcon(networkStatus.isCorrectNetwork)} {networkStatus.isCorrectNetwork ? 'Zora Sepolia' : 'Wrong Network'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Sufficient Balance:</span>
            <span style={{ color: getStatusColor(networkStatus.hasBalance) }}>
              {getStatusIcon(networkStatus.hasBalance)} {networkStatus.balance} ETH
            </span>
          </div>
        </div>

        {!networkStatus.isConnected && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid var(--neon-yellow)' }}>
            <p className="text-sm font-['Inter']" style={{ color: 'var(--text-primary)' }}>
              Please connect your wallet to use this application.
            </p>
          </div>
        )}

        {networkStatus.isConnected && !networkStatus.isCorrectNetwork && (
          <div className="mt-4">
            <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid var(--neon-red)' }}>
              <p className="text-sm font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                You're on the wrong network. Please switch to Zora Sepolia testnet.
              </p>
            </div>
            <button
              onClick={handleSwitchNetwork}
              className="btn-primary w-full py-2 text-sm font-['Inter']"
            >
              Switch to Zora Sepolia
            </button>
          </div>
        )}

        {networkStatus.isConnected && networkStatus.isCorrectNetwork && !networkStatus.hasBalance && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid var(--neon-yellow)' }}>
            <p className="text-sm font-['Inter'] mb-2" style={{ color: 'var(--text-primary)' }}>
              You need testnet ETH for transactions.
            </p>
            <a
              href="https://sepoliafaucet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full py-2 text-sm font-['Inter'] inline-block text-center"
            >
              Get Testnet ETH
            </a>
          </div>
        )}

        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p className="text-xs font-['Inter']" style={{ color: 'var(--text-muted)' }}>
            💡 This app works in demo mode if you encounter issues.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkChecker; 