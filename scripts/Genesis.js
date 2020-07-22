const bre = require("@nomiclabs/buidler");
const BigNumber = require('bignumber.js');
var Web3 = require("web3");
const _ = require('../test/utils.js');

//=============Get Contracts================
const MAI = artifacts.require("MAI");
const Token = artifacts.require("Koven");
const Anchor1 = artifacts.require("bUSD");
const Anchor2 = artifacts.require("DAI");
const Anchor3 = artifacts.require("PAXOS");
const Anchor4 = artifacts.require("Tether");
const Anchor5 = artifacts.require("USDC");

//=============Set Up Globals==========
var MAI_instance; var Anchor1_instance; var Anchor2_instance; 
var Anchor3_instance; var Anchor4_instance; var Anchor5_instance; 
var Token_instance;var addressMAI;
var arrayAddrAnchor = []; var arrayInstAnchor = [];
var acc0; 
let web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
var arrayPrices =[5];
var accounts;
var txCount = 0;
//==============Time Variables ===============
var Weeklytracker = 0


//============Anchors Starting Amounts==========
const _1BN = new BigNumber(1 * 10 ** 19) //30
var _1 = 1 * 10 ** 18;
const usd1 = { "asset": (_1BN * 1.03).toString(), "mai": (1 * _1BN).toString() }
const usd2 = { "asset": (_1BN * 1.02).toString(), "mai": (1 * _1BN).toString() }
const usd3 = { "asset": (_1BN * 1.01).toString(), "mai": (1 * _1BN).toString() }
const usd4 = { "asset": (_1BN * 0.99).toString(), "mai": (1 * _1BN).toString() }
const usd5 = { "asset": (_1BN * 0.98).toString(), "mai": (1 * _1BN).toString() }

//===================MAIN ======================
async function main() {
   await bre.run('compile');
   const initialETH = 3 * 10 ** 19; //30
    accounts = (await web3.eth.getAccounts())
   MAI_instance = await MAI.new({ value: initialETH});
   addressMAI = MAI_instance.address;
   await deployAnchors()
   await addAnchors()
   await distributeTokens()
   let anchorCount = (await MAI_instance.getAnchorsCount())
      if(anchorCount = 5){
        for(let i = 0; i<4032; i++){
          if(i == Weeklytracker){
           await minter()
           console.log(txCount)
           console.log("One Week")
           Weeklytracker += 48 
          }

          if(i%2==0){
            
          }
          await sleep(1000)
          
        }





      }
}
//===============Genesis Functions=====================
async function deployAnchors(){
  Token_instance = await Token.new();
  Anchor1_instance = await Anchor1.new();
  Anchor2_instance = await Anchor2.new();
  Anchor3_instance = await Anchor3.new();
  Anchor4_instance = await Anchor4.new();
  Anchor5_instance = await Anchor5.new();
  
  var addressUSD1 = Anchor1_instance.address;
  arrayAddrAnchor.push(addressUSD1)
  arrayInstAnchor.push(Anchor1_instance)
  var addressUSD2 = Anchor2_instance.address;
  arrayAddrAnchor.push(addressUSD2)
  arrayInstAnchor.push(Anchor2_instance)
  var addressUSD3 = Anchor3_instance.address;
  arrayAddrAnchor.push(addressUSD3)
  arrayInstAnchor.push(Anchor3_instance)
  var addressUSD4 = Anchor4_instance.address;
  arrayAddrAnchor.push(addressUSD4)
  arrayInstAnchor.push(Anchor4_instance)
  var addressUSD5 = Anchor5_instance.address;
  arrayAddrAnchor.push(addressUSD5)
  arrayInstAnchor.push(Anchor5_instance)
}
async function addAnchors() {
    await Anchor1_instance.approve(addressMAI, (usd1.asset), { from: acc0 })
    await MAI_instance.addAnchor(arrayAddrAnchor[0], (usd1.asset), (usd1.mai), { from: accounts[0] })
    txCount += 1
    await Anchor2_instance.approve(addressMAI, (usd2.asset), { from: acc0 })
    await MAI_instance.addAnchor(arrayAddrAnchor[1], (usd2.asset), (usd2.mai), { from: accounts[0] })
    txCount += 1
    await Anchor3_instance.approve(addressMAI, (usd3.asset), { from: acc0 })
    await MAI_instance.addAnchor(arrayAddrAnchor[2], (usd3.asset), (usd3.mai), { from: accounts[0] })
    txCount += 1
    await Anchor4_instance.approve(addressMAI, (usd4.asset), { from: acc0 })
    await MAI_instance.addAnchor(arrayAddrAnchor[3], (usd4.asset), (usd4.mai), { from: accounts[0] })
    txCount += 1
    await Anchor5_instance.approve(addressMAI, (usd5.asset), { from: acc0 })
    await MAI_instance.addAnchor(arrayAddrAnchor[4], (usd5.asset), (usd5.mai), { from: accounts[0] })
    txCount += 1
}
async function distributeTokens(){
  let usdAmount = _.getBN(5*10**20)//500
  for(let i = 1; i < 7; i++){
    let txBUSD = (await arrayInstAnchor[0].transfer(accounts[i],usdAmount,{from: accounts[0]}))
    txCount += 1
    let bUSDBal = (await arrayInstAnchor[0].balanceOf(accounts[i]))
    let txDAI = (await arrayInstAnchor[1].transfer(accounts[i],usdAmount,{from: accounts[0]}))
    txCount += 1
    let DAIBal = (await arrayInstAnchor[1].balanceOf(accounts[i]))
    let txPAX = (await arrayInstAnchor[2].transfer(accounts[i],usdAmount,{from: accounts[0]}))
    txCount += 1
    let PAXBal = (await arrayInstAnchor[2].balanceOf(accounts[i]))
    let txTETH = (await arrayInstAnchor[3].transfer(accounts[i],usdAmount,{from: accounts[0]}))
    txCount += 1
    let TETHBal = (await arrayInstAnchor[3].balanceOf(accounts[i]))
    let txUSDC = (await arrayInstAnchor[4].transfer(accounts[i],usdAmount,{from: accounts[0]}))
    txCount += 1
    let USDCBal = (await arrayInstAnchor[4].balanceOf(accounts[i]))
    //console.log("account" + i + ":"+ _.BN2Str(bUSDBal), _.BN2Str(DAIBal),_.BN2Str(PAXBal), _.BN2Str(TETHBal), _.BN2Str(USDCBal))
  }
  
  
}



//======================Minter Bot=====================
// Purpose : Mints MAI with ETH, then stakes
// Frequency : Twice a week (RLT) || Every 84 seconds (ACLT)
async function minter(){
  let defaultCollaterisation = 150 
  let randomAccount =  Math.floor(Math.random() * 10) + 1; 
  let ethAmount = _.getBN(1*10*18)//1
  let txOpenCDP = (await MAI_instance.openCDP(defaultCollaterisation, {from:accounts[randomAccount], value: ethAmount}))
  txCount += 1
  let randomPool = Math.floor(Math.random() * 6) + 1; 
  if(randomPool = 1){
    let txStake = (await MAI_instance.addLiquidityToEtherPool())
    txCount += 1
  }else{
    let txStake = (await MAI_instance.addLiquidityToAssetPool()) 
  }
  
}

//==============Get Data From Contract================
async function checkMAIPrice() {
  // let mai_price = _.BN2Str((await MAI_instance.medianMAIValue()))
  // console.log(mai_price/_1)
}
async function getAnchors(){
  for(var i = 0; i < 5; i++){
    await MAI_instance.updatePrice()
    const usdName = await arrayInstAnchor[i].name();
    const usdAddress = arrayInstAnchor[i].address;
    const usdValue = _.BN2Str((await MAI_instance.calcValueInMAI(usdAddress)))
    arrayPrices.push(usdValue);
    console.log(usdName,":", usdValue/_1)
  }
   
}



//=====================Time Machine=========================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//====================System Starter========================
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
