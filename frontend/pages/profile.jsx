import { useAccount } from 'wagmi';
import { useEffect, useState, React } from 'react';
import NftGallery from '../components/nftGallery/nftGallery';

export default function Profile() {
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
      Profile
      {isDefinitelyConnected ? (
        <NftGallery walletAddress={address} collectionAddress="0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85" />
      ) : <h3>You should connect your wallet !</h3>}
    </div>
  );
}
