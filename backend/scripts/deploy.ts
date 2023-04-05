import { ethers } from "hardhat"
import * as dotenv from 'dotenv';
// import { ConsumerContract, LinkToken__factory } from '../typechain-types';
// import { BocToken } from '../typechain-types';

dotenv.config();

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
    console.log(`ExchangeToken address: ${exchangeTokenContract.address}, was funded with ${INITIAL_ETH_FUNDING} Wei. Initial token amount: ${INITIAL_TOKEN_AMOUNT}`);

    // Deploying BetOnChain contract
    console.log("Deploying BetOnChain contract.. ")
    const BocTokenAddress = await exchangeTokenContract.betToken();
    const BetOnChainFactory = await ethers.getContractFactory("BetOnChain");
    const bocContract = await BetOnChainFactory.deploy(BocTokenAddress);
    await bocContract.deployed();
    console.log("BetOnChain address:", bocContract.address);


    // // Contract
    // const linkTokenAddress = ethers.utils.getAddress("0x326C977E6efc84E512bB9C30f76E30c160eD06FB"); 
    // const oracleAddress = ethers.utils.getAddress("0xCC79157eb46F5624204f47AB42b3906cAA40eaB7");

    // console.log("Deploying Contract");
    // const apiContract = new APIConsumer__factory(signer);
    // const apiConsumer = await apiContract.deploy(oracleAddress, linkTokenAddress);
    // const deployTxReceipt = await apiConsumer.deployTransaction.wait();
    // console.log(
    //     `The API contract was deployed at the address ${deployTxReceipt.address}`
    //   );
    //   console.log({ deployTxReceipt });
   
    // // auto-funding
    // const fundAmount = "1000000000000000000"; // Funding with 1 LINK
    // const tokenContract = new LinkToken__factory(signer);
    // console.log(`Attaching to LINK token contract at address ${linkTokenAddress} ...`)
    // const deployedLinkToken = tokenContract.attach(linkTokenAddress);
    // console.log("Successfully attached")
    // await deployedLinkToken.transfer(apiConsumer.address, fundAmount)
    // console.log(`APIConsumer funded with ${fundAmount} JUELS`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })