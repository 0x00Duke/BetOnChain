// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BocToken} from './BocToken.sol';

error ExchangeToken__NotEnoughFunding();
error ExchangeToken__EthTransferFailed();

contract ExchangeToken is Ownable {

    uint256 INITIAL_ETH_FUNDING = 1 ether;
    BocToken public betToken;

    constructor(uint256 initialTokenAmount) payable {
        if (msg.value <= INITIAL_ETH_FUNDING) {
            revert ExchangeToken__NotEnoughFunding();
        }
        betToken = new BocToken(initialTokenAmount);
    }

    function mintAdditionalToken(uint256 amount) external onlyOwner {
        betToken.mint(address(this), amount);
    }

    function buyToken() payable external {
        uint256 betTokenBalance = betToken.balanceOf(address(this));
        uint256 ethBalance = address(this).balance;
        uint256 amountOfTokenToReceive = betTokenBalance * msg.value / (ethBalance + msg.value);
        betToken.transfer(msg.sender, amountOfTokenToReceive);
    }

    function sellToken(uint256 amoutOfTokenToRedeem) external {
        uint256 betTokenBalance = betToken.balanceOf(address(this));
        uint256 ethBalance = address(this).balance;
        uint256 amountOfEthToReceive = ethBalance * amoutOfTokenToRedeem / (betTokenBalance + amoutOfTokenToRedeem);
        betToken.transferFrom(msg.sender, address(this), amoutOfTokenToRedeem);
        (bool success, ) = payable(msg.sender).call{value: amountOfEthToReceive}("");
        if(!success) {
            revert ExchangeToken__EthTransferFailed();
        }
    }

}
