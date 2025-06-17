const { ethers } = require("hardhat");

async function main() {
  console.log("Checking contract balances on Zora Sepolia...\n");
  
  // Contract addresses
  const pearlTokenAddress = "0x4E5FEa51924e4BfC3d7c0d99B75f2af22B59AF85";
  const pearlExchangeAddress = "0x34EBE9A9f7D32A49351477DFa0e1A23D0Fc6724A";

  // Create provider for Zora Sepolia
  const provider = new ethers.JsonRpcProvider("https://sepolia.rpc.zora.energy");

  // Get contract instances (read-only)
  const PearlToken = await ethers.getContractFactory("PearlToken");
  const pearlToken = PearlToken.attach(pearlTokenAddress).connect(provider);

  const PearlExchange = await ethers.getContractFactory("PearlExchange");
  const pearlExchange = PearlExchange.attach(pearlExchangeAddress).connect(provider);

  console.log("=== CONTRACT ADDRESSES ===");
  console.log("PEARL Token:", pearlTokenAddress);
  console.log("PEARL Exchange:", pearlExchangeAddress);

  try {
    // Check PEARL token details
    console.log("\n=== PEARL TOKEN INFO ===");
    const name = await pearlToken.name();
    const symbol = await pearlToken.symbol();
    const totalSupply = await pearlToken.totalSupply();
    const decimals = await pearlToken.decimals();
    
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Decimals:", decimals);
    console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals), symbol);

    // Check balances
    console.log("\n=== PEARL TOKEN BALANCES ===");
    const exchangePearlBalance = await pearlToken.balanceOf(pearlExchangeAddress);
    console.log("Exchange Contract:", ethers.formatUnits(exchangePearlBalance, decimals), symbol);

    console.log("\n=== ETH BALANCES ===");
    const exchangeEthBalance = await provider.getBalance(pearlExchangeAddress);
    console.log("Exchange Contract:", ethers.formatEther(exchangeEthBalance), "ETH");

    console.log("\n=== EXCHANGE SETTINGS ===");
    const exchangeRate = await pearlExchange.pearlPerEthRate();
    console.log("Exchange Rate:", ethers.formatUnits(exchangeRate, 18), "PEARL per ETH");

    // Check if exchange is ready
    const isExchangeReady = exchangePearlBalance > 0n && exchangeEthBalance > 0n;
    console.log("\n=== EXCHANGE STATUS ===");
    console.log("Has PEARL tokens:", exchangePearlBalance > 0n ? "✅ YES" : "❌ NO");
    console.log("Has ETH:", exchangeEthBalance > 0n ? "✅ YES" : "❌ NO");
    console.log("Exchange Ready:", isExchangeReady ? "✅ YES - Can trade!" : "❌ NO - Needs funding!");
    
    if (!isExchangeReady) {
      console.log("\n⚠️  PROBLEM IDENTIFIED:");
      if (exchangePearlBalance === 0n) {
        console.log("   - Exchange has 0 PEARL tokens (can't fulfill ETH→PEARL trades)");
      }
      if (exchangeEthBalance === 0n) {
        console.log("   - Exchange has 0 ETH (can't fulfill PEARL→ETH trades)");
      }
      console.log("\n💡 SOLUTION:");
      console.log("   1. Add your private key to .env file");
      console.log("   2. Run: npx hardhat run scripts/fundExchange.js --network zoraSepolia");
    } else {
      console.log("\n🎉 Exchange is properly funded and ready for trading!");
    }

  } catch (error) {
    console.error("❌ Error checking balances:", error.message);
    if (error.message.includes("call revert exception")) {
      console.log("\n💡 This might indicate the contracts are not deployed or the RPC is not responding.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 