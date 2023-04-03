import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { expect } from 'chai';

const BET_POSITION_URI = 'ipfs://test-bet-position-URI';
const BEGINNER_URI = 'ipfs://test-beginner-URI';
const WARRIOR_URI = 'ipfs://test-warrior-URI';
const EXPERT_URI = 'ipfs://test-expert-URI';
const BEGINNER_NUMBER_OF_BETS = 3;
const WARRIOR_NUMBER_OF_BETS = 4;
const EXPERT_NUMBER_OF_BETS = 5;
const BET_AMOUNT = ethers.utils.parseUnits("10", 18);
const BET_AMOUNT2 = ethers.utils.parseUnits("15", 18);
const BET_FOR = 1;
const BET_FOR2 = 2;
const INITIAL_TOKEN_AMOUNT = ethers.utils.parseUnits("1000000", 18);
const INITIAL_ETH_FUNDING = ethers.utils.parseEther("100");
const ETH_AMOUNT_TO_EXCHANGE = ethers.utils.parseEther("1");
const BET_ID = 0;
const BET_ODDS_1 = 0;
const BET_ODDS_2 = 0;
const betIds = ["0", "1","2"];
const oddsfor1 = ["1.2", "2.4", "2.6"];
const oddsfor2 = ["4", "2.1", "1.3"];
const oddsforDraw = ["3","2.2", "1.4"];
describe("BetOnChain", () => {
    let deployer: SignerWithAddress;
    let player: SignerWithAddress;
    let hacker:SignerWithAddress;
    let bocContract: Contract;
    let bocNFTContract: Contract;
    let bocTokenContract: Contract; 

    beforeEach(async () => {
        [deployer, player, hacker] = await ethers.getSigners();
        const ExchangeContractFactory = await ethers.getContractFactory("ExchangeToken");
        const exchangeTokenContract = await ExchangeContractFactory.deploy(INITIAL_TOKEN_AMOUNT, {value: INITIAL_ETH_FUNDING});
        await exchangeTokenContract.deployed();
        const BocTokenFactory = await ethers.getContractFactory("BocToken");
        const BocTokenAddress = await exchangeTokenContract.betToken();
        bocTokenContract = BocTokenFactory.attach(BocTokenAddress);
        const buyTokenTx = await exchangeTokenContract.connect(player).buyToken({value: ETH_AMOUNT_TO_EXCHANGE})
        await buyTokenTx.wait()
        const BetOnChainFactory = await ethers.getContractFactory("BetOnChain");
        bocContract = await BetOnChainFactory.deploy(BocTokenAddress);
        await bocContract.deployed();
        const BocNFTFactory = await ethers.getContractFactory("BocNFT");
        const bocNFTContractAddress = await bocContract.bocNFT();
        bocNFTContract = BocNFTFactory.attach(bocNFTContractAddress);
    })

    describe("BOC Contract", () => {

        let bocContractTokenBalanceBefore: BigNumber;
        let totalBetAmountFor1Before: BigNumber;

        beforeEach(async () => {
            const setBetURI = await bocContract.setBetPositionURI(BET_POSITION_URI);
            await setBetURI.wait();
            bocContractTokenBalanceBefore = await bocTokenContract.balanceOf(bocContract.address);
            const approveTokenTx = await bocTokenContract.connect(player).approve(bocContract.address, ethers.constants.MaxUint256);
            await approveTokenTx.wait();
            const createBetTx = await bocContract.connect(deployer).createBet(
                betIds.map(ethers.utils.parseEther),
                oddsfor1.map(ethers.utils.parseEther),
                oddsforDraw.map(ethers.utils.parseEther),
                oddsfor2.map(ethers.utils.parseEther));
            await createBetTx.wait();
            const openBetTX = await bocContract.connect(deployer).openBet(BET_ID);
            await openBetTX.wait();
            const betInfo = await bocContract.bets(BET_ID);
            totalBetAmountFor1Before = betInfo.totalBetAmountFor1;
            const betTx = await bocContract.connect(player).bet(BET_AMOUNT, BET_FOR, BET_ID);
            await betTx.wait();
            const achievementRequirementTx = await bocContract.setAchievementRequirement(BEGINNER_NUMBER_OF_BETS, WARRIOR_NUMBER_OF_BETS, EXPERT_NUMBER_OF_BETS);
            achievementRequirementTx.wait();
        })

        describe("Bet", () => {
            it("Should revert if the the player bet for a team that does not exists", async () => {
                await expect(bocContract.bet(BET_AMOUNT, 3, BET_ID)).to.be.revertedWithCustomError(bocContract, "BetOnChain__ThisTeamDoesNotExist")
            })
            it("Should update the struct for this bet", async () => {
                const betInfo = await bocContract.bets(BET_ID);
                expect(betInfo.totalBetAmountFor1).to.eq(totalBetAmountFor1Before.add(BET_AMOUNT));
                expect(betInfo.totalBetAmount).to.eq(BET_AMOUNT);
            })
            it("Should set the struct for this player bet", async () => {
                const playerBetInfo = await bocContract.addressToBetToPlayer(player.address, BET_ID);
                expect(playerBetInfo.player).to.eq(player.address);
                expect(playerBetInfo.betId).to.eq(0);
                expect(playerBetInfo.betAmount).to.eq(BET_AMOUNT);
                expect(playerBetInfo.betFor).to.eq(BET_FOR);
                expect(playerBetInfo.nftId).to.eq(0);
            })
            it("Should send the right amount of token", async () => {
                const bocContractTokenBalanceAfter = await bocTokenContract.balanceOf(bocContract.address);
                expect(bocContractTokenBalanceAfter).to.eq(bocContractTokenBalanceBefore.add(BET_AMOUNT))
            })
            it("Should update the number of bets made by this address", async () => {
                expect(await bocContract.numberOfBets(player.address)).to.eq(1);
            })
        })    
        
        describe("Close the bet", () => {

                beforeEach(async () => {
                    const closeBetTX = await bocContract.connect(deployer).closeBet(BET_ID);
                    await closeBetTX.wait();
                    const approveNftTx = await bocNFTContract.connect(player).approve(bocContract.address, 0);
                    await approveNftTx.wait();
                    const setWinnerBetId0Tx = await bocContract._setWinnerBetId0();
                    await setWinnerBetId0Tx.wait();       
                })
                it("Should close the bet ",async ()=>{
                    const betInfo = await bocContract.bets(BET_ID);
                    expect(betInfo.betsOpen).to.eq(false);
                })
                it("Should not be able to withdraw without the nft", async () => {
                    expect(bocContract.connect(hacker).withdrawPrize(BET_ID)).to.be.revertedWithCustomError(bocContract, "BetOnChain__YouNeedTheNftToWithdrawPrize")      
                })
                it("Should burn the NFT at withdraw", async () => { 
                    const withdrawTx = await bocContract.connect(player).withdrawPrize(BET_ID);
                    await withdrawTx.wait();
                    await expect(bocNFTContract.ownerOf(0)).to.be.revertedWith("ERC721: invalid token ID")   
                })
                it("Should withdraw the prize", async () => {
                    const playerTokenBalanceBefore = await bocTokenContract.balanceOf(player.address);
                    const withdrawTx = await bocContract.connect(player).withdrawPrize(BET_ID);
                    await withdrawTx.wait();
                    const playerTokenBalanceAfter = await bocTokenContract.balanceOf(player.address);
                    expect(playerTokenBalanceAfter).to.be.greaterThan(playerTokenBalanceBefore);
                })     
           
        })
        
        describe("Odds", () => {

            let oddsTeam1Before: BigNumber;
            let oddsTeam2Before: BigNumber;

            beforeEach(async () => {
                oddsTeam1Before = await bocContract.getOddsForTeam1(BET_ID);
                oddsTeam2Before = await bocContract.getOddsForTeam2(BET_ID);    
                const betTx = await bocContract.connect(player).bet(BET_AMOUNT2, BET_FOR2, BET_ID );
                await betTx.wait();
            })
            it("Should update the odds for team 1", async () => {
                const oddsTeam1After = await bocContract.getOddsForTeam1(BET_ID);
                expect(oddsTeam1After).to.be.greaterThan(oddsTeam1Before);
            })
            it("Should update the odds for team 2", async () => {
                const oddsTeam2After = await bocContract.getOddsForTeam2(BET_ID);
                expect(oddsTeam2After).to.be.lessThan(oddsTeam2Before);
            })
        })

        describe("Bet NFT", () => {    
            it("Should set the URI for the bet NFT", async () => {
                const betPositionURI = await bocContract.getBetPositionURI();
                expect(betPositionURI).to.eq(BET_POSITION_URI)
            })
            it("Should mint a NFT to the player when betting", async () => {
                const nftOwner = await bocNFTContract.ownerOf(0);
                expect(nftOwner).to.eq(player.address)
            })
            
        })

        describe("Achievement NFT", () => {
            it("Should set the beginner, warrior and expert URI", async () => {
                const achievementURITx = await bocContract.setAchievementURI(BEGINNER_URI, WARRIOR_URI, EXPERT_URI);
                achievementURITx.wait();
                const achievementURI = await bocContract.getAchievementURI();
                expect(achievementURI.beginner).to.eq(BEGINNER_URI);
                expect(achievementURI.warrior).to.eq(WARRIOR_URI);
                expect(achievementURI.expert).to.eq(EXPERT_URI);
            })
            it("Should set the beginner, warrior and expert requirements", async () => {
                const achievementRequirement = await bocContract.getAchievementRequirement();
                expect(achievementRequirement.beginnerNumberOfBets).to.eq(BEGINNER_NUMBER_OF_BETS);
                expect(achievementRequirement.warriorNumberOfBets).to.eq(WARRIOR_NUMBER_OF_BETS);
                expect(achievementRequirement.expertNumberOfBets).to.eq(EXPERT_NUMBER_OF_BETS)
            })
            it("Should revert if the player want to mint a achievement NFT and don't have the requirement", async () => {
                await expect(bocContract.connect(player).mintAchievementNft(0)).to.be.revertedWithCustomError(bocContract, "BetOnChain__RequirementsNotMet")
                await expect(bocContract.connect(player).mintAchievementNft(1)).to.be.revertedWithCustomError(bocContract, "BetOnChain__RequirementsNotMet")
                await expect(bocContract.connect(player).mintAchievementNft(2)).to.be.revertedWithCustomError(bocContract, "BetOnChain__RequirementsNotMet")
            })
            it("Should be able to mint an achievement NFT if requirement are mets", async () => {
                for (let i = 1; i <= EXPERT_NUMBER_OF_BETS; i++) {
                    const betTx = await bocContract.connect(player).bet(BET_AMOUNT, BET_FOR,BET_ID);
                    await betTx.wait();
                }
                for (let i = 0; i <= 2; i++) {
                    await bocContract.connect(player).mintAchievementNft(i);
                }
                expect(await bocNFTContract.ownerOf(6)).to.eq(player.address);
                expect(await bocNFTContract.ownerOf(7)).to.eq(player.address);
                expect(await bocNFTContract.ownerOf(8)).to.eq(player.address);
            })
            it("Shoud not be able to mint a NFT with an achievement level that does not exist", async () => {
                expect(bocContract.connect(player).mintAchievementNft(3)).to.be.revertedWithCustomError(bocContract, "BetOnChain__ThisAchievementDoesNotExist")
            })
        })
    })


})