const bre = require("@nomiclabs/buidler");
const BigNumber = require('bignumber.js');
var Web3 = require("web3");
 var xlsx = require('xlsx');
 var _ = require('../test/utils.js');
 var {writeFile} = require('fs').promises;
 var {readFile} = require('fs').promises;
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
var MAI_ADDRESS; const ETH_ADDRESS = "0x0000000000000000000000000000000000000000"
var arrayAddr = []; var arrayInst = []; var acc0; 
//let web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
var arrayPrices =[5]; var accounts; var txCount = 0;
const _1BN = new BigNumber(1 * 10 ** 18) //1
var _1 = 1 * 10 ** 18;

//==============Time Variables ===============
var monthTracker = 0;
var weekTracker = 0;
var dayTracker = 0;
var hourTracker = 0;

//============Anchors Pool Parameters==========
const amountMAI = 200            //Starting MAI balance for anchor pools
const amountAsset = 201          //Starting Asset balance for anchor pools
const usd = { "asset": (_1BN * amountAsset).toString(), "mai": (_1BN * amountMAI).toString()}



// ============Minter Parameters===============
const mETH = 0.2     // Minter Bot ETH Allowance
const mCollat = 150  // Minters Default Collaterisation

//=============Sensible Staker Parameters ================
const swapETH = 0.2        // Staker Bot ETH Swap

//===============Yolo Staker Parameters ================
const ysETH = 0.2     //ETH amount to opne CDP to get mai
const ysAsset = 10  // Staker Bot Asset 
const ysMAI = 1    // Staker Bot MAI

//===============eth PRICE BOSS Parameters ================
const epBETH = 0.055     //ETH amount into ETH Pool
const epBMAI = 0
const epETH = 0.1 


//===================MAIN ======================
async function main() {
   await bre.run('compile');
   const initialETH = 3 * 10 ** 19; //30
    accounts = (await web3.eth.getAccounts())
   MAI_instance = await MAI.new({ value: initialETH});
   MAI_ADDRESS = MAI_instance.address;
   arrayAddr.push(MAI_ADDRESS)
   arrayInst.push(MAI_instance)
   await deployAnchors()
   await addAnchors()
   await distributeTokens()
   await buildEXCEL()
   let anchorCount = (await MAI_instance.getAnchorsCount())
      if(anchorCount = 5){
        for(let i = 0; i<4032; i++){
         //console.log("Hour" + i)
         //await ethPriceBoss()
         //await checkETHPrice()
         
         if(i == hourTracker){
          await snapshotData()
          await liquidatorBot()
          hourTracker +=3
        }
         if(i == dayTracker){
          
           await minter()
           dayTracker += 12          
         }
         if(i == weekTracker){
           
           // await yoloStaker()
           // await sensibleStaker()
          weekTracker += 48 
         }
         
         if(i == monthTracker){
           monthTracker += 672
         }
         await sleep(1000)
       }
     }
}


//===============Genesis Functions=====================
async function deployAnchors(){
 //Token_instance = await Token.new();
 Anchor1_instance = await Anchor1.new();
 Anchor2_instance = await Anchor2.new();
 Anchor3_instance = await Anchor3.new();
 Anchor4_instance = await Anchor4.new();
 Anchor5_instance = await Anchor5.new();
 
 var addressUSD1 = Anchor1_instance.address;
 arrayAddr.push(addressUSD1)
 arrayInst.push(Anchor1_instance)
 var addressUSD2 = Anchor2_instance.address;
 arrayAddr.push(addressUSD2)
 arrayInst.push(Anchor2_instance)
 var addressUSD3 = Anchor3_instance.address;
 arrayAddr.push(addressUSD3)
 arrayInst.push(Anchor3_instance)
 var addressUSD4 = Anchor4_instance.address;
 arrayAddr.push(addressUSD4)
 arrayInst.push(Anchor4_instance)
 var addressUSD5 = Anchor5_instance.address;
 arrayAddr.push(addressUSD5)
 arrayInst.push(Anchor5_instance)
}
async function addAnchors() {
 let totalSupply =  (await Anchor1_instance.totalSupply())
 //console.log(_.BN2Str(totalSupply/_1))
   await arrayInst[1].approve(MAI_ADDRESS, totalSupply, { from: acc0 })
   await MAI_instance.addAnchor(arrayAddr[1], (usd.asset), (usd.mai), { from: accounts[0] })
   txCount += 1
   await arrayInst[2].approve(MAI_ADDRESS, totalSupply, { from: acc0 })
   await MAI_instance.addAnchor(arrayAddr[2], (usd.asset), (usd.mai), { from: accounts[0] })
   txCount += 1
   await arrayInst[3].approve(MAI_ADDRESS, totalSupply, { from: acc0 })
   await MAI_instance.addAnchor(arrayAddr[3], (usd.asset), (usd.mai), { from: accounts[0] })
   txCount += 1
   await arrayInst[4].approve(MAI_ADDRESS, totalSupply, { from: acc0 })
   await MAI_instance.addAnchor(arrayAddr[4], (usd.asset), (usd.mai), { from: accounts[0] })
   txCount += 1
   await arrayInst[5].approve(MAI_ADDRESS, totalSupply, { from: acc0 })
   await MAI_instance.addAnchor(arrayAddr[5], (usd.asset), (usd.mai), { from: accounts[0] })
   txCount += 1
}
async function distributeTokens(){
 let usdAmount = _.getBN(5*10**20)//500
 for(let i = 1; i < 7; i++){
   let txBUSD = (await arrayInst[1].transfer(accounts[i],usdAmount,{from: accounts[0]}))
   let bUSDBal = (await arrayInst[1].balanceOf(accounts[i]))
   txCount += 1
   
   let txDAI = (await arrayInst[2].transfer(accounts[i],usdAmount,{from: accounts[0]}))
   let DAIBal = (await arrayInst[2].balanceOf(accounts[i]))
   txCount += 1
   
   let txPAX = (await arrayInst[3].transfer(accounts[i],usdAmount,{from: accounts[0]}))
   let PAXBal = (await arrayInst[3].balanceOf(accounts[i]))
   txCount += 1
   
   let txTETH = (await arrayInst[4].transfer(accounts[i],usdAmount,{from: accounts[0]}))
   let TETHBal = (await arrayInst[4].balanceOf(accounts[i]))
   txCount += 1
   
   let txUSDC = (await arrayInst[5].transfer(accounts[i],usdAmount,{from: accounts[0]}))
   let USDCBal = (await arrayInst[5].balanceOf(accounts[i]))
   txCount += 1
   //console.log("account" + i + ":"+ _.BN2Str(bUSDBal), _.BN2Str(DAIBal),_.BN2Str(PAXBal), _.BN2Str(TETHBal), _.BN2Str(USDCBal))
 }
 
 
}
async function approveAccounts(){
 for(let i = 1; i < 20; i++){
   let account = accounts[i]
   let approveAmount = (_1BN * 500).toString()
   let bUSD = (await arrayInst[1].approve(MAI_ADDRESS, approveAmount, { from: account }))
   let DAI = (await arrayInst[2].approve(MAI_ADDRESS, approveAmount, { from: account }))
   let tether = (await arrayInst[3].approve(MAI_ADDRESS, approveAmount, { from: account }))
   let paxos = (await arrayInst[4].approve(MAI_ADDRESS, approveAmount, { from: account }))
   let usdc = (await arrayInst[5].approve(MAI_ADDRESS, approveAmount, { from: account }))
 }
 
}


//======================Minter=====================
// Accounts 1-3
async function minter(){
 let defaultCollaterisation = mCollat 
 let randomAccount =  Math.floor(Math.random() * 3)+1; 
 let account = accounts[randomAccount]
 let ethAmount =  (_1BN * mETH).toString()
 console.log(ethAmount/_1)
 let txOpenCDP = (await MAI_instance.openCDP(defaultCollaterisation, {from:account, value: ethAmount}))
 txCount += 1
 let randomPool = Math.floor(Math.random() * 6); 
 let eth_price = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))
 
 if(randomPool == 0){
   let maiBal = (await MAI_instance.balanceOf(account))
   let maiAmount = ((maiBal * 99.99)/100).toString()
   let ethStakeAmount = (_1BN * (maiAmount/eth_price)).toString()
   let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool( maiAmount, {from:account, value:ethStakeAmount})) 
   console.log("Minter STAKED! " + "Asset:" + _.roundBN2StrD(ethStakeAmount/_1)  + "  MAI:"  +  _.BN2Str(_.floorBN(maiAmount/_1)) + " > " + "ETH")
   await poolBalance(ETH_ADDRESS)
 }else{
   let address = arrayAddr[randomPool]
   let anchor_price = _.BN2Str(await MAI_instance.calcValueInAsset(address))
   let maiBal = (await MAI_instance.balanceOf(account))
   let maiAmount = ((maiBal * 95)/100).toString()
   let assetStakeAmount = maiAmount
   let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetStakeAmount, maiAmount, {from:account})) 
   let pool = (await arrayInst[randomPool].symbol())
   //await poolBalance(address)
   console.log("Minter STAKED! " + "Asset:" + _.BN2Str(_.floorBN(assetStakeAmount/_1))  + "  MAI:"  +  _.BN2Str(_.floorBN(maiAmount/_1)) + " > " + pool)
 }
}

//======================Sensible Staker=====================
// Account 4
async function sensibleStaker(){
 let account = accounts[4]
 let ethSwapAmount = (_1BN * swapETH).toString()
 let txSwap = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSwapAmount, {from: account, value: ethSwapAmount}))
 console.log("Sensible SWAPPED! " + swapETH + " for MAI")
 let eth_price = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))
 let maiBal = (await MAI_instance.balanceOf(account))
 let maiAmount = ((maiBal * 99.99)/100).toString()
 let ethStakeAmount = (_1BN * (maiAmount/eth_price)).toString()
 let txStakeMAI = (await MAI_instance.addLiquidityToEtherPool(maiAmount, {from:account, value:ethStakeAmount}))
 txCount += 1
 // await poolBalance(ETH_ADDRESS)
 console.log("Sensible STAKED! " + "Asset:" + _.roundBN2StrD(ethStakeAmount/_1)  + "  MAI:"  +  _.BN2Str(_.floorBN(maiAmount/_1)) + " > " + "ETH")
   
}

//======================Yolo Staker=====================
// Purpose : Open CDP - Stakes assymetrically
// Frequency : Twice a week (NT) || Every 84 seconds (ACLT)
// Account 5
async function yoloStaker(){
 let randomPool = Math.floor(Math.random() * 6)+1; 
 let account = accounts[5]
 let ethAmount =  (_1BN * ysETH).toString()
 let txOpenCDP = (await MAI_instance.openCDP(150, {from:account, value: ethAmount}))
 let assetAmount = (_1BN * ysAsset).toString()
 let maiAmount = (_1BN * ysMAI).toString()
 let address = arrayAddr[randomPool]
 let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, {from:account})) 
 let pool = (await arrayInst[randomPool].symbol())
 console.log("Yolo STAKED! " + "Asset:" + _.BN2Str(_.floorBN(assetAmount/_1))  + "  MAI:"  +  _.BN2Str(_.floorBN(maiAmount/_1)) + " > " + pool)
 
}

//======================ETH PRICE BOSS=====================
// Purpose : Drives the ETH price somewhere - 1% per day
// Frequency : every hour (NT) || Every 1 second (ACLT)
// Account 6
async function ethPriceBoss(){
 let account = accounts[6]
 let ethAmount =  (_1BN * epBETH).toString()
 let txOpenCDP = (await MAI_instance.openCDP(150, {from:account, value: ethAmount}))
 await getCDPDetails(account)
 txCount += 1
 let maiBal = (await MAI_instance.balanceOf(account))
 let ethStakeAmount = (_1BN * 0).toString()
 let maiAmount = ((maiBal * 99.99)/100).toString()
 let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool( maiAmount, {from:account, value:ethStakeAmount})) 
 txCount += 1
 
 // let ethAmountStake = (_1BN * epETH).toString()
 // let maiStake = (_1BN * 0).toString()   
 // let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool( maiStake, {from:account, value:ethAmountStake})) 
 // txCount += 1

}

//======================LIQUIDATOR =====================
// Purpose : Liquidates UnSafe CDPs
// Frequency : Every 4hrs || Every 12 seconds (ACLT)
// Account 7
//uint CDP, uint liquidation
async function liquidatorBot () {
 let account = accounts[7]
 let liquidationAmount = 2500
 let cdpCount = (await MAI_instance.countOfCDPs())
 //console.log(_.BN2Str(cdpCount))
 for(let i = 1; i <= cdpCount; i++){
   
   console.log(`checking : ${i}`)
    let canLiquidate = (await MAI_instance.checkLiquidationPoint(i))
    if(canLiquidate == true){
      console.log(`liquidate : ${i}`)
      //let txliquidate = (await MAI_instance.liquidateCDP(i, liquidationAmount, {from: account}))
      //txCount +=1
      //console.log("LIQUIDATED CDP " + i + " Fee " + (_.BN2Str(txliquidate.logs[0].args.feeClaimed)/_1))
    }
 }
}



//==============Get Data From Contract================
async function checkMAIPrice() {
  await MAI_instance.updatePrice()
  let mai_price = _.BN2Str((await MAI_instance.medianMAIValue()))
  console.log("MAI = $"+_.roundBN2StrD(mai_price/_1))

}
async function checkETHPrice(){
  let eth_price = _.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  console.log("ETH = $"+(_.BN2Str(_.floorBN(eth_price/_1))))
}
async function getAnchors(){
  for(var i = 1; i < 6; i++){
    
    const usdName = await arrayInst[i].name();
    const usdAddress = arrayInst[i].address;
    const usdValue = _.BN2Str((await MAI_instance.calcValueInMAI(usdAddress)))
    arrayPrices.push(usdValue);
    //console.log(usdName,":", usdValue/_1)
  }
   
}
async function poolBalance(address){
let poolDepth = _.BN2Str((await MAI_instance.mapAsset_ExchangeData(address)).balanceMAI);
let poolBalance = _.BN2Str((await MAI_instance.mapAsset_ExchangeData(address)).balanceAsset);
console.log("==========Pool Details=========")
console.log("Depth =" + _.BN2Str(_.floorBN(poolDepth/_1))+ " : " + "Balance =" + _.BN2Str(_.floorBN(poolBalance/_1)) )
}

async function buildEXCEL(){
const workBook= xlsx.utils.book_new();

const maiSheet = xlsx.utils.aoa_to_sheet([["MAI_PRICE", "MAI_TOTALSUPPLY", "txCOUNT"]],{
  cellDates:true,});
  
const ethPOOLSheet = xlsx.utils.aoa_to_sheet([["ETH_PRICE", "ETH_POOL_BALANCE","ETH_POOL_DEPTH", "ETH_POOL_STAKES", "ETH_POOL_VALUE" ]],{
  cellDates:true,});
const daiPOOLSheet = xlsx.utils.aoa_to_sheet([["DAI_PRICE", "DAI_POOL_BALANCE","DAI_POOL_DEPTH", "DAI_POOL_STAKES", "DAI_POOL_VALUE" ]],{
  cellDates:true,});
const paxPOOLSheet = xlsx.utils.aoa_to_sheet([["PAX_PRICE", "PAX_POOL_BALANCE","PAX_POOL_DEPTH", "PAX_POOL_STAKES", "PAX_POOL_VALUE" ]],{
  cellDates:true,});

 xlsx.utils.book_append_sheet(workBook, maiSheet,'maiData');
 xlsx.utils.book_append_sheet(workBook, ethPOOLSheet,'ethPoolData');
 xlsx.utils.book_append_sheet(workBook, daiPOOLSheet,'daiPoolData');
 xlsx.utils.book_append_sheet(workBook, paxPOOLSheet,'paxPoolData');

const result = xlsx.write(workBook, {
    bookType:'xlsx', // output file type
    type:'buffer', // data type of output
    compression: false // turn on zip compression
});

// Write to a file
writeFile('./maiData.xlsx',result)
.catch((error)=>{
    console.log(error);
});
}

async function snapshotData(){
  const workBook = xlsx.readFile('./maiData.xlsx');
  const maisheet = workBook.Sheets[workBook.SheetNames[0]];
  const ethsheet = workBook.Sheets[workBook.SheetNames[1]];
  const daisheet = workBook.Sheets[workBook.SheetNames[2]];
  const paxsheet = workBook.Sheets[workBook.SheetNames[3]];
let maiPrice = _.BN2Int((await MAI_instance.medianMAIValue()))
let maiSupply = _.BN2Int((await MAI_instance.totalSupply()))

  xlsx.utils.sheet_add_aoa(maisheet, [[(maiPrice/_1),(maiSupply/_1), txCount]], {origin: -1});

  // xlsx.utils.sheet_add_aoa(ethsheet, [[1.00,200, 33]], {origin: -1});
  // xlsx.utils.sheet_add_aoa(daisheet, [[1.00,200, 33]], {origin: -1});
  // xlsx.utils.sheet_add_aoa(paxsheet, [[1.00,200, 33]], {origin: -1});

  const result = xlsx.write(workBook, {
    bookType:'xlsx', // output file type
    type:'buffer', // data type of output
    compression: false // turn on zip compression
});

  // Write to a file
  writeFile('./maiData.xlsx', result).catch((error)=>{
    console.log(error);
});

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
