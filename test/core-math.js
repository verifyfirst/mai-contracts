
var BigNumber = require('bignumber.js');
var _1 = 1 * 10 ** 18; // 1 ETH
const _1BN = new BigNumber(1 * 10 ** 18)
var _dot01 = new BigNumber(1 * 10 ** 16)
const addressETH = "0x0000000000000000000000000000000000000000"
var addressUSD;
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }


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
    return outputMai;
  }
  
   function getMAIPPInUSD(amount) {
    const usdBal = usdPool.asset
    const maiBal = usdPool.mai
  
    const outputUSD = _getCLPSwap(amount.toString(), maiBal, usdBal);
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
    const _x = new BigNumber(x)
    const _X = new BigNumber(X)
    const _Y = new BigNumber(Y)
    const numerator = _x.times(_Y).times(_X)
    const denominator = (_x.plus(_X)).times((_x.plus(_X)))
    const _y = numerator.div(denominator)
    const y = +(new BigNumber(_y)).toFixed();
    return y;
  }
  
   function _getCLPFee(x, X, Y) {
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
  
   function _getCLPLiquidation(x, X, Y) {
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
  function _getPoolUnits(a, A, m, M) {
     // ((M + A) * (m * A + M * a))/(4 * M * A

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
  getValueInMai: function(token) {
      return getValueInMai(token)
  },
  getValueInAsset: function(token) {
    return getValueInAsset(token)
},
getEtherPriceInUSD: function(amount) {
  return getEtherPriceInUSD(amount)
},
getEtherPPinMAI: function(amount) {
  return getEtherPPinMAI(amount)
},
getMAIPPInUSD: function(amount) {
  return getMAIPPInUSD(amount)
},
checkLiquidateCDP: function(_collateral, _debt) {
  return checkLiquidateCDP(_collateral, _debt)
},
_getCLPSwap: function(x, X, Y) {
  return _getCLPSwap(x, X, Y)
},
_getCLPFee: function(x, X, Y) {
  return _getCLPFee(x, X, Y)
},
_getCLPLiquidation: function(x, X, Y) {
  return _getCLPLiquidation(x, X, Y)
},
_getPoolUnits: function(a, A, m, M) {
  return _getPoolUnits(a, A, m, M)
}

};


  


