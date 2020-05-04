var MAI = artifacts.require("./MAI.sol");
var USD = artifacts.require("./tokenUSD.sol");

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

var instanceMAI; var addressMAI; var instanceUSD; var addressUSD;
var acc0; var acc1; var acc2; var acc3;

var _1 = 1 * 10 ** 18; // 1 ETH
const _1BN = new BigNumber(_1)
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot2 = new BigNumber(2 * 10 ** 17)
const addressETH = "0x0000000000000000000000000000000000000000"
var addressUSD;
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (int2BN(2).times(_1BN)).toFixed() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }


contract('MAI', function (accounts) {

    constructor(accounts)
    checkMath(_1)
    checkPrices()
    // openCDP(_1, 101, acc1)
    // liquidateCDP(acc1, 3333)
    // openCDP(_dot01, 150, acc1)
    // openCDP(_dot01, 101, acc1)
    // testFailCDP(_dot01, 100, acc1)
    // closeCDP(acc1, 5000)
    // openCDP(_dot01, 150, acc1)
    // addCollateralToCDP(_dot01, acc1)
    // remintMAIFromCDP(101, acc1)
    //closeCDP(acc1, 10000)
  })

//################################################################
// HELPERS
function BN2Int(BN) { return +(new BigNumber(BN)).toFixed() }
function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }
function int2BN(int) { return (new BigNumber(int)) }
function int2Str(int) { return ((int).toString()) }
function int2Num(int) { return (int / (1 * 10 ** 18)) }
function roundBN2Str(BN) {
  const BN_ = (new BigNumber(BN)).toPrecision(9)
  return BN2Str(BN_)
}
function roundBN2StrR(BN, x) {
  const BN_ = (new BigNumber(BN)).toPrecision(x)
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
    let USD = artifacts.require("tokenUSD.sol");
    instanceUSD = await USD.new();
    addressUSD = instanceUSD.address;
    console.log('addressUSD: %s', addressUSD)

    let MAI = artifacts.require("MAI.sol");
    instanceMAI = await MAI.new(addressUSD, {value:3*10**16});
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
      console.log("x:%s, X:%s, Y:%s, y:%s, fee:%s, lP:%s", int2Num(+_val), int2Num(+etherPool.asset),
        int2Num(+etherPool.mai), int2Num(+output), int2Num(+fee), int2Num(+liquidation))
    })
  }
  
  function checkPrices() {
    it("Checks core logic", async () => {
  
      const ethValueInMai = BN2Int(await instanceMAI.getValueInMAI(addressETH))
      const usdValueInMai = BN2Int(await instanceMAI.getValueInMAI(addressUSD))
      assert.equal(ethValueInMai, getValueInMai(addressETH), "eth correct")
      assert.equal(usdValueInMai, getValueInMai(addressUSD), "usd correct")
  
      const maiValueInUsd = BN2Int(await instanceMAI.getValueInAsset(addressUSD))
      assert.equal(maiValueInUsd, getValueInAsset(addressUSD), "mai is correct")
  
      const ethPriceInUSD = BN2Int(await instanceMAI.getEtherPriceInUSD(int2Str(_1)))
      assert.equal(ethPriceInUSD, getEtherPriceInUSD(_1), "ether is correct")
  
      const ethPPInMAI = BN2Int(await instanceMAI.getEtherPPinMAI(int2Str(_1)))
      assert.equal(ethPPInMAI, getEtherPPinMAI(_1), "mai is correct")
  
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
    var newDebt; var newCollateral;
  
    it("Allows opening CDP", async () => {
      //CDP = (await instanceMAI.mapAddressMemberData.call(_acc)).CDP
      const CDP = BN2Int(await instanceMAI.mapAddressMemberData.call(_acc))
      //console.log("CDP:", CDP)
      if (CDP > 0) {
        existingDebt = BN2Int((await instanceMAI.mapCDPData.call(CDP)).debt)
        existingCollateral = new BigNumber((await instanceMAI.mapCDPData.call(CDP)).collateral)
      }
  
      const ethPPInMAI = roundBN2Str(await instanceMAI.getEtherPPinMAI(int2Str(_eth)))
      //console.log("type", logType(ethPPInMAI)); console.log('ethPPInMAI',ethPPInMAI)
      const ethPP = roundBN2Str(getEtherPPinMAI(int2Str(_eth)).toString())
      //console.log(logType(ethPP))
      assert.equal(ethPPInMAI, ethPP, "etherPP is correct")
      //console.log(ethPPInMAI, ethPP)
      const mintAmount = (BN2Int(ethPPInMAI) * 100) / (_ratio);
      //console.log("mintAmount", mintAmount)
      newDebt = roundBN2Str(mintAmount)
      newCollateral = _eth
  
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
      assert.equal(roundBN2Str(tx1.logs[0].args.amount), newDebt, "newDebt is correct")
      assert.equal(tx1.logs[1].event, "Transfer", "Transfer was called");
      assert.equal(tx1.logs[1].args.to, _acc, "To is correct");
      assert.equal(roundBN2Str(tx1.logs[1].args.amount), newDebt, "newDebt is correct")
      assert.equal(tx1.logs[2].event, "NewCDP", "New CDP event was called");
      assert.equal(roundBN2Str(tx1.logs[2].args.debtIssued), newDebt, "newDebt is correct")
      assert.equal(BN2Int(tx1.logs[2].args.collateralHeld), int2Str(newCollateral), "Collateral is correct");
    });
  
    //test balance of account 0 for mai has increased
    it("tests balances of MAI", async () => {
      let addressMAIBal = BN2Int(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, 0, "correct addressMAIBal bal");
  
      let acc0Bal = roundBN2Str(await instanceMAI.balanceOf(_acc))
      assert.equal(acc0Bal, roundBN2Str((+newDebt + +existingDebt)), "correct _acc bal");
  
      let maiSupply = roundBN2Str(await instanceMAI.totalSupply())
      assert.equal(maiSupply, roundBN2Str((+newDebt + +existingDebt)), "correct new supply")
      //console.log(addressMAIBal, acc0Bal, maiSupply)
  
    })
  
    // Test mappings
    it("Tests mappings", async () => {
      CDP = BN2Int(await instanceMAI.mapAddressMemberData(_acc))
  
      let countOfCDPs = await instanceMAI.countOfCDPs()
      assert.equal(countOfCDPs, CDP, "correct countOfCDPs");
  
      let _CDP = BN2Int(await instanceMAI.mapAddressMemberData(_acc))
      assert.equal(_CDP, CDP, "correct mapAddressMemberData");
  
      let mapCDPData = await instanceMAI.mapCDPData(_CDP);
      assert.equal(mapCDPData.collateral, +newCollateral + +existingCollateral, "CDP Collateral")
      assert.equal(roundBN2Str(mapCDPData.debt), roundBN2Str(+newDebt + +existingDebt), "CDP Debt");
      assert.equal(mapCDPData.owner, _acc, "correct owner");
    })
  }
  
  function testFailCDP(_eth, _ratio, _acc) {
  
    it("tests <101 collaterisation fails to open CDP", async () => {
  
      var tx1 = await truffleAssert.reverts(instanceMAI.openCDP(_ratio, { from: _acc, value: _eth }));
  
    });
  }
  
  function addCollateralToCDP(_eth, _acc) {
  
    it("Allows adding to  CDP", async () => {
  
      let CDP = BN2Int(await instanceMAI.mapAddressMemberData(_acc))
      //console.log("CDP", CDP)
      let existingDebt = BN2Int((await instanceMAI.mapCDPData(CDP)).debt)
      //console.log("existingDebt", existingDebt)
      let existingCollateral = new BigNumber((await instanceMAI.mapCDPData(CDP)).collateral)
      const ethPP = getEtherPPinMAI(existingCollateral.plus(_eth))
      const cltrzn  = Math.round((ethPP * 100) / existingDebt)
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
  
      let newCollateral = new BigNumber((await instanceMAI.mapCDPData(CDP)).collateral)
      assert.equal(BN2Int(newCollateral), BN2Int(existingCollateral.plus(_eth)), "New collateral is correct")
    });
  }
  
  function remintMAIFromCDP(_ratio, _acc) {
  
    var newDebt;
  
    it("Allows reminting MAI from CDP", async () => {
  
      let CDP = BN2Int(await instanceMAI.mapAddressMemberData(_acc))
      let existingDebt = BN2Int((await instanceMAI.mapCDPData(CDP)).debt)
      let existingCollateral = new BigNumber((await instanceMAI.mapCDPData(CDP)).collateral)
      const purchasingPower = getEtherPPinMAI(existingCollateral);//how valuable Ether is in MAI
      const maxMintAmount = (purchasingPower * _ratio) / 100;
      const additionalMintAmount = maxMintAmount - existingDebt;
      newDebt = roundBN2Str(additionalMintAmount + existingDebt)
      //console.log(purchasingPower, maxMintAmount, additionalMintAmount)
  
      let tx1 = await instanceMAI.remintMAIFromCDP(_ratio, { from: _acc, to: addressMAI});
      //console.log(tx1.logs[2])
      assert.equal(tx1.logs.length, 3, "three events were triggered");
      assert.equal(tx1.logs[2].event, "UpdateCDP", "UpdateCDP was called");
      assert.equal(tx1.logs[2].args.CDP, CDP, "CDP is correct");
      // //assert.equal(BN2Int(tx1.logs[1].args.time), issuedMai, "amount is correct");
      assert.equal(tx1.logs[2].args.owner, _acc, "owner is correct");
      assert.equal(BN2Int(tx1.logs[2].args.debtAdded), additionalMintAmount, "mint is correct");
      assert.equal(BN2Int(tx1.logs[2].args.collateralAdded), 0, "collateral is correct");
      assert.equal(BN2Int(tx1.logs[2].args.collateralisation), _ratio, "collateralisation is correct");
  
    });
  
      //test balance of account 0 for mai has increased
    it("tests balances of MAI", async () => {
      let addressMAIBal = BN2Int(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, 0, "correct addressMAIBal bal");
  
      let acc0Bal = roundBN2Str(await instanceMAI.balanceOf(_acc))
      assert.equal(acc0Bal, newDebt, "correct _acc bal");
  
      let maiSupply = roundBN2Str(await instanceMAI.totalSupply())
      assert.equal(maiSupply, newDebt, "correct new supply")
      //console.log(addressMAIBal, acc0Bal, maiSupply)
  
    })
  }
  
  function closeCDP(_acc, _bp) {
  
    var debtRemain; var collateralRemain;
    var CDP;
  
    it("Allows closing CDP", async () => {
  
      let accEth1 = BN2Int(await web3.eth.getBalance(_acc))
      CDP = BN2Int(await instanceMAI.mapAddressMemberData(_acc))
      //console.log("CDP", CDP)
      let existingDebt = BN2Int((await instanceMAI.mapCDPData(CDP)).debt)
      //console.log("existingDebt", existingDebt)
      let existingCollateral = new BigNumber((await instanceMAI.mapCDPData(CDP)).collateral)
  
      let debtClosed = existingDebt * (_bp / 10000)
      let collateralReturned = existingCollateral * (_bp / 10000)
  
      debtRemain = existingDebt - debtClosed
      collateralRemain = existingCollateral - collateralReturned
  
      let tx1 = await instanceMAI.closeCDP(_bp, { from: _acc });
      assert.equal(tx1.logs.length, 4, "Three events was triggered");
      assert.equal(tx1.logs[0].event, "Approval", "Correct event");
      assert.equal(tx1.logs[1].event, "Transfer", "Correct event");
      assert.equal(tx1.logs[2].event, "Transfer", "Correct event");
      assert.equal(tx1.logs[3].event, "CloseCDP", "Correct event");
  
      assert.equal(tx1.logs[3].args.CDP, 1, "CDP is correct");
      assert.equal(tx1.logs[3].args.owner, _acc, "Owner is correct");
      assert.equal(BN2Int(tx1.logs[3].args.debtPaid), debtClosed, "Debt is correct");
      assert.equal(BN2Int(tx1.logs[3].args.etherReturned), collateralReturned, "Collateral is correct");
  
      let accBal = await instanceMAI.balanceOf(_acc);
      assert.equal(BN2Int(accBal), debtRemain, "correct acc0 bal");
  
      let maiSupply = await instanceMAI.totalSupply()
      assert.equal(maiSupply, debtRemain, "correct new supply")
  
      const tx = await web3.eth.getTransaction(tx1.tx);
      const gasCost = tx.gasPrice * tx1.receipt.gasUsed;
      //console.log(accEth1, etherReturned, gasCost)
      //console.log((accEth1 + etherReturned) - gasCost)
  
      let accEth2 = roundBN2StrR(await web3.eth.getBalance(_acc), 3)
      assert.equal(accEth2, roundBN2StrR((+accEth1 + +BN2Int(existingCollateral) - gasCost), 3), "gas test")
  
      let accEthMAI = roundBN2Str(await web3.eth.getBalance(addressMAI))
      assert.equal(accEthMAI, roundBN2Str(collateralRemain), "ethaccBal")
  
    })
  
    // Test mappings
    it("Tests mappings", async () => {
  
      let mapCDPData = await instanceMAI.mapCDPData(CDP);
      assert.equal(mapCDPData.collateral, collateralRemain, "correct collateral");
      assert.equal(mapCDPData.debt, debtRemain, "correct debt");
  
    })
  }
  
  function liquidateCDP(_acc, _bp) {
  
      var existingDebt = 0; var existingCollateral = 0; var CDP;
  
    it("Allows liquidation of CDP", async () => {
  
      const CDP = BN2Int(await instanceMAI.mapAddressMemberData.call(_acc))
      existingDebt = BN2Int((await instanceMAI.mapCDPData.call(CDP)).debt)
      existingCollateral = BN2Int((await instanceMAI.mapCDPData.call(CDP)).collateral)
      console.log(existingDebt, existingCollateral)
      const canLiquidate = checkLiquidateCDP(existingCollateral, existingDebt)
      const canLiquidateSC = await instanceMAI.checkLiquidationPoint(CDP)
      assert.equal(canLiquidateSC, canLiquidate, "canLiquidate is correct")
      //console.log('canLiquidate', CDP, existingDebt, existingCollateral, canLiquidate)
  
      if (canLiquidateSC){
        const liquidatedCollateral = roundBN2Str(existingCollateral / (10000 / _bp))
        const debtDeleted = roundBN2Str(existingDebt / (10000 / _bp))
        const maiBought = roundBN2Str((getEtherPPinMAI(liquidatedCollateral)))
        const fee = roundBN2Str(maiBought - debtDeleted)
        console.log(liquidatedCollateral, debtDeleted, maiBought, fee)
  
        console.log(CDP, _bp)
        let tx1 = await instanceMAI.liquidateCDP(CDP, _bp, { from: _acc });
        console.log(tx1.logs)
        assert.equal(tx1.logs.length, 1, "Three events were triggered");
        assert.equal(tx1.logs[0].event, "LiquidateCDP", "Correct event");
        assertLog(roundBN2Str(tx1.logs[0].args.etherSold), liquidatedCollateral, "Correct liquidatedCollateral");
        assertLog(roundBN2Str(tx1.logs[0].args.maiBought), maiBought, "Correct maiBought");
        assertLog(roundBN2Str(tx1.logs[0].args.debtDeleted), debtDeleted, "Correct debtDeleted");
        assertLog(roundBN2Str(tx1.logs[0].args.feeClaimed), fee, "Correct fee");
  
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