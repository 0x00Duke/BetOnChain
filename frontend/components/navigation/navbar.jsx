import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
import { useEffect, useState, React } from 'react';
import { DarkMode, FiberManualRecord, LightMode, Notifications, SortOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { lightMode, darkMode } from '../../store/slices/colorMode';
import { useAccount } from 'wagmi';
import { fetchBalance } from '@wagmi/core';

const Navbar = ({ toggleNav }) => {
	const [tokensBalance, setTokensBalance] = useState();
	const [isLoading, setIsloading] = useState(false);
	const [myAddress, setMyAddress] = useState();
	const dispatch = useDispatch();
	const colorMode = useSelector(state => state.colorMode.mode);
	const { address, isConnected, isDisconnected } = useAccount();
	const getBalance = async () => {
		setIsloading(true);
		const balance = await fetchBalance({
			address: address,
			token: '0x50790B1De18317ebF58F7D7e91dB7957304a9877', // replace by BOC token contract 
		});
		setTokensBalance(balance);
		setIsloading(false);
	}

	useEffect(() => {
		if (address?.length) getBalance();
	}, [myAddress]);

	useEffect(() => {
		if (address?.length) setMyAddress(address);
	}, [address]);

	return (
		<div className={styles.navbar}>
			<div className={styles.wrapper}>
				<div className={styles.wrapperGreeting}>
					<SortOutlined onClick={toggleNav} className={styles.icon} />
					<h3>
						Welcome !
					</h3>
				</div>
				<div className={styles.personal}>
					<div className={styles.profile}>
						<span className={`${styles.iconSpan} ${styles.colorMode}`}> {/*check behavior*/}
							{
								colorMode === 'light' ?
									(<LightMode onClick={() => dispatch(darkMode())} className={styles.icon} />)
									:
									(<DarkMode onClick={() => dispatch(lightMode())} className={styles.icon} />)
							}
						</span>
						<span className={styles.iconSpan}>
						</span>
						<span className={styles.iconSpan}>
							<Notifications className={styles.icon} />
							<sup>
								<FiberManualRecord className={styles.icon} />
							</sup>
						</span>
						{!isDisconnected && !isLoading ? (
							<div className={`${styles.accountTokenBalance}  ${styles.iconSpan}`}> <b>Balance : </b>{tokensBalance?.formatted} {tokensBalance?.symbol}</div>
						) : null}
						<ConnectButton
							label="Sign in"
							showRecentTransactions={true}
							showBalance={false}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Navbar

