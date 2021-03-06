
var BigNumber = require('bignumber.js');

function getBN(BN) { return (new BigNumber(BN)) }

function BN2Int(BN) { return +(new BigNumber(BN)).toFixed() }

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }

function int2BN(int) { return (new BigNumber(int)) }

function int2Str(int) { return ((int).toString()) }

function int2Num(int) { return (int / (1 * 10 ** 18)) }

function ETH(x) {
  return new BigNumber(x * 10 ** 18);
}
function ETH01(x) {

  return new BigNumber(x * 10 ** 16);
}
function ETH001(x) {
  return new BigNumber(x * 10 ** 15);
}
function floorBN(BN) {
  return (new BigNumber(BN)).integerValue(1)
}
function ceilBN(BN) {
  return (new BigNumber(BN)).integerValue(0)
}
function roundBN2StrD(BN) {
  const BN_ = (new BigNumber(BN)).toPrecision(3, 1)
  return (new BigNumber(BN_)).toFixed()
}
function roundBN2StrU(BN) {
  const BN_ = (new BigNumber(BN)).toPrecision(11, 0)
  return (new BigNumber(BN_)).toFixed()
}
function roundBN2StrDR(BN, x) {
  const BN_ = (new BigNumber(BN)).toPrecision(x, 1)
  return (new BigNumber(BN_)).toFixed()
}
function roundBN2StrUR(BN, x) {
  const BN_ = (new BigNumber(BN)).toPrecision(x, 0)
  return (new BigNumber(BN_)).toFixed()
}
function assertLog(number1, number2, test) {
  return console.log(+(new BigNumber(number1)).toFixed(), +(new BigNumber(number2)).toFixed(), test)
}
function logType(thing) {
  return console.log("%s type", thing, typeof thing)
}

module.exports = {
  ceilBN: ceilBN
  ,
  BN2Int: BN2Int
  ,
  BN2Str: BN2Str,
  getBN,
  int2BN: int2BN
  ,
  int2Str: int2Str
  ,
  int2Num: int2Num
  ,
  ETH: ETH
  ,
  ETH01: ETH01
  ,
  ETH001: ETH001
  ,
  floorBN,
  roundBN2StrD: roundBN2StrD
  ,
  roundBN2StrU,
  roundBN2StrDR: roundBN2StrDR
  ,
  roundBN2StrUR: roundBN2StrUR
  ,
  assertLog: assertLog
  ,
  logType: logType
  ,

};
















