
var tokenUSD = artifacts.require( "./tokenUSD.sol");
var MAI = artifacts.require( "./MAI.sol");

module.exports = function(deployer) {
  deployer.deploy(tokenUSD);
  deployer.deploy(MAI);
};

