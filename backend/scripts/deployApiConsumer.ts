import { ethers, network, run  } from "hardhat"
import * as dotenv from 'dotenv';
import{VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig, developmentChains} from "../helper-hardhat-config"
import LINK_TOKEN_ABI from "@chainlink/contracts/abi/v0.4/LinkToken.json"

dotenv.config();

async function deployApiConsumer() {
    //set log level to ignore non errors
    ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

    // Provider information
    // using "goerli" testnet from .env MNEMONIC
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY)
    console.log({provider});

    // Wallet info
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey || privateKey.length <= 0) {
        throw new Error("Private key missing")
    }
    const wallet = new ethers.Wallet(privateKey)
    const signer = wallet.connect(provider)
    console.log(`Connected to the wallet address ${wallet.address}`)
    const balance = await signer.getBalance();
    console.log(`Ẁallet balance: ${balance} Wei`);

    // Contract
    let linkTokenAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; 
    let oracleAddress = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;
    let jobId = "ca98366cc7314957b8c012c72f05aeeb";
    let fee = (1 * 10**18) / 10; // 0,1 * 10**18 (Varies by network and job)
    let chainId = 5;

    console.log("Deploying Contract");
    const apiConsumerFactory = await ethers.getContractFactory("APIConsumer")
    const apiConsumer = await apiConsumerFactory.deploy(oracleAddress, jobId, fee, linkTokenAddress)
    const deployTxReceipt = await apiConsumer.deployTransaction.wait();
    console.log(
        `The API contract was deployed at the address ${deployTxReceipt.address}`
      );
      console.log({ deployTxReceipt });
    // if (chainId == 31337) {
    //     // hardhat
    //     const linkTokenFactory = await ethers.getContractFactory("LinkToken")
    //     linkToken = await linkTokenFactory.connect(deployer).deploy()

    //     const mockOracleFactory = await ethers.getContractFactory("MockOracle")
    //     mockOracle = await mockOracleFactory.connect(deployer).deploy(linkToken.address)

    //     linkTokenAddress = linkToken.address
    //     oracleAddress = mockOracle.address
    // } else {
    //     // others
    //     oracleAddress = networkConfig[chainId]["oracle"]
    //     linkTokenAddress = networkConfig[chainId]["linkToken"]
    //     linkToken = new ethers.Contract(linkTokenAddress, LINK_TOKEN_ABI, deployer)
    // }


    // const waitBlockConfirmations = developmentChains.includes(network.name)
    //     ? 1
    //     : VERIFICATION_BLOCK_CONFIRMATIONS
    // await apiConsumer.deployTransaction.wait(waitBlockConfirmations)

    // console.log(`APIConsumer deployed to ${apiConsumer.address} on ${network.name}`)

    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     await run("verify:verify", {
    //         address: apiConsumer.address,
    //         constructorArguments: [oracleAddress, jobId, fee, linkTokenAddress],
    //     })
    // }

    // // auto-funding
    // const fundAmount = networkConfig[chainId]["fundAmount"]
    // await linkToken.transfer(apiConsumer.address, fundAmount)

    // console.log(`APIConsumer funded with ${fundAmount} JUELS`)
}

deployApiConsumer()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })