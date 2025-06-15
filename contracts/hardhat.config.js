    // hardhat.config.js
    require("@nomicfoundation/hardhat-toolbox");
    require("@openzeppelin/hardhat-upgrades");
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
          url: process.env.ZORA_SEPOLIA_RPC_URL || "",
          accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        },
        localhost: {
          url: "http://127.0.0.1:8545"
        }
      },
      etherscan: {
        apiKey: {
            zoraSepolia: process.env.ZORA_EXPLORER_API_KEY || "", // Optional
        },
        customChains: [
            {
                network: "zoraSepolia",
                chainId: 99999, // Zora Sepolia Chain ID (verify if changed)
                urls: {
                    api: "https://explorer.sepolia.zora.energy/api",
                    browser: "https://sepolia.explorer.zora.energy/",
                },
            },
        ],
      },
    };
    