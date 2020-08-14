const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const _ = require('./utils.js');
const math = require('./math.js');
const help = require('./helper.js');

var MAI = artifacts.require("MAI.sol");
var USD = artifacts.require("tokenUSD1.sol");

var instanceMAI; var addressMAI; var instanceUSD; var addressUSD;
var acc0; var acc1; var acc2; var acc3;
var _1 = 1 * 10 ** 18;
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot001 = new BigNumber(1 * 10 ** 15)
const addressETH = "0x0000000000000000000000000000000000000000"
const etherPool = { "asset": (1 * _.ETH01(1)).toString(), "mai": (2 * _1).toString() }
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

    const supply = _.BN2Str(await instanceMAI.totalSupply())
    assert.equal(supply, initialMAI, "supply is correct")
    const assetPool_asset = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
    assert.equal(assetPool_asset, etherPool.asset)
    const assetPool_mai = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
    assert.equal(assetPool_mai, etherPool.mai)
    const acc0MAIBalance = _.BN2Str(await instanceMAI.balanceOf(acc0))
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
    const output = _.BN2Str(await instanceMAI.calcCLPSwap(_.int2Str(_val), _.int2Str(etherPool.asset), _.int2Str(etherPool.mai)))
    const _output = await math.calcCLPSwap(_val, +etherPool.asset, +etherPool.mai)
    assert.equal(output, _output, "swap is correct")
    const fee = _.BN2Str(await instanceMAI.calcCLPFee(_.int2Str(_val), _.int2Str(etherPool.asset), _.int2Str(etherPool.mai)))
    const _fee = _.BN2Str(await math.calcCLPFee(_val, +etherPool.asset, +etherPool.mai))
    assert.equal(fee, _fee, "fee is correct")
    const liquidation = _.BN2Str(await instanceMAI.calcCLPLiquidation(_.int2Str(_val), _.int2Str(etherPool.asset), _.int2Str(etherPool.mai)))
    const _liquidation = _.BN2Str(await math.calcCLPLiquidation(_val, +etherPool.asset, +etherPool.mai))
    assert.equal(liquidation, _liquidation, "liquidation is correct")
  })
}

function checkPrices(_eth) {
  it("Checks core logic", async () => {
    const ethValueInMai = _.BN2Str(await instanceMAI.calcValueInMAI(addressETH))
    assert.equal(ethValueInMai, await help.calcValueInMai(instanceMAI, addressETH), "eth correct")
    const ethPriceInUSD = _.BN2Str(await instanceMAI.calcEtherPriceInUSD(_.int2Str(_eth)))
    assert.equal(ethPriceInUSD, _.BN2Str(await help.calcEtherPriceInUSD(instanceMAI, _eth)), "ether is correct")

    const ethPPInMAI = _.BN2Str(await instanceMAI.calcEtherPPinMAI(_.int2Str(_eth)))
    assert.equal(ethPPInMAI, _.BN2Str(await help.calcEtherPPinMAI(instanceMAI, _eth)), "mai is correct")

    const maiPPInUSD = _.BN2Str(await instanceMAI.calcMAIPPInUSD(_.int2Str(ethPPInMAI)))
    assert.equal(maiPPInUSD, _.BN2Str(await help.calcMAIPPInUSD(ethPPInMAI)), "mai is correct")

  })
}

//################################################################
// CDP INTERACTIONS
function openCDP(_eth, ratio, _acc) {
  const _ratio = _.getBN(ratio);
  var existingDebt = 0; var existingCollateral = 0; var CDP;
  var newDebt; var newCollateral; var acc0Bal;

  it("Allows opening CDP", async () => {

    const CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData.call(_acc))
    if (CDP > 0) {
      existingDebt = _.getBN((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      existingCollateral = _.getBN((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    }
    const ethPPInMAI = _.getBN(await instanceMAI.calcEtherPPinMAI(_eth))
    const ethPP = _.getBN(await help.calcEtherPPinMAI(instanceMAI, _eth))
    assert.equal(_.BN2Str(ethPPInMAI), _.BN2Str(ethPP), "etherPP is correct")
    const mintAmount = (ethPPInMAI.times(100)).div(_ratio);
    newDebt = _.floorBN(mintAmount)
    newCollateral = _eth
    acc0Bal = _.getBN(await instanceMAI.balanceOf(_acc))

    var tx1;
    if (_ratio === 150) {
      tx1 = await instanceMAI.send(_eth, { from: _acc });
    } else {
      tx1 = await instanceMAI.openCDP(_ratio, { from: _acc, value: _eth });
    }

    assert.equal(tx1.logs.length, 3, "one event was triggered");
    assert.equal(tx1.logs[0].event, "Transfer", "Transfer was called");
    assert.equal(tx1.logs[0].args.to, addressMAI, "To is correct");
    assert.equal(_.BN2Str(tx1.logs[0].args.amount), _.BN2Str(newDebt), "newDebt is correct")
    assert.equal(tx1.logs[1].event, "Transfer", "Transfer was called");
    assert.equal(tx1.logs[1].args.to, _acc, "To is correct");
    assert.equal(_.BN2Str(tx1.logs[1].args.amount), _.BN2Str(newDebt), "newDebt is correct")
    assert.equal(tx1.logs[2].event, "NewCDP", "New CDP event was called");
    assert.equal(_.BN2Str(tx1.logs[2].args.debtIssued), _.BN2Str(newDebt), "newDebt is correct")
    assert.equal(_.BN2Str(tx1.logs[2].args.collateralHeld), _.BN2Str(newCollateral), "Collateral is correct");
  });

  // //test balance of account 0 for mai has increased
  // it("tests balances of MAI", async () => {
  //   let addressMAIBal = _.BN2Str(await instanceMAI.balanceOf(addressMAI))
  //   assert.equal(addressMAIBal, (initialMAI - maiDeleted), "correct addressMAIBal bal");

  //   let acc0Bal1 = _.BN2Str(await instanceMAI.balanceOf(_acc))
  //   assert.equal(acc0Bal1,_.BN2Str(acc0Bal.plus(newDebt)), "correct _acc bal");

  //   let maiSupply = _.BN2Str(await instanceMAI.totalSupply())
  //   assert.equal(maiSupply, _.BN2Str(acc0Bal.plus(newDebt.plus(initialMAI))), "correct new supply")

  // })

  // Test mappings
  it("Tests mappings", async () => {
    CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))

    let countOfCDPs = _.BN2Str(await instanceMAI.countOfCDPs())
    assert.equal(countOfCDPs, CDP, "correct countOfCDPs");

    let _CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    assert.equal(_CDP, CDP, "correct mapAddress_MemberData");

    let mapCDP_Data = await instanceMAI.mapCDP_Data(_CDP);
    assert.equal(_.BN2Str(mapCDP_Data.collateral), _.BN2Str(newCollateral.plus(existingCollateral)), "CDP Collateral");
    assert.equal(_.BN2Str(mapCDP_Data.debt), _.BN2Str(newDebt.plus(existingDebt)), "CDP Debt");
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

    let CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = _.getBN((await instanceMAI.mapCDP_Data(CDP)).debt)
    let existingCollateral = _.getBN((await instanceMAI.mapCDP_Data(CDP)).collateral)
    const ethPP = await help.calcEtherPPinMAI(instanceMAI, existingCollateral.plus(_eth))
    const cltrzn = _.floorBN((ethPP.times(100)).div(existingDebt));

    let tx1 = await instanceMAI.addCollateralToCDP({ from: _acc, to: addressMAI, value: _eth });
    assert.equal(tx1.logs.length, 1, "one event was triggered");
    assert.equal(tx1.logs[0].event, "UpdateCDP", "UpdateCDP was called");
    assert.equal(tx1.logs[0].args.CDP, CDP, "CDP is correct");
    assert.equal(tx1.logs[0].args.owner, _acc, "owner is correct");
    assert.equal(_.BN2Str(tx1.logs[0].args.debtAdded), 0, "debt is correct");
    assert.equal(_.BN2Str(tx1.logs[0].args.collateralAdded), _eth, "collateral is correct");
    assert.equal(_.BN2Str(tx1.logs[0].args.collateralisation), _.BN2Str(cltrzn), "collateralisation is correct");

    let newCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
    assert.equal(_.BN2Int(newCollateral), _.BN2Int(existingCollateral.plus(_eth)), "New collateral is correct")
  });
}

function remintMAIFromCDP(ratio, _acc) {
  const _ratio = _.getBN(ratio);

  var newDebt; var accBal0; var additionalMintAmount; var maiSupply0;

  it("Allows reminting MAI from CDP", async () => {
    let CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = _.getBN((await instanceMAI.mapCDP_Data(CDP)).debt)
    let existingCollateral = _.getBN((await instanceMAI.mapCDP_Data(CDP)).collateral)
    const purchasingPower = _.getBN(await help.calcEtherPPinMAI(instanceMAI, existingCollateral));//how valuable Ether is in MAI
    const maxMintAmount = _.floorBN((purchasingPower.times(_ratio)).div(100));
    additionalMintAmount = _.getBN(maxMintAmount.minus(existingDebt));
    //newDebt = (additionalMintAmount.plus(existingDebt))
    accBal0 = _.getBN(await instanceMAI.balanceOf(_acc));
    maiSupply0 = _.getBN(await instanceMAI.totalSupply())

    let tx1 = await instanceMAI.remintMAIFromCDP(_ratio, { from: _acc, to: addressMAI });
    assert.equal(tx1.logs.length, 3, "three events were triggered");
    assert.equal(tx1.logs[2].event, "UpdateCDP", "UpdateCDP was called");
    assert.equal(tx1.logs[2].args.CDP, CDP, "CDP is correct");
    assert.equal(tx1.logs[2].args.owner, _acc, "owner is correct");
    assert.equal(_.BN2Str(tx1.logs[2].args.debtAdded), _.BN2Str(additionalMintAmount), "mint is correct");
    assert.equal(_.BN2Str(tx1.logs[2].args.collateralAdded), 0, "collateral is correct");
    assert.equal(_.BN2Str(tx1.logs[2].args.collateralisation), _.BN2Str(_ratio), "collateralisation is correct");

  });

  //test balance of account 0 for mai has increased
  it("tests balances of MAI", async () => {
    let addressMAIBal = _.BN2Str(await instanceMAI.balanceOf(addressMAI))
    assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");

    let accBal1 = _.BN2Str(await instanceMAI.balanceOf(_acc))
    assert.equal(accBal1, _.BN2Str(accBal0.plus(additionalMintAmount)), "correct _acc bal");

    let maiSupply1 = _.BN2Str(await instanceMAI.totalSupply())
    assert.equal(_.BN2Str(maiSupply1), _.BN2Str(additionalMintAmount.plus(maiSupply0)), "correct new supply")
  })
}

function closeCDP(_acc, _bp) {

  var debtRemain; var collateralRemain;
  var CDP; var accBal0; var maiSupply0; var balMAI0;

  it("Allows closing CDP", async () => {
    let accEth1 = _.getBN(await web3.eth.getBalance(_acc))
    CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData(_acc))
    let existingDebt = _.getBN((await instanceMAI.mapCDP_Data(CDP)).debt)

    let existingCollateral = _.getBN((await instanceMAI.mapCDP_Data(CDP)).collateral)
    let debtClosed = _.floorBN((existingDebt.times(_bp)).div(10000));
    let collateralReturned = _.floorBN((existingCollateral.times(_bp)).div(10000));

    debtRemain = _.getBN(existingDebt.minus(debtClosed));
    collateralRemain = _.getBN(existingCollateral.minus(collateralReturned));

    accBal0 = _.getBN(await instanceMAI.balanceOf(_acc));
    maiSupply0 = _.getBN(await instanceMAI.totalSupply());
    balMAI0 = _.getBN(await web3.eth.getBalance(addressMAI))

    let tx1 = await instanceMAI.closeCDP(_bp, { from: _acc });
    assert.equal(tx1.logs.length, 4, "Three events was triggered");
    assert.equal(tx1.logs[0].event, "Approval", "Correct event");
    assert.equal(tx1.logs[1].event, "Transfer", "Correct event");
    assert.equal(tx1.logs[2].event, "Transfer", "Correct event");
    assert.equal(tx1.logs[3].event, "CloseCDP", "Correct event");
    assert.equal(tx1.logs[3].args.CDP, 1, "CDP is correct");
    assert.equal(tx1.logs[3].args.owner, _acc, "Owner is correct");
    assert.equal(_.BN2Str(tx1.logs[3].args.debtPaid), _.BN2Str(debtClosed), "Debt is correct");
    assert.equal(_.BN2Str(tx1.logs[3].args.etherReturned), _.BN2Str(collateralReturned), "Collateral is correct");

    let accBal = _.getBN(await instanceMAI.balanceOf(_acc));
    assert.equal(_.BN2Str(accBal), _.BN2Str(accBal0.minus(debtClosed)), "correct acc0 bal");

    let maiSupply1 = _.getBN(await instanceMAI.totalSupply())
    assert.equal(_.BN2Str(maiSupply1), _.BN2Str(maiSupply0.minus(debtClosed)), "correct new supply")

    const tx = await web3.eth.getTransaction(tx1.tx);
    const gasCost = _.getBN(tx.gasPrice * tx1.receipt.gasUsed);


    let accEth_After = _.BN2Str(await web3.eth.getBalance(_acc))
    assert.equal(accEth_After, _.BN2Str((accEth1.plus(collateralReturned)).minus(gasCost)), "gas test")

    let balMAI1 = _.BN2Str(await web3.eth.getBalance(addressMAI))
    assert.equal(balMAI1, _.BN2Str(balMAI0.minus(collateralReturned)), "Correct acount balance")
  })

  // Test mappings
  it("Tests mappings", async () => {
    let mapCDP_Data = await instanceMAI.mapCDP_Data(CDP);
    assert.equal(_.roundBN2StrD(mapCDP_Data.collateral), _.roundBN2StrD(collateralRemain), "correct collateral");
    assert.equal(_.roundBN2StrD(mapCDP_Data.debt), _.roundBN2StrD(debtRemain), "correct debt");

  })
}

function liquidateCDP(_acc, _bp) {

  var existingDebt = 0; var existingCollateral = 0; var CDP;

  it("Allows liquidation of CDP", async () => {
    let liquidatorMAIBal_Before = _.getBN(await instanceMAI.balanceOf(_acc))
    const CDP = _.BN2Str(await instanceMAI.mapAddress_MemberData.call(_acc))
    existingDebt = _.getBN((await instanceMAI.mapCDP_Data.call(CDP)).debt)
    existingCollateral = _.getBN((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    const canLiquidate = await help.checkLiquidateCDP(instanceMAI, existingCollateral, existingDebt)
    const canLiquidateSC = await instanceMAI.checkLiquidationPoint(CDP)
    const pool_mai_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
    const pool_asset_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
    assert.equal(canLiquidateSC, canLiquidate, "canLiquidate is correct")

    if (canLiquidateSC) {
      const basisPoints = _.getBN(10000);
      const liquidatedCollateral = _.floorBN(existingCollateral.div(basisPoints.div(_bp)));
      const debtDeleted = _.floorBN(existingDebt.div(basisPoints.div(_bp)));
      const maiBought = _.getBN(await math.calcCLPSwap(liquidatedCollateral, pool_asset_Before, pool_mai_Before));
      const fee = maiBought.minus(debtDeleted)

      let tx1 = await instanceMAI.liquidateCDP(CDP, _bp, { from: _acc });
      assert.equal(tx1.logs.length, 3, "Three events were triggered");
      assert.equal(tx1.logs[0].event, "LiquidateCDP", "Correct event");
      assert.equal(_.BN2Str(tx1.logs[0].args.etherSold), _.BN2Str(liquidatedCollateral), "Correct liquidatedCollateral");
      assert.equal(_.BN2Str(tx1.logs[0].args.maiBought), _.BN2Str(maiBought), "Correct maiBought");
      assert.equal(_.BN2Str(tx1.logs[0].args.debtDeleted), _.BN2Str(debtDeleted), "Correct debtDeleted");
      assert.equal(_.BN2Str(tx1.logs[0].args.feeClaimed), _.BN2Str(fee), "Correct fee");

      const finalDebt = _.BN2Str((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      const finalCollateral = _.BN2Str((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
      assert.equal(finalDebt, _.BN2Str(existingDebt.minus(debtDeleted)), "correct final debt");
      assert.equal(_.BN2Str(finalCollateral), _.BN2Str(existingCollateral.minus(liquidatedCollateral)), "correct final collateral");

      let addressMAIBal = _.BN2Str(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, _.BN2Str((_.getBN(initialMAI).minus(maiBought))), "correct addressMAIBal bal");

      let liquidatorMAIBal_After = _.BN2Str(await instanceMAI.balanceOf(_acc))
      assert.equal(liquidatorMAIBal_After, _.BN2Str(fee.plus(liquidatorMAIBal_Before)), "correct liquidatorMAIBal");
    
    }
  })

  

}

