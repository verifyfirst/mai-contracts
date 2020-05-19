
var BigNumber = require('bignumber.js');


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
  return new BigNumber(x * 10 ** 14);
}
function roundBN2StrD(BN) {
  const BN_ = (new BigNumber(BN)).toPrecision(11, 1)
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
  BN2Int: BN2Int
  ,
  BN2Str: BN2Str
  ,
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
  roundBN2StrD: roundBN2StrD
  ,
  roundBN2StrDR: roundBN2StrDR
  ,
  roundBN2StrUR: roundBN2StrUR
  ,
  assertLog: assertLog
  ,
  logType: logType
  ,

};
















