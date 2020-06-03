const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const _ = require('./utils.js');
const math = require('./math.js');
const help = require('./helper.js');

var MAI = artifacts.require("MAI.sol");
var USD1 = artifacts.require( "./tokenUSD1.sol");
var USD2 = artifacts.require( "./tokenUSD2.sol");
var USD3 = artifacts.require( "./tokenUSD3.sol");
var USD4 = artifacts.require( "./tokenUSD4.sol");
var USD5 = artifacts.require( "./tokenUSD5.sol");
var USD6 = artifacts.require( "./tokenUSD6.sol");

var arrayInstAnchor = []; var arrayAddrAnchor = []; 
var medianMAIValue;
var arrayPrices =[5];
var instanceMAI; var addressMAI;
var acc0; var acc1; var acc2; var acc3;
var _1 = 1 * 10 ** 18;
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot1 = new BigNumber(1 * 10 ** 17)

const addressETH = "0x0000000000000000000000000000000000000000"
var _dot01 = new BigNumber(1 * 10 ** 16)
var _dot001 = new BigNumber(1 * 10 ** 15)
var _dot0001 = new BigNumber(1 * 10 ** 14)
var _dot00001 = new BigNumber(1 * 10 ** 13)
const usd1 = { "asset": (_dot1 * 1.02).toString(), "mai": (1 * _dot1).toString() }
const usd2 = { "asset": (_dot1 * 1.01).toString(), "mai": (1 * _dot1).toString() }
const usd3 = { "asset": (_dot1 * 1).toString(), "mai": (1 * _dot1).toString() }
const usd4 = { "asset": (_dot1 * 0.98).toString(), "mai": (1 * _dot1).toString() }
const usd5 = { "asset": (_dot1 * 0.97).toString(), "mai": (1 * _dot1).toString() }
const usd6 = { "asset": (_dot1 * 0.99).toString(), "mai": (1 * _dot1).toString() }

var mint;
var burn;

contract('Anchor', function (accounts) {

    constructor(accounts)
    checkValueAnchors()            //===Median price no change
    checkMAIPrice()

    // addAnchor()
    // checkValueAnchors()            //===Median price no change
    // checkMAIPrice()
    swapETHToMAI(_dot001, acc0)    //===Median price no change 
    checkValueAnchors()            
    checkMAIPrice()

    swapMAIToETH(_dot001, acc0)    //===Median price no change 
    checkValueAnchors()            
    checkMAIPrice()

    swapMAIToUSD(_dot0001, acc0, 0)//===Value of USD1 drecreases === MAI ↑ : USD ↓
    checkValueAnchors()            //===Gets bonus
    checkMAIPrice()

    swapMAIToUSD(_dot001, acc0, 1) //===Value of USD2 drecreases === MAI ↑ : USD ↓
    checkValueAnchors()            //===Gets bonus
    checkMAIPrice()

    swapUSDToMAI(_dot001, acc0, 4) //===Value of USD5 increases === MAI ↓ : USD ↑
    checkValueAnchors()           
    checkMAIPrice()

    swapETHToUSD(_dot0001, acc0, 2) //===Value of USD1 drecreases === MAI ↑ : USD ↓
    checkValueAnchors()             //===Gets bonus
    checkMAIPrice()

    swapUSDToETH(_dot01, acc0, 2)  //===Value of USD1 increases === MAI ↓ : USD ↑
    checkValueAnchors()
    checkMAIPrice()

    swapMAIToUSD(_dot01, acc0, 1)//===Value of USD1 drecreases === MAI ↑ : USD ↓
    checkValueAnchors()            //===Gets bonus
    checkMAIPrice()

    
  })
  
  //################################################################
  // CONSTRUCTION
  function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    it("constructor events", async () => {

        var instanceUSD1 = await USD1.deployed();
        var addressUSD1 = instanceUSD1.address;
        arrayInstAnchor.push(instanceUSD1)
        arrayAddrAnchor.push(addressUSD1)
        var instanceUSD2 = await USD2.deployed();
        var addressUSD2 = instanceUSD2.address;
        arrayInstAnchor.push(instanceUSD2)
        arrayAddrAnchor.push(addressUSD2)
        var instanceUSD3 = await USD3.deployed();
        var addressUSD3 = instanceUSD3.address;
        arrayInstAnchor.push(instanceUSD3)
        arrayAddrAnchor.push(addressUSD3)
        var instanceUSD4 = await USD4.deployed();
        var addressUSD4 = instanceUSD4.address;
        arrayInstAnchor.push(instanceUSD4)
        arrayAddrAnchor.push(addressUSD4)
        var instanceUSD5 = await USD5.deployed();
        var addressUSD5 = instanceUSD5.address;
        arrayInstAnchor.push(instanceUSD5)
        arrayAddrAnchor.push(addressUSD5)
        var instanceUSD6 = await USD6.deployed();
        var addressUSD6 = instanceUSD6.address;
        arrayInstAnchor.push(instanceUSD6)
        arrayAddrAnchor.push(addressUSD6)

      instanceMAI = await MAI.deployed();
      addressMAI = instanceMAI.address;
     
///Add anchor exchanges
      await instanceMAI.approve(addressMAI, (usd1.mai), { from: acc0 })
      await arrayInstAnchor[0].approve(addressMAI, (usd1.asset), { from: acc0 })
      await instanceMAI.addAnchor(arrayAddrAnchor[0], (usd1.asset), (usd1.mai), { from: acc0 })
      await instanceMAI.approve(addressMAI, (usd2.mai), { from: acc0 })
      await arrayInstAnchor[1].approve(addressMAI, (usd2.asset), { from: acc0 })
      await instanceMAI.addAnchor(arrayAddrAnchor[1], (usd2.asset), (usd2.mai), { from: acc0 })
      await instanceMAI.approve(addressMAI, (usd3.mai), { from: acc0 })
      await arrayInstAnchor[2].approve(addressMAI, (usd3.asset), { from: acc0 })
      await instanceMAI.addAnchor(arrayAddrAnchor[2], (usd3.asset), (usd3.mai), { from: acc0 })
      await instanceMAI.approve(addressMAI, (usd4.mai), { from: acc0 })
      await arrayInstAnchor[3].approve(addressMAI, (usd4.asset), { from: acc0 })
      await instanceMAI.addAnchor(arrayAddrAnchor[3], (usd4.asset), (usd4.mai), { from: acc0 })
      await instanceMAI.approve(addressMAI, (usd5.mai), { from: acc0 })
      await arrayInstAnchor[4].approve(addressMAI, (usd5.asset), { from: acc0 })
      await instanceMAI.addAnchor(arrayAddrAnchor[4], (usd5.asset), (usd5.mai), { from: acc0 })
     
    });

  }
function addAnchor(){
  it("adds 6 usd", async () => {
      await instanceMAI.approve(addressMAI, (usd6.mai), { from: acc0 })
      await arrayInstAnchor[5].approve(addressMAI, (usd6.asset), { from: acc0 })
      await instanceMAI.addAnchor(arrayAddrAnchor[5], (usd6.asset), (usd6.mai), { from: acc0 })
    });
}

 function checkValueAnchors(){
    it("constructor events", async () => {
    for(var i = 0; i < 5; i++){
      const usdAddress = arrayInstAnchor[i].address;
      const usdName = await arrayInstAnchor[i].name();
      const usdValue = _.BN2Str((await instanceMAI.calcValueInAsset(usdAddress)))
      arrayPrices.push(usdValue);
      console.log(usdName, ":", _.BN2Str(usdValue/_1))
    }
  });
  }
 function checkMAIPrice(){
    it("tests MAI price matches", async () => {
    await instanceMAI.updatePrice();
    var arrayPri=[];
    for(var i = 0; i < 5; i++){
      const usdAddress = arrayInstAnchor[i].address;
      arrayPri[i] = (await help.calcValueInAsset(instanceMAI, usdAddress));
    }
    var  sortedPriceFeed = [];
    sortedPriceFeed = _sortArray(arrayPri);
    medianMAIValue = _.floorBN(sortedPriceFeed[2]);
    var medianMAI = _.BN2Str(await instanceMAI.medianMAIValue())
    assert.equal(medianMAI, medianMAIValue, "prices match")
     console.log('Mai Price: ',_.BN2Str(await instanceMAI.medianMAIValue()/_1))
    })
  }

  function swapETHToMAI(inputAmount, recipient) {
    it("test swap eth to mai", async () => {
      var addressMAI = instanceMAI.address;
      await _handleTransferIn(addressETH, addressMAI, inputAmount, recipient);
  
    })
  }
  function swapMAIToETH(inputAmount, recipient) {
    it("test swap mai to eth", async () => {
      var addressMAI = instanceMAI.address;
      await _handleTransferIn(addressMAI, addressETH, inputAmount, recipient);
  
    })
  }
  function swapUSDToMAI(inputAmount, recipient, usdIndex) {
    it("test swap usd to mai", async () => {
      var instanceUSD = arrayInstAnchor[usdIndex]
      var addressUSD = arrayInstAnchor[usdIndex].address;
      await _handleTransferIn(addressUSD, addressMAI, inputAmount, recipient, instanceUSD);
  
    })
  }
  function swapUSDToETH(inputAmount, recipient, usdIndex) {
    it("test swap usd to eth", async () => {
      var instanceUSD = arrayInstAnchor[usdIndex]
      var addressUSD = arrayInstAnchor[usdIndex].address;
      await _handleTransferIn(addressUSD, addressETH, inputAmount, recipient, instanceUSD);
  
    })
  }
  function swapETHToUSD(inputAmount, recipient, usdIndex) { 
    it("test swap eth to usd"+ (usdIndex+1), async () => {
      var addressUSD = arrayInstAnchor[usdIndex].address;
      var instanceUSD = arrayInstAnchor[usdIndex]
      await _handleTransferIn(addressETH, addressUSD, inputAmount, recipient, instanceUSD);
  
    })
  }
  function swapMAIToUSD(inputAmount, recipient, usdIndex) {
    it("test swap mai to usd" + (usdIndex+1), async () => {
      var instanceUSD = arrayInstAnchor[usdIndex]
      var addressUSD = arrayInstAnchor[usdIndex].address;
      await _handleTransferIn(addressMAI, addressUSD, inputAmount, recipient, instanceUSD);
  
    })
  }

  
  async function _handleTransferIn(assetFrom, assetTo, inputAmount, recipient, usdInstance) {
    let pool_mai_Before;
    let pool_asset_Before;
    let pool2_mai_Before;
    let pool2_asset_Before;
    let recipient_Asset_Before;
    let recipient_Mai_Before = _.getBN(await instanceMAI.balanceOf(recipient));
    let recipient_ETH_Before = _.getBN(await web3.eth.getBalance(recipient));
    
    if (assetFrom == addressETH && assetTo == addressMAI) {
      pool_mai_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetFrom)).balanceMAI);
      pool_asset_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetFrom)).balanceAsset);
    } else if (assetFrom == addressMAI && assetTo == addressETH) {
      pool_mai_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceMAI);
      pool_asset_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceAsset);
    } else {
      recipient_Asset_Before = _.getBN(await usdInstance.balanceOf(recipient));
      pool_mai_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetFrom)).balanceMAI);
      pool_asset_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetFrom)).balanceAsset);
      pool2_mai_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceMAI);
      pool2_asset_Before = _.getBN((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceAsset);
    }

    const [maiAmount, outputAmount] = await _swapTokenToToken(assetFrom, assetTo, inputAmount);

    let swapAsset;
    if (assetFrom == addressETH && assetTo == addressMAI) {
      swapAsset = await instanceMAI.swapTokenToToken(assetFrom, assetTo, inputAmount, { from: recipient, value: inputAmount });
      assert.equal(swapAsset.logs.length, 2, "2 events was triggered");
      assert.equal(swapAsset.logs[0].event, "Swapped", "Correct event");
      assert.equal(swapAsset.logs[0].args.assetTo, assetTo, " asset to is correct");
      assert.equal(swapAsset.logs[0].args.inputAmount, _.BN2Str(inputAmount), " amount sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[0].args.maiAmount), _.BN2Str(_.floorBN(maiAmount)), " amount mai sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[0].args.outPutAmount), _.BN2Str(outputAmount), " output is correct");
      assert.equal(swapAsset.logs[0].args.recipient, recipient, " sender is correct");
      await _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance);
    }
    else if (assetFrom == addressMAI && assetTo == addressETH) {
      swapAsset = await instanceMAI.swapTokenToToken(assetFrom, assetTo, inputAmount, { from: recipient });
      assert.equal(swapAsset.logs.length, 2, "2 events was triggered");
      assert.equal(swapAsset.logs[1].event, "Swapped", "Correct event");
      assert.equal(swapAsset.logs[1].args.assetTo, assetTo, " asset to is correct");
      assert.equal(swapAsset.logs[1].args.inputAmount, _.BN2Str(inputAmount), " amount sent is correct");
      assert.equal(swapAsset.logs[1].args.maiAmount, _.BN2Str(maiAmount), " amount mai sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.outPutAmount), _.BN2Str(_.floorBN(outputAmount)), " output is correct");
      assert.equal(swapAsset.logs[1].args.recipient, recipient, " sender is correct");
      await _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance);
  
    } else if (assetFrom !== addressETH && assetTo == addressMAI) {
      await usdInstance.approve(addressMAI, inputAmount, { from: recipient })
      swapAsset = await instanceMAI.swapTokenToToken(assetFrom, assetTo, inputAmount, { from: recipient })
      assert.equal(swapAsset.logs.length, 3, "3 events was triggered");
      assert.equal(swapAsset.logs[1].event, "Swapped", "Correct event");
      assert.equal(swapAsset.logs[1].args.assetTo, assetTo, " asset to is correct");
      assert.equal(swapAsset.logs[1].args.inputAmount, _.BN2Str(inputAmount), " amount sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.maiAmount), _.BN2Str(_.floorBN(maiAmount)), " amount mai sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.outPutAmount), _.BN2Str(outputAmount), " output is correct");
      assert.equal(swapAsset.logs[1].args.recipient, recipient, " sender is correct");
      await _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance);
    }
    else if (assetFrom == addressMAI && assetTo !== addressETH) {
      swapAsset = await instanceMAI.swapTokenToToken(assetFrom, assetTo, inputAmount, { from: recipient });
      assert.equal(swapAsset.logs.length, 4, "4 events was triggered");
      assert.equal(swapAsset.logs[2].event, "Swapped", "Correct event");
      assert.equal(swapAsset.logs[2].args.assetTo, assetTo, " asset to is correct");
      assert.equal(swapAsset.logs[2].args.inputAmount, _.BN2Str(inputAmount), " amount sent is correct");
      assert.equal(swapAsset.logs[2].args.maiAmount, _.BN2Str(maiAmount), " amount mai sent is correct");
      assert.equal(_.roundBN2StrD(swapAsset.logs[2].args.outPutAmount), _.roundBN2StrD(outputAmount), " output is correct");
      assert.equal(swapAsset.logs[2].args.recipient, recipient, " sender is correct");
      await _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance);
    }
    else if (assetFrom == addressETH && assetTo !== addressMAI){
      await usdInstance.approve(addressMAI, inputAmount, { from: recipient })
      swapAsset = await instanceMAI.swapTokenToToken(assetFrom, assetTo, inputAmount, { from: recipient, value: inputAmount  })
      assert.equal(swapAsset.logs.length, 3, "3 events was triggered");
      assert.equal(swapAsset.logs[1].event, "Swapped", "Correct event");
      assert.equal(swapAsset.logs[1].args.assetTo, assetTo, " asset to is correct");
      assert.equal(swapAsset.logs[1].args.inputAmount, _.BN2Str(inputAmount), " amount sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.maiAmount), _.BN2Str(_.floorBN(maiAmount)), "amount mai sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.outPutAmount), _.BN2Str(_.floorBN(outputAmount)), " output is correct");
      assert.equal(swapAsset.logs[1].args.recipient, recipient, " sender is correct");
      await _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance);
  
    }else {
      await usdInstance.approve(addressMAI, inputAmount, { from: recipient })
      swapAsset = await instanceMAI.swapTokenToToken(assetFrom, assetTo, inputAmount, { from: recipient })
      assert.equal(swapAsset.logs.length, 2, "2 events was triggered");
      assert.equal(swapAsset.logs[0].event, "Transfer", "Correct event");
      assert.equal(swapAsset.logs[1].event, "Swapped", "Correct event");
      assert.equal(swapAsset.logs[1].args.assetTo, assetTo, " asset to is correct");
      assert.equal(swapAsset.logs[1].args.inputAmount, _.BN2Str(inputAmount), " amount sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.maiAmount), _.BN2Str(_.floorBN(maiAmount)), " amount mai sent is correct");
      assert.equal(_.BN2Str(swapAsset.logs[1].args.outPutAmount), _.BN2Str(_.floorBN(outputAmount)), " output is correct");
      assert.equal(swapAsset.logs[1].args.recipient, recipient, " sender is correct");
      await _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance);
  
    }
  
  }
  async function _handleTransferOut(pool_mai_Before, pool_asset_Before, pool2_mai_Before, pool2_asset_Before,recipient_Mai_Before, recipient_ETH_Before, recipient_Asset_Before, inputAmount, assetTo, assetFrom, outputAmount, maiAmount, recipient, usdInstance) {
    let recipient_ETH_After = _.BN2Str(await web3.eth.getBalance(recipient));
    let recipient_Mai_After = _.BN2Str(await instanceMAI.balanceOf(recipient));
    let pool_mai_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetFrom)).balanceMAI);
    let pool_asset_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetFrom)).balanceAsset);
  
    if (assetFrom == addressMAI && assetTo == addressETH) {
      let pool_mai_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceMAI);
      let pool_asset_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceAsset);
      assert.equal(_.roundBN2StrDR((recipient_ETH_After), 2), _.roundBN2StrDR((recipient_ETH_Before.plus(outputAmount)), 2), "correct recipient ETH bal")
      assert.equal(pool_mai_After, _.BN2Str((pool_mai_Before.plus(inputAmount))), " correct Mai in asset:Mai")
      assert.equal(pool_asset_After, _.BN2Str(_.ceilBN(pool_asset_Before.minus(outputAmount))), " correct Ether in asset:Mai")
    } else if (assetTo == addressMAI) {
      assert.equal(recipient_Mai_After, _.BN2Str(_.floorBN(recipient_Mai_Before.plus(maiAmount))), "correct recipient mai bal")
      assert.equal(pool_mai_After, _.BN2Str(_.ceilBN((pool_mai_Before.minus(maiAmount)).plus(outputAmount))), " correct Mai in asset:Mai")
      assert.equal(pool_asset_After, _.BN2Str(pool_asset_Before.plus(inputAmount)), " correct asset bal in asset:Mai")
    } else if (assetFrom == addressETH && assetTo !== addressMAI){
      let recipient_Asset_After = _.BN2Str(await usdInstance.balanceOf(recipient));
      let pool2_mai_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceMAI);
      let pool2_asset_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceAsset);
      assert.equal(_.roundBN2StrDR((recipient_ETH_After), 2), _.roundBN2StrDR((recipient_ETH_Before.plus(outputAmount)), 2), "correct recipient asset1 bal")
      assert.equal(_.roundBN2StrD(recipient_Asset_After), _.roundBN2StrD(recipient_Asset_Before.plus(outputAmount)), "correct recipient asset2 bal")
      assert.equal(_.roundBN2StrD(pool_mai_After), _.roundBN2StrD(pool_mai_Before.minus(maiAmount)), " correct Mai in asset:Mai")
      assert.equal(pool_asset_After, _.BN2Str(pool_asset_Before.plus(inputAmount)), " correct asset bal in asset:Mai")
      assert.equal(pool2_mai_After, _.BN2Str(_.floorBN(pool2_mai_Before.plus(maiAmount).plus(mint))), " correct Mai in asset:Mai")
      assert.equal(_.roundBN2StrD(pool2_asset_After), _.roundBN2StrD(pool2_asset_Before.minus(outputAmount)), " correct asset bal in asset:Mai")
    }else if(assetFrom == addressMAI && assetTo !== addressETH){
      let recipient_Asset_After = _.BN2Str(await usdInstance.balanceOf(recipient));
      let pool_mai_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceMAI);
      let pool_asset_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceAsset);
      assert.equal(recipient_Mai_After, _.BN2Str(recipient_Mai_Before.minus(inputAmount)), "correct recipient mai bal")
      assert.equal(_.roundBN2StrD(recipient_Asset_After), _.roundBN2StrD(recipient_Asset_Before.plus(outputAmount)), "correct recipient asset2 bal")
      assert.equal(_.roundBN2StrD(pool_mai_After), _.roundBN2StrD(pool2_mai_Before.plus(inputAmount).plus(mint)), " correct Mai in asset:Mai")
      assert.equal(_.roundBN2StrD(pool_asset_After), _.roundBN2StrD(pool2_asset_Before.minus(outputAmount))," correct asset bal in asset:Mai")
    }else{
      let recipient_Asset_After = _.BN2Str(await usdInstance.balanceOf(recipient));
      let pool2_mai_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceMAI);
      let pool2_asset_After = _.BN2Str((await instanceMAI.mapAsset_ExchangeData(assetTo)).balanceAsset);
      assert.equal(_.roundBN2StrDR((recipient_ETH_After), 2), _.roundBN2StrDR((recipient_ETH_Before.plus(outputAmount)), 2), "correct recipient asset1 bal")
      assert.equal(recipient_Asset_After, _.BN2Str(recipient_Asset_Before.minus(inputAmount)), "correct recipient asset2 bal")
      assert.equal(_.roundBN2StrD(pool_mai_After), _.roundBN2StrD(pool_mai_Before.minus(maiAmount)), " correct Mai in asset:Mai")
      assert.equal(pool_asset_After, _.BN2Str(pool_asset_Before.plus(inputAmount)), " correct asset bal in asset:Mai")
      assert.equal(pool2_mai_After, _.BN2Str(_.floorBN(pool2_mai_Before.plus(maiAmount))), " correct Mai in asset:Mai")
      assert.equal(pool2_asset_After,  _.BN2Str(_.ceilBN(pool2_asset_Before.minus(outputAmount))) ,"correct asset bal in asset:Mai")
    }
  
  }
  
  async function _swapTokenToToken(_assetFrom, _assetTo, _amount) {
  
    if (_assetFrom == addressMAI) {
      var _m = 0;
      var _y = await _swapMaiToAsset(_assetTo, _amount);
    }
    else if (_assetTo == addressMAI) {
      var _m = await _swapAssetToMai(_assetFrom, _amount);
      var _y = 0;
    }
    else {
      var _m = await _swapAssetToMai(_assetFrom, _amount);
      var _y = await _swapMaiToAsset(_assetTo, _m)
    }
    
    return [_m, _y];
  }
  
  async function _swapMaiToAsset(_assetTo, _amount) {
    var _X = _.getBN((await instanceMAI.mapAsset_ExchangeData(_assetTo)).balanceMAI);
    var _Y = _.getBN((await instanceMAI.mapAsset_ExchangeData(_assetTo)).balanceAsset);
    
    if(_assetTo !== addressETH ){
      var _x = await _adjustAmountIfAnchor(_assetTo, _amount);
      // console.log("made it",_.BN2Str(_x)/_1)
      tradeOutcome(_x);
     _y = await math.calcCLPSwap(_x, _X, _Y);
     }else{
      _y = await math.calcCLPSwap(_amount, _X, _Y);
     }
     
    return _y;
  }
  
  async function _swapAssetToMai(_assetFrom, _x) {
    var _X = _.getBN((await instanceMAI.mapAsset_ExchangeData(_assetFrom)).balanceAsset);
    var _Y = _.getBN((await instanceMAI.mapAsset_ExchangeData(_assetFrom)).balanceMAI);
    _y = await math.calcCLPSwap(_x, _X, _Y);
    return _y;
  }
  
  async function _adjustAmountIfAnchor(_assetTo, _amount){
    let maiValueInAsset = _.getBN((await help.calcValueInAsset(instanceMAI, _assetTo)));
    let delta; let incentiveFactor = 10; var _x = 0;
    //console.log("maiValue in asset",_.BN2Str(maiValueInAsset)/_1)
    let _medianMAIValue = _.getBN(medianMAIValue);
    // console.log("medianMaiValue",_.BN2Str(_medianMAIValue)/_1)
    if(maiValueInAsset.isLessThan(_medianMAIValue)){
        delta = (_medianMAIValue.minus(maiValueInAsset)).div(incentiveFactor);
         // console.log("delt",_.BN2Str(delta)/_1)
        burn = (_amount.times(delta)).div(_medianMAIValue);
         // console.log("burn",_.BN2Str(burn)/_1)
        _x = _amount.minus(burn);
    }
    if (maiValueInAsset.isGreaterThan(_medianMAIValue)){
        delta = (maiValueInAsset.minus(_medianMAIValue)).div(incentiveFactor);
        //  console.log("delt",_.BN2Str(delta)/_1)
        mint = (_amount.times(delta)).div(_medianMAIValue);
        //  console.log("mint",_.BN2Str(mint)/_1)
        _x = _amount.plus(mint);

    } 
    return _x;
}

function _sortArray(array) {
   return array.sort((a, b) => a - b);
}
function tradeOutcome(_x){
console.log("Trade outcome :", (_.BN2Str(_x)/_1));
}
 