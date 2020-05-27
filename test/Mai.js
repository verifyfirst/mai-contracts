// const assert = require("chai").assert;
// const truffleAssert = require('truffle-assertions');
// var MAI = artifacts.require("MAI.sol");
// var USD = artifacts.require("tokenUSD.sol");
// contract('Mai', function(accounts){
//   var coin
//   var maiAddress
//   var supply = 1*10**18
//   var acc0 = accounts[0]
//   var acc1 = accounts[1]
//   var acc2 = accounts[2] 

//   it("constructor events", async () => {
//     instanceUSD = await USD.deployed();
//     addressUSD = instanceUSD.address;

//     instanceMAI = await MAI.deployed();
//     addressMAI = instanceMAI.address;

//   });

//   it("initializes the contract with the correct values", async () => {

//     let name = await instanceMAI.name()
//     assert.equal(name, "MAI Asset", "correct token name")

//     let sym = await instanceMAI.symbol()
//     assert.equal(sym, "MAI", "correct token symbol")

//     let decimals = await  instanceMAI.decimals()
//     assert.equal(decimals, 18, "correct token decimals")
//   });

//   it("initializes with correct balances", async () => {

//     // let maiBal = await instanceMAI.balanceOf(maiAddress)


//     // let acc0Bal = await instanceMAI.balanceOf(acc0)

//   })

//   it("initializes with correct allowances", async () => {

//     // let acc1_Allowance = await coin.allowance(acc0, acc1)
//     // // assert.equal(acc1_Allowance, 0, "correct acc1 allowance")

//     // let acc2_Allowance = await coin.allowance(acc0, acc2)
//     // assert.equal(acc2_Allowance, 0, "correct acc1 allowance")
//   });


//   it("it tests unauthorised and authorised transfer", async () => {

//     // // unauthorised transfer
//     // let tx1 = await truffleAssert.reverts((coin.transfer(acc0, '10000', { from: acc1 })));
//     // let acc0Bal = await coin.balanceOf(acc0);
//     // assert.equal(acc0Bal, 10000000000, "correct coin balance");
//     // let acc1Bal = await coin.balanceOf(acc1);
//     // assert.equal(acc1Bal, 0, "correct coin balance");

//     // // authorised transfer
//     // let tx2 = await coin.transfer(acc1, '10000', { from: acc0 })
//     // let acc0NewBal = await coin.balanceOf(acc0);
//     // assert.equal(acc0NewBal, 9999990000, "correct coin balance");
//     // let acc1Bal2 = await coin.balanceOf(acc1);
//     // assert.equal(acc1Bal2, 10000, "correct coin balance");

//   });

//     it("it tests unauthorised and authorised approve, transferFrom", async () => {
//     // // unauthorised transferFrom
//     // let tx3 = await truffleAssert.reverts(coin.transferFrom(acc0, acc2, '10000', { from: acc2 }))
//     // let acc0NewBal = await coin.balanceOf(acc0);
//     // assert.equal(acc0NewBal, 9999990000, "correct coin balance");
//     // let acc2NewBal = await coin.balanceOf(acc2);
//     // assert.equal(acc2NewBal, 0, "correct coin balance");
//     // let acc2Allowance = await coin.allowance(acc0, acc2);
//     // assert.equal(acc2Allowance, 0, "correct coin allowance");

//     // // allowance
//     // let tx4 = await coin.approve(acc2, '10000', { from: acc0 });
//     // let acc2Allowance2 = await coin.allowance(acc0, acc2);
//     // assert.equal(acc2Allowance2, 10000, "correct coin allowance");

//     // // authorised transferFrom
//     // let tx5 = await coin.transferFrom(acc0, acc2, '10000', { from: acc2 });
//     // let acc0NewBal1 = await coin.balanceOf(acc0);
//     // assert.equal(acc0NewBal1, 9999980000, "correct coin balance");
//     // let acc2NewBal2 = await coin.balanceOf(acc2);
//     // assert.equal(acc2NewBal2, 10000, "correct coin balance");

//   });







// })
