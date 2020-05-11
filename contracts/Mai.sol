pragma solidity 0.6.4;

//ERC20 Interface nice
interface ERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address account) external view returns (uint);
    function transfer(address, uint) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address, uint) external returns (bool);
    function transferFrom(address, address, uint) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint amount);
    event Approval(address indexed owner, address indexed spender, uint amount);
}
//Safe mathematics
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
contract MAI is ERC20{
    using SafeMath for uint;
    string public name = "MAI Asset";
    string public symbol = "MAI";
    uint public decimals  = 18;
    uint public override totalSupply;
    uint public _1 = 10**decimals;

    bool private notEntered;

    mapping(address => uint) public override balanceOf;
    mapping(address => mapping(address => uint)) public override allowance;

    
    uint public minCollaterisation;
    uint public defaultCollateralisation;
    uint public etherPrice;
    address exchangeUSD;
    uint public mintedMAI;
    uint public pooledMAI;

    mapping(address => MemberData) public mapAddress_MemberData;
    address[] public members;
    struct MemberData {
        address[] exchanges;
        uint CDP;
    }

    mapping(uint => CDPData) public mapCDP_Data;
    uint public countOfCDPs;
    struct CDPData {
        uint collateral;
        uint debt;
        address payable owner;
    }

    mapping(address => ExchangeData) public mapAsset_ExchangeData;
    address[] public exchanges;

     struct ExchangeData {
        bool listed;
        uint balanceMAI;
        uint balanceAsset;
        address[] stakers;
        uint poolUnits;
        mapping(address => uint) stakerUnits;
    }
   
    // Events
    event Transfer (address indexed from, address indexed to, uint amount);
    event Approval ( address indexed owner, address indexed spender, uint amount);

    event NewCDP(uint CDP, uint time, address owner, uint debtIssued, uint collateralHeld, uint collateralisation);
    event UpdateCDP(uint CDP, uint time, address owner, uint debtAdded, uint collateralAdded, uint collateralisation);
    event CloseCDP(uint CDP, uint time, address owner, uint debtPaid, uint etherReturned);
    event LiquidateCDP(uint CDP, uint time, address liquidator, uint liquidation, uint etherSold, uint maiBought, uint debtDeleted, uint feeClaimed);
    event AddLiquidity(address asset, address liquidityProvider, uint amountMAI, uint amountAsset, uint unitsIssued);
    event RemoveLiquidity(address asset, address liquidityProvider, uint amountMAI, uint amountAsset, uint unitsClaimed);

    event Testing1 (uint val1);
    event Testing2 (uint val1, uint val2);
    event Testing3 (uint val1, uint val2, uint val3);

    function transfer(address to, uint amount) public override  returns (bool success) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    function approve(address spender, uint amount) public override  returns (bool success) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    function _approve(address _approver, address _spender, uint _amount) internal returns (bool success){
        allowance[_approver][_spender] = _amount;
        emit Approval(_approver, _spender, _amount);
        return true;
    }
    //Transfer function
    function _transfer(address _from, address _to, uint _amount) internal returns (bool success) {
        require(balanceOf[_from] >= _amount,'Sender must have enough to spend');
        balanceOf[_from] = balanceOf[_from].sub(_amount);
        balanceOf[_to] = balanceOf[_to].add(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    //Delegate a Transfer
    function transferFrom(address from, address to, uint amount) public override returns (bool success) {
        require(amount <= allowance[from][to], 'Sender must have enough allowance to send');
        allowance[from][to] = allowance[from][to].sub(amount);
        _transfer(from, to, amount);
        return true;
    }

    function _mint(uint _amount) internal returns (bool success){
        require(_amount > 0);
        totalSupply = totalSupply.add(_amount);
        balanceOf[address(this)] = balanceOf[address(this)].add(_amount);
        emit Transfer(address(0), address(this), _amount);
        return true;
    }

    function _burn(uint _amount) internal returns (bool success){
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
       
        uint genesisPrice = 200;
        uint purchasingPower = (msg.value/3) * genesisPrice; 
         _mint(purchasingPower*2);
        mapAsset_ExchangeData[address(0)].balanceAsset = msg.value/3;  
        mapAsset_ExchangeData[address(0)].balanceMAI = purchasingPower;
        uint mintAmount = (purchasingPower.mul(100)).div(defaultCollateralisation);
        uint CDP = 0; countOfCDPs = 0;
        mapAddress_MemberData[address(0)].CDP = CDP;
        mapCDP_Data[CDP].collateral = (msg.value * 2)/3;
        mapCDP_Data[CDP].debt = mintAmount;
        mapCDP_Data[CDP].owner = address(0);
        mapAsset_ExchangeData[address(0)].listed = true;
        exchanges.push(address(0));

        _transfer(address(this), msg.sender, purchasingPower);
        //emit NewCDP(CDP, now, msg.sender, mintAmount, msg.value, defaultCollateralisation);
      
    }
    function getStakerUnits(address asset, address staker) public view returns(uint stakerUnits){
         return (mapAsset_ExchangeData[asset].stakerUnits[staker]);
    }

    function getStakerAddress(address asset, uint index) public view returns(address staker){
            return(mapAsset_ExchangeData[asset].stakers[index]);
    }

    function addExchange(address asset, uint amountAsset, uint amountMAI) public payable returns (bool success){
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

    function openCDP(uint collateralisation) public payable returns (bool success) {
      require (msg.value > 0, 'Must be more than 0 to open CDP');
      require (collateralisation >= minCollaterisation, "Must be greater than 101%");
      _manageCDP(msg.sender, msg.value, collateralisation);
      return true;
    }

    function addCollateralToCDP() public payable returns (bool success) {
        require (msg.value > 0, 'Must be more than 0 to open CDP');
        uint CDP = mapAddress_MemberData[msg.sender].CDP;
        require (CDP > 0, "Must be an owner already");
        mapCDP_Data[CDP].collateral += msg.value;
        uint purchasingPower = getEtherPPinMAI(mapCDP_Data[CDP].collateral);//how valuable Ether is in MAI
        uint collateralisation = ((purchasingPower).mul(100)).div(mapCDP_Data[CDP].debt);
        emit UpdateCDP(CDP, now, msg.sender, 0, msg.value, collateralisation);
        return true;
    }

    function remintMAIFromCDP(uint collateralisation) public payable returns (bool success) {
        require (collateralisation >= minCollaterisation, "Must be greater than 101%");
        uint CDP = mapAddress_MemberData[msg.sender].CDP;
        require (CDP != 0, "Must be an owner already");
        uint collateral = mapCDP_Data[CDP].collateral;
        uint purchasingPower = getEtherPPinMAI(collateral);//how valuable Ether is in MAI
        uint maxMintAmount = (purchasingPower.mul(collateralisation)).div(100);
        uint additionalMintAmount = maxMintAmount.sub(mapCDP_Data[CDP].debt);
        mapCDP_Data[CDP].debt += additionalMintAmount;
        _mint(additionalMintAmount);
        require (_transfer(address(this), msg.sender, additionalMintAmount), 'Must transfer mint amount to sender');
        emit UpdateCDP(CDP, now, msg.sender, additionalMintAmount, 0, collateralisation);
        return true;
    }

    function _manageCDP(address payable _owner, uint _value, uint _collateralisation) internal returns (bool success){
      uint purchasingPower = getEtherPPinMAI(_value);//how valuable Ether is in USD
      uint mintAmount = (purchasingPower.mul(100)).div(_collateralisation);
      //uint mintAmount = 100000000000;
      uint CDP = mapAddress_MemberData[_owner].CDP;
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

    function closeCDP(uint _liquidation) public returns (bool success){
      uint CDP = mapAddress_MemberData[msg.sender].CDP;
      require(CDP != 0, 'CDP must exist'); //require CDP exists
      require(_liquidation > 0, 'Liquidation must be greater than 0'); //require liquidation to be greater than 0
      require(_liquidation <= 10000, 'Liquidation must be less than 10k');
      uint debt = mapCDP_Data[CDP].debt;
      uint basisPoints = 10000;
      uint closeAmount = debt.div(basisPoints.div(_liquidation));
      uint collateral = mapCDP_Data[CDP].collateral;
      uint returnAmount = collateral.div(basisPoints.div(_liquidation));
      require(MAI._approve(msg.sender, address(this), closeAmount), 'Must approve first');
      require(MAI.transferFrom(msg.sender, address(this), closeAmount), 'must collect debt');
      require(_burn(closeAmount), 'Must burn debt');
      mapCDP_Data[CDP].debt -= closeAmount;
      mapCDP_Data[CDP].collateral -= returnAmount;
      msg.sender.transfer(returnAmount);
      emit CloseCDP(CDP, now, msg.sender, closeAmount, returnAmount);
      return true;
    }

    function liquidateCDP(uint CDP, uint liquidation) public returns (bool success){
        require(CDP > 0, "must be greater than 0");
        require(CDP <= countOfCDPs, "must exist");
        require(liquidation > 0, 'Liquidation must be greater than 0'); //require liquidation to be greater than 0
        require(liquidation <= 3333, 'Liquidation must be less than 33%');
        if (checkLiquidationPoint(CDP)){
            uint collateral = mapCDP_Data[CDP].collateral;
            uint debt = mapCDP_Data[CDP].debt;
            uint basisPoints = 10000;
            uint liquidatedCollateral = collateral.div(basisPoints.div(liquidation));
            uint debtDeleted = debt.div(basisPoints.div(liquidation));
            //TODO actually sell it
            uint maiBought = getEtherPPinMAI(liquidatedCollateral);
            uint fee = maiBought - debtDeleted;
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

    function addLiquidityToEtherPool (uint amountMAI) public payable returns (bool success) {
        require((amountMAI > 0) || ((msg.value > 0)), "Must get Mai or Eth");
        require(transferFrom(msg.sender, address(this), amountMAI), "Must collect MAI");
        _addLiquidity(address(0), msg.value, amountMAI);
        return true;
    }

    function addLiquidityToAssetPool (address asset, uint amountAsset, uint amountMAI) public returns (bool success) {
        ERC20(asset).transferFrom(msg.sender, address(this), amountAsset);  
        require(transferFrom(msg.sender, address(this), amountMAI), "Must collect MAI");
        _addLiquidity(asset, amountAsset, amountMAI);
        return true;
    }

   
    function _addLiquidity(address asset, uint amountAsset, uint amountMAI) internal {
        if (mapAsset_ExchangeData[asset].listed = false) {                                                         
            exchanges.push(asset);                                                // Add new exchange
            mapAsset_ExchangeData[asset].listed = true;
            mapAsset_ExchangeData[asset].balanceMAI = amountMAI;
            mapAsset_ExchangeData[asset].balanceAsset = amountAsset;
        } else {
            mapAsset_ExchangeData[asset].balanceMAI += amountMAI;
            mapAsset_ExchangeData[asset].balanceAsset += amountAsset;
        }
        if (mapAsset_ExchangeData[asset].stakerUnits[msg.sender] == 0) {
            mapAsset_ExchangeData[asset].stakers.push(msg.sender);
            mapAddress_MemberData[msg.sender].exchanges.push(asset);
            members.push(msg.sender);
        }
        uint M = mapAsset_ExchangeData[asset].balanceMAI;
        uint A = mapAsset_ExchangeData[asset].balanceAsset;
        // ((M + A) * (m * A + M * a))/(4 * M * A)
        uint numerator1 = M.add(A);
        uint numerator2 = amountMAI.mul(A);
        uint numerator3 = M.mul(amountAsset);
        uint numerator = numerator1.mul((numerator2.add(numerator3)));
        uint denominator = 4 * (M.mul(A));
        uint units = numerator.div(denominator);
        mapAsset_ExchangeData[asset].poolUnits += units;
        mapAsset_ExchangeData[asset].stakerUnits[msg.sender] += units;
        emit AddLiquidity(asset, msg.sender, amountMAI, amountAsset, units);
    }

    function removeLiquidityPool(address asset, uint bp) public returns (bool success) {
        uint _outputMAI; uint _outputAsset;
        (_outputMAI, _outputAsset) = _removeLiquidity(asset, bp);
        if(asset == address(0)){
            msg.sender.transfer(_outputAsset);
        } else {
            ERC20(asset).transfer(msg.sender, _outputAsset);
        }
        require (transfer(msg.sender, _outputMAI));
        return true;
    }



    function _removeLiquidity(address _asset, uint _bp) internal returns (uint _outputMAI, uint _outputAsset) {
        require(mapAsset_ExchangeData[_asset].stakerUnits[msg.sender] > 0);
        require(_bp <= 10000); require(_bp > 0);
        uint _basisPoints = 10000;
        uint _stakerUnits = mapAsset_ExchangeData[_asset].stakerUnits[msg.sender];
        uint _units = (_stakerUnits * _bp)/_basisPoints;
        uint _total = mapAsset_ExchangeData[_asset].poolUnits;
        uint _balanceMAI = mapAsset_ExchangeData[_asset].balanceMAI;
        uint _balanceAsset = mapAsset_ExchangeData[_asset].balanceAsset;
        _outputMAI = (_balanceMAI.mul(_units)).div(_total);
        _outputAsset = (_balanceAsset.mul(_units)).div(_total);
        mapAsset_ExchangeData[_asset].stakerUnits[msg.sender] = 0;
        mapAsset_ExchangeData[_asset].poolUnits -= _units;
        require(MAI._approve(msg.sender, address(this), _units), 'Must approve first');
        emit RemoveLiquidity(_asset, msg.sender, _outputMAI, _outputAsset, _units);
        return(_outputMAI, _outputAsset);
    }

    //==================================================================================//
    // Pricing functions

   function getValueInMAI(address asset) public view returns (uint price){
       uint balAsset = mapAsset_ExchangeData[asset].balanceAsset;
       uint balMAI = mapAsset_ExchangeData[asset].balanceMAI;
       return (_1.mul(balMAI)).div(balAsset);
   }

    function getValueInAsset(address asset) public view returns (uint price){
       uint balAsset = mapAsset_ExchangeData[asset].balanceAsset;
       uint balMAI = mapAsset_ExchangeData[asset].balanceMAI;
       return (_1.mul(balAsset)).div(balMAI);
   }

   function getEtherPriceInUSD(uint amount) public view returns (uint amountBought){
       uint etherPriceInMAI = getValueInMAI(address(0));
       uint maiPriceInUSD = getValueInAsset(exchangeUSD);
       uint ethPriceInUSD = maiPriceInUSD.mul(etherPriceInMAI).div(_1);//
        //emit Testing3(etherPriceInMAI, maiPriceInUSD, ethPriceInUSD);
       return (amount.mul(ethPriceInUSD)).div(_1);
   }

   function getEtherPPinMAI(uint amount) public view returns (uint amountBought){
        uint etherBal = mapAsset_ExchangeData[address(0)].balanceAsset;
        uint balMAI = mapAsset_ExchangeData[address(0)].balanceMAI;
        uint outputMAI = getCLPSwap(amount, etherBal, balMAI);
       // uint outputUSD = getMAIPPInUSD(outputMAI);
        return outputMAI;
   }

      function getMAIPPInUSD(uint amount) public view returns (uint amountBought){
        uint balMAI = mapAsset_ExchangeData[exchangeUSD].balanceMAI;
        uint balanceUSD = mapAsset_ExchangeData[exchangeUSD].balanceAsset;

        uint outputUSD = getCLPSwap(amount, balMAI, balanceUSD);
        return outputUSD;
   }

   function checkLiquidationPoint(uint CDP) public view returns (bool canLiquidate){
        uint collateral = mapCDP_Data[CDP].collateral;
        uint debt = mapCDP_Data[CDP].debt;
        uint etherBal = mapAsset_ExchangeData[address(0)].balanceAsset;
        uint balMAI = mapAsset_ExchangeData[address(0)].balanceMAI;
        uint outputMAI = getCLPLiquidation(collateral, etherBal, balMAI);
        if(outputMAI < debt) {
            canLiquidate = true;
        } else {
            canLiquidate = false;
        }
        return canLiquidate;
   }

   //##############################################

    function getCLPSwap(uint x, uint X, uint Y) public pure returns (uint y){
        // y = (x * Y * X)/(x + X)^2
        uint numerator = x.mul(Y.mul(X));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function getCLPFee(uint x, uint X, uint Y) public pure returns (uint y){
        // y = (x * Y * x) / (x + X)^2
        uint numerator = x.mul(Y.mul(x));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function getCLPLiquidation(uint x, uint X, uint Y) public pure returns (uint y){
        // y = (x * Y * (X - x))/(x + X)^2
        uint numerator = (x.mul(Y.mul(X.sub(x))));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }
}
