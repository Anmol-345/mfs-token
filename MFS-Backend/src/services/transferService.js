const { getWeb3, getContract } = require('../config/web3');
const { env } = require('../config/env');
const { Transaction } = require('../models');
const logger = require('../utils/logger');

function formatMFS(rawBigInt) {
  const raw = BigInt(rawBigInt);
  const divisor = 100000000n;
  const intPart = raw / divisor;
  const fracPart = raw % divisor;
  const fracStr = fracPart.toString().padStart(8, '0');
  return `${intPart}.${fracStr}`;
}

function parseMFS(amountStr) {
  const parts = amountStr.toString().split('.');
  let intPart = parts[0] || '0';
  let fracPart = parts[1] || '';
  if (fracPart.length > 8) fracPart = fracPart.substring(0, 8);
  fracPart = fracPart.padEnd(8, '0');
  return intPart + fracPart;
}

async function getBalance(address) {
  const contract = await getContract();
  const raw = await contract.methods.balanceOf(address).call();
  return formatMFS(raw);
}

async function getEthBalance(address) {
  const web3 = getWeb3();
  const raw = await web3.eth.getBalance(address);
  return web3.utils.fromWei(raw, 'ether');
}

function parseBalance(balanceStr) {
  return parseFloat(balanceStr);
}

const TRANSFER_FEE = 0.03;

async function validateSufficientBalance(fromAddress, amount) {
  const balanceStr = await getBalance(fromAddress);
  const balance = parseBalance(balanceStr);
  const required = parseFloat(amount) + TRANSFER_FEE;
  if (balance < required) {
    throw Object.assign(
      new Error(`Insufficient balance. Have ${balance.toFixed(8)} MFS, need ${required.toFixed(8)} MFS (amount + 0.03 fee)`),
      { statusCode: 400 },
    );
  }
  return true;
}

async function sendTokens({ fromAddress, toAddress, amount, privateKey, memo, userId }) {
  const web3 = getWeb3();
  const contract = await getContract();

  await validateSufficientBalance(fromAddress, amount);

  const amountWei = parseMFS(amount);
  const tx = contract.methods.transfer(toAddress, amountWei);
  const gas = await tx.estimateGas({ from: fromAddress });
  const gasPrice = await web3.eth.getGasPrice();

  const txData = tx.encodeABI();
  const txObj = {
    from: fromAddress,
    to: contract.options.address,
    data: txData,
    gas: (BigInt(gas) + 10000n).toString(),
    gasPrice: gasPrice.toString()
  };

  const signedTx = await web3.eth.accounts.signTransaction(txObj, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  const newTx = await Transaction.create({
    userId,
    type: 'send',
    status: 'confirmed',
    amount,
    fee: TRANSFER_FEE.toString(),
    netAmount: amount,
    fromAddress,
    toAddress,
    txHash: receipt.transactionHash,
    blockNumber: Number(receipt.blockNumber),
    memo,
  });

  logger.info('Tokens sent', { fromAddress, toAddress, amount, txHash: receipt.transactionHash });
  return newTx;
}

async function getTransactionHistory({ userId, limit = 50, offset = 0 }) {
  const { User, Wallet } = require('../models');
  const { Op } = require('sequelize');

  const user = await User.findByPk(userId, { include: [Wallet] });
  if (!user) return { transactions: [], total: 0 };

  const addresses = [user.mfsAddress];
  if (user.Wallets) {
    user.Wallets.forEach(w => addresses.push(w.address));
  }
  const uniqueAddresses = [...new Set(addresses.filter(Boolean))];

  const { rows, count } = await Transaction.findAndCountAll({
    where: {
      [Op.or]: [
        { userId },
        { toAddress: { [Op.in]: uniqueAddresses } }
      ]
    },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const modifiedRows = rows.map(tx => {
    const isReceiver = uniqueAddresses.includes(tx.toAddress) && tx.userId !== userId;
    if (isReceiver) {
      const txData = tx.toJSON();
      txData.type = 'receive';
      return txData;
    }
    return tx;
  });

  return { transactions: modifiedRows, total: count };
}

module.exports = { getBalance, getEthBalance, sendTokens, getTransactionHistory, validateSufficientBalance, TRANSFER_FEE };
