import { ethers } from "hardhat"
import tokenAbi from "../assets/LinKToken.json";

async function main() {
    // Deployment parameters
    const INITIAL_TOKEN_AMOUNT = ethers.utils.parseUnits("1000000", 18);
    const INITIAL_ETH_FUNDING = ethers.utils.parseEther("1");

    // Connecting to provider / wallet
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Ẁallet balance:", (await deployer.getBalance()).toString());


    // Deploying ExchangeToken contract
    console.log("Deploying ExchangeToken contract.. ");
    const ExchangeContractFactory = await ethers.getContractFactory("ExchangeToken");
    const exchangeTokenContract = await ExchangeContractFactory.deploy(INITIAL_TOKEN_AMOUNT, {value: INITIAL_ETH_FUNDING, gasLimit: 3000000});
    await exchangeTokenContract.deployed();
    const BocTokenAddress = await exchangeTokenContract.betToken();
    const ConsumerContractAddress = await exchangeTokenContract.consumerContract();
    console.log(`ExchangeToken address: ${exchangeTokenContract.address}, was funded with ${INITIAL_ETH_FUNDING} Wei. Initial token amount: ${INITIAL_TOKEN_AMOUNT}`);
    console.log("BetOnChain token address:", BocTokenAddress);
    console.log("Consumer contract address:", ConsumerContractAddress);

    // Deploying BetOnChain contract
    console.log("Deploying BetOnChain contract.. ")
    const BetOnChainFactory = await ethers.getContractFactory("BetOnChain");
    const bocContract = await BetOnChainFactory.deploy(BocTokenAddress);
    await bocContract.deployed();
    console.log("BetOnChain address:", bocContract.address);
    
    // Funding ConsumerAPI contract with LINK
    console.log("Funding ConsumerAPI contract with LINK..")
    const fundAmount = "1000000000000000000"; // Funding with 1 LINK
    const token = new ethers.Contract(0x779877A7B0D9E8603169DdbD7836e478b4624789, tokenAbi, deployer);
    const fundingTx = await token.transfer(ConsumerContractAddress, fundAmount)
    console.log("Funding tx hash:", fundingTx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })