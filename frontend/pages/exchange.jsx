import { useAccount } from 'wagmi';
import { fetchBalance } from '@wagmi/core';
import { useEffect, useState, React } from 'react';
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
  const [amountTokenBuy, setAmountTokenBuy] = useState("");
  const [amountTokenWithdraw, setAmountTokenWithdraw] = useState("");

  const getBalance = async (token) => {
    setIsloading(true);
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
      getBalance("0xB2448D911BC792c463AF9ED8cf558a85D97c5Bf1"); // Balance BOC
    }
  }, [address]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const buyToken = async event => {
    event.preventDefault(); // prevent page refresh when form is submitted
    // const signer = provider.getSigner(account);
    // const deposit = EXCHANGE_CONTRACT.connect(signer);

    // const tx = await deposit.buyTokens(ethers.utils.parseEther(amountTokenBuy), {
    //   gasLimit: 1_000_000,
    // });
    // await tx.wait();
  };

  const withdrawToken = async event => {
    event.preventDefault(); // prevent page refresh when form is submitted
    // const signer = provider.getSigner(account);
    // const withdraw = EXCHANGE_CONTRACT.connect(signer);

    // const tx = await withdraw.withdraw(ethers.utils.parseEther(amountTokenWithdraw), {
    //   gasLimit: 1_000_000,
    // });
    // await tx.wait();
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
            value={amountTokenBuy}
            onChange={e => setAmountTokenBuy(e.target.value)}
          />
          <div className={styles.max} onClick={() => setAmountTokenBuy(tokensBalance?.formatted)}>Max</div>
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
