const MAI = artifacts.require("MAI.sol");
const tools = require('./core-math.js');
var BigNumber = require('bignumber.js');
var _1 = 1 * 10 ** 18; // 1 ETH
const initialETH = 4*10**16;

contract('MAI', function (accounts) {
  constructor(accounts)

})

//################################################################
  // CONSTRUCTION
  function constructor(accounts) {
    // acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    // it("constructor events", async () => {
    //   let USD = artifacts.require("tokenUSD.sol");
    //   instanceUSD = await USD.deployed();
    //   addressUSD = instanceUSD.address;

    //   let MAI = artifacts.require("MAI.sol");
    //   instanceMAI = await MAI.deployed();
    //   addressMAI = instanceMAI.address;   
    
    // });
  
    }
//################################################################
// HELPERS

function BN2Int(BN) { return +(new BigNumber(BN)).toFixed() }

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }

function int2BN(int) { return (new BigNumber(int)) }

function int2Str(int) { return ((int).toString()) }

function int2Num(int) { return (int / (1 * 10 ** 18)) }

function roundBN2StrD(BN) { 
  const BN_ = (new BigNumber(BN)).toPrecision(11, 1)
return (new BigNumber(BN_)).toFixed()
}

function roundBN2StrDR(BN, x) {
  const BN_ = (new BigNumber(BN)).toPrecision(x, 1)
  return (new BigNumber(BN_)).toFixed()
}

function assertLog(number1, number2, test) {
  return console.log(+(new BigNumber(number1)).toFixed(), +(new BigNumber(number2)).toFixed(), test)
}

function logType(thing) {
  return console.log("%s type", thing, typeof thing)
}

    // async function logPool(addressAsset, amount) {
    //   const assetBalance = BN2Str((await instanceMAI.mapAsset_ExchangeData(addressAsset)).balanceAsset);;
    //   const assetMAIBalance = BN2Str((await instanceMAI.mapAsset_ExchangeData(addressAsset)).balanceMAI);;
    //   const ValueInMai =  +(new BigNumber( tools.getValueInMai(addressAsset))).toFixed(); 
    //   const PriceInUSD =  +(new BigNumber( tools.getEtherPriceInUSD(int2Str(amount)))).toFixed();
    //   const PPInMAI =  +(new BigNumber( tools.getEtherPPinMAI(int2Str(amount)))).toFixed();
    //   console.log(" ")
    //   console.log("-------------------Asset Pool DETAILS--------------------")
    //   console.log('ETH Balance of Pool: ', assetBalance/(_1))
    //   console.log('MAI Balance of Pool: ', assetMAIBalance/(_1))
    //   console.log('MAI Price from Pool: ', ValueInMai/(_1))
    //   console.log('USD Price of Ether:  ', PriceInUSD/(_1))
    //   console.log('MAI PuPow from Pool: ', PPInMAI/(_1))
    //   }
      
    //   async function logETHBalances(acc0, acc1, ETH) {
    //     const acc0AssetBal = await web3.eth.getBalance(acc0)
    //     const acc1AssetBal = await web3.eth.getBalance(acc1)
    //     const addressETHBalance = await web3.eth.getBalance(ETH)
    //     console.log(" ")
    //     console.log("----------------------ETH BALANCES---------------------")
    //     console.log('acc0:       ', acc0AssetBal/(_1))
    //     console.log('acc1:       ', acc1AssetBal/(_1))
    //     console.log('addressETH: ', addressETHBalance/(_1))
    //   }

    //     async function logMAIBalances(acc0, acc1, MAIAddress) {
    //     const acc0MAIBalance = BN2Int(await instanceMAI.balanceOf(acc0))
    //     const acc1MAIBalance = BN2Int(await instanceMAI.balanceOf(acc1))
    //     const addressMAIBalance = BN2Int(await instanceMAI.balanceOf(MAIAddress))
    //     console.log(" ")
    //     console.log("-----------------------MAI BALANCES--------------------")
    //     console.log('acc0:       ', acc0MAIBalance/(_1))  
    //     console.log('acc1:       ', acc1MAIBalance/(_1))  
    //     console.log('addressMAI: ', addressMAIBalance/(_1)) 
 
    //     } 

    //     async function logCDP(CDPAddress) {
    //     const CDP = BN2Int(await instanceMAI.mapAddress_MemberData.call(CDPAddress))
    //     const Collateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    //     const Debt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
    //     console.log(" ")
    //     console.log("-----------------------CDP DETAILS----------------------")
    //     console.log('CDP:        ', CDP)
    //     console.log('Collateral: ', Collateral/(_1)) 
    //     console.log('Debt:       ', Debt/(_1)) 
   
    // } 

module.exports = {
  BN2Int: function(BN) {
      return BN2Int(BN)
  },
    BN2Str: function(BN) {
      return BN2Str(BN)
  },
  int2BN: function(a) {
    return int2BN(a)
  },
  int2Str: function(int) {
    return int2Str(int)
  },
  int2Num: function(int) {
    return int2Num(int)
  },
  roundBN2StrD: function(BN) {
    return roundBN2StrD(BN)
  },
  roundBN2StrDR: function(BN, x) {
    return roundBN2StrDR(BN, x)
  },
  assertLog: function(number1, number2, test) {
    return assertLog(number1, number2, test)
  },
  logType: function(thing) {
    return logType(thing)
  },
  logETHBalances: function(acc0, acc1, ETH) {
    return logETHBalances(acc0, acc1, ETH)
  },
  logMAIBalances: function(acc0, acc1, MAI) {
    return logMAIBalances(acc0, acc1, MAI)
  },
  logCDP: function(CDPAddress) {
    return logCDP(CDPAddress)
  },
  logPool: function(addressAsset, amount) {
    return logPool(addressAsset, amount)
  },

  };
  
  
 


 
  



 


  


