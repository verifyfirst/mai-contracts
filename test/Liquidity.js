
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const help = require('./helper.js');
const math = require('./core-math.js');

var MAI = artifacts.require("MAI.sol");
var USD = artifacts.require("tokenUSD.sol");

var instanceMAI; var addressMAI; var instanceUSD; var addressUSD;
var acc0; var acc1; var acc2; var acc3;

var _1 = 1 * 10 ** 18; // 1 ETH
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot001 = new BigNumber(1 * 10 ** 15)
var _dot2 = new BigNumber(2 * 10 ** 17)
const addressETH = "0x0000000000000000000000000000000000000000"
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
const initialMAI = 4 * _1; const initialETH = 3 * 10 ** 16; //0.04

const timeDelay = 1100;
const delay = ms => new Promise(res => setTimeout(res, ms));


contract('Liquidity', async accounts => {

  // async function start() {
    constructor(accounts)
    // logPool()
    // addLiquidity(addressETH, _1BN, _dot01, acc0)
    // logPool()
    // removeLiquidity(addressETH, 1000, acc0)
    // logPool()
    // addLiquidity(addressETH, _1BN, _dot01, acc0)
    // logPool()
    // removeLiquidity(addressETH, 1000, acc0)
    logPool()
  
    // addExchange(addressUSD, amountAsset, amountMAI)
    addLiquidityUSD(_1BN, _dot01, acc0)
    logPool()
    // removeLiquidity(addressUSD, 1000, acc0)
    // logPool()
  // }
  // start()
})
//################################################################
// CONSTRUCTION
function constructor(accounts) {
  acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]

  it("constructor events", async () => {
    
    instanceUSD = await USD.deployed();
    addressUSD = instanceUSD.address;

    instanceMAI = await MAI.deployed();
    addressMAI = instanceMAI.address;

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

function logPool(){
  it("logs", async () => {
    console.log(await help.logPool(instanceMAI, addressUSD, _1))
  })
}

// function addExchange(asset, amountAsset, amountMAI, _acc) {
//   it("tests to add exchange", async () => {
//     let addExchangeTX = await instanceMAI.addExchange(asset, amountAsset, amountMAI, {from: _acc });
    
//     const pool_mai_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(asset)).balanceMAI);
//     const pool_asset_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(asset)).balanceAsset);

//   })
// }

function addLiquidityUSD(amountM, amountA, staker){
  it("test addressUSD", async () =>{
    const addressMAI = instanceMAI.address;
    console.log('addressMAI', addressMAI)
    const addressUSD = instanceUSD.address;
    console.log('addressUSD', addressUSD)
    await _addLiquidity(addressUSD, amountM, amountA, staker)
  })

}
function addLiquidityETH(amountM, amountA, staker){
  it("test addressETH", async () =>{
    _addLiquidity(addressETH, amountM, amountA, staker)
  })
}

//add liquidity to ether:MAI
async function _addLiquidity(addressPool, amountM, amountA, staker) {
    await delay(timeDelay)
    let pool_mai_Before;
    let pool_asset_Before;
    let stakerUnitsB4;
    console.log('addressPool', addressPool)
    const addressUSD = instanceUSD.address;
    console.log('addressUSD', addressUSD)
    console.log('addressUSD', addressUSD)

    console.log(addressPool)
    let somthing = help.BN2Int(await instanceMAI.mapAsset_ExchangeData(addressUSD))
    console.log(somthing)
    

    if (await instanceMAI.mapAsset_ExchangeData(addressPool)){
      pool_mai_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
      pool_asset_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
      stakerUnitsB4 = help.BN2Int(await instanceMAI.calcStakerUnits(addressPool, staker));  
    }

    // console.log(help.BN2Int(amountA), pool_asset_Before, help.BN2Int(amountM), pool_mai_Before)
    const units = math.calcPoolUnits(amountA, 
      pool_asset_Before + help.BN2Int(amountA), amountM, 
      pool_mai_Before + help.BN2Int(amountM))

    let balance = await instanceMAI.balanceOf(staker)
    // console.log('amountA, balance', help.BN2Int(amountA), help.BN2Int(balance))
    let addMai
    if (addressPool !== addressETH){
      let txApproval = await instanceUSD.approve(addressMAI, amountA, { from: staker })
      let approval = await instanceUSD.allowance(staker, addressMAI)
      // console.log('approval', help.BN2Int(approval))
      addMai = await instanceMAI.addLiquidityToAssetPool(addressPool, amountA, amountM, { from: staker})
    } else {
      addMai = await instanceMAI.addLiquidityToEtherPool(amountM, { from: staker, value: amountA })
    }

    const balanceM = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
    const balanceA = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
    const poolUnits = math.calcPoolUnits(amountA, balanceA, amountM, balanceM);

    assert.equal(addMai.logs.length, 3, "3 events was triggered");
    assert.equal(addMai.logs[0].event, "Transfer", "Correct event");
    assert.equal(addMai.logs[1].event, "Transfer", "Correct event");
    assert.equal(addMai.logs[2].event, "AddLiquidity", "Correct event");
    assert.equal(addMai.logs[2].args.amountMAI, help.BN2Int(amountM), " amount mai is correct");
    assert.equal(help.BN2Int(addMai.logs[2].args.unitsIssued), poolUnits, "units is correct");

    //check Ether:MAi balance increase
    const etherPool_mai = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
    const etherPool_asset = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
    assert.equal(etherPool_mai, +amountM + pool_mai_Before, " added Mai to Ether:Mai")
    assert.equal(etherPool_asset, +amountA + pool_asset_Before, " added Ether to Ether:Mai")

    //check staker units
    const stakerUnitsAfter = help.BN2Int(await instanceMAI.calcStakerUnits(addressPool, staker));
    const stakerAddress = (await instanceMAI.calcStakerAddress(addressPool, 0));
    // console.log(stakerUnitsAfter, stakerUnitsB4, units)
    assert.equal(stakerUnitsAfter, (+stakerUnitsB4 + +units), "staker units is correct")
    assert.equal(stakerAddress, staker, "Staker Address is correct")
}
//remove liquidity from ether:MAI
function removeLiquidity(addressPool, _bp, staker) {
  it("tests to remove liquidity", async () => {
    const _maiBal_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
    const _assetBal_Before = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
    const _stakerUnits = help.BN2Int(await instanceMAI.calcStakerUnits(addressPool, staker));
    const _totalPoolUnits = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).poolUnits);
    const _units = (_stakerUnits * _bp) / 10000
    const _outputMAI = (_maiBal_Before * (_units)) / (_totalPoolUnits);
    const _outputAsset = (_assetBal_Before * (_units)) / (_totalPoolUnits);

    // console.log("units",_units, "outputMAi",_outputMAI,"output Asset", _outputAsset)
    let removeMAITx = await instanceMAI.removeLiquidityPool(addressPool, _bp, { from: staker })
    
    assert.equal(removeMAITx.logs.length, 2, "Two events was triggered");
    assert.equal(removeMAITx.logs[0].event, "RemoveLiquidity", "Correct event");
    assert.equal(help.BN2Int(removeMAITx.logs[0].args.amountMAI / (_1)), help.roundBN2StrD(_outputMAI / (_1)), "correct output of MAI")
    assert.equal(help.roundBN2StrUR((removeMAITx.logs[0].args.amountAsset / (_1)),3), help.roundBN2StrD(_outputAsset / (_1)), "correct output of Asset")
    assert.equal(help.roundBN2StrUR((removeMAITx.logs[0].args.unitsClaimed), 5), help.roundBN2StrUR((_units),5), "correct output of Units claimed")
    assert.equal(removeMAITx.logs[1].event, "Transfer", "Correct event");
    // console.log((removeMAITx.logs[1]))
    // console.log(help.BN2Int(removeMAITx.logs[1].args.amount))

    //check Ether:MAi balance increase
    const etherPool_mai = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
    const etherPool_asset = help.BN2Int((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
    // console.log(await help.logPool(addressETH, _1))
    // console.log(etherPool_mai, _maiBal_Before, _outputMAI)
    assert.equal(etherPool_mai, (_maiBal_Before - _outputMAI), " removed Mai from Ether:Mai")
    assert.equal(etherPool_asset, (_assetBal_Before - _outputAsset), " removed Ether from Ether:Mai")
    
    //check staker units
    const stakerUnits = help.BN2Int(await instanceMAI.calcStakerUnits(addressPool, staker));
    const stakerAddress = (await instanceMAI.calcStakerAddress(addressPool, 0));
    //console.log(stakerUnits, +_stakerUnits, +_units)
    assert.equal(help.roundBN2StrUR(stakerUnits, 4), help.roundBN2StrUR((+_stakerUnits - +_units), 4), "staker units is correct")
    assert.equal(stakerAddress, staker, "Staker Address is correct")

  });

}
