// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ExchangeToken.sol";
import "./BocToken.sol";
import "./BetOnChain.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bet is Ownable, BetOnChain{

    BocToken public paymentToken;
    uint256 public odds;
    uint256 public id;
    bool public betsOpen;

    address[] _playersBet;

    constructor(
        uint256 _id,
        uint256 _odds,
        address _bocTokenAddress
    ) BetOnChain(_bocTokenAddress){
        id = _id;
        odds = _odds;
    }

    function getBetParticipants() external returns (address[] memory){
        uint i;
        for (i = 0; i< bets.length;i++){
            if (id == bets[i].betFor){
                _playersBet.push(bets[i].player);
            }
        }
        return _playersBet;
    }

      modifier whenBetsClosed() {
        require(!betsOpen, "Lottery is open");
        _;
    }

     modifier whenBetsOpen() {
        require(betsOpen ,"Lottery is closed");
        _;
    }
}
