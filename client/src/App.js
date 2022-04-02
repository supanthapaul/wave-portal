import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import './App.css';
import WavePortal from './utils/WavePortal.json';

export default function App() {
	const [currentAccount, setCurrentAccount] = useState("");
	const [waveMessage, setWaveMessage] = useState("");
	const [allWaves, setAllWaves] = useState([]);
	const contractAddress = "0x746D58845C4607f75F8b04B47B987ba05eB027a8";

	const checkIfWalletIsConnected = async () => {
		try {
			// First make sure we have access to window.ethereum
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure you have metamask!");
			} else {
				console.log("We have the ethereum object", ethereum);
			}

			const accounts = await ethereum.request({ method: "eth_accounts" });
			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account:", account);
				setCurrentAccount(account);
				// get all Waves
				getAllWaves();
			} else {
				console.log("No authorized account found")
			}
		} catch (error) {
			console.log(error);
		}
	}

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, WavePortal.abi, signer);
				/*
				 * Call the getAllWaves method from your Smart Contract
				 */
				const waves = await wavePortalContract.getAllWaves();
				console.log(waves);
				/*
				 * We only need address, timestamp, and message in our UI so let's
				 * pick those out
				 */
				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});

				/*
				 * Store our data in React State
				 */
				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!")
			}
		} catch (error) {
			console.log(error);
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}

	const wave = async () => {
		try {
			const { ethereum } = window;
			if(waveMessage.trim() == "") {
				alert("Write something first!");
				return;
			}

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();

				const wavePortalContract = new ethers.Contract(contractAddress, WavePortal.abi, signer);

				let count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());

				/*
				* Execute the actual wave from your smart contract
				*/
				const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 300000 });
				console.log("Mining...", waveTxn.hash);

				await waveTxn.wait();
				console.log("Mined -- ", waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());


			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	useEffect(() => {
		let wavePortalContract;
	
		const onNewWave = (from, timestamp, message) => {
			console.log("NewWave", from, timestamp, message);
			setAllWaves(prevState => [
				...prevState,
				{
					address: from,
					timestamp: new Date(BigNumber.from(timestamp._hex).toNumber() * 1000),
					message: message,
				},
			]);
		};
	
		if (window.ethereum) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
	
			wavePortalContract = new ethers.Contract(contractAddress, WavePortal.abi, signer);
			wavePortalContract.on("NewWave", onNewWave);
		}
	
		return () => {
			if (wavePortalContract) {
				wavePortalContract.off("NewWave", onNewWave);
			}
		};
	}, []);
	return (
		<div className="mainContainer">

			<div className="dataContainer">
				<div className="header">
					👋 Hey there!
				</div>

				<div className="bio">
					I am Supantha Paul and I like creating web3 stuff, so that's pretty cool right? Connect your Ethereum wallet and wave at me!
				</div>

				<textarea 
					className="waveInput"
					rows={4}
					onChange={e => setWaveMessage(e.target.value)}
					placeholder="Write me a message!"
				/>
				<button className="waveButton" onClick={wave}>
					Wave at Me
				</button>
				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}

				{allWaves.map((wave, index) => {
					return (
						<div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>)
				})}
			</div>
		</div>
	);
}
