const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const _ = require('./utils.js');
const math = require('./math.js');
const help = require('./helper.js');

var MAI = artifacts.require("MAI.sol");
var USD1 = artifacts.require( "PAXOS.sol");
var USD2 = artifacts.require( "Tether.sol");
var USD3 = artifacts.require( "bUSD.sol");
var USD4 = artifacts.require( "USDC.sol");
var USD5 = artifacts.require( "DAI.sol");

var arrayInstAnchor = []; var arrayAddrAnchor = []; 
var medianMAIValue;

var instanceMAI; var addressMAI;
var acc0; var acc1; var acc2; var acc3;
var _1 = 1 * 10 ** 18;
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot1 = new BigNumber(1 * 10 ** 17)

const addressETH = "0x0000000000000000000000000000000000000000"
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot001 = new BigNumber(1 * 10 ** 15)
var _dot0001 = new BigNumber(1 * 10 ** 14)
var _dot00001 = new BigNumber(1 * 10 ** 13)
const usd1 = { "asset": (_dot1 * 1.13).toString(), "mai": (1 * _dot1).toString() }


contract('Anchor', function (accounts) {

    constructor(accounts)
 



  })

  function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    it("constructor events", async () => {
        var instanceUSD1 = await USD1.deployed();
        var addressUSD1 = instanceUSD1.address;
        arrayInstAnchor.push(instanceUSD1)
        arrayAddrAnchor.push(addressUSD1)
        
        instanceMAI = await MAI.deployed();
        addressMAI = instanceMAI.address;
        await instanceMAI.approve(addressMAI, (usd1.mai), { from: acc0 })
    await arrayInstAnchor[0].approve(addressMAI, (usd1.asset), { from: acc0 })
    await instanceMAI.addExchange(arrayAddrAnchor[0], (usd1.asset), (usd1.mai), { from: acc0 })
   
    });
}