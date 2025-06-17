const { ethers } = require("hardhat");

async function main() {
  console.log("Checking contract balances...\n");
  
  const [deployer] = await ethers.getSigners();
  
  // Contract addresses
  const pearlTokenAddress = "0x4E5FEa51924e4BfC3d7c0d99B75f2af22B59AF85";
  const pearlExchangeAddress = "0x34EBE9A9f7D32A49351477DFa0e1A23D0Fc6724A";

  // Get contract instances
  const PearlToken = await ethers.getContractFactory("PearlToken");
  const pearlToken = PearlToken.attach(pearlTokenAddress);

  const PearlExchange = await ethers.getContractFactory("PearlExchange");
  const pearlExchange = PearlExchange.attach(pearlExchangeAddress);

  // Check balances
  console.log("=== PEARL TOKEN BALANCES ===");
  const deployerPearlBalance = await pearlToken.balanceOf(deployer.address);
  const exchangePearlBalance = await pearlToken.balanceOf(pearlExchangeAddress);
  const totalSupply = await pearlToken.totalSupply();
  
  console.log("Total Supply:", ethers.formatUnits(totalSupply, 18), "PEARL");
  console.log("Deployer:", ethers.formatUnits(deployerPearlBalance, 18), "PEARL");
  console.log("Exchange:", ethers.formatUnits(exchangePearlBalance, 18), "PEARL");

  console.log("\n=== ETH BALANCES ===");
  const deployerEthBalance = await deployer.provider.getBalance(deployer.address);
  const exchangeEthBalance = await deployer.provider.getBalance(pearlExchangeAddress);
  
  console.log("Deployer:", ethers.formatEther(deployerEthBalance), "ETH");
  console.log("Exchange:", ethers.formatEther(exchangeEthBalance), "ETH");

  console.log("\n=== EXCHANGE SETTINGS ===");
  const exchangeRate = await pearlExchange.pearlPerEthRate();
  console.log("Exchange Rate:", ethers.formatUnits(exchangeRate, 18), "PEARL per ETH");

  // Check if exchange is ready
  const isExchangeReady = exchangePearlBalance > 0n && exchangeEthBalance > 0n;
  console.log("\n=== STATUS ===");
  console.log("Exchange Ready:", isExchangeReady ? "✅ YES" : "❌ NO");
  
  if (!isExchangeReady) {
    console.log("\n⚠️  ISSUE: Exchange contract needs funding!");
    console.log("Run: npx hardhat run scripts/fundExchange.js --network zoraSepolia");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 