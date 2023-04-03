import Navbar from "../components/navigation/navbar";
import Sidebar from "../components/sidebar/sidebar";
import { useState } from "react";
import { useSelector } from "react-redux";
import Head from 'next/head'


export default function MainLayout({ children }) {
	const [toggleNav, setToggleNav] = useState(false);
	const handleToggleNav = () => {
		setToggleNav(!toggleNav);
	}
	const colorMode = useSelector(state => state.colorMode.mode);

	return (
		<div className="App">
			<Head>
				<title>Bet On Chain </title>
			</Head>
			<Sidebar toggler={toggleNav} closeNav={handleToggleNav} />
			<div className="AppContainer">
				<Navbar />
				{children}
			</div>
		</div>
	);
}