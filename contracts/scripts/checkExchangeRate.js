const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Exchange Rate...");
  
  // Contract addresses
  const PEARL_EXCHANGE_ADDRESS = "0x34EBE9A9f7D32A49351477DFa0e1A23D0Fc6724A";
  
  // Get Exchange contract (read-only)
  const PearlExchange = await ethers.getContractAt("PearlExchange", PEARL_EXCHANGE_ADDRESS);
  
  try {
    // Check current rate
    const currentRate = await PearlExchange.pearlPerEthRate();
    const rateFormatted = ethers.formatEther(currentRate);
    
    console.log("📊 Current Exchange Rate:", rateFormatted, "PEARL per ETH");
    
    if (rateFormatted === "1000.0") {
      console.log("✅ Exchange rate is correct!");
    } else if (rateFormatted === "0.000000000000001") {
      console.log("❌ Exchange rate is still wrong! It should be 1000 PEARL per ETH");
      console.log("💡 You need to run the fix script with your private key:");
      console.log("   1. Add your private key to .env file");
      console.log("   2. Run: npx hardhat run scripts/fixExchangeRate.js --network zoraSepolia");
    } else {
      console.log("⚠️  Exchange rate is unexpected:", rateFormatted);
    }
    
  } catch (error) {
    console.error("❌ Error checking rate:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 