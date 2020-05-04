pragma solidity 0.6.4;

import "@nomiclabs/buidler/console.sol";
//ERC20 Interface nice
interface ERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address, uint) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address, uint) external returns (bool);
    function transferFrom(address, address, uint) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
}
//Safe mathematics
library SafeMath {
 function sub(uint256 a, uint256 b) internal pure returns (uint256) {
  assert(b <= a);
  return a - b;
  }

 function add(uint256 a, uint256 b) internal pure returns (uint256)   {
  uint256 c = a + b;
  assert(c >= a);
  return c;
  }
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
      if (a == 0) {
          return 0;
      }
      uint256 c = a * b;
      require(c / a == b, "SafeMath: multiplication overflow");
      return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
      return div(a, b, "SafeMath: division by zero");
  }

  function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
      require(b > 0, errorMessage);
      uint256 c = a / b;
      return c;
  }
}
contract Mai is ERC20{

    using SafeMath for uint256;
    //Token Details
    string public name = "Mai Coin";
    string public symbol = "MAI";
    uint256 public decimals  = 18;
    uint256 public override totalSupply;
    uint256 public _1 = 10**decimals;

    bool private notEntered;

    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;
    mapping(uint256 => CDPData) public mapCDPData;
    mapping(address => MemberData) public mapAddressMemberData;

    uint32 public countOfCDPs;
    uint public minCollaterisation;
    uint256 public defaultCollateralisation = 150;
    uint256 public etherPrice;

    struct MemberData {
        address[] exchanges;
        uint32 CDP;
    }

    struct CDPData {
        uint256 collateral;
        uint256 debt;
        address payable owner;
    }

    mapping(address => ExchangeData) public mapTokenExchangeData;
    address[] public exchanges;
    struct ExchangeData {
        bool listed;
        uint256 maiBalance;
        uint256 assetBalance;
        // address[] stakers;
        // uint256 poolUnits;
        // mapping(address => uint256) stakerUnits;
    }

    // Events
    event NewCDP(uint32 CDP, uint time, address owner, uint256 debtIssued, uint256 collateralHeld, uint256 collateralisation);
    event UpdateCDP(uint32 CDP, uint time, address owner, uint256 debtAdded, uint256 collateralAdded, uint256 collateralisation);
    event CloseCDP(uint32 CDP, uint time, address owner, uint256 debtPaid, uint256 etherReturned);
    event LiquidateCDP(uint32 CDP, uint time, address liquidator, uint256 liquidation, uint256 etherSold, uint256 maiBought, uint256 debtDeleted, uint256 feeClaimed);
    event Transfer (address indexed from, address indexed to, uint256 amount);
    event Approval ( address indexed owner, address indexed spender, uint256 amount);

    event Testing1 (uint256 val1);
    event Testing2 (uint256 val1, uint256 val2);
    event Testing3 (uint256 val1, uint256 val2, uint256 val3);

    function transfer(address to, uint256 amount) public override  returns (bool success) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    function approve(address spender, uint256 amount) public override  returns (bool success) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    function _approve(address _approver, address _spender, uint256 _amount) internal returns (bool success){
        allowance[_approver][_spender] = _amount;
        emit Approval(_approver, _spender, _amount);
        return true;
    }
    //Transfer function
    function _transfer(address _from, address _to, uint256 _amount) internal returns (bool success) {
        require(balanceOf[_from] >= _amount,'Sender must have enough to spend');
        balanceOf[_from] = balanceOf[_from].sub(_amount);
        balanceOf[_to] = balanceOf[_to].add(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    //Delegate a Transfer
    function transferFrom(address from, address to, uint256 amount) public override returns (bool success) {
        require(amount <= allowance[from][to], 'Sender must have enough allowance to send');
        allowance[from][to] = allowance[from][to].sub(amount);
        _transfer(from, to, amount);
        return true;
    }

    function _mint(uint256 _amount) internal returns (bool success){
        require(_amount > 0);
        totalSupply = totalSupply.add(_amount);
        balanceOf[address(this)] = balanceOf[address(this)].add(_amount);
        emit Transfer(address(0), address(this), _amount);
        return true;
    }

    function _burn(uint256 _amount) internal returns (bool success){
        require (_amount > 0); require (_amount <= balanceOf[address(this)]);
        totalSupply = totalSupply.sub(_amount);
        balanceOf[address(this)] = balanceOf[address(this)].sub(_amount);
        emit Transfer(address(this), address(0), _amount);
        return true;
    }

    constructor () public {
        notEntered = true;

        //Ether pool
        mapTokenExchangeData[address(0)].maiBalance = 1500*_1;
        mapTokenExchangeData[address(0)].assetBalance = 10*_1;
        mapTokenExchangeData[address(0)].listed = true;
        exchanges.push(address(0));
        minCollaterisation = 101;

        // USD pool
        mapTokenExchangeData[address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812)].maiBalance = 1100*_1;
        mapTokenExchangeData[address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812)].assetBalance = 1000*_1;
        mapTokenExchangeData[address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812)].listed = true;
        exchanges.push(address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812));
    }


    receive() external payable {
      require (msg.value > 0, 'Must be more than 0 to open CDP');
      _manageCDP(msg.sender, msg.value, defaultCollateralisation);
    }

    function openCDP(uint256 collateralisation) public payable returns (bool success) {
      require (msg.value > 0, 'Must be more than 0 to open CDP');
      require (collateralisation >= minCollaterisation, "Must be greater than 101%");
      _manageCDP(msg.sender, msg.value, collateralisation);
      return true;
    }

    function addCollateralToCDP() public payable returns (bool success) {
        require (msg.value > 0, 'Must be more than 0 to open CDP');
        uint32 CDP = mapAddressMemberData[msg.sender].CDP;
        require (CDP > 0, "Must be an owner already");
        mapCDPData[CDP].collateral += msg.value;
        uint256 purchasingPower = getEtherPPinMAI(mapCDPData[CDP].collateral);//how valuable Ether is in MAI
        uint256 collateralisation = ((purchasingPower).mul(100)).div(mapCDPData[CDP].debt);
        emit UpdateCDP(CDP, now, msg.sender, 0, msg.value, collateralisation);
        return true;
    }

    function remintMAIFromCDP(uint256 collateralisation) public payable returns (bool success) {
        require (collateralisation >= minCollaterisation, "Must be greater than 101%");
        uint32 CDP = mapAddressMemberData[msg.sender].CDP;
        require (CDP != 0, "Must be an owner already");
        uint256 collateral = mapCDPData[CDP].collateral;
        uint256 purchasingPower = getEtherPPinMAI(collateral);//how valuable Ether is in MAI
        uint256 maxMintAmount = (purchasingPower.mul(collateralisation)).div(100);
        uint256 additionalMintAmount = maxMintAmount.sub(mapCDPData[CDP].debt);
        mapCDPData[CDP].debt += additionalMintAmount;
        _mint(additionalMintAmount);
        require (_transfer(address(this), msg.sender, additionalMintAmount), 'Must transfer mint amount to sender');
        emit UpdateCDP(CDP, now, msg.sender, additionalMintAmount, 0, collateralisation);
        return true;
    }

    function _manageCDP(address payable _owner, uint256 _value, uint256 _collateralisation) internal returns (bool success){
      uint256 purchasingPower = getEtherPPinMAI(_value);//how valuable Ether is in USD
      uint256 mintAmount = (purchasingPower.mul(100)).div(_collateralisation);
      //uint256 mintAmount = 100000000000;
      uint32 CDP = mapAddressMemberData[_owner].CDP;
      if (CDP != 0) {
          mapCDPData[CDP].collateral += _value;
          mapCDPData[CDP].debt += mintAmount;
      } else {
          countOfCDPs += 1;
          CDP = countOfCDPs;
          mapAddressMemberData[_owner].CDP = CDP;
          mapCDPData[CDP].collateral = _value;
          mapCDPData[CDP].debt = mintAmount;
          mapCDPData[CDP].owner = _owner;
      }
      _mint(mintAmount);
      require (_transfer(address(this), _owner, mintAmount), 'Must transfer mint amount to sender');
      emit NewCDP(CDP, now, _owner, mintAmount, _value, _collateralisation);
      return true;
    }

    function closeCDP(uint256 _liquidation) public returns (bool success){
      uint32 CDP = mapAddressMemberData[msg.sender].CDP;
      require(CDP != 0, 'CDP must exist'); //require CDP exists
      require(_liquidation > 0, 'Liquidation must be greater than 0'); //require liquidation to be greater than 0
      require(_liquidation <= 10000, 'Liquidation must be less than 10k');
      uint256 debt = mapCDPData[CDP].debt;
      uint256 basisPoints = 10000;
      uint256 closeAmount = debt.div(basisPoints.div(_liquidation));
      uint256 collateral = mapCDPData[CDP].collateral;
      uint256 returnAmount = collateral.div(basisPoints.div(_liquidation));
      require(Mai._approve(msg.sender, address(this), closeAmount), 'Must approve first');
      require(Mai.transferFrom(msg.sender, address(this), closeAmount), 'must collect debt');
      require(_burn(closeAmount), 'Must burn debt');
      mapCDPData[CDP].debt -= closeAmount;
      mapCDPData[CDP].collateral -= returnAmount;
      msg.sender.transfer(returnAmount);
      emit CloseCDP(CDP, now, msg.sender, closeAmount, returnAmount);
      return true;
    }

    function liquidateCDP(uint32 CDP, uint256 liquidation) public returns (bool success){
        require(CDP > 0, "must be greater than 0");
        require(CDP <= countOfCDPs, "must exist");
        require(liquidation > 0, 'Liquidation must be greater than 0'); //require liquidation to be greater than 0
        require(liquidation <= 3333, 'Liquidation must be less than 33%');
        if (checkLiquidationPoint(CDP)){
            uint256 collateral = mapCDPData[CDP].collateral;
            uint256 debt = mapCDPData[CDP].debt;
            uint256 basisPoints = 10000;
            uint256 liquidatedCollateral = collateral.div(basisPoints.div(liquidation));
            uint256 debtDeleted = debt.div(basisPoints.div(liquidation));
            //TODO actually sell it
            uint256 maiBought = getEtherPPinMAI(liquidatedCollateral);
            uint256 fee = maiBought - debtDeleted;
            mapCDPData[CDP].collateral -= liquidatedCollateral;
            mapCDPData[CDP].debt -= debtDeleted;
            emit LiquidateCDP(CDP, now, msg.sender, liquidation, liquidatedCollateral, maiBought, debtDeleted, fee);
            _burn(debtDeleted);
            //require(_transfer(address(this), address(msg.sender), fee), "must transfer fee");
            return true;
        }   else {
            return false;
        }
    }

   function getValueInMai(address token) public view returns (uint256 price){
       uint256 assetBal = mapTokenExchangeData[token].assetBalance;
       uint256 maiBal = mapTokenExchangeData[token].maiBalance;
       return (_1.mul(maiBal)).div(assetBal);
   }

    function getValueInAsset(address token) public view returns (uint256 price){
       uint256 assetBal = mapTokenExchangeData[token].assetBalance;
       uint256 maiBal = mapTokenExchangeData[token].maiBalance;
       return (_1.mul(assetBal)).div(maiBal);
   }

   function getEtherPriceInUSD(uint256 amount) public view returns (uint256 amountBought){
       uint256 etherPriceInMai = getValueInMai(address(0));
       uint256 maiPriceInUSD = getValueInAsset(address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812));
       uint256 ethPriceInUSD = maiPriceInUSD.mul(etherPriceInMai).div(_1);//
        //emit Testing3(etherPriceInMai, maiPriceInUSD, ethPriceInUSD);
       return (amount.mul(ethPriceInUSD)).div(_1);
   }

   function getEtherPPinMAI(uint256 amount) public view returns (uint256 amountBought){
        uint256 etherBal = mapTokenExchangeData[address(0)].assetBalance;
        uint256 maiBal = mapTokenExchangeData[address(0)].maiBalance;

        uint256 outputMai = getCLPSwap(amount, etherBal, maiBal);
       // uint256 outputUSD = getMAIPPInUSD(outputMai);
        return outputMai;
   }

      function getMAIPPInUSD(uint256 amount) public view returns (uint256 amountBought){
        uint256 maiBal = mapTokenExchangeData[address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812)].maiBalance;
        uint256 usdBal = mapTokenExchangeData[address(0xA29713944a53ed8A220a4c96cA62EFfaa23BE812)].assetBalance;

        uint256 outputUSD = getCLPSwap(amount, maiBal, usdBal);
        return outputUSD;
   }

   function checkLiquidationPoint(uint256 CDP) public view returns (bool canLiquidate){
        uint256 collateral = mapCDPData[CDP].collateral;
        uint256 debt = mapCDPData[CDP].debt;
        uint256 etherBal = mapTokenExchangeData[address(0)].assetBalance;
        uint256 maiBal = mapTokenExchangeData[address(0)].maiBalance;
        uint256 outputMai = getCLPLiquidation(collateral, etherBal, maiBal);
        if(outputMai < debt) {
            canLiquidate = true;
        } else {
            canLiquidate = false;
        }
        return canLiquidate;
   }

   //##############################################

    function getCLPSwap(uint256 x, uint256 X, uint256 Y) public pure returns (uint256 y){
        // y = (x * Y * X)/(x + X)^2
        uint256 numerator = x.mul(Y.mul(X));
        uint256 denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function getCLPFee(uint256 x, uint256 X, uint256 Y) public pure returns (uint256 y){
        // y = (x * Y * x) / (x + X)^2
        uint256 numerator = x.mul(Y.mul(x));
        uint256 denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function getCLPLiquidation(uint256 x, uint256 X, uint256 Y) public pure returns (uint256 y){
        // y = (x * Y * (X - x))/(x + X)^2
        uint256 numerator = x.mul(Y.mul(X.sub(x)));
        uint256 denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }
}
