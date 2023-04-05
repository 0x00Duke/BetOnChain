import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"

require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || "********"
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/" + ALCHEMY_API_KEY

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.18',
      },
      {
        version: '0.8.7',
      },
    ],
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
};

export default config;