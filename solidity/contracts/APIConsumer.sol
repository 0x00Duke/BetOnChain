// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";


/// @title A contract to consume data from an API via Chainlink Oracle
/// @author Team 10
/// @notice You can use this contract to query an API
/// @dev This contract is based on Chainlink documentation. https://docs.chainlink.io/docs/example-consumer It uses hardcoded values for clarity. Request testnet LINK and ETH here: https://faucets.chain.link/
contract APIConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public volume;
    bytes32 private jobId;
    uint256 private fee;
    event RequestVolume(bytes32 indexed requestId, uint256 volume);

    /// @notice Initialize the link token and target oracle
    /// @dev See this link for reference https://docs.chain.link/any-api/testnet-oracles/
    address constant private LINK_TOKEN_ADDRESS = 0x779877A7B0D9E8603169DdbD7836e478b4624789; 
    address constant private ORACLE_CONTRACT_ADDRESS = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7
    string constant private JOB_ID = "ca98366cc7314957b8c012c72f05aeeb";  

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(LINK_TOKEN_ADDRESS);
        setChainlinkOracle(ORACLE_CONTRACT_ADDRESS);
        jobId = JOB_ID;
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
   /*  function requestVolumeData() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        // Set the URL to perform the GET request on
        req.add(
            "get",
            "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD"
        );

        // Set the path to find the desired data in the API response, where the response format is:
        // {"RAW":
        //   {"ETH":
        //    {"USD":
        //     {
        //      "VOLUME24HOUR": xxx.xxx,
        //     }
        //    }
        //   }
        //  }
        // request.add("path", "RAW.ETH.USD.VOLUME24HOUR"); // Chainlink nodes prior to 1.0.0 support this format
        req.add("path", "RAW,ETH,USD,VOLUME24HOUR"); // Chainlink nodes 1.0.0 and later support this format

        // Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10 ** 18;
        req.addInt("times", timesAmount);

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(
        bytes32 _requestId,
        uint256 _volume
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestVolume(_requestId, _volume);
        volume = _volume;
    } */


    /// @dev I am unsure what data we actually would need from the Oracle for the contract. Frontend probably needs lists of upcoming teams/competitions/matches.
    /// @dev We might just need to find whether a game is finished and the final score.
    function requestData() public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        // Use the link below to query all matches in the Champions League
        // https://api.football-data.org/v4/competitions/CL/matches
        // Add to Header: X-Auth-Token: 2ac15b063d0e4b6ab5bf6f7a8dff4d2f
        request.add("get", "https://my-api.com/endpoint"); 
        request.add("path", "status");    
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _response) public recordChainlinkFulfillment(_requestId) {
        response = _response;
    }


    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
    }
