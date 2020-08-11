//var DCRpublicEngine = artifacts.require("./DCRpublicEngine.sol");
var SimpleDCReum = artifacts.require("./SimpleDCReum.sol");

module.exports = function(deployer) {
//  deployer.deploy(DCRpublicEngine);
  deployer.deploy(SimpleDCReum);
};
