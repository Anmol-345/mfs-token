const MFSToken = artifacts.require("MFSToken");
const MFSTimeLock = artifacts.require("MFSTimeLock");

const STAKEHOLDER_WALLET = process.env.STAKEHOLDER_WALLET || "0x0000000000000000000000000000000000000001";
const INVESTOR_WALLET = process.env.INVESTOR_WALLET || "0x0000000000000000000000000000000000000002";
const STAKING_POOL_WALLET = process.env.STAKING_POOL_WALLET || "0x0000000000000000000000000000000000000003";

const CLIFF_DURATION = 365 * 24 * 60 * 60;
const VESTING_DURATION = 730 * 24 * 60 * 60;
const STACK_AMOUNT = web3.utils.toBN(100_000_000 * 10 ** 8);

module.exports = async function (deployer, network, accounts) {
  const mfsToken = await MFSToken.deployed();

  const stakeholderLock = await MFSTimeLock.new(
    mfsToken.address,
    STAKEHOLDER_WALLET,
    CLIFF_DURATION,
    VESTING_DURATION,
    STACK_AMOUNT
  );

  const investorLock = await MFSTimeLock.new(
    mfsToken.address,
    INVESTOR_WALLET,
    CLIFF_DURATION,
    VESTING_DURATION,
    STACK_AMOUNT
  );

  const stakingLock = await MFSTimeLock.new(
    mfsToken.address,
    STAKING_POOL_WALLET,
    CLIFF_DURATION,
    VESTING_DURATION,
    STACK_AMOUNT
  );
};
