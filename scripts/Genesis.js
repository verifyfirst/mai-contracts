const bre = require("@nomiclabs/buidler");
const BigNumber = require('bignumber.js');
var Web3 = require("web3");
var xlsx = require('xlsx');
var _ = require('../test/utils.js');
var m = require('../test/math.js');
const { ETH } = require("../test/utils.js");
var { writeFile } = require('fs').promises;
var { readFile } = require('fs').promises;
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
var arrayPrices = [5]; var accounts; var txCount = 0;
const _1BN = new BigNumber(1 * 10 ** 18) //1
var _1 = 1 * 10 ** 18;
var ethPrice_world;
var accTr = 1;
var yoloAcc = 1;
var EthAcc =1;
//==============Time Variables ===============
var weekTracker = 1;
var dayTracker = 1;
var snapShotTracker = 1;
var ethTr = 1;
var fetchPrice =1;
//============Anchors Pool Parameters==========
const amountMAI = 200            //Starting MAI balance for anchor pools
const amountAsset = 201          //Starting Asset balance for anchor pools
const usd = { "asset": (_1BN * amountAsset).toString(), "mai": (_1BN * amountMAI).toString() }
const maxCollateral = 4;
var liquidationAmount = 2500
const accountTotal = 100
// ============Minter Parameters===============
const minterCollateralETH = 0.6     // Minter Bot ETH Allowance
const minterColRatio = 150  // Minters Default Collaterisation
//=============Sensible Staker Parameters ================
const swapETHMAX = 0.4        // Staker Bot ETH Swap
const swapETHMin = 0.01 

//===============Yolo Staker Parameters ================
const ysCollateralETH = 0.5     //ETH amount to opne CDP to get mai
const ysStakeAsset = 10
const ysETHStake = 0.1  // Staker Bot Asset 
const ysMAIStake = 5    // Staker Bot MAI

const swapTkn = 1
//===============eth arbitrageur ==============
const buyETHLarge = 1
const sellETHLarge = 1
const buyETHSmall = 0.2
const sellETHSmall = 0.2
const eCollateralETH = 1.5
//==============swap token===============
const swapTokenMAX = 5        // Staker Bot ETH Swap
const swapTokenMin = 1 
//===================MAIN ======================
async function main() {
  await buildEXCEL()
  await bre.run('compile');
  const initialETH = 3 * 10 ** 20; //30
  accounts = (await web3.eth.getAccounts())
  MAI_instance = await MAI.new({ value: initialETH });
  MAI_ADDRESS = MAI_instance.address;
  arrayAddr.push(MAI_ADDRESS)
  arrayInst.push(MAI_instance)
  await deployAnchors()
  await distributeTokens()
  await addAnchors()
  await approveAccounts()
  await accountSnap()
  let anchorCount = (await MAI_instance.getAnchorsCount())
  if (anchorCount = 5) {
    for (let i = 1; i <= 5376; i++) {
      console.log(`hr ${i}`)
      
      if (i == snapShotTracker) {
       await snapshotData()
       let maiPrice = (_.BN2Int((await MAI_instance.medianMAIValue()))/_1)
        console.log(`ETH ACCOUNT ${EthAcc}`)
        snapShotTracker += 24
      }
      if (i == fetchPrice){
        await getETHPrice(ethTr)
        console.log("WORLD $" + ethPrice_world)
        await checkETHPrice()
        await poolBalance(ETH_ADDRESS)
        ethTr += 1
        fetchPrice +=24
      }
      if (i == dayTracker) {
        await swapToken()
        await sensibleStaker1()
        dayTracker += 24
      }
      if (i == weekTracker) {
        await minter1()
        await yoloStaker1()
        await swapETH()
        await sensibleStaker1()
        weekTracker += 48
      }
      await anchorArbitrageur()
      await ethArbitrageur1()
      await liquidatorBot()
      if(i== 5376){
        let withDraw = (await withdrawLiquidity())
        let finalSnap = (await snapshotData())
        let CDPsnap = (await finalCDPSnap())
        let accSnap =  (await accountSnap())
       
      }
      
      
    }
    
  }
}


//===============Genesis Functions=====================
async function deployAnchors() {
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
  let totalSupply = (await Anchor1_instance.totalSupply())
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
async function distributeTokens() {
  let usdAmount = _.getBN(1 * 10 ** 22)//10000
  for (let i = 1; i < accountTotal; i++) {
    let txBUSD = (await arrayInst[1].transfer(accounts[i], usdAmount, { from: accounts[0] }))
    let bUSDBal = (await arrayInst[1].balanceOf(accounts[i]))
    txCount += 1

    let txDAI = (await arrayInst[2].transfer(accounts[i], usdAmount, { from: accounts[0] }))
    let DAIBal = (await arrayInst[2].balanceOf(accounts[i]))
    txCount += 1

    let txPAX = (await arrayInst[3].transfer(accounts[i], usdAmount, { from: accounts[0] }))
    let PAXBal = (await arrayInst[3].balanceOf(accounts[i]))
    txCount += 1

    let txTETH = (await arrayInst[4].transfer(accounts[i], usdAmount, { from: accounts[0] }))
    let TETHBal = (await arrayInst[4].balanceOf(accounts[i]))
    txCount += 1

    let txUSDC = (await arrayInst[5].transfer(accounts[i], usdAmount, { from: accounts[0] }))
    let USDCBal = (await arrayInst[5].balanceOf(accounts[i]))
    txCount += 1
    //console.log("account" + i + ":"+ _.BN2Str(bUSDBal), _.BN2Str(DAIBal),_.BN2Str(PAXBal), _.BN2Str(TETHBal), _.BN2Str(USDCBal))
  }


}
async function approveAccounts() {
  for (let i = 1; i < accountTotal; i++) {
    let account = accounts[i]
    let approveAmount = _.getBN(1 * 10 ** 22)//1000
    let bUSD = (await arrayInst[1].approve(MAI_ADDRESS, approveAmount, { from: account }))
    let DAI = (await arrayInst[2].approve(MAI_ADDRESS, approveAmount, { from: account }))
    let tether = (await arrayInst[3].approve(MAI_ADDRESS, approveAmount, { from: account }))
    let paxos = (await arrayInst[4].approve(MAI_ADDRESS, approveAmount, { from: account }))
    let usdc = (await arrayInst[5].approve(MAI_ADDRESS, approveAmount, { from: account }))
  }

}


//======================Minter====================
async function minter1() {
  let defaultCollaterisation = minterColRatio
  let account = accounts[accTr]
  let ethAmount = _.getBN(_1 * minterCollateralETH)
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    let existingCollateral = _.BN2Str((await MAI_instance.mapCDP_Data(CDP)).collateral)
     if(!existingCollateral < (_1 * maxCollateral)){
      accTr += 1
     }
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    txCount += 1
    try{
      let txRemint = (await MAI_instance.remintMAIFromCDP(defaultCollaterisation, { from: account, to: MAI_ADDRESS }))
      txCount += 1
    }catch(err){console.log(`Failed remint`)}
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(defaultCollaterisation, { from: account, value: ethAmount }))
    txCount += 1
  }
  let randomPool = Math.floor(Math.random() * 6);
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))

    if (randomPool == 0) {
      let maiBal = (await MAI_instance.balanceOf(account))
      let maiAmount = _.getBN(((maiBal * 99.99)/100))
      let ethStakeAmount = _.getBN((_1 * ((maiAmount.toFixed()) / ethPrice_contract)))
      let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
    } else {
      let address = arrayAddr[randomPool]
      let maiBal = (await MAI_instance.balanceOf(account))
      let maiAmount = _.getBN(((maiBal * 95)/100))
      let assetStakeAmount = maiAmount
      if((maiBal - (_1*0.1)) < (maiAmount.toFixed())){
        let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetStakeAmount, maiAmount, { from: account }))
        txCount += 1
      }
    }
}

//======================Sensible Staker=====================
async function sensibleStaker1() {
  let account = accounts[9]
  let randomEth = Math.floor(Math.random() * swapETHMAX) + swapETHMin;
  let ethSwapAmount = _.getBN(_1 * randomEth)
  let txSwap = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSwapAmount, { from: account, value: ethSwapAmount }))
  txCount += 1
  let ethPrice_contract = _.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  let maiAmount = _.BN2Str((await MAI_instance.balanceOf(account)))
  //console.log(maiAmount, ethPrice_contract)
  let ethStakeAmount = _.getBN((_1 * (maiAmount / (ethPrice_contract))))
  let txStakeMAI = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  txCount += 1
}

//======================Yolo Staker=====================
async function yoloStaker1() {
  let randomPool = Math.floor(Math.random() * 6);
  let account = accounts[yoloAcc]
  let maiBal = _.BN2Str((await MAI_instance.balanceOf(account)))
  let ethAmount = (_1BN * ysCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  let maiAmount = _.getBN(_1 * ysMAIStake)
  if((maiBal - (_1*0.1)) < (maiAmount.toFixed())){
  if (CDP > 0) {
    let existingCollateral = _.BN2Str((await MAI_instance.mapCDP_Data(CDP)).collateral)
    if(existingCollateral > (_1 * 0.5)){
      yoloAcc +=1
     }
     let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
     try{
      let txRemint = (await MAI_instance.remintMAIFromCDP(130, { from: account, to: MAI_ADDRESS }))
      txCount += 1
     }catch(err){
      console.log(`Failed to remint`)
     }
     
   
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(130, { from: account, value: ethAmount }))
    txCount += 1
  }
}else{
  if (randomPool == 0) {
    let assetAmount = (_1BN * ysETHStake).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: assetAmount }))
    txCount += 1
  } else {
    let address = arrayAddr[randomPool]
    let assetAmount = (_1BN * ysStakeAsset).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, { from: account }))
    txCount += 1
  }
}
}

//======================LIQUIDATOR=====================
async function liquidatorBot() {
  let account = accounts[10]
  let cdpCount = (await MAI_instance.countOfCDPs())
  for (let i = 1; i <= cdpCount; i++) {
    let canLiquidate = (await MAI_instance.checkLiquidationPoint(i))
    if(canLiquidate == true){
      try{
        let txliquidate = (await MAI_instance.liquidateCDP(i, liquidationAmount, { from: account }))
        txCount += 1
      }catch(err){
        console.log("failed to liquidate")
      }
      await spendRevenue()
      await ethArbitrageur1()
       
          
    }
    
  }
}

async function swapToken(){
  let randomAcc = Math.floor(Math.random() * 20) + 1
  let account = accounts[randomAcc]
  let randomPool = Math.floor(Math.random() * 6);
  if(!randomPool == 0){
    let address = arrayAddr[randomPool]
    let randomAmount = Math.floor(Math.random() * swapTokenMAX) + swapTokenMin;
    let tokenAmount = (_1BN * randomAmount).toString()
    let txSwap = (await MAI_instance.swapTokenToToken(address, ETH_ADDRESS, tokenAmount, { from: account}))
    txCount += 1
  }
  
}

async function swapETH(){
  let randomAcc = Math.floor(Math.random() * 20) + 1;
  let account = accounts[randomAcc]
  let randomPool = Math.floor(Math.random() * 6);
  if(!randomPool == 0){
    let address = arrayAddr[randomPool];
    let randomEth = Math.floor(Math.random() * swapETHMAX) + swapETHMin;
    let ethSwapAmount = (_1BN * randomEth).toString()
    let txSwap = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, address, ethSwapAmount, { from: account, value: ethSwapAmount }))
    txCount += 1
  }
 
}
//======================EHT Arbitrageur=====================
async function ethArbitrageur1() {
  //console.log(`eth account ${EthAcc}`)
  let account = accounts[EthAcc]
  let ethAmount = _.getBN(_1 * eCollateralETH)
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  let existingCollateral = _.BN2Int((await MAI_instance.mapCDP_Data(CDP)).collateral)
        
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  if (ethPrice_contract < ethPrice_world) {
    let diff =  _.BN2Int(m.percentDifference(ethPrice_world,ethPrice_contract ))
    if(diff > 15){
      var maiSellAmount = buyETHLarge * ethPrice_contract
      var ethBuyAmount = _.getBN(_1 * maiSellAmount)
    }else{
      var maiSellAmount = buyETHSmall * ethPrice_contract
      var ethBuyAmount = _.getBN(_1 * maiSellAmount)
    }
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        if((existingCollateral/_1) > maxCollateral){
          EthAcc +=1
         }
        let add = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount}))
        txCount += 1
        try{
          let remint = (await MAI_instance.remintMAIFromCDP(minterColRatio, { from: account, to: MAI_ADDRESS }))
          txCount += 1
          try{
            let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
            txCount += 1
          }catch(err){
            console.log('Failed to buy')
          }
          
        }catch(err){
          console.log(`Failed remint - eth arber`)
      }
      } else {
       let open = (await MAI_instance.openCDP(minterColRatio, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      try{
        let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
        txCount += 1
      }catch(err){
        console.log('Failed to buy')
      }
      
    }
  } else if (ethPrice_contract > ethPrice_world) {
    let diff =  _.BN2Int(m.percentDifference(ethPrice_contract,ethPrice_world ))
    if(diff > 15){
      let ethSellAmount = (_1BN * sellETHLarge).toString()
      try{
        let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
        txCount += 1
      }catch(err){
        console.log("failed to sell ")
      }
      
    }else{
      let ethSellAmount = (_1BN * sellETHSmall).toString()
      try{
        let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
        txCount += 1
      }catch(err){
        console.log("failed to sell ")
      }
    }
    
    
  }
}

async function spendRevenue(){
  let insolvency = (await MAI_instance.totalInsolvency())
  let revenue = (await MAI_instance.revenue())
  let account = accounts[5]
  if((insolvency/_1) > 100 && (revenue/_1) > 100 ){
    try{
      let spendRevenue = (await MAI_instance.spendRevenue({from:account}))
    }catch(err){
      console.log('out of revenue')
    }
   
  }
}
//======================Anchor Arbitrageur=====================
async function anchorArbitrageur() {
  let randomPool = Math.floor(Math.random() * 6);
  if(!randomPool == 0){
    let address = arrayAddr[randomPool]
    let randomAcc = Math.floor(Math.random() * 20) + 1;
  let account = accounts[randomAcc]
  let ethPrice = _.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  let ethamount = _.floorBN(_.getBN((_1 * (swapTkn / (ethPrice/_1)))))
  let tokenAmount =(_1*swapTkn).toString()
  let poolPrice = _.BN2Str((await MAI_instance.calcValueInMAI(address)))
  
  if((poolPrice/_1) < 1){
   let txSwap =  (await MAI_instance.swapTokenToToken(ETH_ADDRESS, address, ethamount, {from: account, value: ethamount}))
  }
  if((poolPrice/_1) > 1){
    let txSwapp = (await MAI_instance.swapTokenToToken(address, ETH_ADDRESS, tokenAmount, {from: account}))

  }
  }
  
}
async function withdrawLiquidity(){
  for(let x = 0; x < 6; x++){
    let address = arrayAddr[x]
    for (let i = 1; i < accountTotal; i++) {
      let account = accounts[i]
      if(x == 0){
        let stakerUnits = (await MAI_instance.calcStakerUnits(ETH_ADDRESS, account))
        if(stakerUnits > 0){
          let bp = 9999
          let withdraw = (await MAI_instance.removeLiquidityPool(ETH_ADDRESS, bp, {from:account}))
          console.log(`Removed Liquidity ${account}`)
          txCount +=1
        }
      }else{
        let stakerUnits = (await MAI_instance.calcStakerUnits(address, account))
        if(stakerUnits > 0){
          let bp = 9999
          let withdraw = (await MAI_instance.removeLiquidityPool(address, bp, {from:account}))
          console.log(`Removed Liquidity ${account}`)
          txCount +=1
        }
      }
      
      
    }
  }
  
}

//==============Get Data From Contract================

async function checkETHPrice() {
  let ethPrice_contract = _.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  console.log("ETH = $" + (_.BN2Str(_.floorBN(ethPrice_contract / _1))))
}
async function poolBalance(address) {
  let poolDepth = _.BN2Str((await MAI_instance.mapAsset_ExchangeData(address)).balanceMAI);
  let poolBalance = _.BN2Str((await MAI_instance.mapAsset_ExchangeData(address)).balanceAsset);
  console.log("==========Pool Details=========")
  console.log("Depth =" + _.BN2Str(poolDepth / _1) + " : " + "Balance =" + _.BN2Str(poolBalance / _1))
}

//Save data to excel
async function buildEXCEL() {
  const workBook = xlsx.utils.book_new();
  const maiSheet = xlsx.utils.aoa_to_sheet([["MAI_PRICE", "MAI_TOTALSUPPLY", "txCOUNT", "Revenue", "Insolvency", "ETH_PRICE", "DAI_PRICE","PAXOS_PRICE", "USDT_PRICE", "BUSD_PRICE", "USDC_PRICE"]], {
    cellDates: true,
  });
  const ethPOOLSheet = xlsx.utils.aoa_to_sheet([[ "POOL_BALANCE", "POOL_DEPTH"]], {
    cellDates: true,
  });
  const daiPOOLSheet = xlsx.utils.aoa_to_sheet([[ "POOL_BALANCE", "POOL_DEPTH"]], {
    cellDates: true,
  });
  const paxPOOLSheet = xlsx.utils.aoa_to_sheet([[ "POOL_BALANCE", "POOL_DEPTH"]], {
    cellDates: true,
  });
  const usdtPOOLSheet = xlsx.utils.aoa_to_sheet([[ "POOL_BALANCE", "POOL_DEPTH"]], {
    cellDates: true,
  });
  const usdCPOOLSheet = xlsx.utils.aoa_to_sheet([[ "POOL_BALANCE", "POOL_DEPTH"]], {
    cellDates: true,
  });
  const busdPOOLSheet = xlsx.utils.aoa_to_sheet([[ "POOL_BALANCE", "POOL_DEPTH"]], {
    cellDates: true,
  });
  const cdpDetails = xlsx.utils.aoa_to_sheet([["Count", "Debt", "Collateral", "account", "Can_Liquidate"]], {
    cellDates: true,
  });
  const accDetails = xlsx.utils.aoa_to_sheet([["address", "ETH_Balance", "MAI_Balance"]], {
    cellDates: true,
  });

  xlsx.utils.book_append_sheet(workBook, maiSheet, 'maiData');
  xlsx.utils.book_append_sheet(workBook, ethPOOLSheet, 'ethPoolData');
  xlsx.utils.book_append_sheet(workBook, daiPOOLSheet, 'daiPoolData');
  xlsx.utils.book_append_sheet(workBook, paxPOOLSheet, 'paxPoolData');
  xlsx.utils.book_append_sheet(workBook, usdtPOOLSheet, 'usdtPOOLSheet');
  xlsx.utils.book_append_sheet(workBook, usdCPOOLSheet, 'usdCPOOLSheet');
  xlsx.utils.book_append_sheet(workBook, busdPOOLSheet, 'busdPOOLSheet');
  xlsx.utils.book_append_sheet(workBook, cdpDetails, 'cdpDetails');
  xlsx.utils.book_append_sheet(workBook, accDetails, 'accDetails');

  const result = xlsx.write(workBook, {
    bookType: 'xlsx', // output file type
    type: 'buffer', // data type of output
    compression: false // turn on zip compression
  });

  // Write to a file
  writeFile('./maiData.xlsx', result)
    .catch((error) => {
      console.log(error);
    });
}
async function snapshotData() {
  const workBook = xlsx.readFile('./maiData.xlsx');
  const maisheet = workBook.Sheets[workBook.SheetNames[0]];
  const ethsheet = workBook.Sheets[workBook.SheetNames[1]];
  const daisheet = workBook.Sheets[workBook.SheetNames[2]];
  const paxsheet = workBook.Sheets[workBook.SheetNames[3]];
  const usdtsheet = workBook.Sheets[workBook.SheetNames[4]];
  const usdcsheet = workBook.Sheets[workBook.SheetNames[5]];
  const busdsheet = workBook.Sheets[workBook.SheetNames[6]];
  let daipool_address = arrayAddr[1]
  let paxpool_address = arrayAddr[2]
  let usdtpool_address = arrayAddr[3]
  let usdcpool_address = arrayAddr[4]
  let busdpool_address = arrayAddr[5]
  let maiPrice = (_.BN2Int((await MAI_instance.medianMAIValue()))/_1)
  let maiSupply = _.BN2Int((await MAI_instance.totalSupply()))
  let revenue = _.BN2Str((await MAI_instance.revenue()))
  let totalInsolvency = _.BN2Str((await MAI_instance.totalInsolvency()))
  let ethPrice_contract = _.BN2Int((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  let daiPrice = _.BN2Int((await MAI_instance.calcValueInAsset(daipool_address)))
  let paxPrice = _.BN2Int((await MAI_instance.calcValueInAsset(paxpool_address)))
  let usdtPrice = _.BN2Int((await MAI_instance.calcValueInAsset(usdtpool_address)))
  let usdcPrice = _.BN2Int((await MAI_instance.calcValueInAsset(usdcpool_address)))
  let busdPrice = _.BN2Int((await MAI_instance.calcValueInAsset(busdpool_address)))
  xlsx.utils.sheet_add_aoa(maisheet, [[(maiPrice), (maiSupply / _1), txCount,(revenue/_1),(totalInsolvency/_1),(ethPrice_contract / _1),(daiPrice / _1),(paxPrice / _1),(usdtPrice / _1),(busdPrice / _1),(usdcPrice / _1) ]], { origin: -1 });

  
  let ethDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(ETH_ADDRESS)).balanceMAI);
  let ethBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(ETH_ADDRESS)).balanceAsset);
  xlsx.utils.sheet_add_aoa(ethsheet, [[(ethBalance / _1), (ethDepth / _1)]], { origin: -1 });
   
  
   
   let daiDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(daipool_address)).balanceMAI);
   let daiBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(daipool_address)).balanceAsset);
   xlsx.utils.sheet_add_aoa(daisheet, [[ (daiBalance / _1), (daiDepth / _1)]], { origin: -1 });
 
   
  
   let paxDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(paxpool_address)).balanceMAI);
   let paxBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(paxpool_address)).balanceAsset);
   xlsx.utils.sheet_add_aoa(paxsheet, [[ (paxBalance / _1), (paxDepth / _1)]], { origin: -1 });
 
   
   
   let usdtDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(usdtpool_address)).balanceMAI);
   let usdtBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(usdtpool_address)).balanceAsset);
   xlsx.utils.sheet_add_aoa(usdtsheet, [[ (usdtBalance / _1), (usdtDepth / _1)]], { origin: -1 });
 
   
   
   let usdcDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(usdcpool_address)).balanceMAI);
   let usdcBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(usdcpool_address)).balanceAsset);
   xlsx.utils.sheet_add_aoa(usdcsheet, [[ (usdcBalance / _1), (usdcDepth / _1)]], { origin: -1 });
 
   
   
   let busdDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(busdpool_address)).balanceMAI);
   let busdBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(busdpool_address)).balanceAsset);
   xlsx.utils.sheet_add_aoa(busdsheet, [[ (busdBalance / _1), (busdDepth / _1)]], { origin: -1 });
 


  const result = xlsx.write(workBook, {
    bookType: 'xlsx', // output file type
    type: 'buffer', // data type of output
    compression: false // turn on zip compression
  });

  // Write to a file
  writeFile('./maiData.xlsx', result).catch((error) => {
    console.log(error);
  });

}
async function accountSnap(){
  for(let i = 1; i<accountTotal; i++){
    const workBook = xlsx.readFile('./maiData.xlsx');
    const accSheet = workBook.Sheets[workBook.SheetNames[8]];
    let address = accounts[i]
    //console.log(address)
    let ethBalance = _.BN2Int(await web3.eth.getBalance(address))
    let maiBalance = _.BN2Int(await MAI_instance.balanceOf(address))
    xlsx.utils.sheet_add_aoa(accSheet, [[(address), (ethBalance / _1), (maiBalance/_1)]], { origin: -1 });
    
    const result = xlsx.write(workBook, {
      bookType: 'xlsx', // output file type
      type: 'buffer', // data type of output
      compression: false // turn on zip compression
    });
    // Write to a file
    writeFile('./maiData.xlsx', result).catch((error) => {
      console.log(error);
    });
    await sleep(100)
  }
}
async function finalCDPSnap(){
  let cdpCount = (await MAI_instance.countOfCDPs())
  for(let i = 1; i <= cdpCount; i ++){
    const workBook = xlsx.readFile('./maiData.xlsx');
    const cdpsheet = workBook.Sheets[workBook.SheetNames[7]];
    let existingDebt = _.BN2Str((await MAI_instance.mapCDP_Data(i)).debt)
    let existingCollateral = _.BN2Str((await MAI_instance.mapCDP_Data(i)).collateral)
    let address = ((await MAI_instance.mapCDP_Data(i)).address)
    let canLiquidate = (await MAI_instance.checkLiquidationPoint(i))
    xlsx.utils.sheet_add_aoa(cdpsheet, [[(i), (existingDebt / _1), (existingCollateral/_1), address, canLiquidate]], { origin: -1 });
    
    const result = xlsx.write(workBook, {
      bookType: 'xlsx', // output file type
      type: 'buffer', // data type of output
      compression: false // turn on zip compression
    });
  
    // Write to a file
    writeFile('./maiData.xlsx', result).catch((error) => {
      console.log(error);
    });
    await sleep(100)
  }


   
}
//Get daily ETH price
async function getETHPrice(i) {
  const workBook = xlsx.readFile('./scripts/ethPrice.xlsx');
  var sheet = workBook.Sheets[workBook.SheetNames[0]];
  let c = i;
  let address = 'A' + c
  var desired_cell = sheet[address];
  ethPrice_world = (desired_cell ? desired_cell.v : undefined);
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
