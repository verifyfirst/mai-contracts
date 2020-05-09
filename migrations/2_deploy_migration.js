const Token1 = artifacts.require("Token1") 
const tokenUSD = artifacts.require( "tokenUSD");
const MAI = artifacts.require( "MAI");


module.exports = function(deployer) {
  deployer.deploy(Token1);
  deployer.deploy(tokenUSD);
  deployer.deploy(MAI);
  
};

