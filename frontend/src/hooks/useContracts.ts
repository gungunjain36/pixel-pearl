import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useEstimateGas, useGasPrice, useFeeData, useChainId } from 'wagmi';
import { parseEther, formatEther, parseGwei } from 'viem';
import { zoraSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES } from '../utils/zora-config';

// Import ABIs
import PearlTokenABI from '../abi/PearlToken.json';
import MysteryBoxABI from '../abi/MysteryBox.json';
import MemeContestABI from '../abi/MemeContest.json';
import PearlExchangeABI from '../abi/PearlExchange.json';

export const useContracts = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get current gas price and fee data for EIP-1559 optimization
  const { data: gasPrice } = useGasPrice();
  const { data: feeData } = useFeeData();

  // Check if we're on Zora Sepolia
  const isZoraSepolia = chainId === zoraSepolia.id;

  // Calculate optimized gas fees for different speed levels
  const getGasFees = (speedMultiplier: number = 1.2) => {
    if (isZoraSepolia) {
      // EMERGENCY FIX: Use much higher gas fees for Zora Sepolia
      // Many transactions are getting stuck with low fees
      const zoraMultiplier = Math.max(speedMultiplier * 3.0, 5.0); // Minimum 5x multiplier
      
      if (feeData?.maxFeePerGas && feeData?.maxPriorityFeePerGas) {
        return {
          maxFeePerGas: (feeData.maxFeePerGas * BigInt(Math.floor(zoraMultiplier * 100))) / 100n,
          maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * BigInt(Math.floor(zoraMultiplier * 100))) / 100n,
        };
      } else if (gasPrice) {
        return {
          gasPrice: (gasPrice * BigInt(Math.floor(zoraMultiplier * 100))) / 100n,
        };
      }
    } else {
      // Standard Ethereum gas optimization
      if (feeData?.maxFeePerGas && feeData?.maxPriorityFeePerGas) {
        return {
          maxFeePerGas: (feeData.maxFeePerGas * BigInt(Math.floor(speedMultiplier * 100))) / 100n,
          maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * BigInt(Math.floor(speedMultiplier * 100))) / 100n,
        };
      } else if (gasPrice) {
        return {
          gasPrice: (gasPrice * BigInt(Math.floor(speedMultiplier * 100))) / 100n,
        };
      }
    }
    return {};
  };

  // Get optimized gas limits for Zora Sepolia
  const getGasLimit = (baseLimit: bigint) => {
    if (isZoraSepolia) {
      // Zora Sepolia typically needs less gas
      return (baseLimit * 80n) / 100n; // 20% less gas for Zora
    }
    return baseLimit;
  };

  // Pearl Token Contract Functions
  const usePearlBalance = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.PEARL_TOKEN as `0x${string}`,
      abi: PearlTokenABI,
      functionName: 'balanceOf',
      args: [address],
      query: {
        enabled: !!address,
      },
    });
  };

  const approvePearl = async (spender: string, amount: string) => {
    try {
      const gasLimit = getGasLimit(60000n);
      const gasFees = getGasFees(1.1); // Lower multiplier for Zora

      console.log(`🔗 Network: ${isZoraSepolia ? 'Zora Sepolia' : 'Other'}`);
      console.log('Gas settings:', { gasLimit, ...gasFees });

      await writeContract({
        address: CONTRACT_ADDRESSES.PEARL_TOKEN as `0x${string}`,
        abi: PearlTokenABI,
        functionName: 'approve',
        args: [spender, parseEther(amount)],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error approving Pearl tokens:', error);
      throw error;
    }
  };

  const transferPearl = async (to: string, amount: string) => {
    try {
      const gasLimit = getGasLimit(65000n);
      const gasFees = getGasFees(1.1);

      await writeContract({
        address: CONTRACT_ADDRESSES.PEARL_TOKEN as `0x${string}`,
        abi: PearlTokenABI,
        functionName: 'transfer',
        args: [to, parseEther(amount)],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error transferring Pearl tokens:', error);
      throw error;
    }
  };

  // Mystery Box Contract Functions
  const createMysteryBox = async (
    contentType: string,
    ipfsHash: string,
    storyProtocolIPId: string,
    mintPrice: string
  ) => {
    try {
      const gasLimit = getGasLimit(200000n);
      const gasFees = getGasFees(1.1);

      await writeContract({
        address: CONTRACT_ADDRESSES.MYSTERY_BOX as `0x${string}`,
        abi: MysteryBoxABI,
        functionName: 'createMysteryBox',
        args: [contentType, ipfsHash, storyProtocolIPId, parseEther(mintPrice)],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error creating mystery box:', error);
      throw error;
    }
  };

  const purchaseMysteryBox = async (tokenId: number) => {
    try {
      const gasLimit = getGasLimit(150000n);
      const gasFees = getGasFees(1.1);

      await writeContract({
        address: CONTRACT_ADDRESSES.MYSTERY_BOX as `0x${string}`,
        abi: MysteryBoxABI,
        functionName: 'purchaseMysteryBox',
        args: [tokenId],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error purchasing mystery box:', error);
      throw error;
    }
  };

  const convertToCoinV4 = async (tokenId: number) => {
    try {
      const gasLimit = getGasLimit(120000n);
      const gasFees = getGasFees(1.1);

      await writeContract({
        address: CONTRACT_ADDRESSES.MYSTERY_BOX as `0x${string}`,
        abi: MysteryBoxABI,
        functionName: 'convertToCoinV4',
        args: [tokenId],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error converting to CoinV4:', error);
      throw error;
    }
  };

  // Meme Contest Contract Functions
  const submitMeme = async (ipfsHash: string, storyProtocolIPId: string) => {
    try {
      const gasLimit = getGasLimit(180000n);
      const gasFees = getGasFees(1.1);

      await writeContract({
        address: CONTRACT_ADDRESSES.MEME_CONTEST as `0x${string}`,
        abi: MemeContestABI,
        functionName: 'submitMeme',
        args: [ipfsHash, storyProtocolIPId],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error submitting meme:', error);
      throw error;
    }
  };

  const voteForMeme = async (memeId: number) => {
    try {
      const gasLimit = getGasLimit(100000n);
      const gasFees = getGasFees(1.1);

      await writeContract({
        address: CONTRACT_ADDRESSES.MEME_CONTEST as `0x${string}`,
        abi: MemeContestABI,
        functionName: 'voteForMeme',
        args: [memeId],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error voting for meme:', error);
      throw error;
    }
  };

  const getContestResults = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.MEME_CONTEST as `0x${string}`,
      abi: MemeContestABI,
      functionName: 'getContestResults',
    });
  };

  // Pearl Exchange Contract Functions - ZORA SEPOLIA OPTIMIZED
  const exchangeEthForPearl = async (ethAmount: string) => {
    try {
      const gasLimit = getGasLimit(120000n);
      const gasFees = getGasFees(isZoraSepolia ? 2.0 : 1.5); // Higher multiplier for Zora

      console.log(`🚀 Starting ${isZoraSepolia ? 'Zora Sepolia' : 'Ethereum'} optimized ETH to PEARL exchange...`);
      console.log('Network Chain ID:', chainId);
      console.log('Gas settings:', { gasLimit, ...gasFees });

      await writeContract({
        address: CONTRACT_ADDRESSES.PEARL_EXCHANGE as `0x${string}`,
        abi: PearlExchangeABI,
        functionName: 'exchangeEthForPearl',
        value: parseEther(ethAmount),
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error exchanging ETH for Pearl:', error);
      throw error;
    }
  };

  const exchangePearlForEth = async (pearlAmount: string) => {
    try {
      const gasLimit = getGasLimit(150000n);
      const gasFees = getGasFees(isZoraSepolia ? 2.0 : 1.5);

      console.log(`🚀 Starting ${isZoraSepolia ? 'Zora Sepolia' : 'Ethereum'} optimized PEARL to ETH exchange...`);

      await writeContract({
        address: CONTRACT_ADDRESSES.PEARL_EXCHANGE as `0x${string}`,
        abi: PearlExchangeABI,
        functionName: 'exchangePearlForEth',
        args: [parseEther(pearlAmount)],
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error exchanging Pearl for ETH:', error);
      throw error;
    }
  };

  // FAST exchange optimized for Zora Sepolia
  const fastExchangeEthForPearl = async (ethAmount: string) => {
    try {
      const gasLimit = getGasLimit(120000n);
      const gasFees = getGasFees(isZoraSepolia ? 3.0 : 2.5); // Higher for Zora's 2s blocks

      console.log('⚡ FAST exchange mode activated!');
      console.log(`Network: ${isZoraSepolia ? 'Zora Sepolia (2s blocks)' : 'Ethereum'}`);
      console.log('Gas settings:', { gasLimit, ...gasFees });

      await writeContract({
        address: CONTRACT_ADDRESSES.PEARL_EXCHANGE as `0x${string}`,
        abi: PearlExchangeABI,
        functionName: 'exchangeEthForPearl',
        value: parseEther(ethAmount),
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error in fast exchange:', error);
      throw error;
    }
  };

  // INSTANT exchange - optimized for Zora's fast blocks
  const instantExchangeEthForPearl = async (ethAmount: string) => {
    try {
      const gasLimit = getGasLimit(120000n);
      const gasFees = getGasFees(isZoraSepolia ? 4.0 : 4.0); // High priority for instant

      console.log('🔥 INSTANT exchange mode activated!');
      console.log(`Network: ${isZoraSepolia ? 'Zora Sepolia (2s blocks)' : 'Ethereum'}`);
      console.log('Gas settings:', { gasLimit, ...gasFees });

      await writeContract({
        address: CONTRACT_ADDRESSES.PEARL_EXCHANGE as `0x${string}`,
        abi: PearlExchangeABI,
        functionName: 'exchangeEthForPearl',
        value: parseEther(ethAmount),
        gas: gasLimit,
        ...gasFees,
      });
    } catch (error) {
      console.error('Error in instant exchange:', error);
      throw error;
    }
  };

  const getExchangeRate = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.PEARL_EXCHANGE as `0x${string}`,
      abi: PearlExchangeABI,
      functionName: 'pearlPerEthRate',
    });
  };

  return {
    // Transaction states
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // Network info
    chainId,
    isZoraSepolia,

    // Pearl Token functions
    usePearlBalance,
    approvePearl,
    transferPearl,

    // Mystery Box functions
    createMysteryBox,
    purchaseMysteryBox,
    convertToCoinV4,

    // Meme Contest functions
    submitMeme,
    voteForMeme,
    getContestResults,

    // Pearl Exchange functions (Zora-optimized)
    exchangeEthForPearl,
    exchangePearlForEth,
    fastExchangeEthForPearl,
    instantExchangeEthForPearl,
    getExchangeRate,

    // Utility functions
    formatEther,
    parseEther,
    
    // Gas fee information
    feeData,
    gasPrice,
  };
};

export default useContracts; 