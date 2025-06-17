    // hardhat.config.js
    require("@nomicfoundation/hardhat-ethers");
    require('dotenv').config({ path: '../.env' }); // Adjusted path to root .env

    module.exports = {
      solidity: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      networks: {
        zoraSepolia: {
          url: process.env.ZORA_SEPOLIA_RPC_URL || "https://sepolia.rpc.zora.energy",
          accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
          chainId: 999999999, // FIXED: Correct Zora Sepolia Chain ID
        },
        localhost: {
          url: "http://127.0.0.1:8545"
        }
      },
    };
    