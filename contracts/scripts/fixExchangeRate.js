const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing Exchange Rate...");
  
  // Contract addresses
  const PEARL_EXCHANGE_ADDRESS = "0x34EBE9A9f7D32A49351477DFa0e1A23D0Fc6724A";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  // Get Exchange contract
  const PearlExchange = await ethers.getContractAt("PearlExchange", PEARL_EXCHANGE_ADDRESS);
  
  // Check current rate
  const currentRate = await PearlExchange.pearlPerEthRate();
  console.log("❌ Current rate:", ethers.formatEther(currentRate), "PEARL per ETH");
  
  // Set correct rate: 1000 PEARL per ETH
  const correctRate = ethers.parseEther("1000");
  console.log("🔄 Setting rate to:", ethers.formatEther(correctRate), "PEARL per ETH");
  
  try {
    const tx = await PearlExchange.setExchangeRate(correctRate);
    console.log("📝 Transaction hash:", tx.hash);
    await tx.wait();
    
    // Verify the new rate
    const newRate = await PearlExchange.pearlPerEthRate();
    console.log("✅ New rate:", ethers.formatEther(newRate), "PEARL per ETH");
    
    if (ethers.formatEther(newRate) === "1000.0") {
      console.log("🎉 Exchange rate fixed successfully!");
      console.log("🔗 Transaction: https://sepolia.explorer.zora.energy/tx/" + tx.hash);
    } else {
      console.log("❌ Rate update failed");
    }
    
  } catch (error) {
    console.error("❌ Error updating rate:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 