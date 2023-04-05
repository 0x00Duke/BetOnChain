import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"

require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || "********"
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const ALCHEMY_API_KEY_GOERLI = process.env.ALCHEMY_API_KEY_GOERLI
const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/" + ALCHEMY_API_KEY
const GOERLI_RPC_URL = "https://eth-goerli.alchemyapi.io/v2/" + ALCHEMY_API_KEY_GOERLI

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
      linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      linkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    },
  },
};

export default config;