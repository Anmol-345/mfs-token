const MFSToken = artifacts.require("MFSToken");
const MFSTimeLock = artifacts.require("MFSTimeLock");

const DECIMALS = 8;
const TOTAL_SUPPLY = web3.utils.toBN(10_000_000_000 * 10 ** DECIMALS);
const STACK_AMOUNT = web3.utils.toBN(100_000_000 * 10 ** DECIMALS);
const TRANSFER_FEE = web3.utils.toBN(3_000_000);
const MAX_FEE = web3.utils.toBN(100_000_000);
const ZERO = web3.utils.toBN(0);

const expectRevert = async (promise, msg) => {
  try {
    await promise;
    assert.fail("Expected revert not received");
  } catch (err) {
    const hasRevert = err.message.includes("revert") || err.message.includes("VM Exception");
    assert(hasRevert, `Expected revert but got: ${err.message}`);
  }
};

const advanceTime = (seconds) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      { jsonrpc: "2.0", method: "evm_increaseTime", params: [seconds], id: Date.now() },
      (err) => {
        if (err) return reject(err);
        web3.currentProvider.send(
          { jsonrpc: "2.0", method: "evm_mine", params: [], id: Date.now() },
          (err2) => {
            if (err2) return reject(err2);
            resolve();
          }
        );
      }
    );
  });
};

contract("MFSToken", (accounts) => {
  const owner = accounts[0];
  const stakeholder = accounts[1];
  const investor = accounts[2];
  const stakingPool = accounts[3];
  const mainWallet = accounts[4];
  const feeAddress = accounts[5];
  const userA = accounts[6];
  const userB = accounts[7];
  const userC = accounts[8];

  let token;

  beforeEach(async () => {
    token = await MFSToken.new(
      stakeholder,
      investor,
      stakingPool,
      mainWallet,
      feeAddress,
      { from: owner }
    );
  });

  describe("Constructor & Genesis Distribution", () => {
    it("should set correct name and symbol", async () => {
      const name = await token.name();
      const symbol = await token.symbol();
      assert.equal(name, "MFS Crypto");
      assert.equal(symbol, "MFS");
    });

    it("should set 8 decimals", async () => {
      const decimals = await token.DECIMALS();
      assert.equal(decimals.toString(), "8");
    });

    it("should have correct TOTAL_SUPPLY constant", async () => {
      const supply = await token.TOTAL_SUPPLY();
      assert(supply.eq(TOTAL_SUPPLY));
    });

    it("should fund stakeholder wallet with 100M MFS", async () => {
      const balance = await token.balanceOf(stakeholder);
      assert(balance.eq(STACK_AMOUNT));
    });

    it("should fund investor wallet with 100M MFS", async () => {
      const balance = await token.balanceOf(investor);
      assert(balance.eq(STACK_AMOUNT));
    });

    it("should fund staking pool wallet with 100M MFS", async () => {
      const balance = await token.balanceOf(stakingPool);
      assert(balance.eq(STACK_AMOUNT));
    });

    it("should fund main wallet with 9.7B MFS", async () => {
      const balance = await token.balanceOf(mainWallet);
      const expected = TOTAL_SUPPLY.sub(STACK_AMOUNT.mul(web3.utils.toBN(3)));
      assert(balance.eq(expected));
    });

    it("should set initial fee address", async () => {
      const addr = await token.feeAddress();
      assert.equal(addr, feeAddress);
    });

    it("should set initial transfer fee to 0.03 MFS", async () => {
      const fee = await token.transferFee();
      assert(fee.eq(TRANSFER_FEE));
    });

    it("should reject zero address in constructor", async () => {
      await expectRevert(
        MFSToken.new(
          "0x0000000000000000000000000000000000000000",
          investor,
          stakingPool,
          mainWallet,
          feeAddress,
          { from: owner }
        )
      );
    });

    it("should set owner correctly", async () => {
      const tokenOwner = await token.owner();
      assert.equal(tokenOwner, owner);
    });

    it("should verify total supply equals sum of all distributions", async () => {
      const balS = await token.balanceOf(stakeholder);
      const balI = await token.balanceOf(investor);
      const balSP = await token.balanceOf(stakingPool);
      const balM = await token.balanceOf(mainWallet);
      const sum = balS.add(balI).add(balSP).add(balM);
      assert(sum.eq(TOTAL_SUPPLY));
    });
  });

  describe("Transfer Fee Logic", () => {
    it("should deduct 0.03 MFS fee on P2P transfer", async () => {
      const amount = web3.utils.toBN(1_000_000_00);
      const feeAddrBefore = await token.balanceOf(feeAddress);

      await token.transfer(userA, amount, { from: mainWallet });

      const balA = await token.balanceOf(userA);
      const expectedReceive = amount.sub(TRANSFER_FEE);
      assert(balA.eq(expectedReceive));

      const feeAddrAfter = await token.balanceOf(feeAddress);
      assert(feeAddrAfter.sub(feeAddrBefore).eq(TRANSFER_FEE));
    });

    it("should send correct net amount to recipient", async () => {
      const amount = web3.utils.toBN(500_000_000);
      const netAmount = amount.sub(TRANSFER_FEE);

      await token.transfer(userA, amount, { from: mainWallet });
      await token.transfer(userB, amount, { from: mainWallet });

      const balA = await token.balanceOf(userA);
      const balB = await token.balanceOf(userB);
      assert(balA.eq(netAmount));
      assert(balB.eq(netAmount));
    });

    it("should NOT apply fee when sender is owner", async () => {
      const amount = web3.utils.toBN(100_000_000);
      await token.transfer(owner, amount.add(TRANSFER_FEE), { from: mainWallet });

      const feeAddrBefore = await token.balanceOf(feeAddress);
      await token.transfer(userA, amount, { from: owner });

      const bal = await token.balanceOf(userA);
      assert(bal.eq(amount));

      const feeAddrAfter = await token.balanceOf(feeAddress);
      assert(feeAddrAfter.eq(feeAddrBefore));
    });

    it("should NOT apply fee when receiver is feeAddress", async () => {
      const amount = web3.utils.toBN(100_000_000);

      await token.transfer(feeAddress, amount, { from: mainWallet });

      const feeAddrBal = await token.balanceOf(feeAddress);
      assert(feeAddrBal.eq(amount));
    });

    it("should NOT apply fee when sender is fee exempt", async () => {
      await token.setFeeExempt(userA, true, { from: owner });
      await token.transfer(userA, 100_000_000_00, { from: mainWallet });

      const feeAddrBefore = await token.balanceOf(feeAddress);
      await token.transfer(userB, 50_000_000_00, { from: userA });

      const balB = await token.balanceOf(userB);
      assert(balB.eq(web3.utils.toBN(50_000_000_00)));

      const feeAddrAfter = await token.balanceOf(feeAddress);
      assert(feeAddrAfter.eq(feeAddrBefore));
    });

    it("should NOT apply fee when recipient is fee exempt", async () => {
      await token.setFeeExempt(userB, true, { from: owner });
      await token.transfer(userA, 100_000_000_00, { from: mainWallet });

      const feeAddrBefore = await token.balanceOf(feeAddress);
      await token.transfer(userB, 50_000_000_00, { from: userA });

      const balB = await token.balanceOf(userB);
      assert(balB.eq(web3.utils.toBN(50_000_000_00)));

      const feeAddrAfter = await token.balanceOf(feeAddress);
      assert(feeAddrAfter.eq(feeAddrBefore));
    });

    it("should emit TransferFeeCollected event on fee deduction", async () => {
      const amount = web3.utils.toBN(1_000_000_00);
      const tx = await token.transfer(userA, amount, { from: mainWallet });

      const event = tx.logs.find(
        (l) => l.event === "TransferFeeCollected"
      );
      assert(event, "TransferFeeCollected event not emitted");
      assert.equal(event.args.from, mainWallet);
      assert.equal(event.args.to, userA);
      assert(event.args.amount.eq(amount));
      assert(event.args.fee.eq(TRANSFER_FEE));
    });

    it("should apply fee on transferFrom", async () => {
      const amount = web3.utils.toBN(1_000_000_00);
      await token.transfer(userA, amount, { from: mainWallet });
      const netAmount = amount.sub(TRANSFER_FEE);
      await token.approve(userB, netAmount, { from: userA });

      const feeAddrBefore = await token.balanceOf(feeAddress);
      await token.transferFrom(userA, userB, netAmount, { from: userB });

      const feeAddrAfter = await token.balanceOf(feeAddress);
      assert(feeAddrAfter.sub(feeAddrBefore).eq(TRANSFER_FEE));
    });

    it("should collect fees from multiple sequential transfers", async () => {
      const amount = web3.utils.toBN(10_000_000_00);

      await token.transfer(userA, amount, { from: mainWallet });
      await token.transfer(userB, amount, { from: mainWallet });

      const feeBal = await token.balanceOf(feeAddress);
      assert(feeBal.eq(TRANSFER_FEE.mul(web3.utils.toBN(2))));
    });

    it("should deduct full amount as fee when amount is less than fee", async () => {
      const smallAmount = web3.utils.toBN(100);
      await token.transfer(userA, smallAmount, { from: mainWallet });

      const balA = await token.balanceOf(userA);
      assert(balA.eq(ZERO));

      const feeBal = await token.balanceOf(feeAddress);
      assert(feeBal.eq(smallAmount));
    });

    it("should deduct full amount as fee when amount equals fee", async () => {
      await token.transfer(userA, TRANSFER_FEE, { from: mainWallet });

      const balA = await token.balanceOf(userA);
      assert(balA.eq(ZERO));
    });

    it("should not reduce total supply when fees are collected", async () => {
      const supplyBefore = await token.totalSupply();
      await token.transfer(userA, 1_000_000_00, { from: mainWallet });
      const supplyAfter = await token.totalSupply();
      assert(supplyAfter.eq(supplyBefore));
    });
  });

  describe("Fee Address Management", () => {
    it("should update fee address", async () => {
      const newFeeAddr = accounts[9];
      await token.setFeeAddress(newFeeAddr, { from: owner });
      const addr = await token.feeAddress();
      assert.equal(addr, newFeeAddr);
    });

    it("should emit FeeAddressUpdated event", async () => {
      const newFeeAddr = accounts[9];
      const tx = await token.setFeeAddress(newFeeAddr, { from: owner });
      const event = tx.logs.find((l) => l.event === "FeeAddressUpdated");
      assert(event, "Event not emitted");
      assert.equal(event.args.oldAddress, feeAddress);
      assert.equal(event.args.newAddress, newFeeAddr);
    });

    it("should route fees to new address after update", async () => {
      const newFeeAddr = accounts[9];
      await token.setFeeAddress(newFeeAddr, { from: owner });

      const amount = web3.utils.toBN(1_000_000_00);
      await token.transfer(userA, amount, { from: mainWallet });

      const newFeeBal = await token.balanceOf(newFeeAddr);
      assert(newFeeBal.eq(TRANSFER_FEE));

      const oldFeeBal = await token.balanceOf(feeAddress);
      assert(oldFeeBal.eq(ZERO));
    });

    it("should reject zero address for fee address", async () => {
      await expectRevert(
        token.setFeeAddress("0x0000000000000000000000000000000000000000", { from: owner })
      );
    });

    it("should reject non-owner from setting fee address", async () => {
      await expectRevert(
        token.setFeeAddress(accounts[9], { from: userA })
      );
    });
  });

  describe("Transfer Fee Amount Management", () => {
    it("should update transfer fee", async () => {
      const newFee = web3.utils.toBN(1_000_000);
      await token.setTransferFee(newFee, { from: owner });
      const fee = await token.transferFee();
      assert(fee.eq(newFee));
    });

    it("should emit TransferFeeUpdated event", async () => {
      const newFee = web3.utils.toBN(1_000_000);
      const tx = await token.setTransferFee(newFee, { from: owner });
      const event = tx.logs.find((l) => l.event === "TransferFeeUpdated");
      assert(event, "Event not emitted");
      assert(event.args.oldFee.eq(TRANSFER_FEE));
      assert(event.args.newFee.eq(newFee));
    });

    it("should deduct new fee amount after update", async () => {
      const newFee = web3.utils.toBN(1_000_000);
      await token.setTransferFee(newFee, { from: owner });

      const amount = web3.utils.toBN(1_000_000_00);
      const feeAddrBefore = await token.balanceOf(feeAddress);
      await token.transfer(userA, amount, { from: mainWallet });

      const feeAddrAfter = await token.balanceOf(feeAddress);
      assert(feeAddrAfter.sub(feeAddrBefore).eq(newFee));
    });

    it("should reject fee exceeding 1 MFS max", async () => {
      const tooHigh = MAX_FEE.add(web3.utils.toBN(1));
      await expectRevert(
        token.setTransferFee(tooHigh, { from: owner })
      );
    });

    it("should allow fee of exactly 1 MFS (max cap)", async () => {
      await token.setTransferFee(MAX_FEE, { from: owner });
      const fee = await token.transferFee();
      assert(fee.eq(MAX_FEE));
    });

    it("should allow fee of 0 (no fee)", async () => {
      await token.setTransferFee(0, { from: owner });
      const fee = await token.transferFee();
      assert(fee.eq(ZERO));
    });

    it("should reject non-owner from setting fee", async () => {
      await expectRevert(
        token.setTransferFee(1_000_000, { from: userA })
      );
    });

    it("should collect updated fee on subsequent transfers", async () => {
      const newFee = web3.utils.toBN(1_500_000);
      await token.setTransferFee(newFee, { from: owner });

      const amount = web3.utils.toBN(1_000_000_00);
      await token.transfer(userA, amount, { from: mainWallet });

      const feeBal = await token.balanceOf(feeAddress);
      assert(feeBal.eq(newFee));
    });
  });

  describe("Fee Exempt Management", () => {
    it("should set fee exempt status", async () => {
      await token.setFeeExempt(userA, true, { from: owner });
      const exempt = await token.feeExempt(userA);
      assert.equal(exempt, true);
    });

    it("should emit FeeExemptStatusUpdated event", async () => {
      const tx = await token.setFeeExempt(userA, true, { from: owner });
      const event = tx.logs.find(
        (l) => l.event === "FeeExemptStatusUpdated"
      );
      assert(event, "Event not emitted");
      assert.equal(event.args.account, userA);
      assert.equal(event.args.status, true);
    });

    it("should toggle fee exempt off", async () => {
      await token.setFeeExempt(userA, true, { from: owner });
      await token.setFeeExempt(userA, false, { from: owner });
      const exempt = await token.feeExempt(userA);
      assert.equal(exempt, false);
    });

    it("should reject non-owner from setting fee exempt", async () => {
      await expectRevert(
        token.setFeeExempt(userA, true, { from: userA })
      );
    });

    it("should exempt multiple addresses", async () => {
      await token.setFeeExempt(userA, true, { from: owner });
      await token.setFeeExempt(userB, true, { from: owner });
      const exemptA = await token.feeExempt(userA);
      const exemptB = await token.feeExempt(userB);
      assert.equal(exemptA, true);
      assert.equal(exemptB, true);
    });
  });

  describe("Pause / Unpause", () => {
    it("should pause transfers", async () => {
      await token.pause({ from: owner });
      const paused = await token.paused();
      assert.equal(paused, true);
    });

    it("should reject transfers when paused", async () => {
      await token.pause({ from: owner });
      await expectRevert(
        token.transfer(userA, 100, { from: mainWallet })
      );
    });

    it("should reject transferFrom when paused", async () => {
      const amount = web3.utils.toBN(100_000_000);
      await token.transfer(userA, amount, { from: mainWallet });
      await token.approve(userB, amount, { from: userA });
      await token.pause({ from: owner });

      await expectRevert(
        token.transferFrom(userA, userB, amount, { from: userB })
      );
    });

    it("should allow transfers after unpause", async () => {
      await token.pause({ from: owner });
      await token.unpause({ from: owner });
      const paused = await token.paused();
      assert.equal(paused, false);

      await token.transfer(userA, 100_000_000, { from: mainWallet });
      const bal = await token.balanceOf(userA);
      assert(bal.gt(ZERO));
    });

    it("should reject non-owner from pausing", async () => {
      await expectRevert(token.pause({ from: userA }));
    });

    it("should reject non-owner from unpausing", async () => {
      await token.pause({ from: owner });
      await expectRevert(token.unpause({ from: userA }));
    });

    it("should not allow double pause", async () => {
      await token.pause({ from: owner });
      await expectRevert(token.pause({ from: owner }));
    });

    it("should not allow unpause when not paused", async () => {
      await expectRevert(token.unpause({ from: owner }));
    });
  });

  describe("Basic ERC20 Compliance", () => {
    it("should transfer between users without fee when owner sends", async () => {
      const amount = web3.utils.toBN(500_000_000);
      await token.transfer(owner, amount.add(TRANSFER_FEE), { from: mainWallet });
      await token.transfer(userA, amount, { from: owner });
      const balA = await token.balanceOf(userA);
      assert(balA.eq(amount));
    });

    it("should handle approve and allowance", async () => {
      const amount = web3.utils.toBN(1_000_000);
      await token.approve(userB, amount, { from: userA });
      const allowance = await token.allowance(userA, userB);
      assert(allowance.eq(amount));
    });

    it("should handle transferFrom correctly", async () => {
      const amount = web3.utils.toBN(500_000_000);
      await token.transfer(userA, amount, { from: mainWallet });
      await token.approve(userB, amount, { from: userA });

      await token.transferFrom(userA, userC, 100_000_000, { from: userB });

      const balC = await token.balanceOf(userC);
      assert(balC.eq(web3.utils.toBN(97_000_000)));
    });

    it("should handle zero transfers", async () => {
      await token.transfer(userA, 0, { from: mainWallet });
      const balA = await token.balanceOf(userA);
      assert(balA.eq(ZERO));
    });

    it("should reject transfer exceeding balance", async () => {
      const huge = web3.utils.toBN(1_000_000_000_000);
      await expectRevert(
        token.transfer(userB, huge, { from: userA })
      );
    });

    it("should reject transferFrom exceeding allowance", async () => {
      await token.transfer(userA, 100, { from: mainWallet });
      await token.approve(userB, 10, { from: userA });

      await expectRevert(
        token.transferFrom(userA, userC, 20, { from: userB })
      );
    });

    it("should handle self-transfer (zero transfer, no fee)", async () => {
      const amount = web3.utils.toBN(1_000_000_00);
      await token.transfer(userA, amount, { from: mainWallet });

      const balBefore = await token.balanceOf(userA);
      await token.transfer(userA, 0, { from: userA });
      const balAfter = await token.balanceOf(userA);
      assert(balAfter.eq(balBefore));
    });

    it("should maintain total supply after transfers with fee", async () => {
      const supplyBefore = await token.totalSupply();
      await token.transfer(userA, 1_000_000_00, { from: mainWallet });
      const balA = await token.balanceOf(userA);
      await token.transfer(userB, balA, { from: userA });
      const supplyAfter = await token.totalSupply();
      assert(supplyAfter.eq(supplyBefore));
    });

    it("should return correct totalSupply", async () => {
      const supply = await token.totalSupply();
      assert(supply.eq(TOTAL_SUPPLY));
    });
  });
});

contract("MFSTimeLock", (accounts) => {
  const owner = accounts[0];
  const beneficiary = accounts[1];
  let token;
  let timelock;

  const CLIFF = 60;
  const VESTING = 120;
  const STACK = web3.utils.toBN(100_000_000 * 10 ** 8);
  const ZERO = web3.utils.toBN(0);

  beforeEach(async () => {
    token = await MFSToken.new(
      accounts[8],
      accounts[8],
      accounts[8],
      accounts[8],
      accounts[9],
      { from: owner }
    );
    timelock = await MFSTimeLock.new(
      token.address,
      beneficiary,
      CLIFF,
      VESTING,
      STACK,
      { from: owner }
    );
    await token.setFeeExempt(accounts[8], true, { from: owner });
    await token.transfer(timelock.address, STACK, { from: accounts[8] });
    await token.setFeeExempt(accounts[8], false, { from: owner });
    await token.setFeeExempt(timelock.address, true, { from: owner });
  });

  describe("TimeLock Construction", () => {
    it("should set token address", async () => {
      const t = await timelock.token();
      assert.equal(t, token.address);
    });

    it("should set beneficiary", async () => {
      const b = await timelock.beneficiary();
      assert.equal(b, beneficiary);
    });

    it("should set total amount", async () => {
      const total = await timelock.totalAmount();
      assert(total.eq(STACK));
    });

    it("should set cliff end in the future", async () => {
      const cliffEnd = await timelock.cliffEnd();
      const now = Math.floor(Date.now() / 1000);
      assert(cliffEnd.toNumber() > now);
    });

    it("should reject zero token address", async () => {
      await expectRevert(
        MFSTimeLock.new(
          "0x0000000000000000000000000000000000000000",
          beneficiary,
          CLIFF,
          VESTING,
          STACK,
          { from: owner }
        )
      );
    });

    it("should reject zero beneficiary", async () => {
      await expectRevert(
        MFSTimeLock.new(
          token.address,
          "0x0000000000000000000000000000000000000000",
          CLIFF,
          VESTING,
          STACK,
          { from: owner }
        )
      );
    });

    it("should reject zero vesting duration", async () => {
      await expectRevert(
        MFSTimeLock.new(
          token.address,
          beneficiary,
          CLIFF,
          0,
          STACK,
          { from: owner }
        )
      );
    });

    it("should reject zero total amount", async () => {
      await expectRevert(
        MFSTimeLock.new(
          token.address,
          beneficiary,
          CLIFF,
          VESTING,
          0,
          { from: owner }
        )
      );
    });

    it("should set initial released to 0", async () => {
      const released = await timelock.released();
      assert(released.eq(ZERO));
    });

    it("should set owner correctly", async () => {
      const lockOwner = await timelock.owner();
      assert.equal(lockOwner, owner);
    });
  });

  describe("TimeLock Release", () => {
    it("should return 0 releasable before cliff", async () => {
      const amount = await timelock.releasableAmount();
      assert(amount.eq(ZERO));
    });

    it("should revert release before cliff", async () => {
      await expectRevert(timelock.release());
    });

    it("should return positive releasable after cliff", async () => {
      await advanceTime(CLIFF + 10);

      const releasable = await timelock.releasableAmount();
      assert(releasable.gt(ZERO));
      assert(releasable.lt(STACK));
    });

    it("should emit TokensReleased event on release", async () => {
      await advanceTime(CLIFF + 10);

      const tx = await timelock.release();
      const event = tx.logs.find((l) => l.event === "TokensReleased");
      assert(event, "Event not emitted");
      assert.equal(event.args.beneficiary, beneficiary);
    });

    it("should transfer tokens to beneficiary on release", async () => {
      await advanceTime(CLIFF + 30);

      const balBefore = await token.balanceOf(beneficiary);
      await timelock.release();
      const balAfter = await token.balanceOf(beneficiary);
      assert(balAfter.gt(balBefore));
    });

    it("should track released amount correctly", async () => {
      await advanceTime(CLIFF + 60);

      await timelock.release();
      const released = await timelock.released();
      assert(released.gt(ZERO));
    });

    it("should release full amount after vesting end", async () => {
      await advanceTime(CLIFF + VESTING + 1);

      const balBefore = await token.balanceOf(beneficiary);
      await timelock.release();
      const balAfter = await token.balanceOf(beneficiary);
      assert(balAfter.sub(balBefore).eq(STACK));
    });

    it("should return 0 releasable after full release", async () => {
      await advanceTime(CLIFF + VESTING + 1);

      await timelock.release();
      const releasable = await timelock.releasableAmount();
      assert(releasable.eq(ZERO));
    });

    it("should release in multiple chunks", async () => {
      await advanceTime(CLIFF + 30);
      await timelock.release();
      const r1 = await timelock.released();

      await advanceTime(30);
      await timelock.release();
      const r2 = await timelock.released();

      assert(r2.gt(r1));
    });

    it("should fail release after everything is released", async () => {
      await advanceTime(CLIFF + VESTING + 1);
      await timelock.release();

      await expectRevert(timelock.release());
    });

    it("should release correct linear amount midway", async () => {
      const cliffEnd = await timelock.cliffEnd();
      await advanceTime(CLIFF + 60);
      const currentBlock = await web3.eth.getBlock("latest");
      const elapsedSinceCliff = web3.utils.toBN(currentBlock.timestamp).sub(cliffEnd);
      const expected = STACK.mul(elapsedSinceCliff).div(web3.utils.toBN(VESTING));

      await timelock.release();
      const released = await timelock.released();

      const diff = released.sub(expected).abs();
      assert(diff.lte(web3.utils.toBN(100)), "Released amount mismatch");
    });
  });

  describe("TimeLock Revoke", () => {
    it("should allow owner to revoke", async () => {
      await advanceTime(CLIFF + 10);
      await timelock.release();

      const balBefore = await token.balanceOf(owner);
      await timelock.revoke({ from: owner });
      const balAfter = await token.balanceOf(owner);
      assert(balAfter.gt(balBefore));
    });

    it("should emit TimeLockRevoked event", async () => {
      await advanceTime(CLIFF + 10);
      await timelock.release();

      const tx = await timelock.revoke({ from: owner });
      const event = tx.logs.find((l) => l.event === "TimeLockRevoked");
      assert(event, "Event not emitted");
    });

    it("should revert revoke when nothing left", async () => {
      await advanceTime(CLIFF + 10);
      await timelock.release();
      await timelock.revoke({ from: owner });

      await expectRevert(timelock.revoke({ from: owner }));
    });

    it("should reject revoke from non-owner", async () => {
      await expectRevert(timelock.revoke({ from: beneficiary }));
    });

    it("should return unreleased tokens after partial release", async () => {
      await advanceTime(CLIFF + 30);
      await timelock.release();
      const released = await timelock.released();

      const ownerBalBefore = await token.balanceOf(owner);
      await timelock.revoke({ from: owner });
      const ownerBalAfter = await token.balanceOf(owner);

      const expectedReturn = STACK.sub(released);
      assert(ownerBalAfter.sub(ownerBalBefore).eq(expectedReturn));
    });

    it("should revoke all before any release", async () => {
      const balBefore = await token.balanceOf(owner);
      await timelock.revoke({ from: owner });
      const balAfter = await token.balanceOf(owner);
      assert(balAfter.sub(balBefore).eq(STACK));
    });

    it("should mark all as released after revoke", async () => {
      await advanceTime(CLIFF + 30);
      await timelock.release();
      await timelock.revoke({ from: owner });

      const released = await timelock.released();
      assert(released.eq(STACK));
    });
  });
});
