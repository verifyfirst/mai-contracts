var MAI = artifacts.require("./MAI.sol");
var USD = artifacts.require("./tokenUSD.sol");

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
const initialMAI = 4 * _1; const initialETH = 3*10**16;


contract('MAI', function (accounts) {

    constructor(accounts)
    // checkMath(_dot001)
    // checkPrices(_dot001)
    openCDP(_dot001, 110, acc1) // <- gets 0.15
    liquidateCDP(acc1, 3333)    // <- someone else gets MAI deleted
    openCDP(_dot001, 110, acc1) // <- gets another 0.15 -> 0.3
    openCDP(_dot001, 110, acc1)
    testFailCDP(_dot001, 100, acc1)
     closeCDP(acc1, 5000)
    openCDP(_dot001, 150, acc1)
    addCollateralToCDP(_dot001, acc1)
    remintMAIFromCDP(101, acc1)
    closeCDP(acc1, 10000)
  })

//################################################################
// HELPERS
function BN2Int(BN) { return +(new BigNumber(BN)).toFixed() }
function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }
function int2BN(int) { return (new BigNumber(int)) }
function int2Str(int) { return ((int).toString()) }
function int2Num(int) { return (int / (1 * 10 ** 18)) }
function roundBN2StrD(BN) {
  const BN_ = (new BigNumber(BN)).toPrecision(11, 1)
  return BN2Str(BN_)
}
function roundBN2StrDR(BN, x) {
  const BN_ = (new BigNumber(BN)).toPrecision(x, 1)
  return BN2Str(BN_)
}
function assertLog(number1, number2, test) {
  console.log(BN2Int(number1), BN2Int(number2), test)
}
function logType(thing) {
  console.log("%s type", thing, typeof thing)
}

//################################################################
// CONSTRUCTION
function constructor(accounts) {
  acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]

  
  it("constructor events", async () => {
    const balance = await web3.eth.getBalance(acc0)
    console.log('balance of acc0', balance/(_1))

    let USD = artifacts.require("tokenUSD.sol");
    instanceUSD = await USD.new();
    addressUSD = instanceUSD.address;
    console.log('addressUSD: %s', addressUSD)

    let MAI = artifacts.require("MAI.sol");
    instanceMAI = await MAI.new(addressUSD, {value:initialETH});
    addressMAI = instanceMAI.address;
    console.log('CoinAddress: %s', addressMAI)
    console.log('Acc0: %s', acc0)

    const supply = BN2Int(await instanceMAI.totalSupply())
    // console.log(supply)
    assert.equal(supply, 4*_1, "supply is correct")

    const etherPool_asset = BN2Int((await instanceMAI.mapToken_ExchangeData(addressETH)).balanceAsset);
    assert.equal(etherPool_asset, etherPool.asset)
    const etherPool_mai = BN2Int((await instanceMAI.mapToken_ExchangeData(addressETH)).balanceMAI);
    assert.equal(etherPool_mai, etherPool.mai)

    await instanceMAI.approve(addressMAI, (usdPool.mai), {from:acc0})
    await instanceUSD.approve(addressMAI, (usdPool.asset), {from:acc0})
    await instanceMAI.addExchange(addressUSD, (usdPool.asset), (usdPool.mai), {from:acc0})

    const usdPool_asset = BN2Str((await instanceMAI.mapToken_ExchangeData(addressUSD)).balanceAsset);
    assert.equal(usdPool_asset, BN2Str(usdPool.asset))
    const usdPool_mai = BN2Str((await instanceMAI.mapToken_ExchangeData(addressUSD)).balanceMAI);
    assert.equal(usdPool_mai, BN2Str(usdPool.mai))

  });

}


//################################################################
// MATH
function checkMath(_val) {
    it("Checks core math", async () => {
      const output = BN2Int(await instanceMAI.getCLPSwap(int2Str(_val), int2Str(etherPool.asset), int2Str(etherPool.mai)))
      const _output = _getCLPSwap(_val, +etherPool.asset, +etherPool.mai)
      assert.equal(output, _output, "swap is correct")
      const fee = BN2Int(await instanceMAI.getCLPFee(int2Str(_val), int2Str(etherPool.asset), int2Str(etherPool.mai)))
      const _fee = _getCLPFee(_val, +etherPool.asset, +etherPool.mai)
      assert.equal(fee, _fee, "fee is correct")
      const liquidation = BN2Int(await instanceMAI.getCLPLiquidation(int2Str(_val), int2Str(etherPool.asset), int2Str(etherPool.mai)))
      const _liquidation = _getCLPLiquidation(_val, +etherPool.asset, +etherPool.mai)
      assert.equal(liquidation, _liquidation, "liquidation is correct")
      //console.log("x:%s, X:%s, Y:%s, y:%s, fee:%s, lP:%s", int2Num(+_val), int2Num(+etherPool.asset),
      //int2Num(+etherPool.mai), int2Num(+output), int2Num(+fee), int2Num(+liquidation))
    })
  }
  
  function checkPrices(_eth) {
    it("Checks core logic", async () => {
  
      const ethValueInMai = BN2Int(await instanceMAI.getValueInMAI(addressETH))
      const usdValueInMai = BN2Int(await instanceMAI.getValueInMAI(addressUSD))
      assert.equal(ethValueInMai, getValueInMai(addressETH), "eth correct")
      assert.equal(usdValueInMai, getValueInMai(addressUSD), "usd correct")
  
      const maiValueInUsd = BN2Int(await instanceMAI.getValueInAsset(addressUSD))
      assert.equal(maiValueInUsd, getValueInAsset(addressUSD), "mai is correct")
  
      const ethPriceInUSD = BN2Int(await instanceMAI.getEtherPriceInUSD(int2Str(_eth)))
      assert.equal(ethPriceInUSD, getEtherPriceInUSD(_eth), "ether is correct")
  
      const ethPPInMAI = BN2Int(await instanceMAI.getEtherPPinMAI(int2Str(_eth)))
      assert.equal(ethPPInMAI, getEtherPPinMAI(_eth), "mai is correct")
  
      const maiPPInUSD = BN2Int(await instanceMAI.getMAIPPInUSD(int2Str(ethPPInMAI)))
      assert.equal(maiPPInUSD, getMAIPPInUSD(ethPPInMAI), "mai is correct")
  
      // const liquidationPoint = BN2Int(await instanceMAI.checkLiquidationPoint(int2Str(ethPPInMAI)))
      // assert.equal(liquidationPoint, 31880207704383530000,"mai is correct")
      // console.log(liquidationPoint)
  
    })
  }
  
  //################################################################
  // CDP INTERACTIONS
  function openCDP(_eth, _ratio, _acc) {
  
    var existingDebt = 0; var existingCollateral = 0; var CDP;
    var newDebt; var newCollateral; var acc0Bal;
  
    it("Allows opening CDP", async () => {
      //CDP = (await instanceMAI.mapAddress_MemberData.call(_acc)).CDP
      const CDP = BN2Int(await instanceMAI.mapAddress_MemberData.call(_acc))
      //console.log("CDP:", CDP)
      if (CDP > 0) {
        existingDebt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
        existingCollateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
      }
      //console.log('_eth', BN2Int(_eth))
      const ethPPInMAI = BN2Int(await instanceMAI.getEtherPPinMAI(int2Str(_eth)))
      //console.log("type", logType(ethPPInMAI)); console.log('ethPPInMAI',ethPPInMAI)
      const ethPP = BN2Int(getEtherPPinMAI(int2Str(_eth)).toFixed())
      // console.log(logType(ethPP))
      assert.equal(ethPPInMAI, ethPP, "etherPP is correct")
      //console.log('ethPPInMAI', ethPPInMAI, ethPP)
      const mintAmount = (ethPPInMAI * 100) / (_ratio);
     // console.log("mintAmount", mintAmount)
      newDebt = roundBN2StrD(mintAmount)
      newCollateral = _eth

      acc0Bal = BN2Int(await instanceMAI.balanceOf(_acc))
  
      var tx1;
      if (_ratio === 150) {
        tx1 = await instanceMAI.send(_eth, { from: _acc });
      } else {
        tx1 = await instanceMAI.openCDP(_ratio, { from: _acc, value: _eth });
      }
  
      //console.log(tx1.receipt)
      assert.equal(tx1.logs.length, 3, "one event was triggered");
      assert.equal(tx1.logs[0].event, "Transfer", "Transfer was called");
      assert.equal(tx1.logs[0].args.to, addressMAI, "To is correct");
      assert.equal(roundBN2StrD(tx1.logs[0].args.amount), newDebt, "newDebt is correct")
      assert.equal(tx1.logs[1].event, "Transfer", "Transfer was called");
      assert.equal(tx1.logs[1].args.to, _acc, "To is correct");
      assert.equal(roundBN2StrD(tx1.logs[1].args.amount), newDebt, "newDebt is correct")
      assert.equal(tx1.logs[2].event, "NewCDP", "New CDP event was called");
      assert.equal(roundBN2StrD(tx1.logs[2].args.debtIssued), newDebt, "newDebt is correct")
      assert.equal(roundBN2StrD(tx1.logs[2].args.collateralHeld), roundBN2StrD(newCollateral), "Collateral is correct");
      //console.log(newDebt, newCollateral)
    });
  
    //test balance of account 0 for mai has increased
    it("tests balances of MAI", async () => {
      let addressMAIBal = BN2Int(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");
  
      let acc0Bal1 = BN2Int(await instanceMAI.balanceOf(_acc))
      console.log(newDebt, existingDebt)
      console.log('acc0Bal', acc0Bal1)
      assert.equal(roundBN2StrDR(acc0Bal1, 10), roundBN2StrDR((+acc0Bal + +newDebt),10), "correct _acc bal");
  
      let maiSupply = BN2Int(await instanceMAI.totalSupply())
      assert.equal(roundBN2StrD(maiSupply), roundBN2StrD((+acc0Bal + +newDebt + initialMAI)), "correct new supply")
      //console.log(addressMAIBal, acc0Bal, maiSupply)
  
    })


    // Test mappings
    it("Tests mappings", async () => {
      CDP = BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
  
      let countOfCDPs = await instanceMAI.countOfCDPs()
      assert.equal(countOfCDPs, CDP, "correct countOfCDPs");
  
      let _CDP = BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
      assert.equal(_CDP, CDP, "correct mapAddress_MemberData");
  
      let mapCDP_Data = await instanceMAI.mapCDP_Data(_CDP);
      assert.equal(mapCDP_Data.collateral, +newCollateral + +existingCollateral, "CDP Collateral")
      assert.equal(roundBN2StrDR(mapCDP_Data.debt, 10), roundBN2StrDR((+newDebt + existingDebt),10), "CDP Debt");
      assert.equal(mapCDP_Data.owner, _acc, "correct owner");
    })
  }
  
  function testFailCDP(_eth, _ratio, _acc) {
  
    it("tests <101 collaterisation fails to open CDP", async () => {
  
      var tx1 = await truffleAssert.reverts(instanceMAI.openCDP(_ratio, { from: _acc, value: _eth }));
  
    });
  }
  
  function addCollateralToCDP(_eth, _acc) {
  
    it("Allows adding to  CDP", async () => {
  
      let CDP = BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
      //console.log("CDP", CDP)
      let existingDebt = BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
      //console.log("existingDebt", existingDebt)
      let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
      const ethPP = getEtherPPinMAI(existingCollateral.plus(_eth))
      const cltrzn  = Math.floor((ethPP * 100) / existingDebt)
      //open CDP
      let tx1 = await instanceMAI.addCollateralToCDP({ from: _acc, to: addressMAI, value: _eth });
      assert.equal(tx1.logs.length, 1, "one event was triggered");
      assert.equal(tx1.logs[0].event, "UpdateCDP", "UpdateCDP was called");
      assert.equal(tx1.logs[0].args.CDP, CDP, "CDP is correct");
      //assert.equal(BN2Int(tx1.logs[1].args.time), issuedMai, "amount is correct");
      assert.equal(tx1.logs[0].args.owner, _acc, "owner is correct");
      assert.equal(BN2Int(tx1.logs[0].args.debtAdded), 0, "debt is correct");
      assert.equal(BN2Int(tx1.logs[0].args.collateralAdded), _eth, "collateral is correct");
      assert.equal(BN2Int(tx1.logs[0].args.collateralisation), cltrzn, "collateralisation is correct");
  
      let newCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
      assert.equal(BN2Int(newCollateral), BN2Int(existingCollateral.plus(_eth)), "New collateral is correct")
    });
  }
  
  function remintMAIFromCDP(_ratio, _acc) {
  
    var newDebt; var accBal0; var additionalMintAmount; var maiSupply0;
  
    it("Allows reminting MAI from CDP", async () => {
  
      let CDP = BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
      let existingDebt = BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
      let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
      const purchasingPower = getEtherPPinMAI(existingCollateral);//how valuable Ether is in MAI
      const maxMintAmount = (purchasingPower * _ratio) / 100;
      additionalMintAmount = BN2Int(maxMintAmount - existingDebt);
      newDebt = roundBN2StrD(additionalMintAmount + existingDebt)
      //console.log(purchasingPower, maxMintAmount, additionalMintAmount)
      accBal0 = roundBN2StrD(await instanceMAI.balanceOf(_acc))
      maiSupply0 = BN2Int(await instanceMAI.totalSupply())

      let tx1 = await instanceMAI.remintMAIFromCDP(_ratio, { from: _acc, to: addressMAI});
      //console.log(tx1.logs[2])
      assert.equal(tx1.logs.length, 3, "three events were triggered");
      assert.equal(tx1.logs[2].event, "UpdateCDP", "UpdateCDP was called");
      assert.equal(tx1.logs[2].args.CDP, CDP, "CDP is correct");
      // //assert.equal(BN2Int(tx1.logs[1].args.time), issuedMai, "amount is correct");
      assert.equal(tx1.logs[2].args.owner, _acc, "owner is correct");
      assert.equal(roundBN2StrD(tx1.logs[2].args.debtAdded), roundBN2StrD(additionalMintAmount), "mint is correct");
      assert.equal(BN2Int(tx1.logs[2].args.collateralAdded), 0, "collateral is correct");
      assert.equal(BN2Int(tx1.logs[2].args.collateralisation), _ratio, "collateralisation is correct");
  
    });
  
      //test balance of account 0 for mai has increased
    it("tests balances of MAI", async () => {
      let addressMAIBal = BN2Int(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");
     
      let accBal1 = roundBN2StrD(await instanceMAI.balanceOf(_acc))
      assert.equal(accBal1, roundBN2StrD(+accBal0 + +additionalMintAmount), "correct _acc bal");
      
      let maiSupply1 = BN2Int(await instanceMAI.totalSupply())
      assert.equal(roundBN2StrD(maiSupply1), roundBN2StrD((+additionalMintAmount + maiSupply0)), "correct new supply")
      //console.log(addressMAIBal, acc0Bal, maiSupply)
  
    })
  }
  
  function closeCDP(_acc, _bp) {
  
    var debtRemain; var collateralRemain;
    var CDP; var accBal0; var maiSupply0; var balMAI0;
  
    it("Allows closing CDP", async () => {
  
      let accEth1 = BN2Int(await web3.eth.getBalance(_acc))
      CDP = BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
      //console.log("CDP", CDP)
      let existingDebt = BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
     
      let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
      console.log("existingDebt", existingDebt)
      let debtClosed = existingDebt * (_bp / 10000)
      let collateralReturned = existingCollateral * (_bp / 10000)
  
      debtRemain = existingDebt - debtClosed
      collateralRemain = existingCollateral - collateralReturned

      accBal0 = BN2Int(await instanceMAI.balanceOf(_acc));
      maiSupply0 = await instanceMAI.totalSupply()
      balMAI0 = roundBN2StrD(await web3.eth.getBalance(addressMAI))
  
      let tx1 = await instanceMAI.closeCDP(_bp, { from: _acc });
      assert.equal(tx1.logs.length, 4, "Three events was triggered");
      assert.equal(tx1.logs[0].event, "Approval", "Correct event");
      assert.equal(tx1.logs[1].event, "Transfer", "Correct event");
      assert.equal(tx1.logs[2].event, "Transfer", "Correct event");
      assert.equal(tx1.logs[3].event, "CloseCDP", "Correct event");
  
      assert.equal(tx1.logs[3].args.CDP, 1, "CDP is correct");
      assert.equal(tx1.logs[3].args.owner, _acc, "Owner is correct");
      assert.equal(BN2Int(tx1.logs[3].args.debtPaid), debtClosed, "Debt is correct");
      assert.equal(roundBN2StrD(tx1.logs[3].args.etherReturned), roundBN2StrD(collateralReturned), "Collateral is correct");
  
      let accBal = BN2Int(await instanceMAI.balanceOf(_acc));
      assert.equal(roundBN2StrD(accBal), roundBN2StrD(accBal0 - debtClosed), "correct acc0 bal");
  
      let maiSupply1 = await instanceMAI.totalSupply()
      assert.equal(roundBN2StrD(maiSupply1), roundBN2StrD(maiSupply0 - debtClosed), "correct new supply")
  
      const tx = await web3.eth.getTransaction(tx1.tx);
      const gasCost = tx.gasPrice * tx1.receipt.gasUsed;
  
      let accEth2 = roundBN2StrDR(await web3.eth.getBalance(_acc), 3)
      assert.equal(accEth2, roundBN2StrDR((+accEth1 + +BN2Int(existingCollateral) - gasCost), 3), "gas test")
  
      let balMAI1 = roundBN2StrDR(await web3.eth.getBalance(addressMAI), 9)
      //console.log(balMAI, existingDebt, existingCollateral, debtClosed, collateralReturned)
      assert.equal(balMAI1, roundBN2StrDR(+balMAI0 - +collateralReturned, 9), "Correct acount balance")
      
  
    })
  
    // Test mappings
    it("Tests mappings", async () => {
  
      let mapCDP_Data = await instanceMAI.mapCDP_Data(CDP);
      assert.equal(roundBN2StrD(mapCDP_Data.collateral), roundBN2StrD(collateralRemain), "correct collateral");
      assert.equal(roundBN2StrD(mapCDP_Data.debt), roundBN2StrD(debtRemain), "correct debt");
  
    })
  }
  
  function liquidateCDP(_acc, _bp) {
  
      var existingDebt = 0; var existingCollateral = 0; var CDP;
  
    it("Allows liquidation of CDP", async () => {
  
      const CDP = BN2Int(await instanceMAI.mapAddress_MemberData.call(_acc))
      existingDebt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
      existingCollateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
      console.log(existingDebt, existingCollateral)
      const canLiquidate = checkLiquidateCDP(existingCollateral, existingDebt)
      const canLiquidateSC = await instanceMAI.checkLiquidationPoint(CDP)
      assert.equal(canLiquidateSC, canLiquidate, "canLiquidate is correct")
      console.log('canLiquidate', CDP, existingDebt, existingCollateral, canLiquidate)
  
      if (canLiquidateSC){
        const liquidatedCollateral = roundBN2StrD(existingCollateral / (10000 / _bp))
        const debtDeleted = roundBN2StrD(existingDebt / (10000 / _bp))
        const maiBought = roundBN2StrD((getEtherPPinMAI(liquidatedCollateral)))
        const fee = roundBN2StrD(maiBought - debtDeleted)
        console.log(liquidatedCollateral, debtDeleted, maiBought, fee)
  
        console.log(CDP, _bp)
        let tx1 = await instanceMAI.liquidateCDP(CDP, _bp, { from: _acc });
        // console.log(tx1.logs)
        assert.equal(tx1.logs.length, 1, "Three events were triggered");
        assert.equal(tx1.logs[0].event, "LiquidateCDP", "Correct event");
        assertLog(roundBN2StrD(tx1.logs[0].args.etherSold), liquidatedCollateral, "Correct liquidatedCollateral");
        assertLog(roundBN2StrD(tx1.logs[0].args.maiBought), maiBought, "Correct maiBought");
        assertLog(roundBN2StrD(tx1.logs[0].args.debtDeleted), debtDeleted, "Correct debtDeleted");
        assertLog(roundBN2StrD(tx1.logs[0].args.feeClaimed), fee, "Correct fee");

        const finalDebt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
        const finalCollateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)

        console.log('finals', finalDebt, finalCollateral)
        let acc0Bal = BN2Int(await instanceMAI.balanceOf(_acc))
        console.log('acc0Bal', acc0Bal)
  
      }
    })
  
  }
  
  //################################################################
  // CORE ARITHMETIC
  
  function getValueInMai(token) {
    var result
    if (token == addressETH) {
      const etherBal = new BigNumber(etherPool.asset)
      const maiBal = new BigNumber(etherPool.mai)
      result = (_1BN.times(maiBal)).div(etherBal)
    } else {
      const usdBal = new BigNumber(usdPool.asset)
      const maiBal = new BigNumber(usdPool.mai)
      result = (_1BN.times(maiBal)).div(usdBal)
    }
    return result.toFixed()
  }
  
  function getValueInAsset(token) {
    const usdBal = usdPool.asset
    const maiBal = usdPool.mai
    return ((_1BN.times(usdBal)).div(maiBal)).toFixed()
  }
  
  function getEtherPriceInUSD(amount) {
    const _amount = new BigNumber(amount)
    const etherPriceInMai = new BigNumber(getValueInMai(addressETH))
    const maiPriceInUSD = new BigNumber(getValueInAsset(addressUSD))
    const ethPriceInUSD = (maiPriceInUSD.times(etherPriceInMai)).div(_1BN)
    return ((_amount.times(ethPriceInUSD)).div(_1BN)).toFixed()
  }
  
  function getEtherPPinMAI(amount) {
    const etherBal = etherPool.asset
    const maiBal = etherPool.mai
    //console.log(etherBal, maiBal)
    const outputMai = _getCLPSwap(amount, etherBal, maiBal);
    //console.log("outputMai", outputMai)
    return outputMai;
  }
  
  function getMAIPPInUSD(amount) {
    const usdBal = usdPool.asset
    const maiBal = usdPool.mai
  
    const outputUSD = _getCLPSwap(amount.toString(), maiBal, usdBal);
    //console.log(maiBal, usdBal, outputUSD)
    return outputUSD;
  }
  
  function checkLiquidateCDP(_collateral, _debt){
    const etherBal = etherPool.asset
    const maiBal = etherPool.mai
    const outputMai = _getCLPLiquidation(_collateral, etherBal, maiBal);
    //console.log("details", outputMai, _debt)
    var canLiquidate
    if(outputMai < _debt) {
        canLiquidate = true;
    } else {
        canLiquidate = false;
    }
    return canLiquidate;
  }
  
  function _getCLPSwap(x, X, Y) {
    // y = (x * Y * X)/(x + X)^2
    const _x = new int2BN(x)
    const _X = new int2BN(X)
    const _Y = new int2BN(Y)
    // assume BN
    const numerator = _x.times(_Y).times(_X)
    const denominator = (_x.plus(_X)).times((_x.plus(_X)))
    const _y = numerator.div(denominator)
    const y = BN2Int(_y);
    // const numerator = x * Y * X;
    // const denominator = (x + X) * (x + X );
    // const y = numerator / denominator;
    //console.log("clpswap", _x, _X, _Y, numerator, denominator, y)
    return y;
  }
  
  function _getCLPFee(x, X, Y) {
    // y = (x * Y * x) / (x + X)^2
    const _x = new int2BN(x)
    const _X = new int2BN(X)
    const _Y = new int2BN(Y)
    // assume BN
    const numerator = _x.times(_Y.times(_x));
    const denominator = (_x.plus(_X)).times(_x.plus(_X));
    const _y = numerator.div(denominator);
    const y = BN2Int(_y);
    // const numerator = x * Y * X;
    // const denominator = (x + X) * (x + X );
    // const y = numerator / denominator;
    //console.log("clpswap", _x, _X, _Y, numerator, denominator, y)
    return y;
  }
  
  function _getCLPLiquidation(x, X, Y) {
    // y = (x * Y * (X - x))/(x + X)^2
    const _x = new int2BN(x)
    const _X = new int2BN(X)
    const _Y = new int2BN(Y)
    // assume BN
    const numerator = _x.times(_Y.times(_X.minus(_x)));
    const denominator = (_x.plus(_X)).times(_x.plus(_X));
    const _y = numerator.div(denominator);
    const y = BN2Int(_y);
    // const numerator = x * Y * X;
    // const denominator = (x + X) * (x + X );
    // const y = numerator / denominator;
    //console.log("clpswap", _x, _X, _Y, numerator, denominator, y)
    return y;
  }