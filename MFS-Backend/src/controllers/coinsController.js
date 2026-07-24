const { getContract, getWeb3 } = require('../config/web3');
const { env } = require('../config/env');
const { User, Transaction } = require('../models');
const logger = require('../utils/logger');

async function triggerAccumulation(req, res, next) {
  try {
    const user = await User.findByPk(req.user.sub);
    if (!user || !user.mfsAddress) return res.status(400).json({ error: 'No MFS address' });

    const web3 = getWeb3();
    const contract = await getContract();

    const tx = contract.methods.accumulate(user.mfsAddress);
    const gas = await tx.estimateGas({ from: env.blockchain.mainWalletAddress });
    const gasPrice = await web3.eth.getGasPrice();

    const receipt = await tx.send({
      from: env.blockchain.mainWalletAddress,
      gas: BigInt(gas) + 10000n,
      gasPrice,
    });

    await Transaction.create({
      userId: user.id,
      type: 'accumulate',
      status: 'confirmed',
      amount: '0',
      fee: '0',
      netAmount: '0',
      fromAddress: env.blockchain.mainWalletAddress,
      toAddress: user.mfsAddress,
      txHash: receipt.transactionHash,
      blockNumber: Number(receipt.blockNumber),
    });

    logger.info('Accumulation triggered', { address: user.mfsAddress, txHash: receipt.transactionHash });
    res.json({ txHash: receipt.transactionHash, blockNumber: Number(receipt.blockNumber) });
  } catch (err) {
    next(err);
  }
}

async function getAccumulationStatus(req, res, next) {
  try {
    const user = await User.findByPk(req.user.sub);
    if (!user || !user.mfsAddress) return res.status(400).json({ error: 'No MFS address' });

    const contract = await getContract();
    const totalAccumulated = await contract.methods.totalAccumulated(user.mfsAddress).call();
    const lastAccumulation = await contract.methods.lastAccumulation(user.mfsAddress).call();

    res.json({
      totalAccumulated: totalAccumulated.toString(),
      lastAccumulation: new Date(Number(lastAccumulation) * 1000).toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { triggerAccumulation, getAccumulationStatus };
