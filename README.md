# BetOnChain - Betting on Sport/Esport results

**Introduction**

With the World Cup which just ended a couple of months ago, it is interesting to have a look at the sports/esports betting market. It is a very large one: More than 75 Billion dollars according to a grandviewresearch_ study (https://www.grandviewresearch.com/industry-analysis/sports-betting-market-report). Such a market is sometimes considered to be manipulated, not very transparent, etc. and deposited funds cannot always be withdrawn. The blockchain, with its unique technology, can add transparency into this market and hence, make it more efficient. Besides, users, by managing their private keys, are the sole owners of the funds.

**Our idea**

A global architecture can be found below:



![image](https://user-images.githubusercontent.com/92883939/205520437-894f32cd-9473-4877-9465-749796d7a00f.png)



Of course, inputs from external sources are needed in order to have our betting platform working. This is done through Oracles: they provide the ability to bridge the gap between blockchain networks and the outside world. They allow users to send external data to the blockchain, and, as a result, are essential parts of most blockchain applications. Dapps in the DEFI, Risk, betting sectors are not relevant without Oracles.

**What we have done**

 * We are using the following API to get the names of the Teams playing, the odds and the name of the winner:
 
https://www.football-data.org/
   
 * Thanks to Chainlink, we are retrieving the name of the Winner
 
 * We have focused on defining the main structure of the Solidity contracts:
 
  The contracts BetOnChain.sol, BocNFT.sol, BocToken.sol, ConsumerContract.sol and ExchangeToken.sol
  
 * We have created unit tests:
 
  BetOnChain.ts, ExchangeToken.ts
  
 * We have created a front end:

![image](https://user-images.githubusercontent.com/92883939/230429012-81637f1d-d36b-4d45-86d7-84e9ee7dec94.png)

![image](https://user-images.githubusercontent.com/92883939/230429141-0f011b68-49b2-4f40-9bb6-8cde81cf86d7.png)

A diagram of the Solidity contracts interaction can be found below:

![image](https://user-images.githubusercontent.com/92883939/230427715-b1d4e5cb-219b-45d4-a4f2-d6a3e727890c.png)

  What is the process?
  
  1. We deploy the ExchangeToken contract. That creates our token (BocToken) and allows a user to exchange an initial amount of ETH for the Boc token
  
  2. Then we deploy the BetOnChain contract. That creates an NFT as well as the consumer contract
  
  3. We need to fund the customer contract with LINK tokens
  
  4. Then we need to run a Chainlink node to get the result of the games (winner) from the ConsumerContract.sol
  
  5. Then the user can trigger a bet from the frontend
  
  6. Once the game is finished, the name of the winner is provided by the Chainlink oracle and the user (having triggered a bet) gets a NFT
  
  7. Depending on the number of bets triggered, there are different levels of achievements (beginner, warrior and expert). These levels can be set up by the owner of the BetOnChain contract
  
  8. A winner gets the amount bet + the prize of the bet (which depends on the odds)
  
  9. A person who did not win looses the amount bet (betAmount)
  
**Challenges we have encountered**

 * Finding the right API
 
 * Finding a good mix between having APIs called from the backend and having source inputs through Chainlink
 
 * Set up of the Chainlink node on the Cloud
 
**Next steps**
 
  * Adding a treasury. Indeed the main added value of blockchain is giving the possibility of a user to be the sole owner of the funds and manage its custody - so the user can withdraw funds at any time. This feature is not always available in Web 2.0 betting platform - hence the major benefit from blockchain in this case

  * Chainlink hackathon?

**Team**

    Fernando Andreotti - 0x7d519b2d27512dbb130ec4c9b997ef07a6ad9266
    Marvin Roy - 0x5E635441cAb460C3b126f7233419f143f87e404d
    Ramiro Lopez Cento - 0x8E58a9aD55e4e9e5C387537097a6fF41504e4398
    Loic B - 0xAf168C4c755771e46d24C7785909BA70C1e85218
    Leon Ducasse - 0x52d51348509c059A177a8441fb0001AE7Ef73466
    Yannick Jen.- 0x344C263Ae7575b58BCD313Fd6a517c8ca8872B3B
