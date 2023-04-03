import TransactionHistory from "../components/transactionsHistoryDisplay/transactionsHistoryDisplay";
import { useAccount } from 'wagmi';
import { useEffect, useState, React } from 'react';

export default function Transactions() {
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
  const { address, isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setIsDefinitelyConnected(true);
    } else {
      setIsDefinitelyConnected(false);
    }
  }, [address]);

  return (
    <div>
      Transactions
      { isDefinitelyConnected ? (
        <TransactionHistory walletAddress={address} chain={"ETH_MAINNET"} /> 
      ) : <h3>You should connect your wallet !</h3> }
    </div>
  );
}
