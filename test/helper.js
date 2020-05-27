var BigNumber = require('bignumber.js');
var _1 = 1 * 10 ** 18;
const usdPool = { "asset": (2 * _1).toString(), "mai": (2 * _1).toString() };
const addressETH = "0x0000000000000000000000000000000000000000"
const math = require('./math.js');
const _1BN = new BigNumber(1 * 10 ** 18)
async function calcValueInMai(instance, token) {
  var result;
  if (token == addressETH) {
    assetBal = new BigNumber((await instance.mapAsset_ExchangeData(token)).balanceAsset);
    maiBal = new BigNumber((await instance.mapAsset_ExchangeData(token)).balanceMAI);
    result = (_1BN.times(maiBal)).div(assetBal)
  } else {
    assetBal = new BigNumber((await instance.mapAsset_ExchangeData(token)).balanceAsset);
    maiBal = new BigNumber((await instance.mapAsset_ExchangeData(token)).balanceMAI);
    result = (_1BN.times(maiBal)).div(assetBal)
  }
  return result.toFixed()
}
// async function calcValueInAsset() {
//   usdBal = new BigNumber(usdPool.asset)
//   maiBal = new BigNumber(usdPool.mai)
//   return ((_1BN.times(usdBal)).div(maiBal)).toFixed()
// }
async function calcEtherPriceInUSD(instance, amount) {
  const _amount = new BigNumber(amount)
  const etherPriceInMai = new BigNumber(await calcValueInMai(instance, addressETH))
  const maiPriceInUSD = new BigNumber(await calcValueInAsset())
  const ethPriceInUSD = (maiPriceInUSD.times(etherPriceInMai)).div(_1BN)
  return ((_amount.times(ethPriceInUSD)).div(_1BN)).toFixed()
}
async function calcEtherPPinMAI(instance, amount) {
  assetBal = new BigNumber((await instance.mapAsset_ExchangeData(addressETH)).balanceAsset);
  maiBal = new BigNumber((await instance.mapAsset_ExchangeData(addressETH)).balanceMAI);
  const outputMai = math.calcCLPSwap(amount, assetBal, maiBal);
  return outputMai;
}
async function calcMAIPPInUSD(amount) {
  usdBal = new BigNumber(usdPool.asset)
  maiBal = new BigNumber(usdPool.mai)
  const outputUSD = math.calcCLPSwap(amount.toString(), maiBal, usdBal);
  return outputUSD;
}
async function checkLiquidateCDP(instance, _collateral, _debt) {
  assetBal = new BigNumber((await instance.mapAsset_ExchangeData(addressETH)).balanceAsset);
  maiBal = new BigNumber((await instance.mapAsset_ExchangeData(addressETH)).balanceMAI);
  const outputMai = math.calcCLPLiquidation(_collateral, assetBal, maiBal);
  var canLiquidate
  if (outputMai < _debt) {
    canLiquidate = true;
  } else {
    canLiquidate = false;
  }
  return canLiquidate;
}
async function logPool(instance, addressAsset, amount) {
  const assetBalance = +(new BigNumber((await instance.mapAsset_ExchangeData(addressAsset)).balanceAsset));
  const assetMAIBalance = +(new BigNumber((await instance.mapAsset_ExchangeData(addressAsset)).balanceMAI));
  const ValueInMai = +(new BigNumber(await calcValueInMai(instance, addressAsset)));
  const PriceInUSD = +(new BigNumber(await calcEtherPriceInUSD(instance, amount)));
  const PPInMAI = +(new BigNumber(await calcEtherPPinMAI(instance, amount)));
  console.log(" ")
  console.log("-------------------Asset Pool Details -------------------")
  console.log('Asset Pool Balance    :  ', assetBalance / (_1))
  console.log('MAI Pool Balance      :  ', assetMAIBalance / (_1))
  console.log('MAI Price from Pool   :  ', ValueInMai / (_1))
  console.log('USD Price eth:mai     :  ', PriceInUSD / (_1))
  console.log('MAI PP from eth:mai   :  ', PPInMAI / (_1))
}
async function logETHBalances(acc0, acc1, ETH) {
  const acc0AssetBal = await web3.eth.getBalance(acc0)
  const acc1AssetBal = await web3.eth.getBalance(acc1)
  const addressETHBalance = await web3.eth.getBalance(ETH)
  console.log(" ")
  console.log("----------------------ETH BALANCES---------------------")
  console.log('acc0:       ', acc0AssetBal / (_1))
  console.log('acc1:       ', acc1AssetBal / (_1))
  console.log('addressETH: ', addressETHBalance / (_1))
}
async function logMAIBalances(instance, acc0, acc1, MAIAddress) {
  // instance = await MAI.deployed();
  const acc0MAIBalance = BN2Int(await instance.balanceOf(acc0))
  const acc1MAIBalance = BN2Int(await instance.balanceOf(acc1))
  const addressMAIBalance = BN2Int(await instance.balanceOf(MAIAddress))
  console.log(" ")
  console.log("-----------------------MAI BALANCES--------------------")
  console.log('acc0:       ', acc0MAIBalance / (_1))
  console.log('acc1:       ', acc1MAIBalance / (_1))
  console.log('addressMAI: ', addressMAIBalance / (_1))

}
async function logCDP(instance, CDPAddress) {
  // instance = await MAI.deployed();
  const CDP = new BigNumber(await instance.mapAddress_MemberData.call(CDPAddress)).toFixed();
  const Collateral = new BigNumber((await instance.mapCDP_Data.call(CDP)).collateral).toFixed();
  const Debt = new BigNumber((await instance.mapCDP_Data.call(CDP)).debt).toFixed();
  console.log(" ")
  console.log("-----------------------CDP DETAILS----------------------")
  console.log('CDP:        ', CDP)
  console.log('Collateral: ', Collateral / (_1))
  console.log('Debt:       ', Debt / (_1))

}

module.exports = {
  logCDP: logCDP
  ,
  logMAIBalances: logMAIBalances
  ,
  logETHBalances: logETHBalances
  ,
  logPool: logPool
  ,
  checkLiquidateCDP: checkLiquidateCDP
  ,
  calcMAIPPInUSD: calcMAIPPInUSD
  ,
  calcEtherPPinMAI: calcEtherPPinMAI
  ,
  calcEtherPriceInUSD: calcEtherPriceInUSD
  ,
  calcValueInAsset: calcValueInAsset
  ,
  calcValueInMai: calcValueInMai
  ,

}

