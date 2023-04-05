import { useAccount } from 'wagmi';
import { fetchBalance } from '@wagmi/core';
import { useEffect, useState, React } from 'react';
import { ethers } from 'ethers';
import * as exchangeJson from './utils/ExchangeToken.json';
import * as tokenJson from './utils/BocToken.json';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import styles from '../styles/Exchange.module.css';

export default function Exchange() {
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
  const { address, isConnected, isDisconnected } = useAccount();
  const [value, setValue] = useState('1');
  const [tokensBalance, setTokensBalance] = useState();
  const [tokensBalanceBoc, setTokensBalanceBoc] = useState();
  const [isLoading, setIsloading] = useState(false);
  const [amountEthToExchange, setAmountEthToExchange] = useState("");
  const [amountTokenWithdraw, setAmountTokenWithdraw] = useState("");

  const [signerAddress, setSignerAddress] = useState("");
  const [exchange, setExchange] = useState("");
  const [token, setToken] = useState("");

  let provider;

  const getBalance = async (token) => {
    setIsloading(true);
    //using wagmi to fetch token balance
    const balance = await fetchBalance({
      address: address,
      token: token, // replace by BOC token contract : 0x4f7A67464B5976d7547c860109e4432d50AfB38e
    });
    if (token == '')
      setTokensBalance(balance);
    else
      setTokensBalanceBoc(balance);
    setIsloading(false);
  }

  useEffect(() => {
    if (isConnected) {
      setIsDefinitelyConnected(true);
    } else {
      setIsDefinitelyConnected(false);
    }
  }, [address]);

  useEffect(() => {
    if (address?.length) {
      getBalance(""); // Balance ETH
      getBalance("0x50790B1De18317ebF58F7D7e91dB7957304a9877"); // Balance BOC
    }
  }, [address]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const initContract = async () => {
      const { ethereum } = window;
      if (ethereum) {
      try {
        const exchangeAddress = "0xb6daf0c0d23ea8aa5c8332bf56864a7e3e85185b";
        const exchangeABI = exchangeJson.abi;
        const tokenAddress = "0x50790B1De18317ebF58F7D7e91dB7957304a9877";
        const tokenABI = tokenJson.abi;
        provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        setSignerAddress(await signer.getAddress())
        setExchange(new ethers.Contract(
          exchangeAddress,
          exchangeABI,
          signer
        ));
        setToken(new ethers.Contract(
          tokenAddress,
          tokenABI,
          signer
        ))
      } catch (error) {
        console.log(error)
      }
      } else {
        console.log("Install Metamask!")
      }
    }
    initContract();
  }, []);



  const buyToken = async (event) => {
    event.preventDefault(); // prevent page refresh when form is submitted
    try { 
      const ethToSend = ethers.utils.parseEther(amountEthToExchange);
      const buyTokenTx = await exchange.buyToken({value: ethToSend});
      const buyTokenTxReceipt = await buyTokenTx.wait();
      console.log(buyTokenTxReceipt);
      setAmountEthToExchange('')
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawToken = async event => {
    event.preventDefault(); // prevent page refresh when form is submitted
    try { 
      const amountToken = ethers.utils.parseEther(amountTokenWithdraw);
      const approveTx = await token.approve(exchange.address, amountToken);
      await approveTx.wait();
      const sellTokenTx = await exchange.sellToken(amountToken);
      const sellTokenTxReceipt = await sellTokenTx.wait();
      console.log(sellTokenTxReceipt);
      setAmountTokenWithdraw('')
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TabContext  value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleChange} aria-label="exchange tab">
          <Tab label="Deposit" value="1" />
          <Tab label="Withdraw" value="2" />
        </TabList>
      </Box>
      <TabPanel value="1">
        {isDefinitelyConnected && !isLoading ? (
          <div className={`${styles.accountTokenBalance} ${styles.iconSpan}`}> <b>Balance ETH : </b>{tokensBalance?.formatted} {tokensBalance?.symbol}</div>
        ) : null}
        {isDefinitelyConnected && !isLoading ? (
          <div className={`${styles.accountTokenBalanceBoc} ${styles.iconSpan}`}> <b>Balance BOC : </b>{tokensBalanceBoc?.formatted} {tokensBalanceBoc?.symbol}</div>
        ) : null}
        <form className={styles.buyToken}>
          <div className={styles.wrapperBuy}>
          <label htmlFor="buy">Tokens amount to buy</label>
          <input
            id={styles.buy}
            placeholder="0.0 ETH"
            value={amountEthToExchange}
            onChange={e => setAmountEthToExchange(e.target.value)}
          />
          <div className={styles.max} onClick={() => setAmountEthToExchange(tokensBalance?.formatted)}>Max</div>
            <div className={styles.balance}>Balance : {tokensBalance?.formatted} {tokensBalance?.symbol}</div>
          </div>
          <button className={styles.btnBuy} type="submit" onClick={buyToken}>
            Buy BOC Token
          </button>
        </form>
        </TabPanel>
      <TabPanel value="2">
        {isDefinitelyConnected && !isLoading ? (
          <div className={`${styles.accountTokenBalance} ${styles.iconSpan}`}> <b>Balance ETH : </b>{tokensBalance?.formatted} {tokensBalance?.symbol}</div>
        ) : null}
        {isDefinitelyConnected && !isLoading ? (
          <div className={`${styles.accountTokenBalanceBoc} ${styles.iconSpan}`}> <b>Balance BOC : </b>{tokensBalanceBoc?.formatted} {tokensBalanceBoc?.symbol}</div>
        ) : null}
        <form className={styles.withdrawToken}>
          <div className={styles.wrapperBuy}>
          <label htmlFor="withdraw">Tokens amount to withdraw</label>
          <input
              id={styles.withdraw}
            placeholder="0.0 BOC"
            value={amountTokenWithdraw}
            onChange={e => setAmountTokenWithdraw(e.target.value)}
          />
            <div className={styles.max} onClick={() => setAmountTokenWithdraw(tokensBalanceBoc?.formatted)}>Max</div>
            <div className={styles.balance}>Balance : {tokensBalanceBoc?.formatted} {tokensBalanceBoc?.symbol}</div>
          </div>
          <button className={styles.btnBuy} type="submit" onClick={withdrawToken}>
            Withdraw BOC Token
          </button>
        </form>
      </TabPanel>
    </TabContext>
  );
}
