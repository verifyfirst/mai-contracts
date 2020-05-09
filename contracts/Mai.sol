pragma solidity 0.6.4;

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
contract MAI is ERC20{
    using SafeMath for uint256;
    string public name = "MAI Asset";
    string public symbol = "MAI";
    uint256 public decimals  = 18;
    uint256 public override totalSupply;
    uint256 public _1 = 10**decimals;

    bool private notEntered;

    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    
    uint256 public minCollaterisation;
    uint256 public defaultCollateralisation;
    uint256 public etherPrice;
    address exchangeUSD;
    uint256 public mintedMAI;
    uint256 public pooledMAI;

    mapping(address => MemberData) public mapAddress_MemberData;
    address[] public members;
    struct MemberData {
        address[] exchanges;
        uint256 CDP;
    }

    mapping(uint256 => CDPData) public mapCDP_Data;
    uint256 public countOfCDPs;
    struct CDPData {
        uint256 collateral;
        uint256 debt;
        address payable owner;
    }

    mapping(address => ExchangeData) public mapAsset_ExchangeData;
    address[] public exchanges;
    struct ExchangeData {
        bool listed;
        uint256 balanceMAI;
        uint256 balanceAsset;
        address[] stakers;
        uint256 poolUnits;
        mapping(address => uint256) stakerUnits;
    }

    // Events
    event Transfer (address indexed from, address indexed to, uint256 amount);
    event Approval ( address indexed owner, address indexed spender, uint256 amount);

    event NewCDP(uint256 CDP, uint256 time, address owner, uint256 debtIssued, uint256 collateralHeld, uint256 collateralisation);
    event UpdateCDP(uint256 CDP, uint256 time, address owner, uint256 debtAdded, uint256 collateralAdded, uint256 collateralisation);
    event CloseCDP(uint256 CDP, uint256 time, address owner, uint256 debtPaid, uint256 etherReturned);
    event LiquidateCDP(uint256 CDP, uint256 time, address liquidator, uint256 liquidation, uint256 etherSold, uint256 maiBought, uint256 debtDeleted, uint256 feeClaimed);
    event AddLiquidity(address asset, address liquidityProvider, uint256 amountMAI, uint256 amountAsset, uint256 unitsIssued);
    event RemoveLiquidity(address asset, address liquidityProvider, uint256 amountMAI, uint256 amountAsset, uint256 unitsClaimed);

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

    constructor (address assetUSD) public payable {
        notEntered = true;
        defaultCollateralisation = 150;
        minCollaterisation = 101;
        exchangeUSD = assetUSD;
        // Construct with 3 Eth 
        // 2 Eth @ hardcoded price -> mint 400 MAI in CDP0
        // 1 Eth + 200 MAI in address(0) pool
        // 200 MAI back to sender
       
        uint256 genesisPrice = 200;
        uint256 purchasingPower = (msg.value/3) * genesisPrice; 
         _mint(purchasingPower*2);
        mapAsset_ExchangeData[address(0)].balanceAsset = msg.value/3;  
        mapAsset_ExchangeData[address(0)].balanceMAI = purchasingPower;
        uint256 mintAmount = (purchasingPower.mul(100)).div(defaultCollateralisation);
        uint256 CDP = 0; countOfCDPs = 0;
        mapAddress_MemberData[address(0)].CDP = CDP;
        mapCDP_Data[CDP].collateral = (msg.value * 2)/3;
        mapCDP_Data[CDP].debt = mintAmount;
        mapCDP_Data[CDP].owner = address(0);

        //mapAsset_ExchangeData[address(0)].listed = true;
        exchanges.push(address(0));

        _transfer(address(this), msg.sender, purchasingPower);
        //emit NewCDP(CDP, now, msg.sender, mintAmount, msg.value, defaultCollateralisation);
      
    }

    function addExchange(address asset, uint256 amountAsset, uint256 amountMAI) public payable returns (bool success){
        require(MAI.transferFrom(msg.sender, address(this), amountMAI), 'must collect mai');
        ERC20(asset).transferFrom(msg.sender, address(this), amountAsset);
        mapAsset_ExchangeData[asset].balanceMAI = amountMAI;
        mapAsset_ExchangeData[asset].balanceAsset = amountAsset;
        mapAsset_ExchangeData[asset].listed = true;
        exchanges.push(asset);
        return true;
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
        uint256 CDP = mapAddress_MemberData[msg.sender].CDP;
        require (CDP > 0, "Must be an owner already");
        mapCDP_Data[CDP].collateral += msg.value;
        uint256 purchasingPower = getEtherPPinMAI(mapCDP_Data[CDP].collateral);//how valuable Ether is in MAI
        uint256 collateralisation = ((purchasingPower).mul(100)).div(mapCDP_Data[CDP].debt);
        emit UpdateCDP(CDP, now, msg.sender, 0, msg.value, collateralisation);
        return true;
    }

    function remintMAIFromCDP(uint256 collateralisation) public payable returns (bool success) {
        require (collateralisation >= minCollaterisation, "Must be greater than 101%");
        uint256 CDP = mapAddress_MemberData[msg.sender].CDP;
        require (CDP != 0, "Must be an owner already");
        uint256 collateral = mapCDP_Data[CDP].collateral;
        uint256 purchasingPower = getEtherPPinMAI(collateral);//how valuable Ether is in MAI
        uint256 maxMintAmount = (purchasingPower.mul(collateralisation)).div(100);
        uint256 additionalMintAmount = maxMintAmount.sub(mapCDP_Data[CDP].debt);
        mapCDP_Data[CDP].debt += additionalMintAmount;
        _mint(additionalMintAmount);
        require (_transfer(address(this), msg.sender, additionalMintAmount), 'Must transfer mint amount to sender');
        emit UpdateCDP(CDP, now, msg.sender, additionalMintAmount, 0, collateralisation);
        return true;
    }

    function _manageCDP(address payable _owner, uint256 _value, uint256 _collateralisation) internal returns (bool success){
      uint256 purchasingPower = getEtherPPinMAI(_value);//how valuable Ether is in USD
      uint256 mintAmount = (purchasingPower.mul(100)).div(_collateralisation);
      //uint256 mintAmount = 100000000000;
      uint256 CDP = mapAddress_MemberData[_owner].CDP;
      if (CDP != 0) {
          mapCDP_Data[CDP].collateral += _value;
          mapCDP_Data[CDP].debt += mintAmount;
      } else {
          countOfCDPs += 1;
          CDP = countOfCDPs;
          mapAddress_MemberData[_owner].CDP = CDP;
          mapCDP_Data[CDP].collateral = _value;
          mapCDP_Data[CDP].debt = mintAmount;
          mapCDP_Data[CDP].owner = _owner;
      }
      _mint(mintAmount);
      require (_transfer(address(this), _owner, mintAmount), 'Must transfer mint amount to sender');
      emit NewCDP(CDP, now, _owner, mintAmount, _value, _collateralisation);
      return true;
    }

    function closeCDP(uint256 _liquidation) public returns (bool success){
      uint256 CDP = mapAddress_MemberData[msg.sender].CDP;
      require(CDP != 0, 'CDP must exist'); //require CDP exists
      require(_liquidation > 0, 'Liquidation must be greater than 0'); //require liquidation to be greater than 0
      require(_liquidation <= 10000, 'Liquidation must be less than 10k');
      uint256 debt = mapCDP_Data[CDP].debt;
      uint256 basisPoints = 10000;
      uint256 closeAmount = debt.div(basisPoints.div(_liquidation));
      uint256 collateral = mapCDP_Data[CDP].collateral;
      uint256 returnAmount = collateral.div(basisPoints.div(_liquidation));
      require(MAI._approve(msg.sender, address(this), closeAmount), 'Must approve first');
      require(MAI.transferFrom(msg.sender, address(this), closeAmount), 'must collect debt');
      require(_burn(closeAmount), 'Must burn debt');
      mapCDP_Data[CDP].debt -= closeAmount;
      mapCDP_Data[CDP].collateral -= returnAmount;
      msg.sender.transfer(returnAmount);
      emit CloseCDP(CDP, now, msg.sender, closeAmount, returnAmount);
      return true;
    }

    function liquidateCDP(uint256 CDP, uint256 liquidation) public returns (bool success){
        require(CDP > 0, "must be greater than 0");
        require(CDP <= countOfCDPs, "must exist");
        require(liquidation > 0, 'Liquidation must be greater than 0'); //require liquidation to be greater than 0
        require(liquidation <= 3333, 'Liquidation must be less than 33%');
        if (checkLiquidationPoint(CDP)){
            uint256 collateral = mapCDP_Data[CDP].collateral;
            uint256 debt = mapCDP_Data[CDP].debt;
            uint256 basisPoints = 10000;
            uint256 liquidatedCollateral = collateral.div(basisPoints.div(liquidation));
            uint256 debtDeleted = debt.div(basisPoints.div(liquidation));
            //TODO actually sell it
            uint256 maiBought = getEtherPPinMAI(liquidatedCollateral);
            uint256 fee = maiBought - debtDeleted;
            mapCDP_Data[CDP].collateral -= liquidatedCollateral;
            mapCDP_Data[CDP].debt -= debtDeleted;
            emit LiquidateCDP(CDP, now, msg.sender, liquidation, liquidatedCollateral, maiBought, debtDeleted, fee);
            //_burn(debtDeleted);
            //require(_transfer(address(this), address(msg.sender), fee), "must transfer fee");
            return true;
        }   else {
            return false;
        }
    }

    //==================================================================================//
    // Liquidity functions

    function addLiquidityToEtherPool (uint256 amountMAI) public payable returns (bool success) {
        require(msg.value > 0, "Must get Ether");
        require(transferFrom(msg.sender, address(this), amountMAI), "Must collect MAI");
        _addLiquidity(address(0), msg.value, amountMAI);
        return true;
    }

    function addLiquidityToAssetPool (address asset, uint256 amountAsset, uint256 amountMAI) public returns (bool success) {
        ERC20(asset).transferFrom(msg.sender, address(this), amountAsset);  
        require(transferFrom(msg.sender, address(this), amountMAI), "Must collect MAI");
        _addLiquidity(asset, amountAsset, amountMAI);
        return true;
    }

    function _addLiquidity(address asset, uint256 amountAsset, uint256 amountMAI) internal {
        // if (mapAsset_ExchangeData[asset] == 0) {                                                         
        //     exchanges.push(asset);                                                // Add new exchange
        //     //mapAsset_ExchangeData[asset].listed = true;
        //     mapAsset_ExchangeData[asset].balanceMAI = amountMAI;
        //     mapAsset_ExchangeData[asset].balanceAsset = amountAsset;
        // } else {
        //     mapAsset_ExchangeData[asset].balanceMAI += amountMAI;
        //     mapAsset_ExchangeData[asset].balanceAsset += amountAsset;
        // }
        // if (mapAsset_ExchangeData[asset].stakerUnits[msg.sender] == 0) {
        //     mapAsset_ExchangeData[asset].stakers.push(msg.sender);
        //     mapAddress_MemberData[msg.sender].exchanges.push(asset);
        //     members.push(msg.sender);
        // }
        // uint256 M = mapAsset_ExchangeData[asset].balanceMAI;
        // uint256 A = mapAsset_ExchangeData[asset].balanceAsset;
        // // ((M + A) * (m * A + M * a))/(4 * M * A)
        // uint256 numerator1 = M.add(A);
        // uint256 numerator2 = amountMAI.mul(A);
        // uint256 numerator3 = M.mul(amountAsset);
        // uint256 numerator = numerator1.mul((numerator2.add(numerator3)));
        // uint256 denominator = 4 * (M.mul(A));
        // uint256 units = numerator.div(denominator);
        // mapAsset_ExchangeData[asset].poolUnits += units;
        // mapAsset_ExchangeData[asset].stakerUnits[msg.sender] += units;
        // emit AddLiquidity(asset, msg.sender, amountMAI, amountAsset, units);
    }

    // function removeLiquidityFromEtherPool() public returns (bool success) {
    //     require(removeLiquidityPool(address(0)));
    //     return true;
    // }

    function removeLiquidityPool(address asset, uint256 bp) public returns (bool success) {
        uint256 _outputMAI; uint256 _outputAsset;
        (_outputMAI, _outputAsset) = _removeLiquidity(asset, bp);
        if(asset == address(0)){
            msg.sender.transfer(_outputAsset);
        } else {
            ERC20(asset).transfer(msg.sender, _outputAsset);
        }
        require (transfer(msg.sender, _outputMAI));
        return true;
    }



    function _removeLiquidity(address _asset, uint256 _bp) internal returns (uint256 _outputMAI, uint256 _outputAsset) {
        require(mapAsset_ExchangeData[_asset].stakerUnits[msg.sender] > 0);
        require(_bp <= 10000); require(_bp > 0);
        uint256 _basisPoints = 10000;
        uint256 _stakerUnits = mapAsset_ExchangeData[_asset].stakerUnits[msg.sender];
        uint256 _units = (_stakerUnits * _bp)/_basisPoints;
        uint256 _total = mapAsset_ExchangeData[_asset].poolUnits;
        uint256 _balanceMAI = mapAsset_ExchangeData[_asset].balanceMAI;
        uint256 _balanceAsset = mapAsset_ExchangeData[_asset].balanceAsset;
        _outputMAI = (_balanceMAI.mul(_units)).div(_total);
        _outputAsset = (_balanceAsset.mul(_units)).div(_total);
        mapAsset_ExchangeData[_asset].stakerUnits[msg.sender] = 0;
        mapAsset_ExchangeData[_asset].poolUnits -= _units;
        emit RemoveLiquidity(_asset, msg.sender, _outputMAI, _outputAsset, _units);
        return(_outputMAI, _outputAsset);
    }

    //==================================================================================//
    // Pricing functions

   function getValueInMAI(address asset) public view returns (uint256 price){
       uint256 balAsset = mapAsset_ExchangeData[asset].balanceAsset;
       uint256 balMAI = mapAsset_ExchangeData[asset].balanceMAI;
       return (_1.mul(balMAI)).div(balAsset);
   }

    function getValueInAsset(address asset) public view returns (uint256 price){
       uint256 balAsset = mapAsset_ExchangeData[asset].balanceAsset;
       uint256 balMAI = mapAsset_ExchangeData[asset].balanceMAI;
       return (_1.mul(balAsset)).div(balMAI);
   }

   function getEtherPriceInUSD(uint256 amount) public view returns (uint256 amountBought){
       uint256 etherPriceInMAI = getValueInMAI(address(0));
       uint256 maiPriceInUSD = getValueInAsset(exchangeUSD);
       uint256 ethPriceInUSD = maiPriceInUSD.mul(etherPriceInMAI).div(_1);//
        //emit Testing3(etherPriceInMAI, maiPriceInUSD, ethPriceInUSD);
       return (amount.mul(ethPriceInUSD)).div(_1);
   }

   function getEtherPPinMAI(uint256 amount) public view returns (uint256 amountBought){
        uint256 etherBal = mapAsset_ExchangeData[address(0)].balanceAsset;
        uint256 balMAI = mapAsset_ExchangeData[address(0)].balanceMAI;
        uint256 outputMAI = getCLPSwap(amount, etherBal, balMAI);
       // uint256 outputUSD = getMAIPPInUSD(outputMAI);
        return outputMAI;
   }

      function getMAIPPInUSD(uint256 amount) public view returns (uint256 amountBought){
        uint256 balMAI = mapAsset_ExchangeData[exchangeUSD].balanceMAI;
        uint256 balanceUSD = mapAsset_ExchangeData[exchangeUSD].balanceAsset;

        uint256 outputUSD = getCLPSwap(amount, balMAI, balanceUSD);
        return outputUSD;
   }

   function checkLiquidationPoint(uint256 CDP) public view returns (bool canLiquidate){
        uint256 collateral = mapCDP_Data[CDP].collateral;
        uint256 debt = mapCDP_Data[CDP].debt;
        uint256 etherBal = mapAsset_ExchangeData[address(0)].balanceAsset;
        uint256 balMAI = mapAsset_ExchangeData[address(0)].balanceMAI;
        uint256 outputMAI = getCLPLiquidation(collateral, etherBal, balMAI);
        if(outputMAI < debt) {
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
        uint256 numerator = (x.mul(Y.mul(X.sub(x))));
        uint256 denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }
}
