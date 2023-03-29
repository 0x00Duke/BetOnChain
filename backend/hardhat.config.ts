import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY || "********"
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const GOERLI_RPC_URL = "https://eth-goerli.alchemyapi.io/v2/" + ALCHEMY_API_KEY

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.18',
      },
      {
        version: '0.8.7',
      },
      {
        version: '0.4.24',
      },
      {
        version: '0.6.6',
      },
    ],
  },
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
    },
  },
};

export default config;
