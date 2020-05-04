// var Mai = artifacts.require("./Mai.sol");
// const assert = require("chai").assert;
// const truffleAssert = require('truffle-assertions');

// contract('Mai', function(accounts){
//   var coin
//   var maiAddress
//   var supply = 1*10**18
//   var acc0 = accounts[0]
//   var acc1 = accounts[1]
//   var acc2 = accounts[2] 
//   var acc3 = accounts[3]

//   it("constructor events", async () => {
//     let Mai = artifacts.require("Mai.sol");
//     coin = await Mai.new(supply);
//     maiAddress = coin.address;
//     console.log("coin:", maiAddress)
//   });

//   it("initializes the contract with the correct values", async () => {

//     let name = await coin.name()
//     assert.equal(name, "Mai Coin", "correct name")

//     let sym = await coin.symbol()
//     assert.equal(sym, "MAI", "correct symbol")

//     let decimals = await  coin.decimals()
//     assert.equal(decimals, 18, "correct decimals")

//     let count = await coin.totalSupply()
//     assert.equal(count, 10000000000, "correct number")
//   });

//   it("initializes with correct balances", async () => {

//     let maiBal = await coin.balanceOf(maiAddress)
//     assert.equal(maiBal, 0, "correct coin bal")

//     let acc0Bal = await coin.balanceOf(acc0)
//     assert.equal(acc0Bal, supply, "correct acc0 bal")

//     let acc1Bal = await coin.balanceOf(acc1)
//     assert.equal(acc1Bal, 0, "correct acc1 bal")

//     let acc2Bal = await coin.balanceOf(acc2)
//     assert.equal(acc2Bal, 0, "correct acc2 bal")

//     let acc3Bal = await coin.balanceOf(acc3)
//     assert.equal(acc3Bal, 0, "correct acc3 bal")
//   })

//   it("initializes with correct allowances", async () => {

//     let acc1_Allowance = await coin.allowance(acc0, acc1)
//     assert.equal(acc1_Allowance, 0, "correct acc1 allowance")

//     let acc2_Allowance = await coin.allowance(acc0, acc2)
//     assert.equal(acc2_Allowance, 0, "correct acc1 allowance")
//   });


//   it("it tests unauthorised and authorised transfer", async () => {

//     // unauthorised transfer
//     let tx1 = await truffleAssert.reverts((coin.transfer(acc0, '10000', { from: acc1 })));
//     let acc0Bal = await coin.balanceOf(acc0);
//     assert.equal(acc0Bal, 10000000000, "correct coin balance");
//     let acc1Bal = await coin.balanceOf(acc1);
//     assert.equal(acc1Bal, 0, "correct coin balance");

//     // authorised transfer
//     let tx2 = await coin.transfer(acc1, '10000', { from: acc0 })
//     let acc0NewBal = await coin.balanceOf(acc0);
//     assert.equal(acc0NewBal, 9999990000, "correct coin balance");
//     let acc1Bal2 = await coin.balanceOf(acc1);
//     assert.equal(acc1Bal2, 10000, "correct coin balance");

//   });

//     it("it tests unauthorised and authorised approve, transferFrom", async () => {
//     // unauthorised transferFrom
//     let tx3 = await truffleAssert.reverts(coin.transferFrom(acc0, acc2, '10000', { from: acc2 }))
//     let acc0NewBal = await coin.balanceOf(acc0);
//     assert.equal(acc0NewBal, 9999990000, "correct coin balance");
//     let acc2NewBal = await coin.balanceOf(acc2);
//     assert.equal(acc2NewBal, 0, "correct coin balance");
//     let acc2Allowance = await coin.allowance(acc0, acc2);
//     assert.equal(acc2Allowance, 0, "correct coin allowance");

//     // allowance
//     let tx4 = await coin.approve(acc2, '10000', { from: acc0 });
//     let acc2Allowance2 = await coin.allowance(acc0, acc2);
//     assert.equal(acc2Allowance2, 10000, "correct coin allowance");

//     // authorised transferFrom
//     let tx5 = await coin.transferFrom(acc0, acc2, '10000', { from: acc2 });
//     let acc0NewBal1 = await coin.balanceOf(acc0);
//     assert.equal(acc0NewBal1, 9999980000, "correct coin balance");
//     let acc2NewBal2 = await coin.balanceOf(acc2);
//     assert.equal(acc2NewBal2, 10000, "correct coin balance");

//   });







// })
