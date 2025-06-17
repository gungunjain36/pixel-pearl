const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PearlExchange contract...");
  
  // Get the ContractFactory and Signers here
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy PearlToken first if needed
  const PearlToken = await ethers.getContractFactory("PearlToken");
  const initialSupply = ethers.parseUnits("10000000", 18); // 10M PEARL tokens
  const pearlToken = await PearlToken.deploy(initialSupply);
  await pearlToken.waitForDeployment();
  const pearlTokenAddress = await pearlToken.getAddress();
  console.log("PearlToken deployed to:", pearlTokenAddress);

  // Deploy PearlExchange with PearlToken address and initial rate
  const PearlExchange = await ethers.getContractFactory("PearlExchange");
  const initialRate = ethers.parseUnits("1000", 18); // 1000 PEARL per 1 ETH
  const pearlExchange = await PearlExchange.deploy(pearlTokenAddress, initialRate);
  await pearlExchange.waitForDeployment();
  const pearlExchangeAddress = await pearlExchange.getAddress();
  
  console.log("PearlExchange deployed to:", pearlExchangeAddress);
  console.log("Initial exchange rate:", ethers.formatUnits(initialRate, 18), "PEARL per ETH");

  // Transfer some PEARL tokens to the exchange contract so it can fulfill exchanges
  const exchangePearlSupply = ethers.parseUnits("5000000", 18); // 5M PEARL tokens
  console.log("Transferring PEARL tokens to exchange contract...");
  const transferTx = await pearlToken.transfer(pearlExchangeAddress, exchangePearlSupply);
  await transferTx.wait();
  console.log("Transferred", ethers.formatUnits(exchangePearlSupply, 18), "PEARL to exchange contract");

  // Deposit some ETH to the exchange contract for PEARL -> ETH exchanges
  const ethAmount = ethers.parseEther("100"); // 100 ETH
  console.log("Depositing ETH to exchange contract...");
  const depositTx = await pearlExchange.depositEth({ value: ethAmount });
  await depositTx.wait();
  console.log("Deposited", ethers.formatEther(ethAmount), "ETH to exchange contract");

  // Verify the exchange contract has the tokens
  const exchangePearlBalance = await pearlToken.balanceOf(pearlExchangeAddress);
  const exchangeEthBalance = await deployer.provider.getBalance(pearlExchangeAddress);
  
  console.log("\n=== Deployment Summary ===");
  console.log("PearlToken address:", pearlTokenAddress);
  console.log("PearlExchange address:", pearlExchangeAddress);
  console.log("Exchange rate:", "1000 PEARL per 1 ETH");
  console.log("Exchange PEARL balance:", ethers.formatUnits(exchangePearlBalance, 18), "PEARL");
  console.log("Exchange ETH balance:", ethers.formatEther(exchangeEthBalance), "ETH");
  
  console.log("\n=== Add these to your .env file ===");
  console.log(`VITE_PEARL_TOKEN_ADDRESS=${pearlTokenAddress}`);
  console.log(`VITE_PEARL_EXCHANGE_ADDRESS=${pearlExchangeAddress}`);

  console.log("\n=== IMPORTANT: Contract is now funded and ready! ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 