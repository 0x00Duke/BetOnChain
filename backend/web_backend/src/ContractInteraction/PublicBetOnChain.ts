import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as betOnChainJson from '../assets/BetOnChain.json';
import { Injectable } from '@nestjs/common';

dotenv.config();

@Injectable()
export class PublicBetOnChain {
  provider: ethers.providers.Provider;
  contract: ethers.Contract;

  constructor() {
    this.provider = ethers.providers.getDefaultProvider(process.env.NETWORK);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      betOnChainJson.abi,
      this.provider,
    );
  }

  getContractAddress(): string {
    return this.contract.address;
  }

  async bet(betAmount: number, betFor: number, betId: number) {
    const tx = await this.contract.bet(betAmount, betFor, betId);
    const txReceipt = await tx.wait();
    return txReceipt;
  }
}
