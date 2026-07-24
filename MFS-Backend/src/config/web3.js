const { Web3 } = require('web3');
const { env } = require('./env');
const logger = require('../utils/logger');

let web3 = null;
let mfsContract = null;
let mfstokenAbi = null;

async function initWeb3() {
  let provider;
  if (env.blockchain.rpcUrl) {
    provider = new Web3.providers.HttpProvider(env.blockchain.rpcUrl);
    logger.info(`Using Web3 HttpProvider (${env.blockchain.rpcUrl})`);
  } else if (env.nodeEnv === 'development' || !env.blockchain.ipcSocketPath) {
    provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    logger.info('Using Web3 HttpProvider (Local Dev)');
  } else {
    provider = new Web3.providers.IpcProvider(env.blockchain.ipcSocketPath);
    logger.info('Using Web3 IpcProvider');
  }
  web3 = new Web3(provider);

  if (env.blockchain.adminPrivateKey) {
    const account = web3.eth.accounts.privateKeyToAccount(env.blockchain.adminPrivateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    logger.info(`Loaded admin wallet into Web3: ${account.address}`);
  }

  try {
    const netId = await web3.eth.net.getId();
    logger.info(`Web3 connected — network id: ${netId}, chain: ${env.blockchain.sepoliaChainId}`);
  } catch (err) {
    logger.error('Web3 IPC connection failed', { error: err.message });
    throw err;
  }

  return web3;
}

async function getContract() {
  if (mfsContract) return mfsContract;

  if (!mfstokenAbi) {
    mfstokenAbi = require('../../contracts/MFSToken.json').abi;
  }

  mfsContract = new web3.eth.Contract(
    mfstokenAbi,
    env.blockchain.mfsContractAddress,
  );

  return mfsContract;
}

function getWeb3() {
  if (!web3) throw new Error('Web3 not initialized. Call initWeb3() first.');
  return web3;
}

module.exports = { initWeb3, getWeb3, getContract };
