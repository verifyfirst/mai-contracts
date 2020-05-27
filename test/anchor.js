const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const _ = require('./utils.js');
const math = require('./math.js');
const help = require('./helper.js');

var MAI = artifacts.require("MAI.sol");
var USD1 = artifacts.require( "./tokenUSD1.sol");
var USD2 = artifacts.require( "./tokenUSD2.sol");
var USD3 = artifacts.require( "./tokenUSD3.sol");
var USD4 = artifacts.require( "./tokenUSD4.sol");
var USD5 = artifacts.require( "./tokenUSD5.sol");

var arrayInstAnchor = []; var arrayAddrAnchor = []; 
var instanceMAI; var addressMAI;
var acc0; var acc1; var acc2; var acc3;
var _1 = 1 * 10 ** 18;
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot001 = new BigNumber(1 * 10 ** 15)

contract('Anchor', function (accounts) {
    constructor(accounts)
    // addExchange1, 2, 3, 4, 5
    // test calcValueInAsset(usd) for each pool
    // test didn't update price after swapping ETH
    // test did update price after swapping 5 USD
  })
  
  //################################################################
  // CONSTRUCTION
  function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    it("constructor events", async () => {

        var instanceUSD1 = await USD1.deployed();
        var addressUSD1 = instanceUSD1.address;
        arrayInstAnchor.push(instanceUSD1)
        arrayAddrAnchor.push(addressUSD1)
        var instanceUSD2 = await USD2.deployed();
        var addressUSD2 = instanceUSD2.address;
        arrayInstAnchor.push(instanceUSD2)
        arrayAddrAnchor.push(addressUSD2)
        var instanceUSD3 = await USD3.deployed();
        var addressUSD3 = instanceUSD3.address;
        arrayInstAnchor.push(instanceUSD3)
        arrayAddrAnchor.push(addressUSD3)
        var instanceUSD4 = await USD4.deployed();
        var addressUSD4 = instanceUSD4.address;
        arrayInstAnchor.push(instanceUSD4)
        arrayAddrAnchor.push(addressUSD4)
        var instanceUSD5 = await USD5.deployed();
        var addressUSD5 = instanceUSD5.address;
        arrayInstAnchor.push(instanceUSD5)
        arrayAddrAnchor.push(addressUSD5)

    //   console.log(arrayAddrAnchor)
      
      instanceMAI = await MAI.deployed();
      addressMAI = instanceMAI.address;
    //   console.log({addressMAI})
  
      const anchor1 = await instanceMAI.arrayAnchor(0)
      assert.equal(anchor1, arrayAddrAnchor[0], "address is correct")
      const anchor2 = await instanceMAI.arrayAnchor(1)
      assert.equal(anchor2, arrayAddrAnchor[1], "address is correct")
      const anchor3 = await instanceMAI.arrayAnchor(2)
      assert.equal(anchor3, arrayAddrAnchor[2], "address is correct")
      const anchor4 = await instanceMAI.arrayAnchor(3)
      assert.equal(anchor4, arrayAddrAnchor[3], "address is correct")
      const anchor5 = await instanceMAI.arrayAnchor(4)
      assert.equal(anchor5, arrayAddrAnchor[4], "address is correct")
    });
  }