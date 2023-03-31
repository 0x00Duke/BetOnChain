// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Bet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FactoryBet is Ownable{
   
   // Max length? How many bets to store? 
    Bet[] public betAddresses;
    // events to notify external systems    
    event BetCreated(address betAddress);

    function createBet(uint256 _id, uint256 _odds, address _bocTokenAddress) external onlyOwner{
        Bet newBet = new Bet(_id,_odds,_bocTokenAddress);
        emit BetCreated(address(newBet));
        betAddresses.push(newBet);
    }

    function getBetAddresses() external view returns (Bet[] memory){
        return betAddresses;
    }
}
