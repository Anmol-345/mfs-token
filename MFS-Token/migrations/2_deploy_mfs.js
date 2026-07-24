const MFSToken = artifacts.require("MFSToken");

module.exports = async function (deployer, network, accounts) {
  const STAKEHOLDER_WALLET = process.env.STAKEHOLDER_WALLET || accounts[1];
  const INVESTOR_WALLET = process.env.INVESTOR_WALLET || accounts[2];
  const STAKING_POOL_WALLET = process.env.STAKING_POOL_WALLET || accounts[3];
  const MAIN_WALLET = process.env.MAIN_WALLET || accounts[0];
  const COMPANY_FEE_ADDRESS = process.env.COMPANY_FEE_ADDRESS || accounts[4];

  await deployer.deploy(
    MFSToken,
    STAKEHOLDER_WALLET,
    INVESTOR_WALLET,
    STAKING_POOL_WALLET,
    MAIN_WALLET,
    COMPANY_FEE_ADDRESS
  );
};
