import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Lottery, LotteryToken } from '../typechain-types';
import { BigNumber } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Lottery", function () {

  const TOKEN_NAME = "Lottery Token";
  const TOKEN_SYMBOL = "LT0";
  const PURCHASE_RATIO = 10;
  const BET_PRICE = 1;
  const BET_FEE = 1;
  let signer: SignerWithAddress;
  let player: SignerWithAddress;
  let player2: SignerWithAddress;
  let player3: SignerWithAddress;
  let lotteryContract: Lottery;
  let tokenContract: LotteryToken;
  let timestamp: number;
  let ethToSpent: BigNumber;
  let players: SignerWithAddress[]
  let unlockTime: number;

  beforeEach(async () => {
    [signer, player, player2, player3] = await ethers.getSigners();
    const lotteryFactory = await ethers.getContractFactory("Lottery");
    lotteryContract = await lotteryFactory.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      PURCHASE_RATIO,
      BET_PRICE,
      BET_FEE
    );
    await lotteryContract.deployed();
    const lotteryTokenAddress = await lotteryContract.paymentToken();
    const lotteryTokenFactory = await ethers.getContractFactory("LotteryToken");
    tokenContract = lotteryTokenFactory.attach(lotteryTokenAddress);
    timestamp = (await ethers.provider.getBlock('latest')).timestamp;
    ethToSpent = ethers.utils.parseEther("1");
    players = [player, player2, player3];
  });

  describe("Constructor", () => {
    it("Should deploy the token contract with the rigth parameters", async () => {
      expect(await tokenContract.name()).to.eq(TOKEN_NAME);
      expect(await tokenContract.symbol()).to.eq(TOKEN_SYMBOL);
    });
    it("Should deploy the lottery contract with the right parameters", async() => {
      expect(await lotteryContract.purchaseRatio()).to.eq(PURCHASE_RATIO);
      expect(await lotteryContract.betPrice()).to.eq(BET_PRICE);
      expect(await lotteryContract.betFee()).to.eq(BET_FEE);
    })
  })

  describe("Open bets", () => {

    describe('Testing conditions', () => {
      it("Should revert if called by someone that is not the owner", async () => {
        await expect(lotteryContract.connect(player).openBets(timestamp + 10)).to.be.revertedWith("Ownable: caller is not the owner")
      });
      it("Should revert if the closing time is < block.timestamp", async () => {
        await expect(lotteryContract.openBets(timestamp - 1)).to.be.revertedWith("Closing time must be in the future");
      });
    })

    describe('Testing the function', async () => {  
      beforeEach(async () => {
        const openBetsTx = await lotteryContract.openBets(timestamp + 10);
        await openBetsTx.wait();
      })
      it("Should not open a bet if a bet is already open", async () => {
        await expect(lotteryContract.openBets(timestamp + 10)).to.be.revertedWith('Lottery is open');
      })
      it("Should set the betClosingTime to the right time", async () => {
        expect(await lotteryContract.betsClosingTime()).to.eq(timestamp + 10);
      });
      it("Should open the bets", async () => {
        expect(await lotteryContract.betsOpen()).to.eq(true);
      })
    })
  })

  describe('Token purchases and redeem', () => {

    let contractBalanceBefore: BigNumber;

    beforeEach(async () => {
      contractBalanceBefore = await ethers.provider.getBalance(lotteryContract.address);
      const purchaseTokenTx = await lotteryContract.connect(player).purchaseTokens({value: ethToSpent})
      await purchaseTokenTx.wait();
    });

    describe("Purchase", () => {
      it("The contract should receive the right amount of eth", async () => {
        const contractBalanceAfter = await ethers.provider.getBalance(lotteryContract.address);
        expect(contractBalanceAfter).to.eq(contractBalanceBefore.add(ethToSpent))
      });
      it("Should mint the right amount of tokens to the buyer", async () => {
        expect((await tokenContract.balanceOf(player.address)).toString()).to.eq(ethToSpent.mul(PURCHASE_RATIO));
      });
    })

    describe("Redeem", () => {

      let playerEthBalanceBefore: BigNumber;
      let playerTokenBalanceBefore: BigNumber;
      let gasUsed: BigNumber;
      const REDEEM_AMOUNT = 1;

      beforeEach(async () => {
        const allowTx = await tokenContract.connect(player).approve(lotteryContract.address, ethers.constants.MaxUint256);
        await allowTx.wait();
        playerEthBalanceBefore = await ethers.provider.getBalance(player.address)
        playerTokenBalanceBefore = await tokenContract.balanceOf(player.address);
        const redeemTx = await lotteryContract.connect(player).returnTokens(ethers.utils.parseEther(REDEEM_AMOUNT.toString()));
        const redeemTxReceipt = await redeemTx.wait();
        gasUsed = redeemTxReceipt.gasUsed.mul(redeemTxReceipt.effectiveGasPrice);
      })
      it("Should update the token balance", async () => {
        const playerTokenBalanceAfter = await tokenContract.balanceOf(player.address);
        expect(playerTokenBalanceAfter).to.eq(playerTokenBalanceBefore.sub(ethers.utils.parseEther(REDEEM_AMOUNT.toString())))
      })
      it("Should redeem the right amout of ETH", async () => {
        const playerEthBalanceAfter = await ethers.provider.getBalance(player.address);
        expect(playerEthBalanceAfter).to.eq(playerEthBalanceBefore.sub(gasUsed).add(ethers.utils.parseEther(REDEEM_AMOUNT.toString()).div(PURCHASE_RATIO)))
      })
    })
  })

  describe('Bet', () => {

      let tokenBalanceLotteryContractBefore: BigNumber;
      let ownerPoolBalanceBefore: BigNumber;
      let prizePoolBalanceBefore: BigNumber;

    beforeEach(async () => {
      const purchaseTokenTx = await lotteryContract.connect(player).purchaseTokens({value: ethToSpent})
      await purchaseTokenTx.wait();
      const openBetTx = await lotteryContract.openBets(timestamp + 100);
      await openBetTx.wait()
      tokenBalanceLotteryContractBefore = await tokenContract.balanceOf(lotteryContract.address);
      ownerPoolBalanceBefore = await lotteryContract.ownerPool();
      prizePoolBalanceBefore = await lotteryContract.prizePool();
      const allowTx = await tokenContract.connect(player).approve(lotteryContract.address, ethers.constants.MaxUint256)
      await allowTx.wait();
      const betTx = await lotteryContract.connect(player).bet();
      await betTx.wait();
    })
    it("Should charge the right amount of token", async () => {
      const tokenBalanceLotteryContractAfter = await tokenContract.balanceOf(lotteryContract.address);
      expect(tokenBalanceLotteryContractAfter).to.eq(tokenBalanceLotteryContractBefore.add(BET_PRICE).add(BET_FEE))
    })
    it("Should update the owner pool", async () => {
      const ownerPoolBalanceAfter = await lotteryContract.ownerPool();
      expect(ownerPoolBalanceAfter).to.eq(ownerPoolBalanceBefore.add(BET_FEE))
    })
    it("Should update the prize pool", async () => {
      const prizePoolBalanceAfter = await lotteryContract.prizePool();
      expect(prizePoolBalanceAfter).to.eq(prizePoolBalanceBefore.add(BET_PRICE))
    })
    it("Should update the list of bets", async () => {
      const slots = await lotteryContract.getSlots();
      expect(slots[0]).to.eq(player.address);
    });
    it("Should be able to bet many times with the betMany function", async () => {
      const betManyTx = await lotteryContract.connect(player).betMany(2);
      await betManyTx.wait();
      const slots = await lotteryContract.getSlots();
      expect(slots).to.deep.eq([player.address, player.address, player.address])
    })
  })

  describe("Close lottery", () => {

    beforeEach(async () => {
      const openBetTx = await lotteryContract.openBets(timestamp + 100);
      await openBetTx.wait()
      unlockTime = (await time.latest()) + 100;
      const purchaseTokenTx = await lotteryContract.connect(player).purchaseTokens({value: ethToSpent});
      await purchaseTokenTx.wait();
      const allowTx = await tokenContract.connect(player).approve(lotteryContract.address, ethers.constants.MaxUint256)
      await allowTx.wait();
      const betTx = await lotteryContract.connect(player).betMany(3);
      await betTx.wait();
    })
    it("Revert if it is not yet closing time", async () => {
      await expect(lotteryContract.closeLottery()).to.be.revertedWith("Too soon to close");
    })
    it("Revert if the bet is already closed", async () => {
      await time.increaseTo(unlockTime);
      const closeLotteryTx = await lotteryContract.closeLottery();
      await closeLotteryTx.wait();
      await expect(lotteryContract.closeLottery()).to.be.rejectedWith("Already closed")
    })
    it("Should close the lottery", async () => {
      await time.increaseTo(unlockTime);
      await lotteryContract.closeLottery()
      expect(await lotteryContract.betsOpen()).to.eq(false)
    })

    describe("Calculate the prize", () => {
      beforeEach(async () => {
        await time.increaseTo(unlockTime);
        const closeLotteryTx = await lotteryContract.closeLottery();
        await closeLotteryTx.wait();
      })
      it("Should reset the list of bet slots", async () => {
        expect(await lotteryContract.getSlots()).to.deep.eq([])
      })
      it("Should set the prize pool to zero", async () => {
        expect(await lotteryContract.prizePool()).to.eq(0);
      })
      it("Should map the prize to the winner", async () => {
        expect(await lotteryContract.prize(player.address)).to.eq(BET_PRICE * 3)
      })
      
      describe("Winner withdraw", () => {
        it("Should revert if the player has not won prize", async () => {
          await expect(lotteryContract.connect(player2).prizeWithdraw(BET_PRICE * players.length)).to.be.revertedWith("Not enough prize")
        })
        it("The winner should be able to withdraw his prize", async () => {
          const winnerBalanceBeforeWithdraw = await tokenContract.balanceOf(player.address);  
          const withdrawTx = await lotteryContract.connect(player).prizeWithdraw(BET_PRICE * players.length);
          await withdrawTx.wait();
          const winnerBalanceAfterWithdraw = await tokenContract.balanceOf(player.address);
          expect(winnerBalanceAfterWithdraw).to.eq(winnerBalanceBeforeWithdraw.add(BET_PRICE * players.length))
        })
        it("Should update update the winner balance prize after withdraw", async () => {
          const winnerPrizeBalanceBefore = await lotteryContract.prize(player.address)
          const withdrawTx = await lotteryContract.connect(player).prizeWithdraw(BET_PRICE)
          await withdrawTx.wait();
          const winnerPrizeBalanceAfter = await lotteryContract.prize(player.address);
          expect(winnerPrizeBalanceAfter).to.eq(winnerPrizeBalanceBefore.sub(BET_PRICE))
        })
      })

      describe("Owner withdraw", () => {
        it("Should revert if the owner withdraw more than the owner pool", async () => {
          await expect(lotteryContract.ownerWithdraw(BET_FEE * players.length + 1)).to.be.revertedWith("Not enough fees collected")
        })
        it("The owner should be able to withdraw his fees", async () => {
          const ownerBalanceBeforeWithdraw = await tokenContract.balanceOf(signer.address);  
          const withdrawTx = await lotteryContract.ownerWithdraw(BET_FEE * players.length);
          await withdrawTx.wait();
          const ownerBalanceAfterWithdraw = await tokenContract.balanceOf(signer.address);
          expect(ownerBalanceAfterWithdraw).to.eq(ownerBalanceBeforeWithdraw.add(BET_FEE * players.length))
        })
        it("Should update update the owner pool after withdraw", async () => {
          const ownerPoolBefore = await lotteryContract.ownerPool();
          const withdrawTx = await lotteryContract.ownerWithdraw(BET_FEE)
          await withdrawTx.wait();
          const ownerPoolAfter = await lotteryContract.ownerPool();
          expect(ownerPoolAfter).to.eq(ownerPoolBefore.sub(BET_FEE))
        })
      })
    })
  })

});


