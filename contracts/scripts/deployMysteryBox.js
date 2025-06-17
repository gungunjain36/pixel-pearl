const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying UrashmaTaroMysteryBox contract...");

  // Get the deployed PearlToken address
  const pearlTokenAddress = process.env.PEARL_TOKEN_ADDRESS || "";
  
  if (!pearlTokenAddress) {
    throw new Error("PEARL_TOKEN_ADDRESS environment variable not set");
  }

  const MysteryBox = await ethers.getContractFactory("UrashmaTaroMysteryBox");
  const mysteryBox = await MysteryBox.deploy(pearlTokenAddress);

  await mysteryBox.waitForDeployment();
  const mysteryBoxAddress = await mysteryBox.getAddress();

  console.log("UrashmaTaroMysteryBox deployed to:", mysteryBoxAddress);
  console.log("Pearl Token Address:", pearlTokenAddress);

  // Verify contract on explorer
  if (process.env.ZORA_EXPLORER_API_KEY) {
    console.log("Waiting for block confirmations...");
    await mysteryBox.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: mysteryBoxAddress,
        constructorArguments: [pearlTokenAddress],
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("UrashmaTaroMysteryBox:", mysteryBoxAddress);
  console.log("Pearl Token:", pearlTokenAddress);
  console.log("\nAdd this to your .env file:");
  console.log(`REACT_APP_MYSTERY_BOX_ADDRESS=${mysteryBoxAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 