//SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BocNFT} from './BocNFT.sol';
import {BocToken} from './BocToken.sol';

error BetOnChain__RequirementsNotMet();

contract BetOnChain is Ownable {

    struct PlayerBetInfo {
        address player;
        uint256 betAmount;
        uint256 betFor;
        uint256 nftId;
    }

    struct AchievementURI {
        string beginner;
        string warrior;
        string expert; 
    }

    struct AchievementRequirement {
        uint256 beginnerNumberOfBets;
        uint256 warriorNumberOfBets;
        uint256 expertNumberOfBets;
    }

    string private betPositionURI; 
    AchievementURI private achievementURI;
    AchievementRequirement private achievementRequirement;
    PlayerBetInfo[] public bets;
    BocNFT public bocNFT;
    BocToken public bocToken;
    
    mapping(address => uint) public numberOfBets;

    constructor(address bocTokenAddress) {
        bocNFT = new BocNFT();
        bocToken = BocToken(bocTokenAddress);
    }

// Need to review this function to get it fully functionnal with a bet
    function bet(uint256 betAmount, uint256 betFor) external {
        bocToken.transferFrom(msg.sender, address(this), betAmount);
        uint256 nftId = bocNFT.getCurrentId();
        PlayerBetInfo memory myBet = PlayerBetInfo(msg.sender, betAmount, betFor, nftId);
        bets.push(myBet);
        _mintBetPosition();
        numberOfBets[msg.sender] += 1;
    }

    function mintBeginnerNft() external {
        if (numberOfBets[msg.sender] < achievementRequirement.beginnerNumberOfBets) {
            revert BetOnChain__RequirementsNotMet();
        } 
        bocNFT.safeMint(msg.sender, achievementURI.beginner);
    }

    function mintWarriorNft() external {
        if (numberOfBets[msg.sender] < achievementRequirement.warriorNumberOfBets) {
            revert BetOnChain__RequirementsNotMet();
        } 
        bocNFT.safeMint(msg.sender, achievementURI.warrior);
    }

      function mintExpertNft() external {
        if (numberOfBets[msg.sender] < achievementRequirement.expertNumberOfBets) {
            revert BetOnChain__RequirementsNotMet();
        } 
        bocNFT.safeMint(msg.sender, achievementURI.expert);
    }

    function setBetPositionURI(string memory _betPositionURI) external onlyOwner {
        betPositionURI = _betPositionURI;
    }

    function getBetPositionURI() view external returns (string memory) {
        return betPositionURI;
    }

    function setAchievementURI(string memory beginnerURI, string memory warriorURI, string memory expertURI) external onlyOwner {
        achievementURI.beginner = beginnerURI;
        achievementURI.warrior = warriorURI;
        achievementURI.expert = expertURI;
    }

    function getAchievementURI() view external returns (AchievementURI memory) {
        return achievementURI;
    }

    function setAchievementRequirement(uint256 beginnerNumberOfBets, uint256 warriorNumberOfBets, uint256 expertNumberOfBets) external onlyOwner {
        achievementRequirement.beginnerNumberOfBets = beginnerNumberOfBets;
        achievementRequirement.warriorNumberOfBets = warriorNumberOfBets;
        achievementRequirement.expertNumberOfBets = expertNumberOfBets;
    }

    function getAchievementRequirement() view external returns(AchievementRequirement memory) {
        return achievementRequirement;
    }

    function _mintBetPosition() internal {
        bocNFT.safeMint(msg.sender, betPositionURI);
    }
}