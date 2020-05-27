
var tokenUSD1 = artifacts.require( "./tokenUSD1.sol");
var tokenUSD2 = artifacts.require( "./tokenUSD2.sol");
var tokenUSD3 = artifacts.require( "./tokenUSD3.sol");
var tokenUSD4 = artifacts.require( "./tokenUSD4.sol");
var tokenUSD5 = artifacts.require( "./tokenUSD5.sol");
var MAI = artifacts.require( "./MAI.sol");

module.exports = function(deployer) {
  deployer.deploy(tokenUSD1);
  deployer.deploy(tokenUSD2);
  deployer.deploy(tokenUSD3);
  deployer.deploy(tokenUSD4);
  deployer.deploy(tokenUSD5);
  deployer.deploy(MAI);
};

