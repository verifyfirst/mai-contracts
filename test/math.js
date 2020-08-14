var BigNumber = require('bignumber.js');

 function calcCLPSwap(x, X, Y) {
    // y = (x * Y * X)/(x + X)^2
    const _x = new BigNumber(x)
    const _X = new BigNumber(X)
    const _Y = new BigNumber(Y)
    const numerator = _x.times(_Y).times(_X)
    const denominator = (_x.plus(_X)).times(_x.plus(_X))
    const _y = numerator.div(denominator)
    const y = (new BigNumber(_y));
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
    const y = (new BigNumber(_y)).integerValue(1);
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
    const y = (new BigNumber(_y)).integerValue(1);
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
    const poolUnits = (new BigNumber(_units)).integerValue(1);
    return poolUnits;
  }

  function getLiquidationFee(debt,collateral,depth,balance,liquidation ){
    //console.log(debt,collateral,depth,balance,liquidation)
    const _debt = new BigNumber(debt)
    const _collateral = new BigNumber(collateral)
    const _X = new BigNumber(balance)
    const _Y = new BigNumber(depth)
    const liquid = new BigNumber(liquidation)
    const basisPoints = new BigNumber(10000);
    const liquidatedCollateral = (_collateral.times(liquid)).div(basisPoints);
    const debtDeleted = (_debt.times(liquid)).div(basisPoints);
    const maiBought = calcCLPSwap(liquidatedCollateral, _X, _Y);
    const fee = maiBought - debtDeleted;
    //console.log(fee)
  return fee
  }

  function percentDifference (x,y){
    const two = new BigNumber(2)
    const hund = new BigNumber(100)
    const _x = new BigNumber(x)
    const _y = new BigNumber(y)
    const denom = _x.minus(_y)
    const numer = _x.plus(_y)
    const numerator = numer.div(two)
    const final = denom.div(numerator)
    const diff = final.times(hund)
    return diff
  }


  
module.exports = {
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
},
getLiquidationFee: function(a, A, m, M, b) {
  return getLiquidationFee(a, A, m, M, b)
}
,
percentDifference: function(x,y) {
  return percentDifference(x,y)
}
};


  


