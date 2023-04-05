// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";


///@title Consumer contract - Chainlink Oracle
///@notice You can use this contract to get the result of a football match on chain using sportmonks API
///@dev This contract has to be used with an external adapter and a custom jobs  
contract ConsumerContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;



    uint256 private constant ORACLE_PAYMENT = 1 * LINK_DIVISIBILITY / 10; 
    uint256 public homeGoal;
    uint256 public awayGoal;
    string public matchName; 

    mapping(uint256 => uint256) public matchWinner;

    event RequestForInfoFulfilled(
        bytes32 indexed requestId,
        uint256 indexed homeGoal,
        uint256 indexed awayGoal,
        string matchName
    );

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
    }

    ///@notice We have to give the address of the oracle, the custom jobId and the fixtureId for the API
    function requestMatchResult(
        address _oracle,
        string memory _jobId,
        uint256 fixtureId
    ) public onlyOwner {
        Chainlink.Request memory req = buildOperatorRequest(
            stringToBytes32(_jobId),
            this.fulfillRequestInfo.selector
        );
        req.addUint("fixtureId", fixtureId);
        sendOperatorRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    ///@notice This function will be called as a call back function once the chainlink node have all the information requested
    function fulfillRequestInfo(bytes32 _requestId, uint256 _homeGoal, uint256 _awayGoal, string memory _matchName, uint256 _fixtureId, uint256 _winner)
        public
        recordChainlinkFulfillment(_requestId)
    {
        emit RequestForInfoFulfilled(_requestId, _homeGoal, _awayGoal, _matchName);
        matchName = _matchName;
        homeGoal = _homeGoal;
        awayGoal = _awayGoal;
        matchWinner[_fixtureId] = _winner;
    }


    /*
    ========= UTILITY FUNCTIONS ==========
    */

    function contractBalances()
        public
        view
        returns (uint256 eth, uint256 link)
    {
        eth = address(this).balance;

        LinkTokenInterface linkContract = LinkTokenInterface(
            chainlinkTokenAddress()
        );
        link = linkContract.balanceOf(address(this));
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer Link"
        );
    }

    function withdrawBalance() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration
    ) public onlyOwner {
        cancelChainlinkRequest(
            _requestId,
            _payment,
            _callbackFunctionId,
            _expiration
        );
    }

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}
