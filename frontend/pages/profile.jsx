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
          <NftGallery walletAddress={address} collectionAddress={"0xff573458aa954B1d83d01d8343362A4795e256C7"} chain={"sepolia"}/>
          <NftMinter contractAddress={"0x0dd5df115e8cc9a0d2adf2c200ef5e476bbbb3a6"} tokenUri="" abi={bocJson.abi} achievementLevel={0}/> 
          <NftMinter contractAddress={"0x0dd5df115e8cc9a0d2adf2c200ef5e476bbbb3a6"} tokenUri="" abi={bocJson.abi} achievementLevel={1}/> 
          <NftMinter contractAddress={"0x0dd5df115e8cc9a0d2adf2c200ef5e476bbbb3a6"} tokenUri="" abi={bocJson.abi} achievementLevel={2}/> 
        </>
      ) : <h3>You should connect your wallet !</h3>}
    </div>
  );
}
