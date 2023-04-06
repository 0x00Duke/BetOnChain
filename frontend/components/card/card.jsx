import styles from "../../styles/Card.module.css";
import data from '../../database/data';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import odds from "../../database/odds";
import { addBet, removeBet } from '../../store/slices/betslipSlice';
import moment from 'moment';
import * as betJson from '../../pages/utils/BetOnChain.json'
import * as tokenJson from '../../pages/utils/BocToken.json';
import * as consumerJson from '../../pages/utils/ConsumerContract.json';
import * as nftJson from '../../pages/utils/BocNFT.json'
import { ethers } from 'ethers'

function calculateOdds(data) {
  const fraction = data.split('/');
  return ((parseFloat(fraction[0], [10]) / parseFloat(fraction[1], [10])) + 1).toFixed(2);
}

function joint(name, group) {
  if (group === null) {
    return `${name}`;
  }
  else {
    return `${name} ${group}`;
  }
}

function reference(value) {
  switch (value) {
    case "1":
      return "Home";
    case "2":
      return "Away";
    case "X":
      return "Draw";
    case "1X":
      return "Home or Draw";
    case "X2":
      return "Draw or Away";
    case "12":
      return "Home or Away";

    default:
      return value;
  }
}

function convertObjectToString(choiceId, choiceOdd, eventId, choiceName, marketName) {
  const obj = {
    choiceId,
    choiceOdd,
    eventId,
    choiceName,
    marketName,
  };
  return JSON.stringify(obj);
}

const Card = () => {
  const dispatch = useDispatch();
  const [isLive, setIsLive] = useState(true);
  const [starBG, setStarBG] = useState(false);
  const [ftChoice, setFtChoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [betContract, setBetContract] = useState("");
  const [token, setToken] = useState("");
  const [consummerContract, setConsummerContract] = useState("");
  const [nftContract, setNftContract] = useState("");

  const [team1Odds, setTeam1Odds] = useState("");
  const [team2Odds, setTeam2Odds] = useState("");
  const [drawOdds, setDrawOdds] = useState("");

  const [betFor, setBetFor] = useState("");
  const [amountToBet, setAmountToBet] = useState("");
  const [betId, setBetId] = useState("")
  const [winner, setWinner] = useState("")
  const [winnerString, setWinnerString] = useState("");
  const [nftId, setNftId] = useState("");
  
  const matchId = useSelector(state => state.matchId.matchId);
  const bets = useSelector(state => state.betslip.bets);

  const watchCost = useSelector(state => state.betslip.totalAmount);

  const matchObj = data.find(obj => obj.id === matchId);
  const oddsObj = odds.find(obj => obj.eventId === matchId);

  const selectedBet = bets.find(obj => obj.eventId === matchId) || {};

  let provider;

  useEffect(() => {
    setFtChoice(selectedBet);
  }, [watchCost]);

  const market = oddsObj?.markets[0];
  const c = market?.choices;

  useEffect(() => {
    const initContract = async () => {
      const { ethereum } = window;
      if (ethereum) {
      try {
        const betAddress = "0x400483e30faf9a819d2488ae485A0Fc1b571116e";
        const betABI = betJson.abi;
        const tokenAddress = "0x50790B1De18317ebF58F7D7e91dB7957304a9877";
        const tokenABI = tokenJson.abi;
        const consumerAddress = "0x9bfE7Db1DCc6832503fc3FD956528adbDB2A6888";
        const consumerABI = consumerJson.abi;
        const nftAddress = "0x9749E40D042BC1fC521C343453bf77d8Af0Aa838";
        const nftABI = nftJson.abi;
        provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        setBetContract(new ethers.Contract(
          betAddress,
          betABI,
          signer
        ));
        setToken(new ethers.Contract(
          tokenAddress,
          tokenABI,
          signer
        ));
        setConsummerContract(new ethers.Contract(
          consumerAddress,
          consumerABI,
          signer
        ));
        setNftContract(new ethers.Contract(
          nftAddress,
          nftABI,
          signer
        ));
        
      } catch (error) {
        console.log(error)
      }
      } else {
        console.log("Install Metamask!")
      }
    }
    initContract();
    handleUpdateOdds();
  }, []);

{/* Odds selection */}
  const handleChange = (e) => {
    let obj = e.target.value;

    if (ftChoice === '') {
      setFtChoice(obj);
    } else {
      if (parseInt(ftChoice.choiceId) === parseInt(obj.choiceId)) {
        dispatch(removeBet(ftChoice.eventId));
        setFtChoice('');
      } else {
        setFtChoice(obj);
      }
    }
  }

  {/* Form submit */}
  const handleSubmit = (e) => {
    e.preventDefault();
    if (ftChoice === '') {
      return;
    } else {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
      const obj = {
        target: {
          value: JSON.stringify(ftChoice),
          checked: ftChoice.checked
        }
      };
      dispatch(addBet(obj));
    }
  }

  const timerMatch = moment(matchObj?.startTimestamp).format("YYYY-M-DDThh:MM:ss");


  const handleUpdateOdds = async (e) => {
    // e.preventDefault();
    try { 
        const getTeam1Odds = await betContract.getOddsForTeam1(Number(betId))
        setTeam1Odds(Number((getTeam1Odds/10000).toString()).toFixed(2))
        const getDrawOdds = await betContract.getOddsForDraw(Number(betId))
        setDrawOdds(Number((getDrawOdds/10000).toString()).toFixed(2))
        const getTeam2Odds = await betContract.getOddsForTeam2(Number(betId))
        setTeam2Odds(Number((getTeam2Odds/10000).toString()).toFixed(2))
        const info = await betContract.bets(Number(betId))
        const a = info.totalBetAmountFor0.toString();
        const b = info.totalBetAmountFor1.toString();
        const d = info.totalBetAmountFor2.toString();
        console.log(a, b, d)

    } catch (error) {
      console.log(error);
    }
  }

  const handleOpenBet = async (e) => {
    e.preventDefault();
    try { 
        const openBetTx = await betContract.openBet(Number(betId))
        await openBetTx.wait()
    } catch (error) {
      console.log(error);
    }
  }

  const handleCloseBet = async (e) => {
    e.preventDefault();
    try { 
      const closeBetTx = await betContract.closeBet(Number(betId))
      await closeBetTx.wait()
    } catch (error) {
      console.log(error);
    }
  }

  const handleCreateBet = async (e) => {
    e.preventDefault();
    try { 
        const createBetTx = await betContract.createBet(Number(betId), "1", "1", "1")
        await createBetTx.wait()
    } catch (error) {
      console.log(error);
    }
  }

  const handleBet = async (e) => {
    e.preventDefault();
    setBetFor(e.target.value)
    try { 
      const approveTx = await token.approve(betContract.address, ethers.constants.MaxUint256)
      await approveTx.wait();
      const betTx = await betContract.bet(ethers.utils.parseUnits(amountToBet, 18), Number(betFor), Number(betId))
      await betTx.wait()
      setBetFor("");
    } catch (error) {
      console.log(error);
    }
  }

  const handleCallResult = async () => {
    try { 
      const oracleAddress = "0xb603fb591EcfeDd6C18EF539fc1fA8d8F7Ae05E5";
      const jobId = "cd75c01422d34e01b91a0e730d4f5108"
      const callResultTx = await betContract.callResults(oracleAddress, jobId, Number(betId))
      await callResultTx.wait()
    } catch (error) {
      console.log(error);
    }
  }

  const handleEngrave = async () => {
    try { 
      const callWinnerTx = await betContract.getWinner(Number(betId))
      await callWinnerTx.wait()
    } catch (error) {
      console.log(error);
    }
  }

  const handleWinner = async () => {
    try { 
      const winnerCall = await betContract.bets(Number(betId));
      const winner2 = winnerCall.winner.toString();
      setWinner(winner2)
      if (winner == 0) {
        setWinnerString("Draw")
      } else if (winner == 1) {
        setWinnerString("Home Team")
      } else if (winner == 2) {
        setWinnerString("Away Team")
      } else {
        setWinnerString("Wait a few mns for a secure result")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleWithdraw = async () => {
    try { 
      const approveNftTx = await nftContract.approve(betContract.address, nftId);
      const approveNftTxReceipt = approveNftTx.wait();
      const withdrawTx = await betContract.withdrawPrize(Number(betId));
      const withdrawTxReceipt = await withdrawTx.wait()
      console.log(withdrawTxReceipt)
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <>

{/* Admin */}
  <div className={styles.card}>
      <div className={styles.cardTitle}>
        ADMIN
          <input placeholder="Enter a bet ID" className={styles.buttonA} value={betId} onChange={(e) => setBetId(e.target.value)} />
      </div>
      <br />
 
      <br/>
      <br />
      <div className={styles.cardActions}>
        <button type='submit' onClick={handleCreateBet}> Create Bet </button>
      </div>
      <br/>
      <div className={styles.cardActions}>
        <div>
          <button type='submit' onClick={handleOpenBet}> Open Bet </button>
        </div>
      </div>
      <br />
      <div className={styles.cardActions}>
        <div>
          <button type='submit' onClick={handleCloseBet}> Close Bet </button>
        </div>
      </div>
      <br />
    </div>


{/* Match */}
  <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardTitle}>
        <span style={{flex: "1"}}>
          Wed, 9PM
        </span>
        <div className={styles.cardTitleText} style={{ flex: "auto" }}>
          Champions League
        </div>
        <div className={styles.cardTitleIcons}>
        </div>
      </div>
      <br />
      <br />
      {/* Team + Odds + Team */}

      <div className={styles.cardBody}>

        <div className={styles.team}>
            <div className={styles.teamName}> FC Barcelona </div>  {/* API CAll for Home Team */} 
        </div>

        {/* Team 1 name*/}
        <div className={styles.matchStats}>
          <div className={styles.oddsButtons} >  {/* API CAll for  QUOTES */} 

            {/* Odds team 1 */}
            <div className={styles.switchItem}>
              <input type="checkbox" value={team1Odds} onChange={handleChange} id={styles.switcher}  checked={team1Odds}/>
              <label htmlFor="switcher"> {team1Odds} </label>
            </div>
              
            {/* Odds draw */}
            <div className={styles.switchItem}>
              <input type="checkbox" value={drawOdds} onChange={handleChange} id={styles.switcher} />
              <label htmlFor="switcher"> {drawOdds} </label>
            </div>

            {/* Odds team 2*/}
            <div className={styles.switchItem}>
              <input type="checkbox" value={team2Odds} onChange={handleChange} id={styles.switcher} />
              <label htmlFor="switcher"> {team2Odds} </label>
            </div>

          </div>
        </div>

      {/* Team 2 name*/}
        <div className={styles.team}>
          <div className={styles.teamName}> Inter Milan </div>  {/* API CAll for Away team */} 
        </div>

      </div>
      <br />
      <br />
      {/* Action */}
      <div className={styles.cardActions}>
          <button type='submit' onClick={handleUpdateOdds}> Update Odds </button>
      </div>  
      <br />
 
  </form>



{/* Bet Section */}
        <div className={styles.card} >
          <div className={styles.cardTitle}>
            Bet wisely
          </div>
          <br />
          <br />

          <form className={styles.cardActions} onSubmit={handleBet} >
            <input placeholder="Bet ID" className={styles.buttonA} value={betId} />
              {/* (e) => setBetId(e.target.value)} /> */}
            <select className={styles.buttonA} value={betFor} onChange={(e) => setBetFor(e.target.value)}>
              <option value=""></option>
              <option value="1">Team 1</option>
              <option value="2">Team 2</option>
              <option value="0">Draw</option>
            </select>
            <input placeholder="Amount of BOC" className={styles.buttonA} value={amountToBet} onChange={(e) => setAmountToBet(e.target.value)} />
            <button className={styles.buttonA} type='submit'>Bet</button>
          </form>
          <br />
          <br />
          <br />
          Keep the NFT that you will receive in a secure place

        </div>

        <div className={styles.card} >
          <div className={styles.cardTitle}>
            Results from a trusted source on Chain
          </div>
          <br />
          <br />
          <div className={styles.cardActions}>
            <button type='submit' onClick={handleCallResult}> Call Oracle </button>
          </div>  
          <br />
          <div className={styles.cardActions}>
            <button type='submit' onClick={handleEngrave}> Engrave in marble </button>
          </div>  
          <br />
      </div>

      <div className={styles.card} >
          <div className={styles.cardTitle}>
            Winner name
          </div>
          <br />
          <br />
          <div className={styles.cardActions}>
          <button type='submit' onClick={handleWinner}> Show winner </button>
      </div>  
      <br />
          {winnerString}
      </div>
    
      <div className={styles.card} >
          <div className={styles.cardTitle}>
            Exchange your NFT for your rewards Token
          </div>
          <br />
          <br />
          <div className={styles.cardActions}>
            <input placeholder="NFT ID to burn" className={styles.cardActions} value={nftId} onChange={(e) => setNftId(e.target.value)} />
           <button type='submit' onClick={handleWithdraw}> Withdraw winning bet </button>
      </div>  
      <br />
      </div>


  </>
  )
}

export default Card

