var BigNumber = require('bignumber.js');
var _1 = 1 * 10 ** 18; // 1 ETH
const _1BN = new BigNumber(1 * 10 ** 18)
const addressETH = "0x0000000000000000000000000000000000000000"
const MAI = artifacts.require("MAI.sol");
const USD = artifacts.require("tokenUSD.sol");
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
var assetBal; 
var maiBal;
var addressUSD;
construct();

async function construct(){
  instanceMAI = await MAI.deployed();
  instanceUSD = await USD.new();
  addressUSD = instanceUSD.address;
}
  async function calcValueInMai(token) {
    
    var result
    if (token == addressETH) {
    assetBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(token)).balanceAsset);
    maiBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(token)).balanceMAI);
      result = (_1BN.times(maiBal)).div(assetBal)
    } else {
    assetBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(token)).balanceAsset);
    maiBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(token)).balanceMAI);
      result = (_1BN.times(maiBal)).div(assetBal)
    }
    return result.toFixed()
  }

  async function calcValueInAsset(){
    usdBal = new BigNumber(usdPool.asset)
    maiBal = new BigNumber(usdPool.mai)
    return ((_1BN.times(usdBal)).div(maiBal)).toFixed()
  }
   
  
   async function calcEtherPriceInUSD(amount) {
    const _amount = new BigNumber(amount)
    const etherPriceInMai = new BigNumber(await calcValueInMai(addressETH))
    const maiPriceInUSD = new BigNumber(await calcValueInAsset())
    const ethPriceInUSD = (maiPriceInUSD.times(etherPriceInMai)).div(_1BN)
    return ((_amount.times(ethPriceInUSD)).div(_1BN)).toFixed()
  }
  
  async function calcEtherPPinMAI(amount) {
    assetBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
    maiBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
    const outputMai = calcCLPSwap(amount, assetBal, maiBal);
    return outputMai;
  }
  
   async function calcMAIPPInUSD(amount) {
    usdBal = new BigNumber(usdPool.asset)
    maiBal = new BigNumber(usdPool.mai)
    const outputUSD = calcCLPSwap(amount.toString(), maiBal, usdBal);
    return outputUSD;
  }
  
   async function checkLiquidateCDP(_collateral, _debt){
    assetBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceAsset);
    maiBal = new BigNumber((await instanceMAI.mapAsset_ExchangeData(addressETH)).balanceMAI);
    const outputMai = calcCLPLiquidation(_collateral, assetBal, maiBal);
    //console.log("details", outputMai, _debt)
    var canLiquidate
    if(outputMai < _debt) {
        canLiquidate = true;
    } else {
        canLiquidate = false;
    }
    return canLiquidate;
  }
  
function calcCLPSwap(x, X, Y) {
    // y = (x * Y * X)/(x + X)^2
    const _x = new BigNumber(x)
    const _X = new BigNumber(X)
    const _Y = new BigNumber(Y)
    const numerator = _x.times(_Y).times(_X)
    const denominator = (_x.plus(_X)).times((_x.plus(_X)))
    const _y = numerator.div(denominator)
    const y = +(new BigNumber(_y)).toFixed();
    return y;
  }
  
   function calcCLPFee(x, X, Y) {
    // y = (x * Y * x) / (x + X)^2
    const _x = new BigNumber(x)
    const _X = new BigNumber(X)
    const _Y = new BigNumber(Y)
    const numerator = _x.times(_Y.times(_x));
    const denominator = (_x.plus(_X)).times(_x.plus(_X));
    const _y = numerator.div(denominator);
    const y = +(new BigNumber(_y)).toFixed();
    return y;
  }
  
   function calcCLPLiquidation(x, X, Y) {
    // y = (x * Y * (X - x))/(x + X)^2
    const _x = new BigNumber(x)
    const _X = new BigNumber(X)
    const _Y = new BigNumber(Y)
    const numerator = _x.times(_Y.times(_X.minus(_x)));
    const denominator = (_x.plus(_X)).times(_x.plus(_X));
    const _y = numerator.div(denominator);
    const y = +(new BigNumber(_y)).toFixed();
    return y;
  }
  function calcPoolUnits(a, A, m, M) {
     // ((M + A) * (m * A + M * a))/(4 * M * A)
    const _m = new BigNumber(m);
    const _a = new BigNumber(a);
    const _M = new BigNumber(M);
    const _A = new BigNumber(A);
    const numerator1 = _M.plus(_A);
    const numerator2 = _m.times(_A);
    const numerator3 = _M.times(_a);
    const numerator = numerator1.times((numerator2.plus(numerator3)));
    const denominator = 4 * (_M.times(_A));
    const _units = numerator.div(denominator);
    const poolUnits = +(new BigNumber(_units)).toFixed();
    return poolUnits;
  }


  
    
  
  

module.exports = {
  calcValueInMai: function(token) {
      return calcValueInMai(token)
  },
  calcValueInAsset: function() {
    return calcValueInAsset()
},
calcEtherPriceInUSD: function(amount) {
  return calcEtherPriceInUSD(amount)
},
calcEtherPPinMAI: function(amount) {
  return calcEtherPPinMAI(amount)
},
calcMAIPPInUSD: function(amount) {
  return calcMAIPPInUSD(amount)
},
checkLiquidateCDP: function(_collateral, _debt) {
  return checkLiquidateCDP(_collateral, _debt)
},
calcCLPSwap: function(x, X, Y) {
  return calcCLPSwap(x, X, Y)
},
calcCLPFee: function(x, X, Y) {
  return calcCLPFee(x, X, Y)
},
calcCLPLiquidation: function(x, X, Y) {
  return calcCLPLiquidation(x, X, Y)
},
calcPoolUnits: function(a, A, m, M) {
  return calcPoolUnits(a, A, m, M)
}

};


  


