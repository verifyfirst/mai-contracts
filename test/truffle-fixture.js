var MAI = artifacts.require("./MAI.sol");
var USD = artifacts.require("./tokenUSD.sol");

const initialETH = 3 * 10 ** 16; //0.04

module.exports = async() => {
    const usd = await USD.new();
    USD.setAsDeployed(usd)
    const mai = await MAI.new(usd.address, { value: initialETH });
    MAI.setAsDeployed(mai)
    
};