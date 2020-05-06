const tokenUSD = artifacts.require( "tokenUSD");
const MAI = artifacts.require( "MAI");


module.exports = function(deployer) {
  deployer.deploy(tokenUSD);
  deployer.deploy(MAI);
  
};
