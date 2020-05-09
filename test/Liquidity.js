const math = require('./core-math.js')
const help = require('./helper.js');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

var instanceMAI; var addressMAI; var instanceUSD; var addressUSD;
var acc0; var acc1; var acc2; var acc3;

var _1 = 1 * 10 ** 18; // 1 ETH
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot001 = new BigNumber(1 * 10 ** 15)
var _dot2 = new BigNumber(2 * 10 ** 17)
const addressETH = "0x0000000000000000000000000000000000000000"
var addressUSD;
var addressToken;
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
 const tokenPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
const initialMAI = 4 * _1; const initialETH = 3*10**16; //0.04

contract('MAI', function (accounts) {
    constructor(accounts)

    
 
  })
//################################################################
  // CONSTRUCTION
  function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    it("constructor events", async () => {
      let USD = artifacts.require("tokenUSD.sol");
      instanceUSD = await USD.new();
      addressUSD = instanceUSD.address;

      let MAI = artifacts.require("MAI.sol");
      instanceMAI = await MAI.new(addressUSD, {value:initialETH});
      addressMAI = instanceMAI.address;

      const supply = help.BN2Int(await instanceMAI.totalSupply())
      assert.equal(supply, initialMAI, "supply is correct")
      const etherPool_asset = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
      assert.equal(etherPool_asset, etherPool.asset)
      const etherPool_mai = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
      assert.equal(etherPool_mai, etherPool.mai)
  
      await instanceMAI.approve(addressMAI, (usdPool.mai), {from:acc0})
      await instanceUSD.approve(addressMAI, (usdPool.asset), {from:acc0})
      await instanceMAI.addExchange(addressUSD, (usdPool.asset), (usdPool.mai), {from:acc0})

      const usdPool_asset = help.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressUSD)).balanceAsset);
      assert.equal(usdPool_asset, help.BN2Str(usdPool.asset))
      const usdPool_mai = help.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressUSD)).balanceMAI);
      assert.equal(usdPool_mai, help.BN2Str(usdPool.mai))

    });
  
    }
