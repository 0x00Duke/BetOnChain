import { network, ethers } from "hardhat"
import * as tokenAbi from "../assets/LinkToken.json";
import * as dotenv from 'dotenv';


dotenv.config();

async function deploy() {
    // Deployment parameters
    
    const linkTokenAddress: any | undefined = network.config.linkTokenAddress

    const INITIAL_TOKEN_AMOUNT = 1000000;
    const INITIAL_ETH_FUNDING = ethers.utils.parseUnits("0.3","ether"); // 0.3 ETH (in Wei)

    // Connecting to provider / wallet
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Ẁallet balance (in Wei):", (await deployer.getBalance()).toString());

    // Deploying ExchangeToken contract
    console.log("Deploying ExchangeToken contract.. ");
    const ExchangeContractFactory = await ethers.getContractFactory("ExchangeToken", deployer);
    const exchangeTokenContract = await ExchangeContractFactory.deploy(INITIAL_TOKEN_AMOUNT, {value: INITIAL_ETH_FUNDING}); 
    await exchangeTokenContract.deployed();
    const BocTokenAddress = await exchangeTokenContract.betToken();
    console.log(`ExchangeToken address: ${exchangeTokenContract.address}, was funded with ${INITIAL_ETH_FUNDING} Wei. Initial token amount: ${INITIAL_TOKEN_AMOUNT}`);
    console.log("BetOnChain token address:", BocTokenAddress);

    // Deploying BetOnChain contract
    console.log("Deploying BetOnChain contract.. ")
    const BetOnChainFactory = await ethers.getContractFactory("BetOnChain", deployer);
    const bocContract = await BetOnChainFactory.deploy(BocTokenAddress);
    await bocContract.deployed();
    console.log("BetOnChain address:", bocContract.address);
    const ConsumerContractAddress = await bocContract.consumerContract();
    console.log("Consumer contract address:", ConsumerContractAddress);

    // Funding ConsumerAPI contract with LINK
    console.log("Funding ConsumerAPI contract with LINK..")
    const fundAmount = "1000000000000000000"; // Funding with 1 LINK
    const token = new ethers.Contract(linkTokenAddress, tokenAbi, deployer);
    const fundingTx = await token.transfer(ConsumerContractAddress, fundAmount)
    console.log("Contract funded, transaction hash ", fundingTx.hash);
    console.log("Done! Successfully deployed BetOnChain contracts!")
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })