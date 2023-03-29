import { ethers } from "hardhat"

async function readNumber() {

    // Once the contract is deployed, we can interact with it using the contract's address
    const APICONTRACT_ADDRESS = ethers.utils.getAddress("0x1dE41Fa1a87e612eF2466FcA03Ec5e26C9d560C9");
    const apiConsumerFactory = await ethers.getContractFactory("APIConsumer")
    const deployedApiContract = apiConsumerFactory.attach(APICONTRACT_ADDRESS);
    const id = await deployedApiContract.volume()
    console.log(id.toString())
}

readNumber()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })