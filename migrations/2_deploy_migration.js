
const tokenUSD = artifacts.require( "./tokenUSD.sol");
const MAI = artifacts.require( "./MAI.sol");


module.exports = function(deployer) {
  deployer.deploy(tokenUSD);
  deployer.deploy(MAI);
  
};

