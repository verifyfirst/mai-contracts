const MAI = artifacts.require( "MAI");
const tokenUSD = artifacts.require( "tokenUSD");

module.exports = function(deployer) {
  deployer.deploy(MAI);
  deployer.deploy(tokenUSD);
};
