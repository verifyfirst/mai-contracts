
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const utils = require('./utils.js');
const math = require('./math.js');
const help = require('./helper.js');

var MAI = artifacts.require("MAI.sol");
var USD = artifacts.require("tokenUSD.sol");

var instanceMAI; var addressMAI; var instanceUSD; var addressUSD;
var acc0; var acc1; var acc2; var acc3;

var _1 = 1 * 10 ** 18;
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot01 = new BigNumber(1 * 10 ** 16)
const addressETH = "0x0000000000000000000000000000000000000000"
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const initialMAI = 4 * _1; const initialETH = 3 * 10 ** 16;
const timeDelay = 1100;
const delay = ms => new Promise(res => setTimeout(res, ms));

contract('Liquidity', async accounts => {
  constructor(accounts)
  logETH()
  addLiquidityETH(_1BN, _dot01, acc0)
  logETH()
  removeLiquidityETH(10000, acc0)
  logETH()
  logUSD()
  addLiquidityUSD(_1BN, _dot01, acc0)
  logUSD()
  removeLiquidityUSD(10000, acc0)
  logUSD()
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

    const supply = utils.BN2Str(await instanceMAI.totalSupply())
    assert.equal(supply, initialMAI, "supply is correct")
    const assetPool_asset = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
    assert.equal(assetPool_asset, etherPool.asset)
    const assetPool_mai = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
    assert.equal(assetPool_mai, etherPool.mai)
    const acc0MAIBalance = utils.BN2Str(await instanceMAI.balanceOf(acc0))
    assert.equal(acc0MAIBalance, (2 * _1), "Received MAI is correct")
  });
}

function logETH() {
  it("logs", async () => {
    console.log(await help.logPool(instanceMAI, addressETH, _1))
  })
}
function logUSD() {
  it("logs", async () => {
    const addressUSD = instanceUSD.address;
    console.log(await help.logPool(instanceMAI, addressUSD, _1))
  })
}

function addLiquidityUSD(amountM, amountA, staker) {
  it("test addressUSD", async () => {
    const addressUSD = instanceUSD.address;
    await _addLiquidityToAssetPool(addressUSD, amountM, amountA, staker)
  })

}
function addLiquidityETH(amountM, amountA, staker) {
  it("test addressETH", async () => {
    await _addLiquidityToEtherPool(addressETH, amountM, amountA, staker)
  })
}
function removeLiquidityUSD(_bp, staker) {
  it("tests to remove liquidity", async () => {
    const addressUSD = instanceUSD.address;
    await _removeLiquidity(addressUSD, _bp, staker)
  });
}
function removeLiquidityETH(_bp, staker) {
  it("tests to remove liquidity", async () => {
    await _removeLiquidity(addressETH, _bp, staker)
  });
}

async function _addLiquidityToEtherPool(addressPool, amountM, amountA, staker) {
  await delay(timeDelay)
  let pool_mai_Before;
  let pool_asset_Before;
  let stakerUnitsB4;

  if (await instanceMAI.mapAsset_ExchangeData(addressPool)) {
    pool_mai_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
    pool_asset_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
    stakerUnitsB4 = utils.getBN(await instanceMAI.calcStakerUnits(addressPool, staker));
  }

  const units = math.calcPoolUnits(amountA,
    pool_asset_Before.plus(utils.getBN(amountA)), amountM,
    pool_mai_Before.plus(utils.getBN(amountM)))


  let addMai
  if (addressPool !== addressETH) {
    await instanceUSD.approve(addressMAI, amountA, { from: staker })
    // await instanceUSD.allowance(staker, addressMAI)
    addMai = await instanceMAI.addLiquidityToAssetPool(addressPool, amountA, amountM, { from: staker })
  } else {
    addMai = await instanceMAI.addLiquidityToEtherPool(amountM, { from: staker, value: amountA })
  }

  const balanceM = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
  const balanceA = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
  const poolUnits = math.calcPoolUnits(amountA, balanceA, amountM, balanceM);

  assert.equal(addMai.logs.length, 2, "3 events was triggered");
  assert.equal(addMai.logs[0].event, "Transfer", "Correct event");
  assert.equal(addMai.logs[1].event, "AddLiquidity", "Correct event");
  assert.equal(addMai.logs[1].args.amountMAI, utils.BN2Str(amountM), " amount mai is correct");
  assert.equal(utils.BN2Str(addMai.logs[1].args.unitsIssued), poolUnits, "units is correct");

  //check Ether:MAi balance increase
  const etherPool_mai = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
  const etherPool_asset = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
  assert.equal(etherPool_mai, utils.BN2Str(amountM.plus(pool_mai_Before)), " added Mai to Ether:Mai")
  assert.equal(etherPool_asset, utils.BN2Str(amountA.plus(pool_asset_Before)), " added Ether to Ether:Mai")

  //check staker units
  const stakerUnitsAfter = utils.BN2Str(await instanceMAI.calcStakerUnits(addressPool, staker));
  const stakerAddress = (await instanceMAI.calcStakerAddress(addressPool, 0));
  assert.equal(stakerUnitsAfter, utils.BN2Str((stakerUnitsB4.plus(units))), "staker units is correct")
  assert.equal(stakerAddress, staker, "Staker Address is correct")
}

async function _addLiquidityToAssetPool(addressPool, amountM, amountA, staker) {
  await delay(timeDelay)
  let pool_mai_Before;
  let pool_asset_Before;
  let stakerUnitsB4;

  if (await instanceMAI.mapAsset_ExchangeData(addressPool)) {
    pool_mai_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
    pool_asset_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
    stakerUnitsB4 = utils.getBN(await instanceMAI.calcStakerUnits(addressPool, staker));
  }

  // console.log(utils.BN2Int(amountA), pool_asset_Before, utils.BN2Int(amountM), pool_mai_Before)
  const units = math.calcPoolUnits(amountA,
    pool_asset_Before.plus(amountA), amountM,
    pool_mai_Before.plus(amountM))


  let addMai
  if (addressPool !== addressETH) {
    await instanceUSD.approve(addressMAI, amountA, { from: staker })
    addMai = await instanceMAI.addLiquidityToAssetPool(addressPool, amountA, amountM, { from: staker })
  } else {
    addMai = await instanceMAI.addLiquidityToEtherPool(amountM, { from: staker, value: amountA })
  }

  const balanceM = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
  const balanceA = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
  const poolUnits = math.calcPoolUnits(amountA, balanceA, amountM, balanceM);

  assert.equal(addMai.logs.length, 3, "3 events was triggered");
  assert.equal(addMai.logs[0].event, "Transfer", "Correct event");
  assert.equal(addMai.logs[1].event, "Transfer", "Correct event");
  assert.equal(addMai.logs[2].event, "AddLiquidity", "Correct event");
  assert.equal(addMai.logs[2].args.amountMAI, utils.BN2Str(amountM), " amount mai is correct");
  assert.equal(utils.BN2Str(addMai.logs[2].args.unitsIssued), poolUnits, "units is correct");

  //check Ether:MAi balance increase
  const etherPool_mai = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
  const etherPool_asset = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
  assert.equal(etherPool_mai, utils.BN2Str(amountM.plus(pool_mai_Before)), " added Mai to Ether:Mai")
  assert.equal(etherPool_asset, utils.BN2Str(amountA.plus(pool_asset_Before)), " added Ether to Ether:Mai")

  //check staker units
  const stakerUnitsAfter = utils.BN2Str(await instanceMAI.calcStakerUnits(addressPool, staker));
  const stakerAddress = (await instanceMAI.calcStakerAddress(addressPool, 0));
  assert.equal(stakerUnitsAfter, utils.BN2Str((stakerUnitsB4.plus(units))), "staker units is correct")
  assert.equal(stakerAddress, staker, "Staker Address is correct")
}

async function _removeLiquidity(addressPool, _bp, staker) {

  await delay(timeDelay)
  const _maiBal_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
  const _assetBal_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
  const _stakerUnits = utils.getBN(await instanceMAI.calcStakerUnits(addressPool, staker));
  const _totalPoolUnits = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressPool)).poolUnits);
  // const _units = (_stakerUnits.times(utils.getBN(_bp))).div(utils.getBN(10000))
  const _units = (_stakerUnits.times(_bp)).div(10000)
  // console.log(_units, _totalPoolUnits)
  const _outputMAI = (_maiBal_Before.times(_units)).div(_totalPoolUnits);
  const _outputAsset = (_assetBal_Before.times(_units)).div(_totalPoolUnits);

  let removeMAITx = await instanceMAI.removeLiquidityPool(addressPool, _bp, { from: staker })
  assert.equal(removeMAITx.logs[0].event, "RemoveLiquidity", "Correct event");
  assert.equal(removeMAITx.logs[0].args.amountMAI, utils.BN2Str(_outputMAI), "correct output of MAI")
  assert.equal(removeMAITx.logs[0].args.amountAsset, utils.BN2Str(_outputAsset), "correct output of Asset")
  assert.equal(removeMAITx.logs[0].args.unitsClaimed, utils.BN2Str(_units), "correct output of Units claimed")
  assert.equal(removeMAITx.logs[1].event, "Transfer", "Correct event");


  //check Ether:MAi balance increase
  const _maiBal_After = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceMAI);
  const _assetBal_After = utils.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressPool)).balanceAsset);
  // console.log(_maiBal_After, _maiBal_Before, _outputMAI)
  assert.equal(_maiBal_After, utils.BN2Str((_maiBal_Before.minus(_outputMAI))), " removed Mai from Ether:Mai")
  assert.equal(_assetBal_After, utils.BN2Str((_assetBal_Before.minus(_outputAsset))), " removed Ether from Ether:Mai")

  //check staker units
  const stakerUnits = utils.BN2Str(await instanceMAI.calcStakerUnits(addressPool, staker));
  const stakerAddress = (await instanceMAI.calcStakerAddress(addressPool, 0));
  assert.equal(stakerUnits, utils.BN2Str(_stakerUnits.minus(_units)), "staker units is correct")
  assert.equal(stakerAddress, staker, "Staker Address is correct");
}
