const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMONIC = "awkward genuine possible animal maze baby outside return movie panel echo letter cute wasp need";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
	    network_id:"*",
	    host:'localhost',
	    port: 8545
	
    },
    ropsten: {
      provider:  new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/f86c1527e7f24bf99018c94a7b5abae4"),
      network_id: '3',
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
  }
};
