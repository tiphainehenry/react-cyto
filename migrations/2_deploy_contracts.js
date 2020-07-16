var DCRpublicEngine = artifacts.require("./DCRpublicEngine.sol");

module.exports = function(deployer) {
  deployer.deploy(DCRpublicEngine);
};
