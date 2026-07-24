const { Admin, User, Wallet, Transaction, SupportTicket, Notification } = require('../models');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { getBalance } = require('../services/transferService');
const { getWeb3, getContract } = require('../config/web3');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isValid = await admin.validatePassword(password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (admin.isSuspended) return res.status(403).json({ error: 'Account is suspended' });

    admin.lastLoginAt = new Date();
    await admin.save();

    const accessToken = jwt.sign({ adminId: admin.id, role: admin.role }, env.jwt.accessSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ adminId: admin.id }, env.jwt.refreshSecret, { expiresIn: '7d' });

    res.json({
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      accessToken,
      refreshToken
    });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;
    
    let where = {};
    if (search) {
      const { Op } = require('sequelize');
      where = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { 
      attributes: { exclude: ['passwordHash'] }, 
      include: [
        Wallet,
        { model: require('../models').Referral, as: 'referralsMade', include: [{ model: User, as: 'referred', attributes: ['email', 'phone'] }] },
        { model: require('../models').Referral, as: 'referralsReceived', include: [{ model: User, as: 'referrer', attributes: ['email', 'phone'] }] }
      ] 
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

exports.freezeUser = async (req, res, next) => {
  try {
    const { freeze } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.status = freeze ? 'frozen' : 'active';
    await user.save();
    res.json({ success: true, status: user.status });
  } catch (err) { next(err); }
};

exports.fundGas = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const { env } = require('../config/env');
    const { getWeb3 } = require('../config/web3');
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const targetAddress = user.walletAddress || user.mfsAddress;
    if (!targetAddress) return res.status(400).json({ error: 'User has no wallet address' });

    const web3 = getWeb3();
    const amountWei = web3.utils.toWei('0.001', 'ether');

    let txHash;
    if (env.blockchain.adminPrivateKey) {
      const adminAccount = web3.eth.accounts.privateKeyToAccount(env.blockchain.adminPrivateKey);
      const gas = await web3.eth.estimateGas({ from: adminAccount.address, to: targetAddress, value: amountWei });
      const gasPrice = await web3.eth.getGasPrice();
      const txObj = {
        from: adminAccount.address,
        to: targetAddress,
        value: amountWei,
        gas: (BigInt(gas) + 10000n).toString(),
        gasPrice: gasPrice.toString()
      };
      const signedTx = await web3.eth.accounts.signTransaction(txObj, env.blockchain.adminPrivateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      txHash = receipt.transactionHash;
    } else {
      const accounts = await web3.eth.getAccounts();
      const adminAccount = accounts[0];
      const receipt = await web3.eth.sendTransaction({
        from: adminAccount,
        to: targetAddress,
        value: amountWei,
      });
      txHash = receipt.transactionHash;
    }

    res.json({ success: true, txHash });
  } catch (err) { next(err); }
};

exports.updateKyc = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['unverified', 'basic', 'advanced'].includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const wasUnverified = user.kycLevel === 'unverified';
    user.kycLevel = status;
    await user.save();

    if (wasUnverified && (status === 'basic' || status === 'advanced') && user.referredBy) {
      const { Referral, Wallet, Transaction } = require('../models');
      const { env } = require('../config/env');
      const referral = await Referral.findOne({ where: { referredId: user.id } });
      
      if (referral && parseFloat(referral.rewardEarned) === 0) {
        const referrerUser = await User.findByPk(user.referredBy, { include: [Wallet] });
        if (referrerUser && referrerUser.mfsAddress) {
          const web3 = getWeb3();
          const contract = await getContract();
          
          const mfsAmount = '50';
          const mfsWei = mfsAmount + '00000000'; // 50 MFS with 8 decimals

          try {
            let txHash;
            let fromAddress;
            const txMethod = contract.methods.transfer(referrerUser.mfsAddress, mfsWei);
            
            if (env.blockchain.adminPrivateKey) {
              const adminAccount = web3.eth.accounts.privateKeyToAccount(env.blockchain.adminPrivateKey);
              fromAddress = adminAccount.address;
              const gas = await txMethod.estimateGas({ from: fromAddress });
              const gasPrice = await web3.eth.getGasPrice();
              const txObj = {
                from: fromAddress,
                to: contract.options.address,
                data: txMethod.encodeABI(),
                gas: (BigInt(gas) + 10000n).toString(),
                gasPrice: gasPrice.toString()
              };
              const signedTx = await web3.eth.accounts.signTransaction(txObj, env.blockchain.adminPrivateKey);
              const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
              txHash = receipt.transactionHash;
            } else {
              const accounts = await web3.eth.getAccounts();
              fromAddress = accounts[0]; // Fallback for local testing
              const gas = await txMethod.estimateGas({ from: fromAddress });
              const receipt = await txMethod.send({ from: fromAddress, gas: BigInt(gas) + 10000n });
              txHash = receipt.transactionHash;
            }

            referral.rewardEarned = 50;
            await referral.save();

            await Transaction.create({
              userId: referrerUser.id,
              type: 'receive',
              status: 'confirmed',
              amount: '50',
              fee: '0',
              netAmount: '50',
              fromAddress: fromAddress,
              toAddress: referrerUser.mfsAddress,
              txHash: txHash,
              memo: 'Referral Reward',
            });
          } catch (e) {
            console.error('Failed to send referral reward:', e);
          }
        }
      }
    }

    res.json({ success: true, kycLevel: user.kycLevel });
  } catch (err) { next(err); }
};

exports.getWallets = async (req, res, next) => {
  try {
    const wallets = await Wallet.findAll({ include: [{ model: User, attributes: ['email', 'phone'] }] });
    res.json({ wallets });
  } catch (err) { next(err); }
};

exports.freezeWallet = async (req, res, next) => {
  // Skipping blockchain freeze for now, just local or return ok
  res.json({ success: true });
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ transactions });
  } catch (err) { next(err); }
};

exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const totalUsers = await User.count();
    const totalTx = await Transaction.count();
    const totalWallets = await Wallet.count();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const feeRevenue30dResult = await Transaction.sum('fee', { where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });
    const volume24hResult = await Transaction.sum('amount', { where: { createdAt: { [Op.gte]: twentyFourHoursAgo } } });
    const usersToday = await User.count({ where: { createdAt: { [Op.gte]: startOfToday } } });

    const { env } = require('../config/env');
    const { getWeb3 } = require('../config/web3');
    const web3 = getWeb3();
    const adminWallet = env.blockchain.mfsMainWalletAddress;
    let adminBalance = '0';
    try {
      if (adminWallet) {
        const balanceWei = await web3.eth.getBalance(adminWallet);
        adminBalance = parseFloat(web3.utils.fromWei(balanceWei, 'ether')).toFixed(4);
      }
    } catch(e) {
      console.error('Failed to get admin balance', e);
    }

    res.json({ 
      totalUsers, 
      totalWallets,
      totalTransactions: totalTx, 
      circulatingSupply: 250000000, // Fixed initial supply
      feeRevenue30d: feeRevenue30dResult || 0,
      volume24h: volume24hResult || 0, 
      usersToday,
      adminWallet,
      adminBalance
    });
  } catch (err) { next(err); }
};

exports.getAnalyticsCharts = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const promises = [];
    
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23,59,59,999);
      
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      promises.push((async () => {
        const [dayVol, dayUsers, dayFees] = await Promise.all([
          Transaction.sum('amount', { where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } }),
          User.count({ where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } }),
          Transaction.sum('fee', { where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } })
        ]);
        return { date: dayStr, vol: dayVol || 0, users: dayUsers, fees: dayFees || 0 };
      })());
    }

    const results = await Promise.all(promises);
    const volume = results.map(r => ({ date: r.date, value: r.vol }));
    const growth = results.map(r => ({ date: r.date, value: r.users }));
    const fees = results.map(r => ({ date: r.date, value: r.fees }));

    const txs = await Transaction.findAll();
    const typeCount = txs.reduce((acc, tx) => {
      const t = tx.type || 'unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    
    const total = txs.length || 1;
    const distribution = Object.keys(typeCount).map(key => ({
      name: key.toUpperCase(),
      value: Math.round((typeCount[key] / total) * 100)
    }));

    if (distribution.length === 0) {
      distribution.push({ name: 'NONE', value: 100 });
    }

    res.json({ 
      transactionVolume: volume,
      userGrowth: growth,
      feeRevenue: fees,
      distribution,
      quickStats: []
    });
  } catch (err) { next(err); }
};

exports.getTokenConfig = async (req, res, next) => {
  try {
    res.json({ transferFee: '0.03', feeAddress: '0x...', isPaused: false });
  } catch (err) { next(err); }
};

exports.updateFee = async (req, res, next) => {
  res.json({ success: true, fee: req.body.fee });
};

exports.updateFeeAddress = async (req, res, next) => {
  res.json({ success: true, address: req.body.address });
};

exports.togglePause = async (req, res, next) => {
  res.json({ success: true });
};

exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.findAll({ order: [['updatedAt', 'DESC']] });
    res.json({ tickets });
  } catch (err) { next(err); }
};

exports.replyTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const replyText = req.body.body || req.body.message;
    const newMessage = { from: 'admin', body: replyText, createdAt: new Date() };
    const messages = [...(ticket.messages || []), newMessage];
    ticket.messages = messages;
    ticket.status = 'in_progress';
    await ticket.save();
    
    try {
      const io = require('../utils/socket').getIO();
      io.to(`ticket_${ticket.id}`).emit('new_message', newMessage);
      io.emit('admin_ticket_update');
    } catch (e) {}
    
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

exports.closeTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.status = 'closed';
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
};

exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.findAll({ attributes: { exclude: ['passwordHash'] } });
    res.json({ admins });
  } catch (err) { next(err); }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password, role, name } = req.body;
    const admin = await Admin.create({ email, passwordHash: password, role, name });
    res.json({ success: true, admin: { id: admin.id, email: admin.email, role: admin.role, name: admin.name } });
  } catch (err) { next(err); }
};

exports.suspendAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    admin.isSuspended = req.body.suspend;
    await admin.save();
    res.json({ success: true, admin });
  } catch (err) { next(err); }
};

exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, body, userId } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });

    if (userId) {
      await Notification.create({
        userId,
        type: 'system',
        title,
        body
      });
    } else {
      const users = await User.findAll({ attributes: ['id'] });
      const notifications = users.map(u => ({
        userId: u.id,
        type: 'system',
        title,
        body
      }));
      await Notification.bulkCreate(notifications);
    }
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.mintTokens = async (req, res, next) => {
  try {
    const { address, mfsAmount, ethAmount } = req.body;
    if (!address) return res.status(400).json({ error: 'Address is required' });

    let targetAddress = address;
    const web3 = getWeb3();
    
    if (!web3.utils.isAddress(targetAddress)) {
      const { Op } = require('sequelize');
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [{ email: targetAddress }, { phone: targetAddress }] 
        } 
      });
      if (user && user.mfsAddress) {
        targetAddress = user.mfsAddress;
      } else {
        return res.status(400).json({ error: 'Invalid wallet address or user not found' });
      }
    }

    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0] || web3.eth.defaultAccount || env.blockchain.mfsMainWalletAddress;
    
    const results = {};

    // 1. Transfer ETH (Testnet)
    if (ethAmount && parseFloat(ethAmount) > 0) {
      const ethWei = web3.utils.toWei(ethAmount.toString(), 'ether');
      const tx = await web3.eth.sendTransaction({
        from: adminAccount,
        to: targetAddress,
        value: ethWei,
        gas: 21000
      });
      results.ethTx = tx.transactionHash;
    }

    // 2. Transfer MFS
    if (mfsAmount && parseFloat(mfsAmount) > 0) {
      const contract = await getContract();
      // Parse MFS (8 decimals)
      const parts = mfsAmount.toString().split('.');
      let intPart = parts[0] || '0';
      let fracPart = parts[1] || '';
      if (fracPart.length > 8) fracPart = fracPart.substring(0, 8);
      fracPart = fracPart.padEnd(8, '0');
      const mfsWei = intPart + fracPart;

      const txObj = contract.methods.transfer(targetAddress, mfsWei);
      const gas = await txObj.estimateGas({ from: adminAccount });
      const tx = await txObj.send({ from: adminAccount, gas: BigInt(gas) + 10000n });
      results.mfsTx = tx.transactionHash;
    }

    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
};
