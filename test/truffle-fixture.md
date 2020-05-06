var MAI = artifacts.require("./MAI.sol");
var USD = artifacts.require("./tokenUSD.sol");

module.exports = async() => {
    const mai = await MAI.new();
    MAI.setAsDeployed(mai)
    const usd = await USD.new();
    USD.setAsDeployed(usd)
};