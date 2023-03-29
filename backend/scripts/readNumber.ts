import { ethers } from "hardhat"

async function readNumber() {

    // Once the contract is deployed, we can interact with it using the contract's address
    const APICONTRACT_ADDRESS = "0x1dE41Fa1a87e612eF2466FcA03Ec5e26C9d560C9";
    const apiConsumerFactory = await ethers.getContractFactory("APIConsumer")
    const deployedApiContract = apiConsumerFactory.attach(APICONTRACT_ADDRESS);
    const transaction = await deployedApiContract.requestVolumeData()
    const transactionReceipt = await transaction.wait(1)
    console.log(transactionReceipt)
    const requestId = transactionReceipt.events[0].topics[1]
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