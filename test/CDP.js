
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
const addressETH = "0x0000000000000000000000000000000000000000"
const etherPool = { "asset": (1 * utils.ETH01(1)).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() };
const initialMAI = 4 * _1; const initialETH = 5 * 10 ** 16;
const timeDelay = 1100;
const delay = ms => new Promise(res => setTimeout(res, ms));

contract('MAI', function (accounts) {
  constructor(accounts)
  checkMath(utils.ETH001(1))
  checkPrices(utils.ETH001(1))
  openCDP(utils.ETH001(1), 110, acc1) // <- gets 0.15
  addCollateralToCDP(utils.ETH001(1), acc1)
  remintMAIFromCDP(101, acc1)
  liquidateCDP(acc1, 3333)    // <- someone else gets MAI deleted
  openCDP(utils.ETH001(1), 110, acc1) // <- gets another 0.15 -> 0.3
  openCDP(utils.ETH001(1), 110, acc1)
  testFailCDP(utils.ETH001(1), 100, acc1)
  closeCDP(acc1, 5000)
  openCDP(utils.ETH001(1), 150, acc1)
  closeCDP(acc1, 10000)
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

    await instanceMAI.approve(addressMAI, (usdPool.mai), { from: acc0 })
    await instanceUSD.approve(addressMAI, (usdPool.asset), { from: acc0 })
    await instanceMAI.addExchange(addressUSD, (usdPool.asset), (usdPool.mai), { from: acc0 })
  });
}


//################################################################
// MATH
function checkMath(_val) {
  it("Checks core math", async () => {
    const output = utils.BN2Int(await instanceMAI.calcCLPSwap(utils.int2Str(_val), utils.int2Str(etherPool.asset), utils.int2Str(etherPool.mai)))
    const _output = await math.calcCLPSwap(_val, +etherPool.asset, +etherPool.mai)
    assert.equal(output, _output, "swap is correct")
    const fee = utils.BN2Int(await instanceMAI.calcCLPFee(utils.int2Str(_val), utils.int2Str(etherPool.asset), utils.int2Str(etherPool.mai)))
    const _fee = await math.calcCLPFee(_val, +etherPool.asset, +etherPool.mai)
    assert.equal(utils.roundBN2StrD(fee), utils.roundBN2StrD(_fee), "fee is correct")
    const liquidation = utils.BN2Int(await instanceMAI.calcCLPLiquidation(utils.int2Str(_val), utils.int2Str(etherPool.asset), utils.int2Str(etherPool.mai)))
    const _liquidation = await math.calcCLPLiquidation(_val, +etherPool.asset, +etherPool.mai)
    assert.equal(liquidation, _liquidation, "liquidation is correct")
  })
}

function checkPrices(_eth) {
  it("Checks core logic", async () => {
    const ethValueInMai = utils.BN2Int(await instanceMAI.calcValueInMAI(addressETH))
    assert.equal(ethValueInMai, await help.calcValueInMai(instanceMAI, addressETH), "eth correct")
    const ethPriceInUSD = utils.BN2Int(await instanceMAI.calcEtherPriceInUSD(utils.int2Str(_eth)))
    assert.equal(ethPriceInUSD, await help.calcEtherPriceInUSD(instanceMAI, _eth), "ether is correct")

    const ethPPInMAI = utils.BN2Int(await instanceMAI.calcEtherPPinMAI(utils.int2Str(_eth)))
    assert.equal(ethPPInMAI, await help.calcEtherPPinMAI(instanceMAI, _eth), "mai is correct")

    const maiPPInUSD = utils.BN2Int(await instanceMAI.calcMAIPPInUSD(utils.int2Str(ethPPInMAI)))
    assert.equal(maiPPInUSD, await help.calcMAIPPInUSD(ethPPInMAI), "mai is correct")

  })
}

//################################################################
// CDP INTERACTIONS
function openCDP(_eth, _ratio, _acc) {

  var existingDebt = 0; var existingCollateral = 0; var CDP;
  var newDebt; var newCollateral; var acc0Bal;

  it("Allows opening CDP", async () => {

    const CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData.call(_acc))
    if (CDP > 0) {
      existingDebt = utils.BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      existingCollateral = utils.BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    }
    const ethPPInMAI = utils.BN2Int(await instanceMAI.calcEtherPPinMAI(utils.int2Str(_eth)))
    const ethPP = utils.BN2Int(await help.calcEtherPPinMAI(instanceMAI, _eth))
    assert.equal(ethPPInMAI, ethPP, "etherPP is correct")
    const mintAmount = (ethPPInMAI * 100) / (_ratio);
    newDebt = await utils.roundBN2StrD(mintAmount)
    newCollateral = _eth
    acc0Bal = utils.BN2Int(await instanceMAI.balanceOf(_acc))

    var tx1;
    if (_ratio === 150) {
      tx1 = await instanceMAI.send(_eth, { from: _acc });
    } else {
      tx1 = await instanceMAI.openCDP(_ratio, { from: _acc, value: _eth });
    }

    assert.equal(tx1.logs.length, 3, "one event was triggered");
    assert.equal(tx1.logs[0].event, "Transfer", "Transfer was called");
    assert.equal(tx1.logs[0].args.to, addressMAI, "To is correct");
    assert.equal(utils.roundBN2StrD(tx1.logs[0].args.amount), newDebt, "newDebt is correct")
    assert.equal(tx1.logs[1].event, "Transfer", "Transfer was called");
    assert.equal(tx1.logs[1].args.to, _acc, "To is correct");
    assert.equal(utils.roundBN2StrD(tx1.logs[1].args.amount), newDebt, "newDebt is correct")
    assert.equal(tx1.logs[2].event, "NewCDP", "New CDP event was called");
    assert.equal(utils.roundBN2StrD(tx1.logs[2].args.debtIssued), newDebt, "newDebt is correct")
    assert.equal(utils.roundBN2StrD(tx1.logs[2].args.collateralHeld), utils.roundBN2StrD(newCollateral), "Collateral is correct");
  });

  //test balance of account 0 for mai has increased
  it("tests balances of MAI", async () => {
    let addressMAIBal = utils.BN2Int(await instanceMAI.balanceOf(addressMAI))
    assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");

    let acc0Bal1 = utils.BN2Int(await instanceMAI.balanceOf(_acc))
    assert.equal(utils.roundBN2StrDR(acc0Bal1, 10), utils.roundBN2StrDR((+acc0Bal + +newDebt), 10), "correct _acc bal");

    let maiSupply = utils.BN2Int(await instanceMAI.totalSupply())
    assert.equal(utils.roundBN2StrD(maiSupply), utils.roundBN2StrD((+acc0Bal + +newDebt + initialMAI)), "correct new supply")


    // console.log(await utils.logPools(_eth))
  })

  // Test mappings
  it("Tests mappings", async () => {
    CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData(_acc))

    let countOfCDPs = await instanceMAI.countOfCDPs()
    assert.equal(countOfCDPs, CDP, "correct countOfCDPs");

    let _CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
    assert.equal(_CDP, CDP, "correct mapAddress_MemberData");

    let mapCDP_Data = await instanceMAI.mapCDP_Data(_CDP);
    assert.equal(mapCDP_Data.collateral, +newCollateral + +existingCollateral, "CDP Collateral")
    assert.equal(utils.roundBN2StrDR(mapCDP_Data.debt, 10), utils.roundBN2StrDR((+newDebt + existingDebt), 10), "CDP Debt");
    assert.equal(mapCDP_Data.owner, _acc, "correct owner");
  })
}

function testFailCDP(_eth, _ratio, _acc) {

  it("tests if < 101 collaterisation fails to open a CDP", async () => {
    var tx1 = await truffleAssert.reverts(instanceMAI.openCDP(_ratio, { from: _acc, value: _eth }));
  });
}

function addCollateralToCDP(_eth, _acc) {

  it("Allows adding to CDP", async () => {

    let CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = utils.BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
    let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
    const ethPP = await help.calcEtherPPinMAI(instanceMAI, existingCollateral.plus(_eth))
    const cltrzn = Math.floor((ethPP * 100) / existingDebt)

    let tx1 = await instanceMAI.addCollateralToCDP({ from: _acc, to: addressMAI, value: _eth });
    assert.equal(tx1.logs.length, 1, "one event was triggered");
    assert.equal(tx1.logs[0].event, "UpdateCDP", "UpdateCDP was called");
    assert.equal(tx1.logs[0].args.CDP, CDP, "CDP is correct");
    assert.equal(tx1.logs[0].args.owner, _acc, "owner is correct");
    assert.equal(utils.BN2Int(tx1.logs[0].args.debtAdded), 0, "debt is correct");
    assert.equal(utils.BN2Int(tx1.logs[0].args.collateralAdded), _eth, "collateral is correct");
    assert.equal(utils.BN2Int(tx1.logs[0].args.collateralisation), cltrzn, "collateralisation is correct");

    let newCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
    assert.equal(utils.BN2Int(newCollateral), utils.BN2Int(existingCollateral.plus(_eth)), "New collateral is correct")
  });
}

function remintMAIFromCDP(_ratio, _acc) {

  var newDebt; var accBal0; var additionalMintAmount; var maiSupply0;

  it("Allows reminting MAI from CDP", async () => {
    let CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = utils.BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
    let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
    const purchasingPower = await help.calcEtherPPinMAI(instanceMAI, existingCollateral);//how valuable Ether is in MAI
    const maxMintAmount = (purchasingPower * _ratio) / 100;
    additionalMintAmount = utils.BN2Int(maxMintAmount - existingDebt);
    newDebt = utils.roundBN2StrD(additionalMintAmount + existingDebt)
    accBal0 = utils.roundBN2StrD(await instanceMAI.balanceOf(_acc))
    maiSupply0 = utils.BN2Int(await instanceMAI.totalSupply())

    let tx1 = await instanceMAI.remintMAIFromCDP(_ratio, { from: _acc, to: addressMAI });
    assert.equal(tx1.logs.length, 3, "three events were triggered");
    assert.equal(tx1.logs[2].event, "UpdateCDP", "UpdateCDP was called");
    assert.equal(tx1.logs[2].args.CDP, CDP, "CDP is correct");
    assert.equal(tx1.logs[2].args.owner, _acc, "owner is correct");
    assert.equal(utils.roundBN2StrD(tx1.logs[2].args.debtAdded), utils.roundBN2StrD(additionalMintAmount), "mint is correct");
    assert.equal(utils.BN2Int(tx1.logs[2].args.collateralAdded), 0, "collateral is correct");
    assert.equal(utils.BN2Int(tx1.logs[2].args.collateralisation), _ratio, "collateralisation is correct");

  });

  //test balance of account 0 for mai has increased
  it("tests balances of MAI", async () => {
    let addressMAIBal = utils.BN2Int(await instanceMAI.balanceOf(addressMAI))
    assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");

    let accBal1 = utils.roundBN2StrDR(await instanceMAI.balanceOf(_acc), 9)
    assert.equal(accBal1, utils.roundBN2StrDR((+accBal0 + +additionalMintAmount), 9), "correct _acc bal");

    let maiSupply1 = utils.BN2Int(await instanceMAI.totalSupply())
    assert.equal(utils.roundBN2StrD(maiSupply1), utils.roundBN2StrD((+additionalMintAmount + maiSupply0)), "correct new supply")
  })
}

function closeCDP(_acc, _bp) {

  var debtRemain; var collateralRemain;
  var CDP; var accBal0; var maiSupply0; var balMAI0;

  it("Allows closing CDP", async () => {
    let accEth1 = utils.BN2Int(await web3.eth.getBalance(_acc))
    CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = utils.BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)

    let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
    let debtClosed = existingDebt * (_bp / 10000)
    let collateralReturned = existingCollateral * (_bp / 10000)

    debtRemain = existingDebt - debtClosed
    collateralRemain = existingCollateral - collateralReturned

    accBal0 = utils.BN2Int(await instanceMAI.balanceOf(_acc));
    maiSupply0 = await instanceMAI.totalSupply()
    balMAI0 = utils.roundBN2StrD(await web3.eth.getBalance(addressMAI))

    let tx1 = await instanceMAI.closeCDP(_bp, { from: _acc });
    assert.equal(tx1.logs.length, 4, "Three events was triggered");
    assert.equal(tx1.logs[0].event, "Approval", "Correct event");
    assert.equal(tx1.logs[1].event, "Transfer", "Correct event");
    assert.equal(tx1.logs[2].event, "Transfer", "Correct event");
    assert.equal(tx1.logs[3].event, "CloseCDP", "Correct event");

    assert.equal(tx1.logs[3].args.CDP, 1, "CDP is correct");
    assert.equal(tx1.logs[3].args.owner, _acc, "Owner is correct");
    assert.equal(utils.BN2Int(tx1.logs[3].args.debtPaid), debtClosed, "Debt is correct");
    assert.equal(utils.roundBN2StrD(tx1.logs[3].args.etherReturned), utils.roundBN2StrD(collateralReturned), "Collateral is correct");

    let accBal = utils.BN2Int(await instanceMAI.balanceOf(_acc));
    assert.equal(utils.roundBN2StrD(accBal), utils.roundBN2StrD(accBal0 - debtClosed), "correct acc0 bal");

    let maiSupply1 = await instanceMAI.totalSupply()
    assert.equal(utils.roundBN2StrD(maiSupply1), utils.roundBN2StrD(maiSupply0 - debtClosed), "correct new supply")

    const tx = await web3.eth.getTransaction(tx1.tx);
    const gasCost = tx.gasPrice * tx1.receipt.gasUsed;

    let accEth2 = utils.roundBN2StrDR(await web3.eth.getBalance(_acc), 3)
    assert.equal(accEth2, utils.roundBN2StrDR((+accEth1 + +utils.BN2Int(existingCollateral) - gasCost), 3), "gas test")

    let balMAI1 = utils.roundBN2StrDR(await web3.eth.getBalance(addressMAI), 9)
    assert.equal(balMAI1, utils.roundBN2StrDR(+balMAI0 - +collateralReturned, 9), "Correct acount balance")
  })

  // Test mappings
  it("Tests mappings", async () => {
    let mapCDP_Data = await instanceMAI.mapCDP_Data(CDP);
    assert.equal(utils.roundBN2StrD(mapCDP_Data.collateral), utils.roundBN2StrD(collateralRemain), "correct collateral");
    assert.equal(utils.roundBN2StrD(mapCDP_Data.debt), utils.roundBN2StrD(debtRemain), "correct debt");

  })
}

function liquidateCDP(_acc, _bp) {

  var existingDebt = 0; var existingCollateral = 0; var CDP;

  it("Allows liquidation of CDP", async () => {
    const CDP = utils.BN2Int(await instanceMAI.mapAddress_MemberData.call(_acc))
    existingDebt = utils.BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
    existingCollateral = utils.BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    const canLiquidate = await help.checkLiquidateCDP(instanceMAI, existingCollateral, existingDebt)
    const canLiquidateSC = await instanceMAI.checkLiquidationPoint(CDP)
    assert.equal(canLiquidateSC, canLiquidate, "canLiquidate is correct")

    if (canLiquidateSC) {
      const liquidatedCollateral = existingCollateral / (10000 / _bp)
      const debtDeleted = (existingDebt / (10000 / _bp))
      const maiBought = await help.calcEtherPPinMAI(instanceMAI, liquidatedCollateral);
      const fee = maiBought - debtDeleted

      let tx1 = await instanceMAI.liquidateCDP(CDP, _bp, { from: _acc });
      assert.equal(tx1.logs.length, 3, "Three events were triggered");
      assert.equal(tx1.logs[0].event, "LiquidateCDP", "Correct event");
      assert.equal(utils.roundBN2StrDR(tx1.logs[0].args.etherSold / (_1), 4), utils.roundBN2StrDR(liquidatedCollateral / (_1), 4), "Correct liquidatedCollateral");
      assert.equal(utils.roundBN2StrDR(tx1.logs[0].args.maiBought / (_1), 3), utils.roundBN2StrDR(maiBought / (_1), 3), "Correct maiBought");
      assert.equal(utils.roundBN2StrDR(tx1.logs[0].args.debtDeleted / (_1), 3), utils.roundBN2StrDR(debtDeleted / (_1), 3), "Correct debtDeleted");
      assert.equal(utils.roundBN2StrDR(tx1.logs[0].args.feeClaimed / (_1), 4), utils.roundBN2StrDR(fee / (_1), 4), "Correct fee");

      const finalDebt = utils.BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      const finalCollateral = utils.BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
      assert.equal(utils.roundBN2StrDR(finalDebt / (_1), 4), utils.roundBN2StrDR(((existingDebt - debtDeleted) / (_1)), 4), "correct final debt");
      assert.equal(utils.roundBN2StrDR((finalCollateral / _1), 3), utils.roundBN2StrDR(((existingCollateral - liquidatedCollateral) / _1), 3), "correct final collateral");


    }
  })

}

