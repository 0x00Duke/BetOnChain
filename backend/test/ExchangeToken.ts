import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from 'ethers'

const INITIAL_TOKEN_AMOUNT = ethers.utils.parseUnits("1000000", 18);
const INITIAL_ETH_FUNDING = ethers.utils.parseEther("100")
const MINT_NEW_TOKEN_AMOUNT = ethers.utils.parseUnits("100", 18);
const ETH_AMOUNT_TO_EXCHANGE = ethers.utils.parseEther("1");
const TOKEN_AMOUNT_TO_SELL = ethers.utils.parseUnits("1000", 18)

describe("ExchangeToken", () => {

    let deployer: SignerWithAddress;
    let player: SignerWithAddress;
    let exchangeTokenContract: Contract;
    let bocTokenContract: Contract;
    let balanceExchangeTokenContract: BigNumber;
    

    beforeEach(async () => {
        [deployer, player] = await ethers.getSigners();
        const ExchangeTokenFactory = await ethers.getContractFactory("ExchangeToken");
        exchangeTokenContract = await ExchangeTokenFactory.deploy(INITIAL_TOKEN_AMOUNT, {value: INITIAL_ETH_FUNDING});
        await exchangeTokenContract.deployed();
        const BocTokenFactory = await ethers.getContractFactory("BocToken");
        const BocTokenAddress = await exchangeTokenContract.betToken();
        bocTokenContract = BocTokenFactory.attach(BocTokenAddress);
        balanceExchangeTokenContract = await bocTokenContract.balanceOf(exchangeTokenContract.address);
    })

    describe("Constructor", () => {
        it("Should set mint the initial supply to the ExchangeToken contract", async () => {
            expect(balanceExchangeTokenContract).to.eq(INITIAL_TOKEN_AMOUNT);
        } )
    });

    describe("Mint additional token", () => {

        beforeEach(async () => {
            const mintNewToken = await exchangeTokenContract.mintAdditionalToken(MINT_NEW_TOKEN_AMOUNT);
            await mintNewToken.wait()
        })

        it("Should revert if not the owner call the mint function", async () => {
            await expect(exchangeTokenContract.connect(player).mintAdditionalToken(MINT_NEW_TOKEN_AMOUNT)).to.be.revertedWith("Ownable: caller is not the owner")
        });
        it("Should update the total supply", async () => {
            const totalSupply = await bocTokenContract.totalSupply()
            expect(totalSupply).to.eq(INITIAL_TOKEN_AMOUNT.add(MINT_NEW_TOKEN_AMOUNT))
        })
        it("Should mint the token to the EchangeToken contract", async () => {
            const balanceExchangeTokenContractAfter = await bocTokenContract.balanceOf(exchangeTokenContract.address);
            expect(balanceExchangeTokenContractAfter).to.eq(balanceExchangeTokenContract.add(MINT_NEW_TOKEN_AMOUNT))
        })
    })

    describe("Exchange buy and sell", () => {

        let playerBalanceBefore: BigNumber;
        let playerBalanceAfterTx1: BigNumber;

        beforeEach(async () => {
            playerBalanceBefore = await bocTokenContract.balanceOf(player.address);
            const buyTokenTx = await exchangeTokenContract.connect(player).buyToken({value: ETH_AMOUNT_TO_EXCHANGE})
            await buyTokenTx.wait();
        })
        
        describe("Buy token", () => {
            it("Should update the token balance for the player", async() => {
                playerBalanceAfterTx1 = await bocTokenContract.balanceOf(player.address);
                expect(playerBalanceAfterTx1).to.be.greaterThan(playerBalanceBefore)
            })
            it("The price of the token should goes up afer a buy", async () => {
                const buyTokenTx2 = await exchangeTokenContract.connect(player).buyToken({value: ETH_AMOUNT_TO_EXCHANGE})
                await buyTokenTx2.wait();
                const playerBalanceAfterTx2 = await bocTokenContract.balanceOf(player.address);
                expect(playerBalanceAfterTx2.sub(playerBalanceAfterTx1)).to.be.lessThan(playerBalanceAfterTx1.sub(playerBalanceBefore))
            })
        })
        describe("Sell token", () => {

            let playerEthBalanceBefore: BigNumber;
            let playerEthBalanceAfterTx1: BigNumber;

            beforeEach(async () => {
                playerEthBalanceBefore = await ethers.provider.getBalance(player.address);
                const approveTx = await bocTokenContract.connect(player).approve(exchangeTokenContract.address, ethers.constants.MaxUint256)
                await approveTx.wait();
                const sellTokenTx = await exchangeTokenContract.connect(player).sellToken(TOKEN_AMOUNT_TO_SELL);
                await sellTokenTx.wait();
            })
            it("Should update the token balance of the player", async () => {
                const playerBalanceAfterSell = await bocTokenContract.balanceOf(player.address);
                expect(playerBalanceAfterSell).to.eq(playerBalanceAfterTx1.sub(TOKEN_AMOUNT_TO_SELL))
            })
            it("Should update the Eth balance of the player", async () => {
                playerEthBalanceAfterTx1 = await ethers.provider.getBalance(player.address);
                expect(playerEthBalanceAfterTx1).to.be.greaterThan(playerEthBalanceBefore);
            })
            it("The price of the token should goes down after a sell", async () => {
                const sellTokenTx2 = await exchangeTokenContract.connect(player).sellToken(TOKEN_AMOUNT_TO_SELL)
                await sellTokenTx2.wait();
                const playerEthBalanceAfterTx2 = await ethers.provider.getBalance(player.address);
                expect(playerEthBalanceAfterTx2.sub(playerBalanceAfterTx1)).to.be.greaterThan(playerEthBalanceAfterTx1.sub(playerEthBalanceBefore))
            })
        })
    })
    
})
