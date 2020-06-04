var BigNumber = require('bignumber.js');

async function calcCLPSwap(x, X, Y) {
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
}
};


  


