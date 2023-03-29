import { ethers } from "hardhat"

async function readNumber() {

    const apiConsumerFactory = await ethers.getContractFactory("APIConsumer")
    const apiConsumer = await apiConsumerFactory
    const id = await apiConsumer.volume()
    console.log(id.toString())
}

readNumber()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })