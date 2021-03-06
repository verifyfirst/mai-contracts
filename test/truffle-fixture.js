
var MAI = artifacts.require("MAI.sol");
var USD1 = artifacts.require( "PAXOS.sol");
var USD2 = artifacts.require( "Tether.sol");
var USD3 = artifacts.require( "bUSD.sol");
var USD4 = artifacts.require( "USDC.sol");
var USD5 = artifacts.require( "DAI.sol");
var USD6 = artifacts.require( "Koven.sol");

const initialETH = 3 * 10 ** 17; //3

module.exports = async() => {
    const usd1 = await USD1.new();
    USD1.setAsDeployed(usd1)
    const usd2 = await USD2.new();
    USD2.setAsDeployed(usd2)
    const usd3 = await USD3.new();
    USD3.setAsDeployed(usd3)
    const usd4 = await USD4.new();
    USD4.setAsDeployed(usd4)
    const usd5 = await USD5.new();
    USD5.setAsDeployed(usd5)
    const usd6 = await USD6.new();
    USD6.setAsDeployed(usd6)
    const mai = await MAI.new(usd1.address, usd2.address,usd3.address, usd4.address, usd5.address, { value: initialETH});
    MAI.setAsDeployed(mai)
    // console.log(usd1.address, usd2.address, usd3.address,
    //     usd4.address, usd5.address)
};