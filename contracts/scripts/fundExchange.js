const { ethers } = require("hardhat");

async function main() {
  console.log("🏦 Starting Exchange Funding Process...");
  
  // Contract addresses
  const PEARL_TOKEN_ADDRESS = "0x4E5FEa51924e4BfC3d7c0d99B75f2af22B59AF85";
  const PEARL_EXCHANGE_ADDRESS = "0x34EBE9A9f7D32A49351477DFa0e1A23D0Fc6724A";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  // Check deployer balance
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer ETH balance:", ethers.formatEther(deployerBalance), "ETH");
  
  // Get Pearl Token contract
  const PearlToken = await ethers.getContractAt("PearlToken", PEARL_TOKEN_ADDRESS);
  const deployerPearlBalance = await PearlToken.balanceOf(deployer.address);
  console.log("🪙 Deployer PEARL balance:", ethers.formatEther(deployerPearlBalance), "PEARL");
  
  // Get Exchange contract
  const PearlExchange = await ethers.getContractAt("PearlExchange", PEARL_EXCHANGE_ADDRESS);
  
  // Check current exchange balances
  const exchangeEthBalance = await ethers.provider.getBalance(PEARL_EXCHANGE_ADDRESS);
  const exchangePearlBalance = await PearlToken.balanceOf(PEARL_EXCHANGE_ADDRESS);
  
  console.log("\n📊 Current Exchange Status:");
  console.log("   ETH Balance:", ethers.formatEther(exchangeEthBalance), "ETH");
  console.log("   PEARL Balance:", ethers.formatEther(exchangePearlBalance), "PEARL");
  
  // Funding amounts
  const PEARL_AMOUNT = ethers.parseEther("1500"); // 1500 PEARL tokens
  const ETH_AMOUNT = ethers.parseEther("1.5");    // 1.5 ETH
  
  console.log("\n🚀 Starting funding transactions...");
  
  try {
    // Step 1: Transfer PEARL tokens to exchange
    console.log("1️⃣ Transferring", ethers.formatEther(PEARL_AMOUNT), "PEARL tokens to exchange...");
    const pearlTx = await PearlToken.transfer(PEARL_EXCHANGE_ADDRESS, PEARL_AMOUNT);
    console.log("   Transaction hash:", pearlTx.hash);
    await pearlTx.wait();
    console.log("   ✅ PEARL transfer confirmed!");
    
    // Step 2: Send ETH to exchange
    console.log("2️⃣ Sending", ethers.formatEther(ETH_AMOUNT), "ETH to exchange...");
    const ethTx = await deployer.sendTransaction({
      to: PEARL_EXCHANGE_ADDRESS,
      value: ETH_AMOUNT,
      gasLimit: 21000
    });
    console.log("   Transaction hash:", ethTx.hash);
    await ethTx.wait();
    console.log("   ✅ ETH transfer confirmed!");
    
    // Step 3: Update exchange rate to 1000 PEARL per ETH
    console.log("3️⃣ Setting exchange rate to 1000 PEARL per ETH...");
    const newRate = ethers.parseEther("1000"); // 1000 PEARL per ETH
    const rateTx = await PearlExchange.setPearlPerEthRate(newRate);
    console.log("   Transaction hash:", rateTx.hash);
    await rateTx.wait();
    console.log("   ✅ Exchange rate updated!");
    
    // Final verification
    console.log("\n🎉 Funding Complete! Verifying final balances...");
    
    const finalExchangeEth = await ethers.provider.getBalance(PEARL_EXCHANGE_ADDRESS);
    const finalExchangePearl = await PearlToken.balanceOf(PEARL_EXCHANGE_ADDRESS);
    const finalRate = await PearlExchange.pearlPerEthRate();
    
    console.log("📈 Final Exchange Status:");
    console.log("   ETH Balance:", ethers.formatEther(finalExchangeEth), "ETH");
    console.log("   PEARL Balance:", ethers.formatEther(finalExchangePearl), "PEARL");
    console.log("   Exchange Rate:", ethers.formatEther(finalRate), "PEARL per ETH");
    
    if (finalExchangeEth > 0 && finalExchangePearl > 0) {
      console.log("\n✅ SUCCESS: Exchange is now fully funded and ready for trading!");
      console.log("🔗 Exchange Contract: https://sepolia.explorer.zora.energy/address/" + PEARL_EXCHANGE_ADDRESS);
    } else {
      console.log("\n❌ WARNING: Exchange funding may have failed. Please check manually.");
    }
    
  } catch (error) {
    console.error("\n❌ Error during funding:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 