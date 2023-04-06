import { useAccount } from 'wagmi';
import { useEffect, useState, React } from 'react';
import NftGallery from '../components/nftGallery/nftGallery';
import NftMinter from '../components/nftGallery/nftMinter';
import * as bocJson from './utils/BetOnChain.json'

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
        <>
          <NftGallery walletAddress={address} collectionAddress={"0x9749E40D042BC1fC521C343453bf77d8Af0Aa838"} chain={"sepolia"}/>
          <NftMinter contractAddress={"0x400483e30faf9a819d2488ae485A0Fc1b571116e"} tokenUri="" abi={bocJson.abi} achievementLevel={0}/> 
          <NftMinter contractAddress={"0x400483e30faf9a819d2488ae485A0Fc1b571116e"} tokenUri="" abi={bocJson.abi} achievementLevel={1}/> 
          <NftMinter contractAddress={"0x400483e30faf9a819d2488ae485A0Fc1b571116e"} tokenUri="" abi={bocJson.abi} achievementLevel={2}/> 
        </>
      ) : <h3>You should connect your wallet !</h3>}
    </div>
  );
}
