
var BigNumber = require('bignumber.js');


var MAI = artifacts.require("MAI.sol");
var USD1 = artifacts.require( "./tokenUSD1.sol");
var USD2 = artifacts.require( "./tokenUSD2.sol");
var USD3 = artifacts.require( "./tokenUSD3.sol");
var USD4 = artifacts.require( "./tokenUSD4.sol");
var USD5 = artifacts.require( "./tokenUSD5.sol");

var arrayInstAnchor = []; var arrayAddrAnchor = []; 
var medianMAIValue;

var instanceMAI; var addressMAI;
var acc0; var acc1; var acc2; var acc3;
var _1 = 1 * 10 ** 18;
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot1 = new BigNumber(1 * 10 ** 17)

const addressETH = "0x0000000000000000000000000000000000000000"

const usd1 = { "asset": (_dot1 * 1.13).toString(), "mai": (1 * _dot1).toString() }
const usd2 = { "asset": (_dot1 * 1.01).toString(), "mai": (1 * _dot1).toString() }
const usd3 = { "asset": (_dot1 * 1).toString(), "mai": (1 * _dot1).toString() }
const usd4 = { "asset": (_dot1 * 0.98).toString(), "mai": (1 * _dot1).toString() }
const usd5 = { "asset": (_dot1 * 0.97).toString(), "mai": (1 * _dot1).toString() }

contract('Anchor', function (accounts) {

    constructor(accounts)

  })

  //################################################################
  // CONSTRUCTION
function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    it("constructor events", async () => {
        // var instanceUSD1 = await USD1.deployed();
        // var addressUSD1 = instanceUSD1.address;
        // arrayInstAnchor.push(instanceUSD1)
        // arrayAddrAnchor.push(addressUSD1)
        // var instanceUSD2 = await USD2.deployed();
        // var addressUSD2 = instanceUSD2.address;
        // arrayInstAnchor.push(instanceUSD2)
        // arrayAddrAnchor.push(addressUSD2)
        // var instanceUSD3 = await USD3.deployed();
        // var addressUSD3 = instanceUSD3.address;
        // arrayInstAnchor.push(instanceUSD3)
        // arrayAddrAnchor.push(addressUSD3)
        // var instanceUSD4 = await USD4.deployed();
        // var addressUSD4 = instanceUSD4.address;
        // arrayInstAnchor.push(instanceUSD4)
        // arrayAddrAnchor.push(addressUSD4)
        // var instanceUSD5 = await USD5.deployed();
        // var addressUSD5 = instanceUSD5.address;
        // arrayInstAnchor.push(instanceUSD5)
        // arrayAddrAnchor.push(addressUSD5)

        instanceMAI = await MAI.deployed();
        addressMAI = instanceMAI.address;
    //     await instanceMAI.approve(addressMAI, (usd1.mai), { from: acc0 })
    // await arrayInstAnchor[0].approve(addressMAI, (usd1.asset), { from: acc0 })
    // await instanceMAI.addExchange(arrayAddrAnchor[0], (usd1.asset), (usd1.mai), { from: acc0 })
    // await instanceMAI.approve(addressMAI, (usd2.mai), { from: acc0 })
    // await arrayInstAnchor[1].approve(addressMAI, (usd2.asset), { from: acc0 })
    // await instanceMAI.addExchange(arrayAddrAnchor[1], (usd2.asset), (usd2.mai), { from: acc0 })
    // await instanceMAI.approve(addressMAI, (usd3.mai), { from: acc0 })
    // await arrayInstAnchor[2].approve(addressMAI, (usd3.asset), { from: acc0 })
    // await instanceMAI.addExchange(arrayAddrAnchor[2], (usd3.asset), (usd3.mai), { from: acc0 })
    // await instanceMAI.approve(addressMAI, (usd4.mai), { from: acc0 })
    // await arrayInstAnchor[3].approve(addressMAI, (usd4.asset), { from: acc0 })
    // await instanceMAI.addExchange(arrayAddrAnchor[3], (usd4.asset), (usd4.mai), { from: acc0 })
    // await instanceMAI.approve(addressMAI, (usd5.mai), { from: acc0 })
    // await arrayInstAnchor[4].approve(addressMAI, (usd5.asset), { from: acc0 })
    // await instanceMAI.addExchange(arrayAddrAnchor[4], (usd5.asset), (usd5.mai), { from: acc0 })
    });
}

