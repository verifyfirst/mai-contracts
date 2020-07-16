
var MAI = artifacts.require("MAI.sol");
var USD1 = artifacts.require( "PAXOS.sol");
var USD2 = artifacts.require( "Tether.sol");
var USD3 = artifacts.require( "bUSD.sol");
var USD4 = artifacts.require( "USDC.sol");
var USD5 = artifacts.require( "DAI.sol");
var USD6 = artifacts.require( "Koven.sol");

const initialETH = 3 * 10 ** 18; //30

module.exports = function(deployer) {
  deployer.deploy(USD1);
  deployer.deploy(USD2);
  deployer.deploy(USD3);
  deployer.deploy(USD4);
  deployer.deploy(USD5);
  deployer.deploy(USD6);
  deployer.deploy(MAI, { value: initialETH});
};

