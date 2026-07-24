const { User, Referral } = require('../models');
const { Op } = require('sequelize');

async function getReferralStats(req, res, next) {
  try {
    const userId = req.user.sub;
    const [referrals, count] = await Promise.all([
      Referral.findAll({
        where: { referrerId: userId },
        include: [{ model: User, as: 'referred', attributes: ['id', 'email', 'phone', 'createdAt'] }],
        order: [['created_at', 'DESC']],
      }),
      Referral.count({ where: { referrerId: userId } }),
    ]);
    const totalReward = referrals.reduce((sum, r) => sum + parseFloat(r.rewardEarned), 0);

    const user = await User.findByPk(userId);

    res.json({
      referralCode: user.referralCode,
      totalReferrals: count,
      totalReward: totalReward.toFixed(8),
      referrals: referrals.map((r) => ({
        id: r.id,
        level: r.level,
        rewardEarned: r.rewardEarned,
        referredEmail: r.referred?.email,
        referredPhone: r.referred?.phone,
        joinedAt: r.referred?.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getReferralTree(req, res, next) {
  try {
    const userId = req.user.sub;
    const tree = await buildTree(userId, 3);
    res.json({ tree });
  } catch (err) {
    next(err);
  }
}

async function buildTree(userId, maxDepth, depth = 0) {
  if (depth >= maxDepth) return null;
  const referrals = await Referral.findAll({
    where: { referrerId: userId },
    include: [{ model: User, as: 'referred', attributes: ['id', 'email', 'phone', 'referralCode', 'createdAt'] }],
  });
  const childNodes = [];
  for (const ref of referrals) {
    const grandchildren = await buildTree(ref.referredId, maxDepth, depth + 1);
    childNodes.push({
      user: ref.referred,
      level: ref.level,
      rewardEarned: ref.rewardEarned,
      children: grandchildren ? grandchildren.children : [],
    });
  }
  return { userId, children: childNodes };
}

module.exports = { getReferralStats, getReferralTree };
