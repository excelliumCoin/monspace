require("@nomiclabs/hardhat-ethers");
require('dotenv').config({ path: '../.env.local' });

const PRIVATE_KEY = process.env.PRIVATE_KEY || "b19bbec31da33876bd4b590cc889f843aad38c53b8e99f0798a67db9cc28550d";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      accounts: [PRIVATE_KEY],
      chainId: 10143,
      gasPrice: 50000000000, // 50 gwei
      gas: 8000000,
      timeout: 60000
    },
    hardhat: {
      chainId: 1337
    }
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
