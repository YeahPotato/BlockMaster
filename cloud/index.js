/**
 * 方块大师 - 云函数入口
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口
exports.main = async (event, context) => {
  const { action, data } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  switch (action) {
    case 'getRank':
      return await getRank(data);
    case 'submitScore':
      return await submitScore(openid, data);
    case 'claimAdReward':
      return await claimAdReward(openid, data);
    case 'buySkin':
      return await buySkin(openid, data);
    case 'buyCoins':
      return await buyCoins(openid, data);
    default:
      return { code: -1, message: 'Unknown action' };
  }
};

// 获取排行榜
async function getRank({ chapter, level, limit = 50 }) {
  try {
    const result = await db.collection('leaderboard')
      .where({ chapter, level })
      .orderBy('bestTime', 'asc')
      .limit(limit)
      .get();
    
    return {
      code: 0,
      data: result.data.map(item => ({
        rank: item.rank || 0,
        nickname: item.nickname || '匿名玩家',
        avatar: item.avatar || '',
        bestTime: item.bestTime,
        stars: item.stars || 3,
      })),
    };
  } catch (e) {
    console.error('getRank error:', e);
    return { code: -1, message: e.message };
  }
}

// 提交分数
async function submitScore(openid, { chapter, level, time, stars }) {
  try {
    const now = Date.now();
    const day = getDayStr();
    
    // 查询是否已存在
    const existing = await db.collection('leaderboard')
      .where({ openid, chapter, level })
      .get();
    
    if (existing.data.length > 0) {
      // 更新（如果更好）
      const old = existing.data[0];
      if (time < old.bestTime || (time === old.bestTime && stars > old.stars)) {
        await db.collection('leaderboard').doc(old._id).update({
          data: {
            bestTime: time,
            stars: Math.max(old.stars, stars),
            updatedAt: now,
          },
        });
        
        // 重新计算排名
        await recalculateRank(chapter, level);
      }
    } else {
      // 获取当前最大排名
      const maxRank = await db.collection('leaderboard')
        .where({ chapter, level })
        .orderBy('rank', 'desc')
        .limit(1)
        .get();
      
      const newRank = (maxRank.data[0]?.rank || 0) + 1;
      
      await db.collection('leaderboard').add({
        data: {
          openid,
          chapter,
          level,
          bestTime: time,
          stars,
          rank: newRank,
          day,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
    
    return { code: 0, message: 'success' };
  } catch (e) {
    console.error('submitScore error:', e);
    return { code: -1, message: e.message };
  }
}

// 重新计算排名
async function recalculateRank(chapter, level) {
  try {
    const result = await db.collection('leaderboard')
      .where({ chapter, level })
      .orderBy('bestTime', 'asc')
      .get();
    
    const batch = [];
    result.data.forEach((item, index) => {
      if (item.rank !== index + 1) {
        batch.push(db.collection('leaderboard').doc(item._id).update({
          data: { rank: index + 1 },
        }));
      }
    });
    
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  } catch (e) {
    console.error('recalculateRank error:', e);
  }
}

// 广告奖励
async function claimAdReward(openid, { type, reward }) {
  try {
    // 获取或创建用户记录
    const user = await db.collection('users').where({ openid }).get();
    
    if (user.data.length > 0) {
      const userData = user.data[0];
      const updateData = {};
      
      if (reward.coins) {
        updateData.coins = db.command.inc(reward.coins);
      }
      if (reward.diamonds) {
        updateData.diamonds = db.command.inc(reward.diamonds);
      }
      if (reward.hintTickets) {
        updateData.hintTickets = db.command.inc(reward.hintTickets);
      }
      
      await db.collection('users').doc(userData._id).update({ data: updateData });
      
      return {
        code: 0,
        data: {
          coins: (userData.coins || 0) + (reward.coins || 0),
          diamonds: (userData.diamonds || 0) + (reward.diamonds || 0),
          hintTickets: (userData.hintTickets || 0) + (reward.hintTickets || 0),
        },
      };
    }
    
    return { code: -1, message: 'User not found' };
  } catch (e) {
    console.error('claimAdReward error:', e);
    return { code: -1, message: e.message };
  }
}

// 购买皮肤
async function buySkin(openid, { skinId, cost }) {
  try {
    const user = await db.collection('users').where({ openid }).get();
    if (user.data.length === 0) {
      return { code: -1, message: 'User not found' };
    }
    
    const userData = user.data[0];
    const skins = userData.skins || [];
    
    // 已拥有
    if (skins.includes(skinId)) {
      return { code: -2, message: 'Already owned' };
    }
    
    const updateData = { $push: { skins: skinId } };
    let success = true;
    
    if (cost.type === 'coins') {
      if ((userData.coins || 0) < cost.value) {
        return { code: -3, message: 'Not enough coins' };
      }
      updateData.$inc = { coins: -cost.value };
    } else if (cost.type === 'diamonds') {
      if ((userData.diamonds || 0) < cost.value) {
        return { code: -3, message: 'Not enough diamonds' };
      }
      updateData.$inc = { diamonds: -cost.value };
    }
    
    await db.collection('users').doc(userData._id).update({ data: updateData });
    
    return { code: 0, message: 'success' };
  } catch (e) {
    console.error('buySkin error:', e);
    return { code: -1, message: e.message };
  }
}

// 购买金币
async function buyCoins(openid, { amount, price }) {
  try {
    const user = await db.collection('users').where({ openid }).get();
    if (user.data.length === 0) {
      return { code: -1, message: 'User not found' };
    }
    
    const userData = user.data[0];
    const diamonds = userData.diamonds || 0;
    
    if (diamonds < price) {
      return { code: -3, message: 'Not enough diamonds' };
    }
    
    await db.collection('users').doc(userData._id).update({
      data: {
        $inc: { diamonds: -price, coins: amount },
      },
    });
    
    return {
      code: 0,
      data: {
        diamonds: diamonds - price,
        coins: (userData.coins || 0) + amount,
      },
    };
  } catch (e) {
    console.error('buyCoins error:', e);
    return { code: -1, message: e.message };
  }
}

function getDayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
