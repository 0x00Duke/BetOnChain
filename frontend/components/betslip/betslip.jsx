import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BetslipCard from '../betslipCard/betslipCard';
import { removeBet, updateStake } from '../../store/slices/betslipSlice';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Close, KeyboardArrowDown, SportsSoccer } from '@mui/icons-material';
import { useAccount } from 'wagmi';
import { fetchBalance } from '@wagmi/core';
import styles from "../../styles/Betslip.module.css";

const BetSlip = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState('2');
  const [toggleSlip, setToggleSlip] = useState(false);
  const [screenSize, setScreenSize] = useState(null);

  const bets = useSelector(state => state.betslip.bets);
  const totalOdds = useSelector(state => state.betslip.totalOdds);
  const totalAmount = useSelector(state => state.betslip.totalAmount);
  const stake = useSelector(state => state.betslip.stake);

  const [tokensBalance, setTokensBalance] = useState();
  const { address, isConnected, isDisconnected } = useAccount();
  const [myAddress, setMyAddress] = useState();
  const [isLoading, setIsloading] = useState(false);
  const getBalance = async () => {
    setIsloading(true);
    const balance = await fetchBalance({
      address: address,
      token: '0x50790B1De18317ebF58F7D7e91dB7957304a9877', // replace by BOC token contract 
    });
    setTokensBalance(balance);
    setIsloading(false);
  };

  useEffect(() => {
    if (address?.length) getBalance();
  }, [myAddress]);

  useEffect(() => {
    if (address?.length) setMyAddress(address);
  }, [address]);

  useEffect(() => {
    if (bets.length > 0) {
      setValue('2');
    }
  }, [bets.length]);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleStake = (e) => {
    dispatch(updateStake(e.target.value));
  };
  const handleRemove = (id) => {
    dispatch(removeBet(id));
  };
  const handleToggleSlip = () => {
    if (screenSize > 1024) {
      const betslips = document.querySelector(`${styles.toggleQueries}`);
      betslips.scrollIntoView({ behavior: 'smooth' });
    } else {
      setToggleSlip(!toggleSlip);
    }
  }

  return (
    <>
      <div className={`${styles.toggleQueries} ${toggleSlip ? `${styles.open}`: undefined}`} id={styles.betslips}>
        <BetslipCard className={styles.toggleCard}>
          <div className={styles.bettingSlip}>
            <div className={styles.goDown} onClick={() => setToggleSlip(!toggleSlip)}>
              <KeyboardArrowDown className={styles.icon} />
            </div>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} className={styles.timtim} >
                    <Tab label="Betslip" value="2" />
                    <Tab disabled label="" value="1" />
                  </TabList>
                </Box>
                {
                  bets.length > 0 && (
                    <TabPanel value="2">
                      <div className={styles.bets}>
                        {
                          bets.map((e, i) => (
                            <div className={styles.bettingList} key={i}>
                              <div className={styles.removeButton} onClick={() => handleRemove(e.eventId)}>
                                <Close className={styles.icon} />
                              </div>
                              <div className={styles.game}>
                                <div className={styles.type}>
                                  <SportsSoccer className={styles.icon} stroke='2px' />
                                  {e.choiceName}
                                </div>
                                <div className={styles.competition}>
                                  {e.matchName}
                                </div>
                                <div className={styles.market}>
                                  {e.marketName}
                                </div>
                              </div>
                              <div className={styles.odd}>
                                {e.choiceOdd}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      {
                        bets.length > 0 && (
                          <div className={styles.totalling}>
                            <div className={styles.tto}>
                              <div className={styles.title}>
                                Total Odds
                              </div>
                              <div className={styles.body}>
                                {totalOdds}
                              </div>
                            </div>
                            <div className={styles.tto}>
                              <div className={styles.title}>
                                Tokens Balance
                              </div>
                              <div className={styles.body}>
                                {tokensBalance?.formatted} {tokensBalance?.symbol}
                              </div>
                            </div>
                            <div className={styles.tto}>
                              <div className={styles.title}>
                                Stake
                              </div>
                              <div className={styles.body}>
                                <input type="tel" onChange={handleStake} value={stake} />
                              </div>
                            </div>
                            <div className={`${styles.tto} ${styles.win}`}>
                              <div className={styles.title}>
                                Potential Winnings
                              </div>
                              <div className={styles.body}>
                                {`$${totalAmount}`}
                              </div>
                            </div>
                            <div className={styles.placeBet}>
                              <button>
                                Place Bet
                              </button>
                            </div>
                          </div>
                        )
                      }
                    </TabPanel>
         
                  )
                }
                <TabPanel value="1">

                </TabPanel>
              </TabContext>
            </Box>
          </div>
        </BetslipCard>
      </div>
      {
        !toggleSlip && (
          <span className={styles.floatingButton} onClick={handleToggleSlip}>
            <span className={styles.betCount}>
              {bets.length}
            </span>
            <span>
              BETSLIP
            </span>
          </span>
        )
      }
    </>
  )
}

export default BetSlip