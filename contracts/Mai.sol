pragma solidity 0.6.4;
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
    uint public medianMAIValue;
    address[] public arrayAnchor;
    uint public mintedMAI;
    uint public pooledMAI;
    uint public incentiveFactor = 10;
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
        bool isAnchor;
        uint balanceMAI;
        uint balanceAsset;
        address[] stakers;
        uint poolUnits;
        mapping(address => uint) stakerUnits;
        mapping(address => bool) isActivePoolStaker;
    }
    event Transfer (address indexed from, address indexed to, uint amount);
    event Approval ( address indexed owner, address indexed spender, uint amount);

    event NewCDP(uint CDP, uint time, address owner, uint debtIssued, uint collateralHeld, uint collateralisation);
    event UpdateCDP(uint CDP, uint time, address owner, uint debtAdded, uint collateralAdded, uint collateralisation);
    event CloseCDP(uint CDP, uint time, address owner, uint debtPaid, uint etherReturned);
    event LiquidateCDP(uint CDP, uint time, address liquidator, uint liquidation, uint etherSold, uint maiBought, uint debtDeleted, uint feeClaimed);
    event AddLiquidity(address asset, address liquidityProvider, uint amountMAI, uint amountAsset, uint unitsIssued);
    event RemoveLiquidity(address asset, address liquidityProvider, uint amountMAI, uint amountAsset, uint unitsClaimed);
    event Swapped(address assetFrom, address assetTo, uint inputAmount, uint maiAmount, uint outPutAmount, address recipient);
    event AnchorRemoved(address assetAnchor, uint delta, uint assetValue, address recipient);
    //======##Getters##======
    function calcStakerUnits(address asset, address staker) public view returns(uint stakerUnits){
         return (mapAsset_ExchangeData[asset].stakerUnits[staker]);
    }
    function calcStakerAddress(address asset, uint index) public view returns(address staker){
        return(mapAsset_ExchangeData[asset].stakers[index]);
    }
    function calcStakerCount(address asset) public view returns (uint){
        return(mapAsset_ExchangeData[asset].stakers.length);
    }
    function getExhangesCount() public view returns (uint){
        return exchanges.length;
    }
    function getAnchorsCount() public view returns (uint){
        return arrayAnchor.length;
    }
    function getMembersCount() public view returns (uint){
        return members.length;
    }
    function getMemberExchangeCount(address member) public view returns (uint){
        return (mapAddress_MemberData[member].exchanges.length);
    }
    function getStakerExchanges (address member, uint index) public view returns (address exchange){
         return (mapAddress_MemberData[member].exchanges[index]);
    }

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
    function _transfer(address _from, address _to, uint _amount) internal returns (bool success) {
        require(balanceOf[_from] >= _amount,'Sender must have enough to spend');
        balanceOf[_from] = balanceOf[_from].sub(_amount);
        balanceOf[_to] = balanceOf[_to].add(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }
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

    constructor () public payable {
        notEntered = true;
        defaultCollateralisation = 150;
        minCollaterisation = 101;
        medianMAIValue = _1;
        uint genesisPrice = 369;
        uint purchasingPower = (msg.value/3) * genesisPrice; 
        _mint(purchasingPower*2);
        mapAsset_ExchangeData[address(0)].balanceAsset = msg.value/3;  
        mapAsset_ExchangeData[address(0)].balanceMAI = purchasingPower;
        uint poolUnit = ((msg.value/3).add(purchasingPower))/2;
        mapAsset_ExchangeData[address(0)].poolUnits = poolUnit;
        mapAsset_ExchangeData[address(0)].stakers.push(msg.sender);
        mapAsset_ExchangeData[address(0)].isActivePoolStaker[msg.sender] = true;
        mapAsset_ExchangeData[address(0)].stakerUnits[msg.sender] += poolUnit;
        mapAddress_MemberData[msg.sender].exchanges.push(address(0));
        uint mintAmount = (purchasingPower.mul(100)).div(defaultCollateralisation);
        uint CDP = 0; countOfCDPs = 0; 
        mapAddress_MemberData[address(0)].CDP = CDP;
        mapCDP_Data[CDP].collateral = (msg.value.mul(2)).div(3);
        mapCDP_Data[CDP].debt = mintAmount;
        mapCDP_Data[CDP].owner = address(0);
        mapAsset_ExchangeData[address(0)].listed = true;
        exchanges.push(address(0));
        _transfer(address(this), msg.sender, purchasingPower);
        emit NewCDP(CDP, now, msg.sender, mintAmount, msg.value, defaultCollateralisation);
    }
    
    function addExchange(address asset, uint amountAsset, uint amountMAI) public payable returns (bool success){
         require((amountMAI > 0) && ((amountAsset > 0)), "Must get Mai or token");
         _transfer(msg.sender, address(this), amountMAI);
         ERC20(asset).transferFrom(msg.sender, address(this), amountAsset);
         mapAsset_ExchangeData[asset].balanceMAI = amountMAI;
         mapAsset_ExchangeData[asset].balanceAsset = amountAsset;
         exchanges.push(asset);  // Add new exchange
         mapAsset_ExchangeData[asset].listed = true;
         uint poolUnitInit = ((amountAsset).add(amountMAI))/2;
         mapAsset_ExchangeData[asset].poolUnits = poolUnitInit;
         mapAsset_ExchangeData[asset].stakerUnits[msg.sender] += poolUnitInit;
         mapAsset_ExchangeData[asset].isActivePoolStaker[msg.sender] = true;
        emit AddLiquidity(asset, msg.sender, amountMAI, amountAsset, poolUnitInit);
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
        uint collateralisation;
        require (CDP > 0, "Must be an owner already");
        mapCDP_Data[CDP].collateral += msg.value;
        uint purchasingPower = calcEtherPPinMAI(mapCDP_Data[CDP].collateral);//how valuable Ether is in MAI
        if(mapCDP_Data[CDP].debt == 0){
         collateralisation = ((purchasingPower).mul(100)).mul(10);
        }else{
         collateralisation = ((purchasingPower).mul(100)).div(mapCDP_Data[CDP].debt);
        }
        emit UpdateCDP(CDP, now, msg.sender, 0, msg.value, collateralisation);
        return true;
    }

    function remintMAIFromCDP(uint collateralisation) public payable returns (bool success) {
        require (collateralisation >= minCollaterisation, "Must be greater than 101%");
        uint CDP = mapAddress_MemberData[msg.sender].CDP;
        require (CDP != 0, "Must be an owner already");
        uint collateral = mapCDP_Data[CDP].collateral;
        uint purchasingPower = calcEtherPPinMAI(collateral);//how valuable Ether is in MAI
        uint maxMintAmount = (purchasingPower.mul(100)).div(collateralisation);
        uint additionalMintAmount = maxMintAmount.sub(mapCDP_Data[CDP].debt);
        mapCDP_Data[CDP].debt += additionalMintAmount;
        _mint(additionalMintAmount);
        require (_transfer(address(this), msg.sender, additionalMintAmount), 'Must transfer mint amount to sender');
        emit UpdateCDP(CDP, now, msg.sender, additionalMintAmount, 0, collateralisation);
        return true;
    }

    function _manageCDP(address payable _owner, uint _value, uint _collateralisation) internal returns (bool success){
      uint purchasingPower = calcEtherPPinMAI(_value);//how valuable Ether is in MAI
      uint mintAmount = (purchasingPower.mul(100)).div(_collateralisation);
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
     // require(MAI._approve(msg.sender, address(this), closeAmount), 'Must approve first');
      //require(MAI.transferFrom(msg.sender, address(this), closeAmount), 'must collect debt');
       require (_transfer(msg.sender, address(this), closeAmount), 'Must transfer closeAmount to sender');
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
            uint liquidatedCollateral = (collateral.mul(liquidation)).div(basisPoints);
            uint debtDeleted = (debt.mul(liquidation)).div(basisPoints);
            uint maiBought; uint _y = 0;
            (maiBought, _y) = _swapTokenToToken(address(0), address(this), liquidatedCollateral);
            uint fee = maiBought - debtDeleted;
            mapCDP_Data[CDP].collateral -= liquidatedCollateral;
            mapCDP_Data[CDP].debt -= debtDeleted;
            emit LiquidateCDP(CDP, now, msg.sender, liquidation, liquidatedCollateral, maiBought, debtDeleted, fee);
            _burn(debtDeleted);
            require(_transfer(address(this), address(msg.sender), fee), "must transfer fee");
            return true;
        }   else {
            return false;
        }
    }

    //==================================================================================//
    // Liquidity functions
    function addLiquidityToEtherPool (uint amountMAI) public payable returns (bool success) {
        require((amountMAI > 0) || ((msg.value > 0)), "Must get Mai or Eth");
        //require(transferFrom(msg.sender, address(this), amountMAI), "Must collect MAI");
        _transfer(msg.sender, address(this), amountMAI);
        _addLiquidity(address(0), msg.value, amountMAI);
        return true;
    }

    function addLiquidityToAssetPool (address asset, uint amountAsset, uint amountMAI) public returns (bool success) {
        ERC20(asset).transferFrom(msg.sender, address(this), amountAsset);  
        //require(transferFrom(msg.sender, address(this), amountMAI), "Must collect MAI");
        _transfer(msg.sender, address(this), amountMAI);
        _addLiquidity(asset, amountAsset, amountMAI);
        return true;
    }
 
    function _addLiquidity(address asset, uint a, uint m) internal {
        if (!mapAsset_ExchangeData[asset].isActivePoolStaker[msg.sender]){
            mapAsset_ExchangeData[asset].stakers.push(msg.sender);
            mapAddress_MemberData[msg.sender].exchanges.push(asset);
            members.push(msg.sender);
            mapAsset_ExchangeData[asset].isActivePoolStaker[msg.sender] = true;
        }
        mapAsset_ExchangeData[asset].balanceMAI += m;
        mapAsset_ExchangeData[asset].balanceAsset += a;
        uint M = mapAsset_ExchangeData[asset].balanceMAI;
        uint A = mapAsset_ExchangeData[asset].balanceAsset;
        uint units = calcStakeUnits(a, A, m, M);
        mapAsset_ExchangeData[asset].poolUnits += units;
        mapAsset_ExchangeData[asset].stakerUnits[msg.sender] += units;
        emit AddLiquidity(asset, msg.sender, m, a, units);
    }

    function removeLiquidityPool(address asset, uint bp) public returns (bool success) {
        uint _outputMAI; uint _outputAsset;
        (_outputMAI, _outputAsset) = _removeLiquidity(asset, bp);
        if(asset == address(0)){
            msg.sender.transfer(_outputAsset);
        } else {
            ERC20(asset).transfer(msg.sender, _outputAsset);
        }
        require (_transfer(address(this), msg.sender, _outputMAI));
        return true;
    }

    function _removeLiquidity(address _asset, uint _bp) internal returns (uint _outputMAI, uint _outputAsset) {
        require(mapAsset_ExchangeData[_asset].stakerUnits[msg.sender] > 0);
        require(_bp <= 10000); require(_bp > 0);
        uint _basisPoints = 10000;
        uint _stakerUnits = mapAsset_ExchangeData[_asset].stakerUnits[msg.sender];
        uint _units = (_stakerUnits.mul(_bp)).div(_basisPoints);
        uint _total = mapAsset_ExchangeData[_asset].poolUnits;
        uint _balanceMAI = mapAsset_ExchangeData[_asset].balanceMAI;
        uint _balanceAsset = mapAsset_ExchangeData[_asset].balanceAsset;
        _outputMAI = (_balanceMAI.mul(_units)).div(_total);
        _outputAsset = (_balanceAsset.mul(_units)).div(_total);
        mapAsset_ExchangeData[_asset].stakerUnits[msg.sender] -= _units;
        mapAsset_ExchangeData[_asset].poolUnits -= _units;
        mapAsset_ExchangeData[_asset].balanceMAI -= _outputMAI;
        mapAsset_ExchangeData[_asset].balanceAsset -= _outputAsset;
        emit RemoveLiquidity(_asset, msg.sender, _outputMAI, _outputAsset, _units);
        return(_outputMAI, _outputAsset);
    }

    function swapTokenToToken(address assetFrom, address assetTo, uint inputAmount) public payable returns (bool success) {
        require((inputAmount > 0), "Must get Asset");
        uint maiAmount = 0; uint outputAmount = 0;
        if(assetFrom == address(0)){
            require ((msg.value == inputAmount), 'must get ETH');
        } else if (assetFrom == address(this)){
            _transfer(msg.sender, address(this), inputAmount); 
        } else {
            ERC20(assetFrom).transferFrom(msg.sender, address(this), inputAmount);
        }
        (maiAmount, outputAmount) = _swapTokenToToken(assetFrom, assetTo, inputAmount);
        emit Swapped(assetFrom, assetTo, inputAmount, maiAmount, outputAmount, msg.sender);
        _handleTransferOut(assetTo, maiAmount, outputAmount,  msg.sender);
        _checkAnchor(assetFrom, assetTo);
        return true;
    }

    function _swapTokenToToken(address _assetFrom, address _assetTo, uint _amount) internal returns(uint _m, uint _y){ 
        if(_assetFrom == address(this)){
            _m=0;
            _y = _swapMaiToAsset(_assetTo, _amount);  
        }
        if(_assetTo == address(this)){
            _m= _swapAssetToMai(_assetFrom, _amount);
            _y = 0;
        }
        if(_assetFrom != address(this) && _assetTo != address(this)){
            _m = _swapAssetToMai(_assetFrom, _amount);
            _y = _swapMaiToAsset(_assetTo, _m);
        }   
        return (_m, _y);
    }

    function _swapAssetToMai(address _assetFrom, uint _x) internal returns (uint _y){
        uint _X = mapAsset_ExchangeData[_assetFrom].balanceAsset;
        uint _Y = mapAsset_ExchangeData[_assetFrom].balanceMAI;
        _y = calcCLPSwap(_x, _X, _Y);
        mapAsset_ExchangeData[_assetFrom].balanceAsset += _x;
        mapAsset_ExchangeData[_assetFrom].balanceMAI -= _y;
        return _y;
    }

    function _swapMaiToAsset(address _assetTo, uint _x) internal returns (uint _y){
        uint _X = mapAsset_ExchangeData[_assetTo].balanceMAI;
        uint _Y = mapAsset_ExchangeData[_assetTo].balanceAsset;
        if(mapAsset_ExchangeData[_assetTo].isAnchor){
         _x = _adjustAmountIfAnchor(_assetTo, _x);
        }
         _y = calcCLPSwap(_x, _X, _Y);
        mapAsset_ExchangeData[_assetTo].balanceMAI += _x;
        mapAsset_ExchangeData[_assetTo].balanceAsset -= _y;
        return _y;
    }

    //======================================================================
    //Anchors
    function addAnchor(address asset, uint amountAsset, uint amountMAI) public payable returns (bool success){
        require((arrayAnchor.length < 5), "must only have 5 anchors");
        if(!mapAsset_ExchangeData[asset].isAnchor){
            _transfer(msg.sender, address(this), amountMAI);
       // require(MAI.transferFrom(msg.sender, address(this), amountMAI), 'must collect mai');
        ERC20(asset).transferFrom(msg.sender, address(this), amountAsset);
        mapAsset_ExchangeData[asset].listed = true;
        mapAsset_ExchangeData[asset].isAnchor = true;
        _addLiquidity(asset, amountAsset, amountMAI);
        arrayAnchor.push(asset);
        exchanges.push(asset);
        }
        return true;
    }
    // function removeAnchor(address asset) public returns (bool success){
    //     require((mapAsset_ExchangeData[asset].isAnchor = true), "must be an anchor");
    //     uint maxAnchorSlip = 10**17;
    //     uint assetValue = calcValueInAsset(asset);
    //     uint numerator = assetValue.sub(medianMAIValue);
    //     uint denominator =(assetValue.add(medianMAIValue)).div(2);
    //     uint delta = ((_1.mul(numerator)).div(denominator));
    //     require((delta > maxAnchorSlip), "percentage difference > anchor limit percentage ");
    //     for (uint i=0; i < arrayAnchor.length; i++) {
    //          if (arrayAnchor[i] == asset){
    //              arrayAnchor[i] = arrayAnchor[arrayAnchor.length - 1];
    //              arrayAnchor.pop();
    //             }
    //     }
    //     //_nukeAnchor(asset);  
    //     emit AnchorRemoved(asset, delta, assetValue, msg.sender);
                
    //     return true;
    // }
   
    // function _nukeAnchor(address _asset) internal returns (bool success){
    //      uint _outputMAI; uint _outputAsset; uint _bp = 10000;
    //     for(uint i = 0; i < mapAsset_ExchangeData[_asset].stakers[].length; i++){
    //     (_outputMAI, _outputAsset) = _removeLiquidity(_asset, _bp);
    //     ERC20(_asset).transfer(mapAsset_ExchangeData[_asset].stakers[i], _outputAsset);
    //     require (_transfer(address(this), mapAsset_ExchangeData[_asset].stakers[i], _outputMAI));
    //     }
    //     mapAsset_ExchangeData[asset].isAnchor = false;
    // }

    function _checkAnchor(address _assetFrom, address _assetTo) internal {
        address anchor = address(0);
        if(mapAsset_ExchangeData[_assetFrom].isAnchor){
            anchor = _assetFrom;
        } else if (mapAsset_ExchangeData[_assetTo].isAnchor) {
            anchor = _assetTo;
        }
        if(anchor != address(0)){
            updatePrice();
        }
    }

    function updatePrice() public {
        uint[5] memory arrayPrices;
        for(uint i = 0; i < 5; i++){
            arrayPrices[i] = (calcValueInMAI(arrayAnchor[i]));
        }
        uint[5] memory sortedPriceFeed = _sortArray(arrayPrices);
        medianMAIValue = sortedPriceFeed[2];
    }

    function _sortArray(uint[5] memory array) internal pure returns (uint[5] memory) {
        uint l = array.length;
        for(uint i = 0; i < l; i++) {
            for(uint j = i+1; j < l ;j++) {
                if(array[i] > array[j]) {
                    uint temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }
        }
        return array;
    }

    function _adjustAmountIfAnchor(address _asset, uint _amount) internal returns (uint _x){
        uint maiValueInAsset = calcValueInAsset(_asset);
        uint delta;
        if(maiValueInAsset < medianMAIValue){
            delta = (medianMAIValue.sub(maiValueInAsset)).div(incentiveFactor);
            uint burn = (_amount.mul(delta)).div(medianMAIValue);
             _burn(burn);
             _x = _amount.sub(burn);
        }
        if (maiValueInAsset > medianMAIValue){
            delta = (maiValueInAsset.sub(medianMAIValue)).div(incentiveFactor);
            uint mint = (_amount.mul(delta)).div(medianMAIValue);
             _mint(mint);
             _x = _amount.add(mint);
        }    
        return _x;
    }
    function _handleTransferOut(address _assetTo, uint maiAmount, uint _amountAsset, address payable _recipient) internal {
        if (_assetTo == address(0)) {
            _recipient.transfer(_amountAsset);
        } else if (_assetTo == address(this)) {
            _transfer(address(this), _recipient, maiAmount);
        } else {
            ERC20(_assetTo).transfer(_recipient, _amountAsset);
        }
    }

    //==================================================================================//
    // Pricing functions

   function calcValueInMAI(address asset) public view returns (uint price){
       uint balAsset = mapAsset_ExchangeData[asset].balanceAsset;
       uint balMAI = mapAsset_ExchangeData[asset].balanceMAI;
       return (_1.mul(balMAI)).div(balAsset);
   }

    function calcValueInAsset(address asset) public view returns (uint price){
       uint balAsset = mapAsset_ExchangeData[asset].balanceAsset;
       uint balMAI = mapAsset_ExchangeData[asset].balanceMAI;
       return (_1.mul(balAsset)).div(balMAI);
   }

   function calcEtherPriceInUSD(uint amount) public view returns (uint amountBought){
       uint etherPriceInMAI = calcValueInMAI(address(0));
    //    uint maiPriceInUSD = calcValueInAsset(exchangeUSD);
       uint ethPriceInUSD = medianMAIValue.mul(etherPriceInMAI).div(_1);//
       return (amount.mul(ethPriceInUSD)).div(_1);
   }

   function calcEtherPPinMAI(uint amount) public view returns (uint amountBought){
        uint etherBal = mapAsset_ExchangeData[address(0)].balanceAsset;
        uint balMAI = mapAsset_ExchangeData[address(0)].balanceMAI;
        uint outputMAI = calcCLPSwap(amount, etherBal, balMAI);
        return outputMAI;
   }

   function checkLiquidationPoint(uint CDP) public view returns (bool canLiquidate){
        uint collateral = mapCDP_Data[CDP].collateral;
        uint debt = mapCDP_Data[CDP].debt;
        uint etherBal = mapAsset_ExchangeData[address(0)].balanceAsset;
        uint balMAI = mapAsset_ExchangeData[address(0)].balanceMAI;
        uint outputMAI = calcCLPLiquidation(collateral, etherBal, balMAI);
        if(outputMAI < debt) {
            canLiquidate = true;
        } else {
            canLiquidate = false;
        }
        return canLiquidate;
   }

   //##############################################
   //ClP functions

    function calcCLPSwap(uint x, uint X, uint Y) public pure returns (uint y){
        // y = (x * Y * X)/(x + X)^2
        uint numerator = x.mul(Y.mul(X));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function calcCLPFee(uint x, uint X, uint Y) public pure returns (uint y){
        // y = (x * Y * x) / (x + X)^2
        uint numerator = x.mul(Y.mul(x));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function calcCLPLiquidation(uint x, uint X, uint Y) public pure returns (uint y){
        // y = (x * Y * (X - x))/(x + X)^2
        uint numerator = (x.mul(Y.mul(X.sub(x))));
        uint denominator = (x.add(X)).mul(x.add(X));
        y = numerator.div(denominator);
        return y;
    }

    function calcStakeUnits(uint a, uint A, uint m, uint M) public pure returns (uint units){
        // ((M + A) * (m * A + M * a))/(4 * M * A)
        uint numerator1 = M.add(A);
        uint numerator2 = m.mul(A);
        uint numerator3 = M.mul(a);
        uint numerator = numerator1.mul((numerator2.add(numerator3)));
        uint denominator = 4 * (M.mul(A));
        units = numerator.div(denominator);
        return units;
    }
}
