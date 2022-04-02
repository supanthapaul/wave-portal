require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
	networks: {
    rinkeby: {
      url: process.env.DEV_ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
};