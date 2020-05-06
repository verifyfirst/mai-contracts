var MAI = artifacts.require("./MAI.sol");
var USD = artifacts.require("./tokenUSD.sol");

const tools = require('./core-math.js')
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
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
const initialMAI = 4 * _1; const initialETH = 3*10**16;


contract('MAI', function (accounts) {

    constructor(accounts)
      checkMath(_dot001)
    //  checkPrices(_dot001)
    // openCDP(_dot001, 110, acc1) // <- gets 0.15
    // logAccounts(acc1)
    // logPools(_1)
    //  liquidateCDP(acc1, 3333)    // <- someone else gets MAI deleted
    // openCDP(_dot001, 110, acc1) // <- gets another 0.15 -> 0.3
    // openCDP(_dot001, 110, acc1)
    // testFailCDP(_dot001, 100, acc1)
    //  closeCDP(acc1, 5000)
    // openCDP(_dot001, 150, acc1)
    // addCollateralToCDP(_dot001, acc1)
    // remintMAIFromCDP(101, acc1)
    // closeCDP(acc1, 10000)
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
    assert.equal(supply, 4*_1, "supply is correct")
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


  //################################################################
  // MATH
  function checkMath(_val) {
    it("Checks core math", async () => {
      const output = help.BN2Int(await instanceMAI.getCLPSwap(help.int2Str(_val), help.int2Str(etherPool.asset), help.int2Str(etherPool.mai)))
      const _output = await tools._getCLPSwap(_val, +etherPool.asset, +etherPool.mai)
      assert.equal(output, _output, "swap is correct")
      const fee = help.BN2Int(await instanceMAI.getCLPFee(help.int2Str(_val), help.int2Str(etherPool.asset), help.int2Str(etherPool.mai)))
      const _fee = await tools._getCLPFee(_val, +etherPool.asset, +etherPool.mai)
      assert.equal(fee, _fee, "fee is correct")
      const liquidation = help.BN2Int(await instanceMAI.getCLPLiquidation(help.int2Str(_val), help.int2Str(etherPool.asset), help.int2Str(etherPool.mai)))
      const _liquidation = await tools._getCLPLiquidation(_val, +etherPool.asset, +etherPool.mai)
      assert.equal(liquidation, _liquidation, "liquidation is correct")
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
  
    })
  }
  
  //################################################################
  // CDP INTERACTIONS
  function openCDP(_eth, _ratio, _acc) {
  
    var existingDebt = 0; var existingCollateral = 0; var CDP;
    var newDebt; var newCollateral; var acc0Bal;
  
    it("Allows opening CDP", async () => {
      const CDP = BN2Int(await instanceMAI.mapAddress_MemberData.call(_acc))
      if (CDP > 0) {
        existingDebt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
        existingCollateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
      }
      const ethPPInMAI = BN2Int(await instanceMAI.getEtherPPinMAI(int2Str(_eth)))
      const ethPP = BN2Int(getEtherPPinMAI(int2Str(_eth)).toFixed())
      assert.equal(ethPPInMAI, ethPP, "etherPP is correct")
      const mintAmount = (ethPPInMAI * 100) / (_ratio);
      newDebt = roundBN2StrD(mintAmount)
      newCollateral = _eth
      acc0Bal = BN2Int(await instanceMAI.balanceOf(_acc))
  
      var tx1;
      if (_ratio === 150) {
        tx1 = await instanceMAI.send(_eth, { from: _acc });
      } else {
        tx1 = await instanceMAI.openCDP(_ratio, { from: _acc, value: _eth });
      }

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
    });
  
    //test balance of account 0 for mai has increased
    it("tests balances of MAI", async () => {
      let addressMAIBal = BN2Int(await instanceMAI.balanceOf(addressMAI))
      assert.equal(addressMAIBal, initialMAI, "correct addressMAIBal bal");
  
      let acc0Bal1 = BN2Int(await instanceMAI.balanceOf(_acc))
      assert.equal(roundBN2StrDR(acc0Bal1, 10), roundBN2StrDR((+acc0Bal + +newDebt),10), "correct _acc bal");
  
      let maiSupply = BN2Int(await instanceMAI.totalSupply())
      assert.equal(roundBN2StrD(maiSupply), roundBN2StrD((+acc0Bal + +newDebt + initialMAI)), "correct new supply")
  
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
      let existingDebt = BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
      let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
      const ethPP = getEtherPPinMAI(existingCollateral.plus(_eth))
      const cltrzn  = Math.floor((ethPP * 100) / existingDebt)

      let tx1 = await instanceMAI.addCollateralToCDP({ from: _acc, to: addressMAI, value: _eth });
      assert.equal(tx1.logs.length, 1, "one event was triggered");
      assert.equal(tx1.logs[0].event, "UpdateCDP", "UpdateCDP was called");
      assert.equal(tx1.logs[0].args.CDP, CDP, "CDP is correct");
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
      accBal0 = roundBN2StrD(await instanceMAI.balanceOf(_acc))
      maiSupply0 = BN2Int(await instanceMAI.totalSupply())

      let tx1 = await instanceMAI.remintMAIFromCDP(_ratio, { from: _acc, to: addressMAI});
      assert.equal(tx1.logs.length, 3, "three events were triggered");
      assert.equal(tx1.logs[2].event, "UpdateCDP", "UpdateCDP was called");
      assert.equal(tx1.logs[2].args.CDP, CDP, "CDP is correct");
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
    })
  }
  
  function closeCDP(_acc, _bp) {
  
    var debtRemain; var collateralRemain;
    var CDP; var accBal0; var maiSupply0; var balMAI0;
  
    it("Allows closing CDP", async () => {
      let accEth1 = BN2Int(await web3.eth.getBalance(_acc))
      CDP = BN2Int(await instanceMAI.mapAddress_MemberData(_acc))
      let existingDebt = BN2Int((await instanceMAI.mapCDP_Data(CDP)).debt)
     
      let existingCollateral = new BigNumber((await instanceMAI.mapCDP_Data(CDP)).collateral)
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
      const canLiquidate = checkLiquidateCDP(existingCollateral, existingDebt)
      const canLiquidateSC = await instanceMAI.checkLiquidationPoint(CDP)
      assert.equal(canLiquidateSC, canLiquidate, "canLiquidate is correct")
  
      if (canLiquidateSC){
        const liquidatedCollateral = roundBN2StrD(existingCollateral / (10000 / _bp))
        const debtDeleted = roundBN2StrD(existingDebt / (10000 / _bp))
        const maiBought = roundBN2StrD((getEtherPPinMAI(liquidatedCollateral)))
        const fee = roundBN2StrD(maiBought - debtDeleted)

        let tx1 = await instanceMAI.liquidateCDP(CDP, _bp, { from: _acc });
        assert.equal(tx1.logs.length, 1, "Three events were triggered");
        assert.equal(tx1.logs[0].event, "LiquidateCDP", "Correct event");
        assertLog(roundBN2StrD(tx1.logs[0].args.etherSold), liquidatedCollateral, "Correct liquidatedCollateral");
        assertLog(roundBN2StrD(tx1.logs[0].args.maiBought), maiBought, "Correct maiBought");
        assertLog(roundBN2StrD(tx1.logs[0].args.debtDeleted), debtDeleted, "Correct debtDeleted");
        assertLog(roundBN2StrD(tx1.logs[0].args.feeClaimed), fee, "Correct fee");

        const finalDebt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
        const finalCollateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)

        let acc0Bal = BN2Int(await instanceMAI.balanceOf(_acc))
      }
    })
  
  }
  
 