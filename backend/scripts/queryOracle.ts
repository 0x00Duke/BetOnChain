import { ethers } from "hardhat"
import * as dotenv from 'dotenv'
import { APIConsumer__factory } from "../typechain-types";
dotenv.config()
async function readNumber() {

    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY)
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey || privateKey.length <= 0) {
        throw new Error("Private key missing")
    }
    const wallet = new ethers.Wallet(privateKey)
    const signer = wallet.connect(provider)

    // Once the contract is deployed, we can interact with it using the contract's address
    const APICONTRACT_ADDRESS = ethers.utils.getAddress("0xE2b9E6fEcD4bc11226c1f8edEBD56fF075dA160F");
    const contract = new APIConsumer__factory(signer);
    const deployedApiContract = contract.attach(APICONTRACT_ADDRESS);
    // First call volume before doing Oracle call
    const volumeBefore = await deployedApiContract.volume()
    console.log(`Ìnitial volume is ${volumeBefore.toString()}`)
    // Now call the Oracle
    console.log("Calling Oracle..")
    const transaction = await deployedApiContract.requestVolumeData()
    const transactionReceipt = await transaction.wait(1)
    console.log(transactionReceipt)
    const requestId = transactionReceipt.events[0].topics[1]
    // Now call again (this almost never instantly returns the correct value)
    const volumeAfter = await deployedApiContract.volume()
    console.log(`Final volume is ${volumeAfter.toString()}`)
}

readNumber()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })