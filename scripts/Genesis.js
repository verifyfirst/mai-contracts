const bre = require("@nomiclabs/buidler");
const BigNumber = require('bignumber.js');
var Web3 = require("web3");
var xlsx = require('xlsx');
var _ = require('../test/utils.js');
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
//==============Time Variables ===============
var monthTracker = 1;
var weekTracker = 1;
var dayTracker = 1;
var hourTracker = 1;
var ethTr = 1;
//============Anchors Pool Parameters==========
const amountMAI = 200            //Starting MAI balance for anchor pools
const amountAsset = 201          //Starting Asset balance for anchor pools
const usd = { "asset": (_1BN * amountAsset).toString(), "mai": (_1BN * amountMAI).toString() }



// ============Minter Parameters===============
const minterCollateralETH = 0.5     // Minter Bot ETH Allowance
const minterColRatio = 150  // Minters Default Collaterisation

//=============Sensible Staker Parameters ================
const swapETH = 0.1        // Staker Bot ETH Swap

//===============Yolo Staker Parameters ================
const ysCollateralETH = 0.5     //ETH amount to opne CDP to get mai
const ysStakeAsset = 10
const ysETHStake = 0.5  // Staker Bot Asset 
const ysMAIStake = 1    // Staker Bot MAI

//===============eth arbitrageur ==============
const buyETH = 0.1
const sellETH = 0.1
const eCollateralETH = 0.3


//===================MAIN ======================
async function main() {
  await bre.run('compile');
  const initialETH = 3 * 10 ** 20; //300
  accounts = (await web3.eth.getAccounts())
  MAI_instance = await MAI.new({ value: initialETH });
  MAI_ADDRESS = MAI_instance.address;
  arrayAddr.push(MAI_ADDRESS)
  arrayInst.push(MAI_instance)
  await deployAnchors()
  await distributeTokens()
  await addAnchors()
  await approveAccounts()
  await buildEXCEL()
  let anchorCount = (await MAI_instance.getAnchorsCount())
  if (anchorCount = 5) {
    for (let i = 1; i <= 4032; i++) {
      await checkETHPrice()
      await poolBalance(ETH_ADDRESS)
      if (i == hourTracker) {
        await snapshotData()
        hourTracker += 4
      }
      if (i == dayTracker) {
        await getETHPrice(ethTr)
        console.log(`WORLD ETH PRICE ${ethPrice_world}`)
        await minter1()
        await minter2()
        await minter3()
        ethTr += 1
        dayTracker += 6
      }
      if (i == weekTracker) {
        await yoloStaker1()
        await yoloStaker2()
        await yoloStaker3()
        await yoloStaker4()
        await yoloStaker5()
        await sensibleStaker1()
        await sensibleStaker2()
        await sensibleStaker3()
        weekTracker += 12
      }
      await ethArbitrageur1()
      await ethArbitrageur2()
      await ethArbitrageur3()
      await ethArbitrageur4()
      await ethArbitrageur5()
      await ethArbitrageur6()
      await liquidatorBot()
      await sleep(1000)
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
  let usdAmount = _.getBN(5 * 10 ** 20)//500
  for (let i = 1; i < 19; i++) {
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
  for (let i = 1; i < 19; i++) {
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
async function minter1() {
  let defaultCollaterisation = minterColRatio
  let account = accounts[1]
  let ethAmount = (_1BN * minterCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(defaultCollaterisation, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(defaultCollaterisation, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  txCount += 1
  let randomPool = Math.floor(Math.random() * 6);
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))

  if (randomPool == 0) {
    let maiBal = (await MAI_instance.balanceOf(account))
    let maiAmount = ((maiBal * 99.99) / 100).toString()
    let ethStakeAmount = (_1BN * (maiAmount / ethPrice_contract)).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  } else {
    let address = arrayAddr[randomPool]
    let maiBal = (await MAI_instance.balanceOf(account))
    let maiAmount = ((maiBal * 95) / 100).toString()
    let assetStakeAmount = maiAmount
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetStakeAmount, maiAmount, { from: account }))
  }
}
async function minter2() {
  let defaultCollaterisation = minterColRatio
  let account = accounts[2]
  let ethAmount = (_1BN * minterCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(defaultCollaterisation, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(defaultCollaterisation, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  txCount += 1
  let randomPool = Math.floor(Math.random() * 6);
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))

  if (randomPool == 0) {
    let maiBal = (await MAI_instance.balanceOf(account))
    let maiAmount = ((maiBal * 99.99) / 100).toString()
    let ethStakeAmount = (_1BN * (maiAmount / ethPrice_contract)).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  } else {
    let address = arrayAddr[randomPool]
    let maiBal = (await MAI_instance.balanceOf(account))
    let maiAmount = ((maiBal * 95) / 100).toString()
    let assetStakeAmount = maiAmount
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetStakeAmount, maiAmount, { from: account }))
  }
}
async function minter3() {
  let defaultCollaterisation = minterColRatio
  let account = accounts[3]
  let ethAmount = (_1BN * minterCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(defaultCollaterisation, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(defaultCollaterisation, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  txCount += 1
  let randomPool = Math.floor(Math.random() * 6);
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))

  if (randomPool == 0) {
    let maiBal = (await MAI_instance.balanceOf(account))
    let maiAmount = ((maiBal * 99.99) / 100).toString()
    let ethStakeAmount = (_1BN * (maiAmount / ethPrice_contract)).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  } else {
    let address = arrayAddr[randomPool]
    let maiBal = (await MAI_instance.balanceOf(account))
    let maiAmount = ((maiBal * 95) / 100).toString()
    let assetStakeAmount = maiAmount
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetStakeAmount, maiAmount, { from: account }))
    let pool = (await arrayInst[randomPool].symbol())
  }
}

//======================Sensible Staker=====================
// Accounts 4-6
async function sensibleStaker1() {
  let account = accounts[4]
  let ethSwapAmount = (_1BN * swapETH).toString()
  let txSwap = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSwapAmount, { from: account, value: ethSwapAmount }))
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))
  let maiBal = (await MAI_instance.balanceOf(account))
  let maiAmount = ((maiBal * 99.99) / 100).toString()
  let ethStakeAmount = (_1BN * (maiAmount / ethPrice_contract)).toString()
  let txStakeMAI = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  txCount += 1

}
async function sensibleStaker2() {
  let account = accounts[5]
  let ethSwapAmount = (_1BN * swapETH).toString()
  let txSwap = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSwapAmount, { from: account, value: ethSwapAmount }))
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))
  let maiBal = (await MAI_instance.balanceOf(account))
  let maiAmount = ((maiBal * 99.99) / 100).toString()
  let ethStakeAmount = (_1BN * (maiAmount / ethPrice_contract)).toString()
  let txStakeMAI = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  txCount += 1

}
async function sensibleStaker3() {
  let account = accounts[6]
  let ethSwapAmount = (_1BN * swapETH).toString()
  let txSwap = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSwapAmount, { from: account, value: ethSwapAmount }))
  let ethPrice_contract = _.BN2Str(await MAI_instance.calcValueInMAI(ETH_ADDRESS))
  let maiBal = (await MAI_instance.balanceOf(account))
  let maiAmount = ((maiBal * 99.99) / 100).toString()
  let ethStakeAmount = (_1BN * (maiAmount / ethPrice_contract)).toString()
  let txStakeMAI = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: ethStakeAmount }))
  txCount += 1

}

//======================Yolo Staker=====================
// Accounts 7-11
async function yoloStaker1() {
  let randomPool = Math.floor(Math.random() * 6);
  let account = accounts[7]
  let ethAmount = (_1BN * ysCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(130, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(130, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  if (randomPool == 0) {
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysETHStake).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: assetAmount }))

  } else {
    let address = arrayAddr[randomPool]
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysStakeAsset).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, { from: account }))
  }
}
async function yoloStaker2() {
  let randomPool = Math.floor(Math.random() * 6);
  let account = accounts[8]
  let ethAmount = (_1BN * ysCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(130, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(130, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  if (randomPool == 0) {
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysETHStake).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: assetAmount }))

  } else {
    let address = arrayAddr[randomPool]
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysStakeAsset).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, { from: account }))

  }
}
async function yoloStaker3() {
  let randomPool = Math.floor(Math.random() * 6);
  let account = accounts[9]
  let ethAmount = (_1BN * ysCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(130, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(130, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  if (randomPool == 0) {
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysETHStake).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: assetAmount }))

  } else {
    let address = arrayAddr[randomPool]
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysStakeAsset).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, { from: account }))

  }
}
async function yoloStaker4() {
  let randomPool = Math.floor(Math.random() * 6);
  let account = accounts[10]
  let ethAmount = (_1BN * ysCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(130, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(130, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  if (randomPool == 0) {
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysETHStake).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: assetAmount }))

  } else {
    let address = arrayAddr[randomPool]
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysStakeAsset).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, { from: account }))

  }
}
async function yoloStaker5() {
  let randomPool = Math.floor(Math.random() * 6);
  let account = accounts[11]
  let ethAmount = (_1BN * ysCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  if (CDP > 0) {
    console.log(`ADDED COLLATERAL`)
    let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
    let txRemint = (await MAI_instance.remintMAIFromCDP(130, { from: account, to: MAI_ADDRESS }))
    await cdpBalance(CDP)
  } else {
    let txOpenCDP = (await MAI_instance.openCDP(130, { from: account, value: ethAmount }))
    console.log(`Opened CDP`)
  }
  if (randomPool == 0) {
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysETHStake).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToEtherPool(maiAmount, { from: account, value: assetAmount }))

  } else {
    let address = arrayAddr[randomPool]
    let maiAmount = (_1BN * ysMAIStake).toString()
    let assetAmount = (_1BN * ysStakeAsset).toString()
    let txStakeAsset = (await MAI_instance.addLiquidityToAssetPool(address, assetAmount, maiAmount, { from: account }))

  }
}


//======================LIQUIDATOR=====================
// Accounts 12
async function liquidatorBot() {
  let account = accounts[12]
  let liquidationAmount = 3333

  let cdpCount = (await MAI_instance.countOfCDPs())
  for (let i = 1; i <= cdpCount; i++) {
    let canLiquidate = (await MAI_instance.checkLiquidationPoint(i))
    if (canLiquidate == true) {
      await poolBalance(ETH_ADDRESS)
      await cdpBalance(i)
      let txliquidate = (await MAI_instance.liquidateCDP(i, liquidationAmount, { from: account }))
      txCount += 1
      console.log("LIQUIDATED CDP " + i + " Fee " + (_.BN2Str(txliquidate.logs[0].args.feeClaimed) / _1))
    }
  }
}

//======================EHT Arbitrageur=====================
// Accounts 13-15
async function ethArbitrageur1() {
  let account = accounts[13]
  let ethAmount = (_1BN * eCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  let maiSellAmount = buyETH * ethPrice_contract
  let ethBuyAmount = (_1BN * maiSellAmount).toString()
  let ethSellAmount = (_1BN * sellETH).toString()
  if (ethPrice_contract < ethPrice_world) {
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
          let txRemint = (await MAI_instance.remintMAIFromCDP(150, { from: account, to: MAI_ADDRESS }))
          txCount += 1
      } else {
        let txOpenCDP = (await MAI_instance.openCDP(150, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
      console.log(`Bought ETH ${ethBuyAmount/_1}`)
      txCount += 1
    }
    
  } else if (ethPrice_contract > ethPrice_world) {
    let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
    console.log(`Sold ETH ${ethBuyAmount/_1}`)
    txCount += 1
  }



}
async function ethArbitrageur2() {
  let account = accounts[14]
  let ethAmount = (_1BN * eCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  let maiSellAmount = buyETH * ethPrice_contract
  let ethBuyAmount = (_1BN * maiSellAmount).toString()
  let ethSellAmount = (_1BN * sellETH).toString()
  if (ethPrice_contract < ethPrice_world) {
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
          let txRemint = (await MAI_instance.remintMAIFromCDP(150, { from: account, to: MAI_ADDRESS }))
          txCount += 1
      } else {
        let txOpenCDP = (await MAI_instance.openCDP(150, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
      console.log(`Bought ETH ${ethBuyAmount/_1}`)
      txCount += 1
    }
    
  } else if (ethPrice_contract > ethPrice_world) {
    let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
    console.log(`Sold ETH ${ethBuyAmount/_1}`)
    txCount += 1
  }



}
async function ethArbitrageur3() {
  let account = accounts[15]
  let ethAmount = (_1BN * eCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  let maiSellAmount = buyETH * ethPrice_contract
  let ethBuyAmount = (_1BN * maiSellAmount).toString()
  let ethSellAmount = (_1BN * sellETH).toString()
  if (ethPrice_contract < ethPrice_world) {
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
          let txRemint = (await MAI_instance.remintMAIFromCDP(150, { from: account, to: MAI_ADDRESS }))
          txCount += 1
      } else {
        let txOpenCDP = (await MAI_instance.openCDP(150, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
      console.log(`Bought ETH ${ethBuyAmount/_1}`)
      txCount += 1
    }
    
  } else if (ethPrice_contract > ethPrice_world) {
    let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
    console.log(`Sold ETH ${ethBuyAmount/_1}`)
    txCount += 1
  }



}
async function ethArbitrageur4() {
  let account = accounts[16]
  let ethAmount = (_1BN * eCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  let maiSellAmount = buyETH * ethPrice_contract
  let ethBuyAmount = (_1BN * maiSellAmount).toString()
  let ethSellAmount = (_1BN * sellETH).toString()
  if (ethPrice_contract < ethPrice_world) {
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
          let txRemint = (await MAI_instance.remintMAIFromCDP(150, { from: account, to: MAI_ADDRESS }))
          txCount += 1
      } else {
        let txOpenCDP = (await MAI_instance.openCDP(150, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
      console.log(`Bought ETH ${ethBuyAmount/_1}`)
      txCount += 1
    }
    
  } else if (ethPrice_contract > ethPrice_world) {
    let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
    console.log(`Sold ETH ${ethBuyAmount/_1}`)
    txCount += 1
  }



}
async function ethArbitrageur5() {
  let account = accounts[17]
  let ethAmount = (_1BN * eCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  let maiSellAmount = buyETH * ethPrice_contract
  let ethBuyAmount = (_1BN * maiSellAmount).toString()
  let ethSellAmount = (_1BN * sellETH).toString()
  if (ethPrice_contract < ethPrice_world) {
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
          let txRemint = (await MAI_instance.remintMAIFromCDP(150, { from: account, to: MAI_ADDRESS }))
          txCount += 1
      } else {
        let txOpenCDP = (await MAI_instance.openCDP(150, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
      console.log(`Bought ETH ${ethBuyAmount/_1}`)
      txCount += 1
    }
    
  } else if (ethPrice_contract > ethPrice_world) {
    let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
    console.log(`Sold ETH ${ethBuyAmount/_1}`)
    txCount += 1
  }



}
async function ethArbitrageur6() {
  let account = accounts[18]
  let ethAmount = (_1BN * eCollateralETH).toString()
  let CDP = _.BN2Str(await MAI_instance.mapAddress_MemberData(account))
  
  let maiBal = (_.BN2Str((await MAI_instance.balanceOf(account))))/_1
  let ethPrice_contract = (_.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS))))/_1
  let maiSellAmount = buyETH * ethPrice_contract
  let ethBuyAmount = (_1BN * maiSellAmount).toString()
  let ethSellAmount = (_1BN * sellETH).toString()
  if (ethPrice_contract < ethPrice_world) {
    if(maiBal < maiSellAmount){
      if (CDP > 0) {
        let txAddCollateral = (await MAI_instance.addCollateralToCDP({ from: account, to: MAI_ADDRESS, value: ethAmount }))
          let txRemint = (await MAI_instance.remintMAIFromCDP(150, { from: account, to: MAI_ADDRESS }))
          txCount += 1
      } else {
        let txOpenCDP = (await MAI_instance.openCDP(150, { from: account, value: ethAmount }))
        txCount += 1
      }
    }else{
      let txBuyETH = (await MAI_instance.swapTokenToToken(MAI_ADDRESS, ETH_ADDRESS, ethBuyAmount, { from: account }))
      console.log(`Bought ETH ${ethBuyAmount/_1}`)
      txCount += 1
    }
    
  } else if (ethPrice_contract > ethPrice_world) {
    let txSellETH = (await MAI_instance.swapTokenToToken(ETH_ADDRESS, MAI_ADDRESS, ethSellAmount, { from: account, value: ethSellAmount }))
    console.log(`Sold ETH ${ethBuyAmount/_1}`)
    txCount += 1
  }



}



//======================Anchor Arbitrageur=====================
// Accounts 16-18
async function anchorArbitrageur() {
  let randomAccount = Math.floor(Math.random() * 19) + 16;
  let account = accounts[randomAccount]
}



//==============Get Data From Contract================
async function checkMAIPrice() {
  await MAI_instance.updatePrice()
  let mai_price = _.BN2Str((await MAI_instance.medianMAIValue()))
  console.log("MAI = $" + _.roundBN2StrD(mai_price / _1))

}
async function checkETHPrice() {
  let ethPrice_contract = _.BN2Str((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  console.log("ETH = $" + (_.BN2Str(_.floorBN(ethPrice_contract / _1))))
}
async function getAnchors() {
  for (var i = 1; i < 6; i++) {

    const usdName = await arrayInst[i].name();
    const usdAddress = arrayInst[i].address;
    const usdValue = _.BN2Str((await MAI_instance.calcValueInMAI(usdAddress)))
    arrayPrices.push(usdValue);
    //console.log(usdName,":", usdValue/_1)
  }

}
async function poolBalance(address) {
  let poolDepth = _.BN2Str((await MAI_instance.mapAsset_ExchangeData(address)).balanceMAI);
  let poolBalance = _.BN2Str((await MAI_instance.mapAsset_ExchangeData(address)).balanceAsset);
  console.log("==========Pool Details=========")
  console.log("Depth =" + _.BN2Str(poolDepth / _1) + " : " + "Balance =" + _.BN2Str(poolBalance / _1))
}
async function cdpBalance(CDP) {
  let existingDebt = _.BN2Str((await MAI_instance.mapCDP_Data(CDP)).debt)
  let existingCollateral = _.BN2Str((await MAI_instance.mapCDP_Data(CDP)).collateral)
  console.log(`Debt ${existingDebt / _1} == Collateral ${existingCollateral / _1}`)
}
async function accountBalances(acc){
let maiBal = (await MAI_instance.balanceOf(acc))
console.log(`Amount MAI = ${maiBal/_1}`)
}
//Save data to excel
async function buildEXCEL() {
  const workBook = xlsx.utils.book_new();

  const maiSheet = xlsx.utils.aoa_to_sheet([["MAI_PRICE", "MAI_TOTALSUPPLY", "txCOUNT"]], {
    cellDates: true,
  });

  const ethPOOLSheet = xlsx.utils.aoa_to_sheet([["ETHPRICE_contract", "ETH_POOL_BALANCE", "ETH_POOL_DEPTH", "ETH_POOL_STAKES", "ETH_POOL_VALUE"]], {
    cellDates: true,
  });
  const daiPOOLSheet = xlsx.utils.aoa_to_sheet([["DAI_PRICE", "DAI_POOL_BALANCE", "DAI_POOL_DEPTH", "DAI_POOL_STAKES", "DAI_POOL_VALUE"]], {
    cellDates: true,
  });
  const paxPOOLSheet = xlsx.utils.aoa_to_sheet([["PAX_PRICE", "PAX_POOL_BALANCE", "PAX_POOL_DEPTH", "PAX_POOL_STAKES", "PAX_POOL_VALUE"]], {
    cellDates: true,
  });

  xlsx.utils.book_append_sheet(workBook, maiSheet, 'maiData');
  xlsx.utils.book_append_sheet(workBook, ethPOOLSheet, 'ethPoolData');
  xlsx.utils.book_append_sheet(workBook, daiPOOLSheet, 'daiPoolData');
  xlsx.utils.book_append_sheet(workBook, paxPOOLSheet, 'paxPoolData');

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
  let maiPrice = _.BN2Int((await MAI_instance.medianMAIValue()))
  let maiSupply = _.BN2Int((await MAI_instance.totalSupply()))
  xlsx.utils.sheet_add_aoa(maisheet, [[(maiPrice / _1), (maiSupply / _1), txCount]], { origin: -1 });

  let ethPrice_contract = _.BN2Int((await MAI_instance.calcValueInMAI(ETH_ADDRESS)))
  let ethDepth = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(ETH_ADDRESS)).balanceMAI);
  let ethBalance = _.BN2Int((await MAI_instance.mapAsset_ExchangeData(ETH_ADDRESS)).balanceAsset);
  let ethStakesCount = _.BN2Int((await MAI_instance.calcStakerCount(ETH_ADDRESS)))
  let poolAssetValue = (ethPrice_contract / _1) * (ethBalance / _1)
  let poolBaseValue = (maiPrice / _1) * (ethDepth / _1)
  let ethPoolValue = (poolAssetValue + poolBaseValue)

  xlsx.utils.sheet_add_aoa(ethsheet, [[(ethPrice_contract / _1), (ethBalance / _1), (ethDepth / _1), ethStakesCount, ethPoolValue]], { origin: -1 });



  // xlsx.utils.sheet_add_aoa(daisheet, [[1.00,200, 33]], {origin: -1});
  // xlsx.utils.sheet_add_aoa(paxsheet, [[1.00,200, 33]], {origin: -1});

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
