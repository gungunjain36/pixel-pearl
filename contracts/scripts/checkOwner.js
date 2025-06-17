const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Contract Owner...");
  
  const PEARL_EXCHANGE_ADDRESS = "0x34EBE9A9f7D32A49351477DFa0e1A23D0Fc6724A";
  const YOUR_ADDRESS = "0x4C8cAF1b6e725A50201C023Df331Cc4D757943fe";
  
  // Get Exchange contract
  const PearlExchange = await ethers.getContractAt("PearlExchange", PEARL_EXCHANGE_ADDRESS);
  
  try {
    const owner = await PearlExchange.owner();
    
    console.log("📝 Contract Owner:", owner);
    console.log("👤 Your Address:", YOUR_ADDRESS);
    console.log("🔑 Are you the owner?", owner.toLowerCase() === YOUR_ADDRESS.toLowerCase() ? "✅ YES" : "❌ NO");
    
    if (owner.toLowerCase() !== YOUR_ADDRESS.toLowerCase()) {
      console.log("\n❌ PROBLEM: You are not the owner of this contract!");
      console.log("💡 Only the owner can call setExchangeRate()");
      console.log("🏠 The deployer address is:", owner);
      console.log("📱 You need to use the deployer wallet to change the exchange rate");
    } else {
      console.log("\n✅ You are the owner! The transaction should work.");
      console.log("💡 The gas estimation error might be due to network issues.");
      console.log("🚀 Try clicking 'Send Transaction' anyway - it might work!");
    }
    
  } catch (error) {
    console.error("❌ Error checking owner:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 