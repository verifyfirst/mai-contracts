const tools = require('./core-math.js');
var BigNumber = require('bignumber.js');

var instanceMAI; var addressMAI; var instanceUSD; var addressUSD;
var acc0; var acc1; var acc2; var acc3;

var _1 = 1 * 10 ** 18; // 1 ETH
var _dot01 = new BigNumber(1 * 10 ** 16)
const addressETH = "0x0000000000000000000000000000000000000000"
var addressUSD;
const etherPool = { "asset": (1 * _dot01).toString(), "mai": (2 * _1).toString() }
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() }
const initialETH = 3*10**16;

//################################################################
// HELPERS

function BN2Int(BN) { return +(new BigNumber(BN)).toFixed() }

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }

function int2BN(int) { return (new BigNumber(int)) }

function int2Str(int) { return ((int).toString()) }

function int2Num(int) { return (int / (1 * 10 ** 18)) }

function roundBN2StrD(BN) { 
  const BN_ = (new BigNumber(BN)).toPrecision(11, 1)
return (new BigNumber(BN)).toFixed()
}

function roundBN2StrDR(BN, x) {
  const BN_ = (new BigNumber(BN)).toPrecision(x, 1)
  return (new BigNumber(BN)).toFixed()
}

function assertLog(number1, number2, test) {
  console.log(+(new BigNumber(number1)).toFixed(), +(new BigNumber(number2)).toFixed(), test)
}

function logType(thing) {
  console.log("%s type", thing, typeof thing)
}

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
  logAccounts: function(_accCDP) {
    return logAccounts(_accCDP)
  },
  logPools: function(_eth) {
    return logPools(_eth)
  },

  };
  
  contract('MAI', function (accounts) {

    constructor(accounts)

  })

 //################################################################
  // CONSTRUCTION
  function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]
  
    it("constructor events", async () => {
      let USD = artifacts.require("tokenUSD.sol");
      instanceUSD = await USD.new();
      addressUSD = instanceUSD.address;
      let MAI = artifacts.require("MAI.sol");
      instanceMAI = await MAI.new(addressUSD, {value:initialETH});
      addressMAI = instanceMAI.address;
      await instanceMAI.approve(addressMAI, (usdPool.mai), {from:acc0})
      await instanceUSD.approve(addressMAI, (usdPool.asset), {from:acc0})
      await instanceMAI.addExchange(addressUSD, (usdPool.asset), (usdPool.mai), {from:acc0})
    });
    }


 function logPools(_eth) {
  // log balances of etherPool.asset, etherPool.mai, price(_1), PP(_1)
  const etherPoolETHBalance = +(new BigNumber(etherPool.asset)).toFixed();
  const etherPoolMAIBalance = +(new BigNumber(etherPool.mai)).toFixed();
  const ethValueInMai =  +(new BigNumber( tools.getMai(addressETH))).toFixed(); 
  const ethPriceInUSD =  +(new BigNumber( tools.getEtherPriceInUSD(int2Str(_eth)))).toFixed();
  const ethPPInMAI =  +(new BigNumber( tools.getEtherPPinMAI(int2Str(_eth)))).toFixed();
  console.log(" ")
  console.log("-------------------etherPool DETAILS--------------------")
  console.log('ETH Balance of etherPool: ', etherPoolETHBalance/(_1))
  console.log('MAI Balance of etherPool: ', etherPoolMAIBalance/(_1))
  console.log('MAI Price from etherPool: ', ethValueInMai/(_1))
  console.log('USD Price from etherPool: ', ethPriceInUSD/(_1))
  console.log('MAI PuPow from etherPool: ', ethPPInMAI/(_1))
  
  
  // log balances of usdPool.asset, etherPool.mai, price(_1), PP(_1)
  const usdPoolETHBalance = BN2Int(usdPool.asset);
  const usdPoolMAIBalance = BN2Int(usdPool.mai);
  const usdValueInMai = BN2Int(tools.getMai(addressUSD))
  const maiPPInUSD = BN2Int(tools.getMAIPPInUSD(int2Str(_eth)))
  console.log(" ")
  console.log("---------------------usdPool DETAILS--------------------")
  console.log('ETH Balance of usdPool:   ', usdPoolETHBalance/(_1))
  console.log('MAI Balance of usdPool:   ', usdPoolMAIBalance/(_1))
  console.log('MAI Price from usdPool:   ', usdValueInMai/(_1))
  console.log('MAI PuPow from usdPool:   ', maiPPInUSD/(_1))
  }
  
  async function logAccounts(_accCDP) {
    
    // log balanceETH of addressMAI, acc0, acc1
    const acc0ETHbalance = await web3.eth.getBalance(acc0)
    const acc1ETHbalance = await web3.eth.getBalance(acc1)
    const addressETHbalance = await web3.eth.getBalance(addressETH)
    console.log(" ")
    console.log("----------------------ETH BALANCES---------------------")
    console.log('acc0:       ', acc0ETHbalance/(_1))
    console.log('acc1:       ', acc1ETHbalance/(_1))
    console.log('addressETH: ', addressETHbalance/(_1))
  
    // log balanceMAI of addressMAI, acc0, acc1
    const acc0MAIBalance = BN2Int(await instanceMAI.balanceOf(acc0))
    const acc1MAIBalance = BN2Int(await instanceMAI.balanceOf(acc1))
    const addressMAIBalance = BN2Int(await instanceMAI.balanceOf(addressMAI))
    console.log(" ")
    console.log("-----------------------MAI BALANCES--------------------")
    console.log('acc0:       ', acc0MAIBalance/(_1))  
    console.log('acc1:       ', acc1MAIBalance/(_1))  
    console.log('addressMAI: ', addressMAIBalance/(_1))  
  
    // log CDP of accCDP: collateral, debt
    const CDP = BN2Int(await instanceMAI.mapAddress_MemberData.call(_accCDP))
    const Collateral = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).collateral)
    const Debt = BN2Int((await instanceMAI.mapCDP_Data.call(CDP)).debt)
    console.log(" ")
    console.log("-----------------------CDP DETAILS----------------------")
    console.log('CDP:        ', CDP)
    console.log('Collateral: ', Collateral/(_1)) 
    console.log('Debt:       ', Debt/(_1)) 

  }
  



 


  


