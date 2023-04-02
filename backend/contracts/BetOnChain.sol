//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import {BocNFT} from './BocNFT.sol';
import {BocToken} from './BocToken.sol';

error BetOnChain__RequirementsNotMet();
error BetOnChain__ThisAchievementDoesNotExist();

contract BetOnChain is Ownable {

    struct PlayerBetInfo {
        address player;
        uint256 betAmount;
        uint256 betFor;
        uint256 nftId;
    }

    struct BetInfo{
        uint256 betFor1;
        uint256 betFor2;
        uint256 oddsfor1;
        uint256 oddsfor2;
        bool betsOpen;
        uint256 totalBetAmount;
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
    PlayerBetInfo[] public playerBets;
    BocNFT public bocNFT;
    BocToken public bocToken;
   
    mapping(address => uint) public numberOfBets;
    mapping(uint256 => BetInfo) public bets; // Mapping to match ID with Bet 
    mapping(address=> mapping (uint256=> PlayerBetInfo)) public addressToBetToPlayer;

    constructor(address bocTokenAddress) {
        bocNFT = new BocNFT();
        bocToken = BocToken(bocTokenAddress);
    }

// MODIFIER ZONE 
    modifier whenBetsClosed(uint256 betId) {
        require(!bets[betId].betsOpen, "Bet is open");
        _;
    }

     modifier whenBetsOpen(uint256 betId) {
         require(bets[betId].betsOpen, "Bet is closed");
        _;
    }

// FUNCTION ZONE

    function createBet(uint256 betId, uint256 betFor1, uint256 betFor2,uint256 oddsfor1, uint256 oddsfor2) external onlyOwner{
        BetInfo memory newBet = BetInfo(betFor1,betFor2,oddsfor1, oddsfor2,false,0);
        bets[betId]= newBet;
    }  

// Manually open and close bets
    function openBets(uint256 betId) external onlyOwner whenBetsClosed(betId) {
        bets[betId].betsOpen = true;
    }

    function closeBet(uint256 betId ) external onlyOwner whenBetsOpen(betId){
        bets[betId].betsOpen = false;
    }

// Withdraw Price:
    function withdrawPrice(uint256 betId) external whenBetsClosed(betId){
        require(addressToBetToPlayer[msg.sender][betId].betAmount >0, "User has not make a bet");
        // Calculate how much to transfer to thius user
        // Need odds 
    }

// Need to review this function to get it fully functionnal with a bet

    function bet(uint256 betAmount, uint256 betFor,uint256 betId) external whenBetsOpen(betId){
        bocToken.transferFrom(msg.sender, address(this), betAmount);
        uint256 nftId = bocNFT.getCurrentId();
        PlayerBetInfo memory myBet = PlayerBetInfo(msg.sender, betAmount, betFor, nftId);
        playerBets.push(myBet);
        bets[betId].totalBetAmount += betAmount; 
        addressToBetToPlayer[msg.sender][betId] = myBet;
        _mintBetPosition();
        numberOfBets[msg.sender] += 1;
    }

    function mintAchievementNft(uint256 achievementLevelToMint) external {
        if (achievementLevelToMint == 0) {
            if (numberOfBets[msg.sender] < achievementRequirement.warriorNumberOfBets) {
                revert BetOnChain__RequirementsNotMet();
            } 
            bocNFT.safeMint(msg.sender, achievementURI.beginner);
        }
        if (achievementLevelToMint == 1) {
            if (numberOfBets[msg.sender] < achievementRequirement.warriorNumberOfBets) {
                revert BetOnChain__RequirementsNotMet();
            } 
            bocNFT.safeMint(msg.sender, achievementURI.warrior);
        }
        if (achievementLevelToMint == 2) {
            if (numberOfBets[msg.sender] < achievementRequirement.expertNumberOfBets) {
                revert BetOnChain__RequirementsNotMet();
            } 
            bocNFT.safeMint(msg.sender, achievementURI.expert);
        }
        if (achievementLevelToMint > 2) {
            revert BetOnChain__ThisAchievementDoesNotExist();
        }
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

    function getAchievementRequirement() view public returns(AchievementRequirement memory) {
        return achievementRequirement;
    }

    function _mintBetPosition() internal {
        bocNFT.safeMint(msg.sender, betPositionURI);
    }
}