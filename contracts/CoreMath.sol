pragma solidity ^0.6.4;
library SafeMath {
 function sub(uint a, uint b) internal pure returns (uint) {
  assert(b <= a);
  return a - b;
  }

 function add(uint a, uint b) internal pure returns (uint)   {
  uint c = a + b;
  assert(c >= a);
  return c;
  }
  function mul(uint a, uint b) internal pure returns (uint) {
      if (a == 0) {
          return 0;
      }
      uint c = a * b;
      require(c / a == b, "SafeMath: multiplication overflow");
      return c;
  }

  function div(uint a, uint b) internal pure returns (uint) {
      return div(a, b, "SafeMath: division by zero");
  }

  function div(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
      require(b > 0, errorMessage);
      uint c = a / b;
      return c;
  }
}

contract CoreMath {
    using SafeMath for uint;
    function calcCLPSwap(uint x, uint X, uint Y) external  pure returns (uint y){
        uint numerator = x.mul(Y.mul(X));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function calcCLPFee(uint x, uint X, uint Y) external  pure returns (uint y){
        uint numerator = x.mul(Y.mul(x));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function calcCLPLiquidation(uint x, uint X, uint Y) external  pure returns (uint y){
        uint numerator = (x.mul(Y.mul(X.sub(x))));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function calcStakeUnits(uint a, uint A, uint m, uint M) external  pure returns (uint units){
        uint numerator1 = M.add(A);
        uint numerator2 = m.mul(A);
        uint numerator3 = M.mul(a);
        uint numerator = numerator1.mul((numerator2.add(numerator3)));
        uint denominator = 4 * (M.mul(A));
        units = numerator.div(denominator);
        return units;
    }
}