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
    const APICONTRACT_ADDRESS = ethers.utils.getAddress("0x2B32a272e89b22Aa71035B57C0339e99e49cB819");
    const contract = new APIConsumer__factory(signer);
    const deployedApiContract = contract.attach(APICONTRACT_ADDRESS);
    // const transaction = await deployedApiContract.requestVolumeData()
    // const transactionReceipt = await transaction.wait(1)
    // console.log(transactionReceipt)
    // const requestId = transactionReceipt.events[0].topics[1]
    const volume = await deployedApiContract.volume()
    console.log(volume.toString())
    
    //await mockOracle.fulfillOracleRequest(requestId, numToBytes32(callbackValue))
    // const volume = await apiConsumer.volume()
    //console.log(volume.toString())
}

readNumber()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })