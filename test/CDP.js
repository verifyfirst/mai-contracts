
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
var _dot001 = new BigNumber(1 * 10 ** 15)
const addressETH = "0x0000000000000000000000000000000000000000"
const etherPool = { "asset": (1 * utils.ETH01(1)).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() };
const initialMAI = 4 * _1; const initialETH = 5 * 10 ** 16;
const timeDelay = 1100;
var maiDeleted = 0;
const delay = ms => new Promise(res => setTimeout(res, ms));

contract('MAI', function (accounts) {
  constructor(accounts)
  checkMath(_dot001)
  checkPrices(_dot001)
  openCDP(_dot001, 110, acc1) // <- gets 0.15
  addCollateralToCDP(_dot001, acc1)
  remintMAIFromCDP(101, acc1)
  liquidateCDP(acc1, 3333)
  openCDP(_dot001, 110, acc1) // <- gets another 0.15 -> 0.3
  openCDP(_dot001, 110, acc1)
  testFailCDP(_dot001, 100, acc1)
  closeCDP(acc1, 5000)
  openCDP(_dot001, 150, acc1)
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
    const output = utils.BN2Str(await instanceMAI.calcCLPSwap(utils.int2Str(_val), utils.int2Str(etherPool.asset), utils.int2Str(etherPool.mai)))
    const _output = await math.calcCLPSwap(_val, +etherPool.asset, +etherPool.mai)
    assert.equal(output, _output, "swap is correct")
    const fee = utils.BN2Str(await instanceMAI.calcCLPFee(utils.int2Str(_val), utils.int2Str(etherPool.asset), utils.int2Str(etherPool.mai)))
    const _fee = utils.BN2Str(await math.calcCLPFee(_val, +etherPool.asset, +etherPool.mai))
    assert.equal(fee, _fee, "fee is correct")
    const liquidation = utils.BN2Str(await instanceMAI.calcCLPLiquidation(utils.int2Str(_val), utils.int2Str(etherPool.asset), utils.int2Str(etherPool.mai)))
    const _liquidation = utils.BN2Str(await math.calcCLPLiquidation(_val, +etherPool.asset, +etherPool.mai))
    assert.equal(liquidation, _liquidation, "liquidation is correct")
  })
}

function checkPrices(_eth) {
  it("Checks core logic", async () => {
    const ethValueInMai = utils.BN2Str(await instanceMAI.calcValueInMAI(addressETH))
    assert.equal(ethValueInMai, await help.calcValueInMai(instanceMAI, addressETH), "eth correct")
    const ethPriceInUSD = utils.BN2Str(await instanceMAI.calcEtherPriceInUSD(utils.int2Str(_eth)))
    assert.equal(ethPriceInUSD, utils.BN2Str(await help.calcEtherPriceInUSD(instanceMAI, _eth)), "ether is correct")

    const ethPPInMAI = utils.BN2Str(await instanceMAI.calcEtherPPinMAI(utils.int2Str(_eth)))
    assert.equal(ethPPInMAI, utils.BN2Str(await help.calcEtherPPinMAI(instanceMAI, _eth)), "mai is correct")

    const maiPPInUSD = utils.BN2Str(await instanceMAI.calcMAIPPInUSD(utils.int2Str(ethPPInMAI)))
    assert.equal(maiPPInUSD, utils.BN2Str(await help.calcMAIPPInUSD(ethPPInMAI)), "mai is correct")

  })
}

//################################################################
// CDP INTERACTIONS
function openCDP(_eth, ratio, _acc) {
  const _ratio = utils.getBN(ratio);
  var existingDebt = 0; var existingCollateral = 0; var CDP;
  var newDebt; var newCollateral; var acc0Bal;

  it("Allows opening CDP", async () => {

    const CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData.call(_acc))
    if (CDP > 0) {
      existingDebt = utils.getBN((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      existingCollateral = utils.getBN((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    }
    const ethPPInMAI = utils.getBN(await instanceMAI.calcEtherPPinMAI(_eth))
    const ethPP = utils.getBN(await help.calcEtherPPinMAI(instanceMAI, _eth))
    assert.equal(utils.BN2Str(ethPPInMAI), utils.BN2Str(ethPP), "etherPP is correct")
    const mintAmount = (ethPPInMAI.times(100)).div(_ratio);
    newDebt = utils.floorBN(mintAmount)
    newCollateral = _eth
    acc0Bal = utils.getBN(await instanceMAI.balanceOf(_acc))

    var tx1;
    if (_ratio === 150) {
      tx1 = await instanceMAI.send(_eth, { from: _acc });
    } else {
      tx1 = await instanceMAI.openCDP(_ratio, { from: _acc, value: _eth });
    }

    assert.equal(tx1.logs.length, 3, "one event was triggered");
    assert.equal(tx1.logs[0].event, "Transfer", "Transfer was called");
    assert.equal(tx1.logs[0].args.to, addressMAI, "To is correct");
    assert.equal(utils.BN2Str(tx1.logs[0].args.amount), utils.BN2Str(newDebt), "newDebt is correct")
    assert.equal(tx1.logs[1].event, "Transfer", "Transfer was called");
    assert.equal(tx1.logs[1].args.to, _acc, "To is correct");
    assert.equal(utils.BN2Str(tx1.logs[1].args.amount), utils.BN2Str(newDebt), "newDebt is correct")
    assert.equal(tx1.logs[2].event, "NewCDP", "New CDP event was called");
    assert.equal(utils.BN2Str(tx1.logs[2].args.debtIssued), utils.BN2Str(newDebt), "newDebt is correct")
    assert.equal(utils.BN2Str(tx1.logs[2].args.collateralHeld), utils.BN2Str(newCollateral), "Collateral is correct");
  });

  // //test balance of account 0 for mai has increased
  // it("tests balances of MAI", async () => {
  //   let addressMAIBal = utils.BN2Str(await instanceMAI.balanceOf(addressMAI))
  //   assert.equal(addressMAIBal, (initialMAI - maiDeleted), "correct addressMAIBal bal");

  //   let acc0Bal1 = utils.BN2Str(await instanceMAI.balanceOf(_acc))
  //   assert.equal(acc0Bal1,utils.BN2Str(acc0Bal.plus(newDebt)), "correct _acc bal");

  //   let maiSupply = utils.BN2Str(await instanceMAI.totalSupply())
  //   assert.equal(maiSupply, utils.BN2Str(acc0Bal.plus(newDebt.plus(initialMAI))), "correct new supply")

  // })

  // Test mappings
  it("Tests mappings", async () => {
    CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))

    let countOfCDPs = utils.BN2Str(await instanceMAI.countOfCDPs())
    assert.equal(countOfCDPs, CDP, "correct countOfCDPs");

    let _CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    assert.equal(_CDP, CDP, "correct mapAddress_MemberData");

    let mapCDP_Data = await instanceMAI.mapCDP_Data(_CDP);
    assert.equal(utils.BN2Str(mapCDP_Data.collateral), utils.BN2Str(newCollateral.plus(existingCollateral)), "CDP Collateral");
    assert.equal(utils.BN2Str(mapCDP_Data.debt), utils.BN2Str(newDebt.plus(existingDebt)), "CDP Debt");
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

    let CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = utils.getBN((await instanceMAI.mapCDP_Data(CDP)).debt)
    let existingCollateral = utils.getBN((await instanceMAI.mapCDP_Data(CDP)).collateral)
    const ethPP = await help.calcEtherPPinMAI(instanceMAI, existingCollateral.plus(_eth))
    const cltrzn = utils.floorBN((ethPP.times(100)).div(existingDebt));

    let tx1 = await instanceMAI.addCollateralToCDP({ from: _acc, to: addressMAI, value: _eth });
    assert.equal(tx1.logs.length, 1, "one event was triggered");
    assert.equal(tx1.logs[0].event, "UpdateCDP", "UpdateCDP was called");
    assert.equal(tx1.logs[0].args.CDP, CDP, "CDP is correct");
    assert.equal(tx1.logs[0].args.owner, _acc, "owner is correct");
    assert.equal(utils.BN2Str(tx1.logs[0].args.debtAdded), 0, "debt is correct");
    assert.equal(utils.BN2Str(tx1.logs[0].args.collateralAdded), _eth, "collateral is correct");
    assert.equal(utils.BN2Str(tx1.logs[0].args.collateralisation), utils.BN2Str(cltrzn), "collateralisation is correct");

    let newCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
    assert.equal(utils.BN2Int(newCollateral), utils.BN2Int(existingCollateral.plus(_eth)), "New collateral is correct")
  });
}

function remintMAIFromCDP(ratio, _acc) {
  const _ratio = utils.getBN(ratio);

  var newDebt; var accBal0; var additionalMintAmount; var maiSupply0;

  it("Allows reminting MAI from CDP", async () => {
    let CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = utils.getBN((await instanceMAI.mapCDP_Data(CDP)).debt)
    let existingCollateral = utils.getBN((await instanceMAI.mapCDP_Data(CDP)).collateral)
    const purchasingPower = utils.getBN(await help.calcEtherPPinMAI(instanceMAI, existingCollateral));//how valuable Ether is in MAI
    const maxMintAmount = utils.floorBN((purchasingPower.times(_ratio)).div(100));
    additionalMintAmount = utils.getBN(maxMintAmount.minus(existingDebt));
    //newDebt = (additionalMintAmount.plus(existingDebt))
    accBal0 = utils.getBN(await instanceMAI.balanceOf(_acc));
    maiSupply0 = utils.getBN(await instanceMAI.totalSupply())

    let tx1 = await instanceMAI.remintMAIFromCDP(_ratio, { from: _acc, to: addressMAI });
    assert.equal(tx1.logs.length, 3, "three events were triggered");
    assert.equal(tx1.logs[2].event, "UpdateCDP", "UpdateCDP was called");
    assert.equal(tx1.logs[2].args.CDP, CDP, "CDP is correct");
    assert.equal(tx1.logs[2].args.owner, _acc, "owner is correct");
    assert.equal(utils.BN2Str(tx1.logs[2].args.debtAdded), utils.BN2Str(additionalMintAmount), "mint is correct");
    assert.equal(utils.BN2Str(tx1.logs[2].args.collateralAdded), 0, "collateral is correct");
    assert.equal(utils.BN2Str(tx1.logs[2].args.collateralisation), utils.BN2Str(_ratio), "collateralisation is correct");

  });

  //test balance of account 0 for mai has increased
  it("tests balances of MAI", async () => {
    let addressMAIBal = utils.BN2Str(await instanceMAI.balanceOf(addressMAI))
    assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");

    let accBal1 = utils.BN2Str(await instanceMAI.balanceOf(_acc))
    assert.equal(accBal1, utils.BN2Str(accBal0.plus(additionalMintAmount)), "correct _acc bal");

    let maiSupply1 = utils.BN2Str(await instanceMAI.totalSupply())
    assert.equal(utils.BN2Str(maiSupply1), utils.BN2Str(additionalMintAmount.plus(maiSupply0)), "correct new supply")
  })
}

function closeCDP(_acc, _bp) {

  var debtRemain; var collateralRemain;
  var CDP; var accBal0; var maiSupply0; var balMAI0;

  it("Allows closing CDP", async () => {
    let accEth1 = utils.getBN(await web3.eth.getBalance(_acc))
    CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = utils.getBN((await instanceMAI.mapCDP_Data(CDP)).debt)

    let existingCollateral = utils.getBN((await instanceMAI.mapCDP_Data(CDP)).collateral)
    let debtClosed = utils.floorBN((existingDebt.times(_bp)).div(10000));
    let collateralReturned = utils.floorBN((existingCollateral.times(_bp)).div(10000));

    debtRemain = utils.getBN(existingDebt.minus(debtClosed));
    collateralRemain = utils.getBN(existingCollateral.minus(collateralReturned));

    accBal0 = utils.getBN(await instanceMAI.balanceOf(_acc));
    maiSupply0 = utils.getBN(await instanceMAI.totalSupply());
    balMAI0 = utils.getBN(await web3.eth.getBalance(addressMAI))

    let tx1 = await instanceMAI.closeCDP(_bp, { from: _acc });
    assert.equal(tx1.logs.length, 4, "Three events was triggered");
    assert.equal(tx1.logs[0].event, "Approval", "Correct event");
    assert.equal(tx1.logs[1].event, "Transfer", "Correct event");
    assert.equal(tx1.logs[2].event, "Transfer", "Correct event");
    assert.equal(tx1.logs[3].event, "CloseCDP", "Correct event");
    assert.equal(tx1.logs[3].args.CDP, 1, "CDP is correct");
    assert.equal(tx1.logs[3].args.owner, _acc, "Owner is correct");
    assert.equal(utils.BN2Str(tx1.logs[3].args.debtPaid), utils.BN2Str(debtClosed), "Debt is correct");
    assert.equal(utils.BN2Str(tx1.logs[3].args.etherReturned), utils.BN2Str(collateralReturned), "Collateral is correct");

    let accBal = utils.getBN(await instanceMAI.balanceOf(_acc));
    assert.equal(utils.BN2Str(accBal), utils.BN2Str(accBal0.minus(debtClosed)), "correct acc0 bal");

    let maiSupply1 = utils.getBN(await instanceMAI.totalSupply())
    assert.equal(utils.BN2Str(maiSupply1), utils.BN2Str(maiSupply0.minus(debtClosed)), "correct new supply")

    const tx = await web3.eth.getTransaction(tx1.tx);
    const gasCost = utils.getBN(tx.gasPrice * tx1.receipt.gasUsed);


    let accEth_After = utils.BN2Str(await web3.eth.getBalance(_acc))
    assert.equal(accEth_After, utils.BN2Str((accEth1.plus(collateralReturned)).minus(gasCost)), "gas test")

    let balMAI1 = utils.BN2Str(await web3.eth.getBalance(addressMAI))
    assert.equal(balMAI1, utils.BN2Str(balMAI0.minus(collateralReturned)), "Correct acount balance")
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
    const CDP = utils.BN2Str(await instanceMAI.mapAddress_MemberData.call(_acc))
    existingDebt = utils.getBN((await instanceMAI.mapCDP_Data.call(CDP)).debt)
    existingCollateral = utils.getBN((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    const canLiquidate = await help.checkLiquidateCDP(instanceMAI, existingCollateral, existingDebt)
    const canLiquidateSC = await instanceMAI.checkLiquidationPoint(CDP)
    const pool_mai_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
    const pool_asset_Before = utils.getBN((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
    assert.equal(canLiquidateSC, canLiquidate, "canLiquidate is correct")

    if (canLiquidateSC) {
      const basisPoints = utils.getBN(10000);
      const liquidatedCollateral = utils.floorBN(existingCollateral.div(basisPoints.div(_bp)));
      const debtDeleted = utils.floorBN(existingDebt.div(basisPoints.div(_bp)));
      const maiBought = utils.getBN(await math.calcCLPSwap(liquidatedCollateral, pool_asset_Before, pool_mai_Before));
      const fee = maiBought.minus(debtDeleted)

      let tx1 = await instanceMAI.liquidateCDP(CDP, _bp, { from: _acc });
      assert.equal(tx1.logs.length, 3, "Three events were triggered");
      assert.equal(tx1.logs[0].event, "LiquidateCDP", "Correct event");
      assert.equal(utils.BN2Str(tx1.logs[0].args.etherSold), utils.BN2Str(liquidatedCollateral), "Correct liquidatedCollateral");
      assert.equal(utils.BN2Str(tx1.logs[0].args.maiBought), utils.BN2Str(maiBought), "Correct maiBought");
      assert.equal(utils.BN2Str(tx1.logs[0].args.debtDeleted), utils.BN2Str(debtDeleted), "Correct debtDeleted");
      assert.equal(utils.BN2Str(tx1.logs[0].args.feeClaimed), utils.BN2Str(fee), "Correct fee");

      const finalDebt = utils.BN2Str((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      const finalCollateral = utils.BN2Str((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
      assert.equal(finalDebt, utils.BN2Str(existingDebt - debtDeleted), "correct final debt");
      assert.equal(utils.roundBN2StrDR((finalCollateral / _1), 3), utils.roundBN2StrDR(((existingCollateral - liquidatedCollateral) / _1), 3), "correct final collateral");


      let addressMAIBal = utils.BN2Str(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, (initialMAI - maiBought), "correct addressMAIBal bal");
    

      

    }
  })

  

}

