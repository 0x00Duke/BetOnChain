import { ethers } from "hardhat"
import * as dotenv from 'dotenv';
import { LinkToken__factory } from '../typechain-types';

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
    const linkTokenAddress = ethers.utils.getAddress("0x326C977E6efc84E512bB9C30f76E30c160eD06FB"); 
    const oracleAddress = ethers.utils.getAddress("0xCC79157eb46F5624204f47AB42b3906cAA40eaB7");

    console.log("Deploying Contract");
    const apiConsumerFactory = await ethers.getContractFactory("APIConsumer")
    const apiConsumer = await apiConsumerFactory.deploy(oracleAddress, linkTokenAddress);
    const deployTxReceipt = await apiConsumer.deployTransaction.wait();
    console.log(
        `The API contract was deployed at the address ${deployTxReceipt.address}`
      );
      console.log({ deployTxReceipt });
   
    // auto-funding
    const fundAmount = "1000000000000000000";
    const contract = new LinkToken__factory(signer);
    console.log(`Attaching to ballot contract at address ${linkTokenAddress} ...`)
    const deployedLinkToken = contract.attach(linkTokenAddress);
    console.log("Successfully attached")
    await deployedLinkToken.transfer(apiConsumer.address, fundAmount)
    console.log(`APIConsumer funded with ${fundAmount} JUELS`)
}

deployApiConsumer()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })