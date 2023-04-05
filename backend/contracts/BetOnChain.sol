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



/**
 * @title BetOnChain contract - betting functionality
 * @notice You can use this contract to create bets, interact with them, withdraw prizes and mint achievement NFTs.
 * @dev Inherits OpenZeppelin Ownable implementation
 */
contract BetOnChain is Ownable {

    /// @dev Struct that contains information about a player's bet
     
    struct PlayerBetInfo {
        address player;
        uint256 betId;
        uint256 betAmount;
        uint256 betFor;
        uint256 nftId;
    }
    
    ///  @dev Struct that contains information about a bet
     
    struct BetInfo{
        uint256 oddsfor1;
        uint256 oddsfor2;
        uint256 oddsforDraw;
        bool betsOpen;
        bool betsExist; 
        uint256 totalBetAmountFor1;
        uint256 totalBetAmountFor2; 
        uint256 totalBetAmount;
        uint256 winner;
    }
    /// @dev Struct that contains the URIs of the achievement NFTs
    
    struct AchievementURI {
        string beginner;
        string warrior;
        string expert; 
    }
     
     /// @dev Struct that contains the requirements for each achievement level depending on number of bets
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
   
    mapping(address => uint) public numberOfBets; // number of bets mapping
    mapping(uint256 => BetInfo) public bets; // mapping to match ID with Bet 
    /// @dev mapping that matches addresses to a mapping that matches betIds with playerBetInfo 
    mapping(address => mapping (uint256 => PlayerBetInfo)) public addressToBetToPlayer; 


    /**
    * @notice Contracts constructor
    * @param bocTokenAddress Address to initialize BocToken contract instance 
    * @dev Upon deployment, it creates an instance of the BocNFT and ConsumerContract contracts
        and initializes the BocToken contract instance.
    */
    constructor(address bocTokenAddress) {
        bocNFT = new BocNFT();
        consumerContract = new ConsumerContract();
        bocToken = BocToken(bocTokenAddress);
    }

    // ************************ //  
    // *       Events     * //
    // ************************ //

    event betSent(address _from, address _to, uint256 betId, uint256 amount, uint256 betFor);
    event prizeWithdraw(address _from, address _to, uint256 betId, uint256 amount);
    event achievementNftMinted(address _to, uint256 achievementLevelToMint);
    // ************************ //  
    // *       Modifiers      * //
    // ************************ //

    modifier whenBetsClosed(uint256 betId) {
        require(!bets[betId].betsOpen, "Bet is open");
        _;
    }

     modifier whenBetsOpen(uint256 betId) {
         require(bets[betId].betsOpen, "Bet is closed");
        _;
    }

    // ************************ //  
    // *       Functions     * //
    // ************************ //

    /**
     * @notice  Creates new Bets and includes them in bets mapping
     * @dev     Only owner can call this function
     * @param   betId  array of unique identifiers of bet to be created 
     * @param   oddsfor1  array of odds for team 1
     * @param   oddsforDraw  array of odds for a draw
     * @param   oddsfor2  array of odds for team 2
     */
    function createBet(uint256[] calldata betId, uint256[] calldata oddsfor1,uint256[] calldata oddsforDraw, uint256[] calldata oddsfor2) external onlyOwner{
         uint256 length = betId.length;
         require(length >0 && length == oddsfor1.length && length == oddsfor2.length && length== oddsforDraw.length, "BetOnChain invalid length of input arrays");
            for(uint i =0; i< length;){
               if (bets[betId[i]].betsExist) {
                  revert BetOnChain__ThisIdIsAlreadyUsed();
              }
                BetInfo memory newBet = BetInfo(oddsfor1[i], oddsfor2[i], oddsforDraw[i], false, true, 1 ether, 1 ether, 0, 0);
                bets[betId[i]]= newBet;
                 unchecked{  
                     i++;
                 }
            }
    }  

    /**
     * @notice  Opens bets already created for users to bet 
     * @dev     Only owner can call
     * @param   betId  Unique identifier of bet to open 
     */
    function openBet(uint256 betId) external onlyOwner whenBetsClosed(betId) {
        bets[betId].betsOpen = true;
    }

     /**
     * @notice  Closes an open bet
     * @dev     Only owner can call
     * @param   betId Unique identifier of bet to close 
     */
    function closeBet(uint256 betId ) external onlyOwner whenBetsOpen(betId){
        bets[betId].betsOpen = false;
    }

    /**
     * @notice  Bet certain amount for a team when bet is open.
     * @dev     Allows a user to place a bet on a particular outcome for a given bet ID and mint NFT for given bet.
     * @param   betAmount  Amount of BOC tokens to be bet.
     * @param   betFor  The team  that the user is betting on. This should be either 1 or 2.
     * @param   betId   Unique identifier of the bet.
     */
    function bet(uint256 betAmount, uint256 betFor, uint256 betId) external whenBetsOpen(betId){
        if (betFor != 1 && betFor !=2 ) {
            revert BetOnChain__ThisTeamDoesNotExist();
        }
        bocToken.transferFrom(msg.sender, address(this), betAmount);
        uint256 nftId = _mintBetPosition();
        _updatePlayerBetInfo(msg.sender, betId, betAmount, betFor, nftId);
        _updateBetInfo(betAmount, betId, betFor);  
        emit betSent(msg.sender,address(this),betId,betAmount,betFor)  ;
    }


    /**
     * @notice  Withdraw bet prize 
     * @dev     Only NFT owner for that bet can withdraw prize. 
     * @param   betId  Unique identifier of the bet
     */
    function withdrawPrize(uint256 betId) external whenBetsClosed(betId) {
        uint256 winner = bets[betId].winner;
        if (addressToBetToPlayer[msg.sender][betId].betFor != winner) {
            revert BetOnChain__YouBetIsNotAWinningBet();
        }
        _burnNft(betId);
        uint256 prizeAmount = _calculatePrizeToWithdraw(betId, winner);
        bocToken.transfer(msg.sender, prizeAmount);
        emit prizeWithdraw(address(this), msg.sender, betId,prizeAmount);
    }

    /**
     * @notice  Return odds for team 1
     * @dev     Get odds providing bet unique identifier. Only reads.
     * @param   betId  Unique identifier of the bet
     * @return  uint256  Odds for team 1
     */
    function getOddsForTeam1(uint256 betId) view external returns (uint256) {
        return bets[betId].oddsfor1;
    }

    /**
     * @notice  Return odds for team 2
     * @dev     Get odds providing bet unique identifier. Only reads.
     * @param   betId  Unique identifier of the bet
     * @return  uint256  Odds for team 2
     */
    function getOddsForTeam2(uint256 betId) view external returns (uint256) {
        return bets[betId].oddsfor2;
    }

    /**
     * @notice  Requests match results
     * @dev     Retrieve API information from Chainlink. 
     * @param   oracle Address of oracle contract 
     * @param   jobId  The ID of the job to be used to request the match results.
     * @param   betId   Unique identifier of the bet
     */
    function callResults(address oracle, string memory jobId, uint256 betId) external whenBetsClosed(betId) {
        consumerContract.requestMatchResult(oracle, jobId, betId);
    }

    /**
     * @notice  Get bet winning team.
     * @dev     Using oracle request.
     * @param   betId  Unique identifier of the bet.
     */
    function getWinner(uint256 betId) external {
        uint256 winner = consumerContract.matchWinner(betId);
        bets[betId].winner = winner;
    }

    /**
     * @notice  Mint achievement NFT
     * @dev     User can mint NFT depending on number of bets done
     * @param   achievementLevelToMint  Level of achievement (0,1 or 2)
     */
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
        emit achievementNftMinted(msg.sender,achievementLevelToMint);
    }

    /**
     * @dev     Sets the URI for the bet position NFT. Only Owner can call.
     * @param   _betPositionURI   The new URI for the bet position NFT.
     */
    function setBetPositionURI(string memory _betPositionURI) external onlyOwner {
        betPositionURI = _betPositionURI;
    }

    /**
     * @dev     Get URI for the bet position NFT.
     * @return  string  URI returned.
     */
    function getBetPositionURI() view external returns (string memory) {
        return betPositionURI;
    }

    /**
     * @dev     Sets the URIs for the different achievement levels.
     * @param   beginnerURI  The URI for the beginner achievement level.
     * @param   warriorURI  The URI for the warrior achievement level.
     * @param   expertURI  The URI for the expert achievement level.
     */
    function setAchievementURI(string memory beginnerURI, string memory warriorURI, string memory expertURI) external onlyOwner {
        achievementURI.beginner = beginnerURI;
        achievementURI.warrior = warriorURI;
        achievementURI.expert = expertURI;
    }

    /**
     * @dev  Get URI for different achievement levels.
     * @return  AchievementURI  struct containing URIs.
     */
    function getAchievementURI() view external returns (AchievementURI memory) {
        return achievementURI;
    }

   /**
    * @dev Sets the required number of bets for achieving different levels. Only owner can call.
    * @param beginnerNumberOfBets The required number of bets to achieve the beginner level.
    * @param warriorNumberOfBets The required number of bets to achieve the warrior level.
    * @param expertNumberOfBets The required number of bets to achieve the expert level.
    */
    function setAchievementRequirement(uint256 beginnerNumberOfBets, uint256 warriorNumberOfBets, uint256 expertNumberOfBets) external onlyOwner {
        achievementRequirement.beginnerNumberOfBets = beginnerNumberOfBets;
        achievementRequirement.warriorNumberOfBets = warriorNumberOfBets;
        achievementRequirement.expertNumberOfBets = expertNumberOfBets;
    }

    /**
     * @dev     Returns the required number of bets for achieving different levels.
     * @return AchievementRequirement struct containing the required number of bets for achieving the beginner, warrior, and expert levels.
     */
    function getAchievementRequirement() view public returns(AchievementRequirement memory) {
        return achievementRequirement;
    }

    /**
     * @dev     Internal function. Mints a new Bet On Chain NFT and assigns it to the sender's address.
     * @return  uint256  The ID of the newly minted NFT.
     */
    function _mintBetPosition() internal returns (uint256) {
        uint256 nftId = bocNFT.getCurrentId();
        bocNFT.safeMint(msg.sender, betPositionURI);
        return nftId;
    }

   /**
    * @notice This function updates the player's betting information.
    * @dev Internal function. It creates a new PlayerBetInfo struct with the provided parameters, and stores it in the addressToBetToPlayer mapping for the given player and bet ID.
    * It also increments the numberOfBets variable for the player.
    * @param _player The address of the player.
    * @param betId The ID of the bet.
    * @param _betAmount The amount of the bet.
    * @param _betFor The team the bet was placed for.
    * @param _nftId The ID of the NFT representing the bet position.
    */

    function _updatePlayerBetInfo(address _player, uint256 betId, uint256 _betAmount, uint256 _betFor, uint256 _nftId) internal {
        PlayerBetInfo memory myBet = PlayerBetInfo(_player, betId, _betAmount, _betFor, _nftId);
        addressToBetToPlayer[msg.sender][betId] = myBet;
        numberOfBets[msg.sender] += 1;
    }

    
   /**
    * @notice Updates the betting information for a given bet.
    * @dev It updates the total bet amounts for each team, the total bet amount for the bet, and the odds for each team based on the amount bet.
    * @param _betAmount The amount of the bet to be added to the total amount.
    * @param _betId Unique identifier of the bet to be updated.
    * @param _betFor The team that the bet was placed for (either 1 or 2).
    */

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

   /**
    * @notice  Burns the NFT associated with the bet and owned by the caller.
    * @dev     The caller must own the NFT associated with the given bet, otherwise the function will revert.
    * @param   _betId  Unique identifier of the bet.
    */
    function _burnNft(uint256 _betId) internal {
        uint256 nftId = addressToBetToPlayer[msg.sender][_betId].nftId;
        if(bocNFT.ownerOf(nftId) != msg.sender) {
            revert BetOnChain__YouNeedTheNftToWithdrawPrize();
        }
        bocNFT.burn(nftId);
    }

  /**
   * @notice  Calculates the prize to be withdrawn by the caller if the given bet has a winner.
   * @dev     The bet must have a winner set, otherwise the function will revert.
   * @param   _betId  Unique identifier of the bet.
   * @param   _winner The winner of the bet (1 for "for1", 2 for "for2").
   * @return  uint256 The prize amount, in wei.
   */
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