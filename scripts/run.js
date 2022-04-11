const main = async () => {
	// The Hardhat Runtime Environment, or HRE for short, is an object containing all the functionality that Hardhat exposes when running a task, test or script. In reality, Hardhat is the HRE.
	const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  console.log("Contract addy:", waveContract.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  /*
   * Let's try two waves now
   */
  const waveTxn = await waveContract.wave("This is wave #1");
  await waveTxn.wait();

  // const waveTxn2 = await waveContract.wave("This is wave #2");
  // await waveTxn2.wait();

  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves[0].timestamp._hex);
};

const runMain = async () => {
	try {
		await main();
		process.exit(0); // exit Node process without error
	} catch (error) {
		console.log(error);
		process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
	}
};

runMain();