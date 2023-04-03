//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import {BocNFT} from './BocNFT.sol';
import {BocToken} from './BocToken.sol';
import {ConsumerContract} from './ConsumerContract.sol';

error BetOnChain__RequirementsNotMet();
error BetOnChain__ThisAchievementDoesNotExist();
error BetOnChain__ThisTeamDoesNotExist();
error BetOnChain__ThisIdIsAlreadyUsed();
error BetOnChain__YouNeedTheNftToWithdrawPrize();
error BetOnChain__ThereIsNoWinnerOrWinnerNotSet();
error BetOnChain__YouBetIsNotAWinningBet();

contract BetOnChain is Ownable {

    struct PlayerBetInfo {
        address player;
        uint256 betId;
        uint256 betAmount;
        uint256 betFor;
        uint256 nftId;
    }

    struct BetInfo{
        uint256 oddsfor1;
        uint256 oddsfor2;
        bool betsOpen;
        bool betsExist; 
        uint256 totalBetAmountFor1;
        uint256 totalBetAmountFor2; 
        uint256 totalBetAmount;
        uint256 winner;
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
    BocNFT public bocNFT;
    BocToken public bocToken;
    ConsumerContract public consumerContract;
   
    mapping(address => uint) public numberOfBets;
    mapping(uint256 => BetInfo) public bets; // Mapping to match ID with Bet 
    mapping(address => mapping (uint256 => PlayerBetInfo)) public addressToBetToPlayer;

    constructor(address bocTokenAddress) {
        bocNFT = new BocNFT();
        consumerContract = new ConsumerContract();
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

    function createBet(uint256 betId, uint256 oddsfor1, uint256 oddsfor2) external onlyOwner{
        if (bets[betId].betsExist) {
            revert BetOnChain__ThisIdIsAlreadyUsed();
        }
        BetInfo memory newBet = BetInfo(oddsfor1, oddsfor2, false, true, 1 ether, 1 ether, 0, 0);
        bets[betId]= newBet;
    }  
// Manually open and close bets
    function openBet(uint256 betId) external onlyOwner whenBetsClosed(betId) {
        bets[betId].betsOpen = true;
    }

    function closeBet(uint256 betId ) external onlyOwner whenBetsOpen(betId){
        bets[betId].betsOpen = false;
    }

    function bet(uint256 betAmount, uint256 betFor, uint256 betId) external whenBetsOpen(betId){
        if (betFor != 1 && betFor !=2 ) {
            revert BetOnChain__ThisTeamDoesNotExist();
        }
        bocToken.transferFrom(msg.sender, address(this), betAmount);
        uint256 nftId = _mintBetPosition();
        _updatePlayerBetInfo(msg.sender, betId, betAmount, betFor, nftId);
        _updateBetInfo(betAmount, betId, betFor);     
    }

//Withdraw Price:
    function withdrawPrize(uint256 betId) external whenBetsClosed(betId) {
        uint256 winner = bets[betId].winner;
        if (addressToBetToPlayer[msg.sender][betId].betFor != winner) {
            revert BetOnChain__YouBetIsNotAWinningBet();
        }
        _burnNft(betId);
        uint256 prizeAmount = _calculatePrizeToWithdraw(betId, winner);
        bocToken.transfer(msg.sender, prizeAmount);
    }

    function getOddsForTeam1(uint256 betId) view external returns (uint256) {
        return bets[betId].oddsfor1;
    }

    function getOddsForTeam2(uint256 betId) view external returns (uint256) {
        return bets[betId].oddsfor2;
    }

    function callResults(address oracle, string memory jobId, uint256 betId) external whenBetsClosed(betId) {
        consumerContract.requestMatchResult(oracle, jobId, betId);
    }

    function getWinner(uint256 betId) external {
        uint256 winner = consumerContract.matchWinner(betId);
        bets[betId].winner = winner;
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

    function _mintBetPosition() internal returns (uint256) {
        uint256 nftId = bocNFT.getCurrentId();
        bocNFT.safeMint(msg.sender, betPositionURI);
        return nftId;
    }

    function _updatePlayerBetInfo(address _player, uint256 betId, uint256 _betAmount, uint256 _betFor, uint256 _nftId) internal {
        PlayerBetInfo memory myBet = PlayerBetInfo(_player, betId, _betAmount, _betFor, _nftId);
        addressToBetToPlayer[msg.sender][betId] = myBet;
        numberOfBets[msg.sender] += 1;
    }

    function _updateBetInfo(uint256 _betAmount, uint256 _betId, uint256 _betFor) internal {
        if (_betFor == 1) {
            bets[_betId].totalBetAmountFor1 += _betAmount;
        } else {
            bets[_betId].totalBetAmountFor2 += _betAmount;
        }
        bets[_betId].totalBetAmount += _betAmount; 
        uint256 totalBetAmountFor1 = bets[_betId].totalBetAmountFor1;
        uint256 totalBetAmountFor2 = bets[_betId].totalBetAmountFor2;
        uint256 oddsFor2 =  (totalBetAmountFor1 * 10000 / totalBetAmountFor2) + 10000;
        bets[_betId].oddsfor2 = oddsFor2;
        uint256 oddsFor1 =  (totalBetAmountFor2 * 10000 / totalBetAmountFor1) + 10000;
        bets[_betId].oddsfor1 = oddsFor1;
    }

    function _burnNft(uint256 _betId) internal {
        uint256 nftId = addressToBetToPlayer[msg.sender][_betId].nftId;
        if(bocNFT.ownerOf(nftId) != msg.sender) {
            revert BetOnChain__YouNeedTheNftToWithdrawPrize();
        }
        bocNFT.burn(nftId);
    }

    function _calculatePrizeToWithdraw(uint256 _betId, uint256 _winner) view internal returns (uint256) {
        uint256 betAmount = addressToBetToPlayer[msg.sender][_betId].betAmount;
        uint256 odds;
        if (_winner == 1) {
            odds = bets[_betId].oddsfor1;
        } else if (_winner == 2) {
            odds = bets[_betId].oddsfor2;
        } else {
            revert BetOnChain__ThereIsNoWinnerOrWinnerNotSet();
        }
        uint256 prize = (betAmount * odds) / 10000 - 1*10**18;
        return prize;
    }

    // helper function to test the winner without oracle
    function _setWinnerBetId0() external onlyOwner() {
        bets[0].winner = 1;
    }

}
