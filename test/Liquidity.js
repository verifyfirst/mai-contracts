const math = require('./core-math.js')
const help = require('./helper.js')
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
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
const initialMAI = 4 * _1; const initialETH = 3*10**16; //0.04

contract('MAI', function (accounts) {
    constructor(accounts)
     addLiquidity(addressETH, _dot01)
     //removeLiquidity(addressETH, 1000)
 
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

      const help = require('./helper.js');
      const supply = help.BN2Int(await instanceMAI.totalSupply())
      assert.equal(supply, initialMAI, "supply is correct")
      const etherPool_asset = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
      assert.equal(etherPool_asset, etherPool.asset)
      const etherPool_mai = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
      assert.equal(etherPool_mai, etherPool.mai)
     
      const acc0MAIBalance = help.BN2Int(await instanceMAI.balanceOf(acc0))
      assert.equal(acc0MAIBalance, (2 * _1), "Received MAI is correct")
    });
    }

   

//add liquidity to ether:MAI
function addLiquidity(address, amount){
    it("tests to add liquidity", async () => {
    const amountA = 0;
    const etherPool_mai_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(address)).balanceMAI);
    let txApproval = await instanceMAI.approve(addressMAI, amount, {from:acc0})
    let addMai = await instanceMAI.addLiquidityToEtherPool(amount, { from: acc0, value: amount})

    const balanceM = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(address)).balanceMAI);
    const balanceA = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(address)).balanceAsset);
    const poolUnits = math._getPoolUnits(amountA, balanceA, amount, balanceM);
 
    assert.equal(addMai.logs.length, 2, "Two events was triggered");
    assert.equal(addMai.logs[0].event, "Transfer", "Correct event");
    assert.equal(addMai.logs[1].event, "AddLiquidity", "Correct event");
    assert.equal(addMai.logs[1].args.amountMAI, help.BN2Int(amount), " amount mai is correct");
     assert.equal(help.BN2Int(addMai.logs[1].args.unitsIssued), poolUnits, "units is correct");
    

    //check Ether:MAi balance increase
    const etherPool_mai = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(address)).balanceMAI);
    assert.equal(etherPool_mai, +amount + etherPool_mai_Before , " added Mai to Ether:Mai")
    
  
  });

  
}
//remove _dot01 liquidity from ether:MAI
// function removeLiquidity(address, bp){
//     it("tests to removew liquidity", async () => {
   
//   });
  
// }
