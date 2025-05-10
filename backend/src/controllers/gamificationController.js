const db = require('../config/db');

// Badge levels and their XP thresholds
const BADGE_LEVELS = [
  { name: 'Beginner', minXp: 0 },
  { name: 'Explorer', minXp: 50 },
  { name: 'Apprentice', minXp: 150 },
  { name: 'Adept', minXp: 300 },
  { name: 'Expert', minXp: 600 },
  { name: 'Master', minXp: 1000 }
];

// XP rewards for different activities
const XP_REWARDS = {
  COMPLETE_STEP: 10,
  COMPLETE_WEEK: 25,
  COMPLETE_ROADMAP: 100,
  PARTICIPATE_DISCUSSION: 5,
  DAILY_LOGIN: 2,
  SHARE_RESOURCE: 15,
  HELP_PEER: 20
};

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first learning step', condition: 'complete_step', threshold: 1, icon: 'Footprints' },
  { id: 'consistent_learner', name: 'Consistent Learner', description: 'Login for 7 consecutive days', condition: 'daily_login', threshold: 7, icon: 'Calendar' },
  { id: 'roadmap_master', name: 'Roadmap Master', description: 'Complete an entire learning roadmap', condition: 'complete_roadmap', threshold: 1, icon: 'Trophy' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Participate in 10 discussions', condition: 'participate_discussion', threshold: 10, icon: 'MessageCircle' },
  { id: 'helping_hand', name: 'Helping Hand', description: 'Help 5 peers with their questions', condition: 'help_peer', threshold: 5, icon: 'HandHelping' },
  { id: 'resource_contributor', name: 'Resource Contributor', description: 'Share 3 learning resources with the community', condition: 'share_resource', threshold: 3, icon: 'Share2' },
  { id: 'xp_milestone_100', name: 'Century Club', description: 'Earn 100 XP points', condition: 'xp_milestone', threshold: 100, icon: 'Award' },
  { id: 'xp_milestone_500', name: 'High Achiever', description: 'Earn 500 XP points', condition: 'xp_milestone', threshold: 500, icon: 'Star' },
  { id: 'xp_milestone_1000', name: 'XP Legend', description: 'Earn 1000 XP points', condition: 'xp_milestone', threshold: 1000, icon: 'Zap' }
];

// Determine badge based on XP
const determineBadge = (xp) => {
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= BADGE_LEVELS[i].minXp) {
      return BADGE_LEVELS[i].name;
    }
  }
  return BADGE_LEVELS[0].name; // Default to beginner
};

// Check for XP milestone achievements
const checkXpMilestones = async (userId, totalXp) => {
  const newAchievements = [];
  
  // Get XP milestone achievements
  const xpMilestoneAchievements = ACHIEVEMENTS.filter(a => a.condition === 'xp_milestone');
  
  for (const achievement of xpMilestoneAchievements) {
    if (totalXp >= achievement.threshold) {
      // Check if user already has this achievement
      const existingAchievement = await db('user_achievements')
        .where({ user_id: userId, achievement_id: achievement.id })
        .first();
      
      if (!existingAchievement) {
        // Award the achievement
        await db('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
          earned_at: db.fn.now()
        });
        
        newAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon
        });
      }
    }
  }
  
  return newAchievements;
};

// Update user's gamification data
exports.updateGamification = async (req, res) => {
  const { user_id, activity_type, step_id, roadmap_id } = req.body;
  
  try {
    // Determine XP to award based on activity type
    let xp_earned = 0;
    switch(activity_type) {
      case 'complete_step':
        xp_earned = XP_REWARDS.COMPLETE_STEP;
        break;
      case 'complete_week':
        xp_earned = XP_REWARDS.COMPLETE_WEEK;
        break;
      case 'complete_roadmap':
        xp_earned = XP_REWARDS.COMPLETE_ROADMAP;
        break;
      case 'participate_discussion':
        xp_earned = XP_REWARDS.PARTICIPATE_DISCUSSION;
        break;
      case 'daily_login':
        xp_earned = XP_REWARDS.DAILY_LOGIN;
        break;
      case 'share_resource':
        xp_earned = XP_REWARDS.SHARE_RESOURCE;
        break;
      case 'help_peer':
        xp_earned = XP_REWARDS.HELP_PEER;
        break;
      default:
        xp_earned = 0;
    }
    
    // Get current XP for user
    const currentData = await db('gamification').where({ user_id }).first();
    const currentXp = currentData ? currentData.xp : 0;
    const newTotalXp = currentXp + xp_earned;
    
    // Determine badge based on new total XP
    const newBadge = determineBadge(newTotalXp);
    const badgeUpgraded = currentData && currentData.badge !== newBadge;
    
    // Update login streak if this is a daily login
    let loginStreak = currentData ? currentData.login_streak || 0 : 0;
    let streakUpdated = false;
    
    if (activity_type === 'daily_login') {
      // Check if last login was yesterday
      const lastLoginActivity = await db('gamification_history')
        .where({ user_id, activity_type: 'daily_login' })
        .orderBy('created_at', 'desc')
        .first();
      
      if (lastLoginActivity) {
        const lastLoginDate = new Date(lastLoginActivity.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if last login was yesterday (same day in a different timezone is also acceptable)
        if (lastLoginDate.toDateString() === yesterday.toDateString() || 
            lastLoginDate.toDateString() === today.toDateString()) {
          loginStreak += 1;
          streakUpdated = true;
        } else {
          // Reset streak if not consecutive
          loginStreak = 1;
          streakUpdated = true;
        }
      } else {
        // First login
        loginStreak = 1;
        streakUpdated = true;
      }
    }
    
    // Update gamification data
    if (currentData) {
      const updateData = {
        xp: newTotalXp,
        badge: newBadge,
        updated_at: db.fn.now()
      };
      
      if (streakUpdated) {
        updateData.login_streak = loginStreak;
      }
      
      await db('gamification')
        .where({ user_id })
        .update(updateData);
    } else {
      await db('gamification').insert({
        user_id,
        xp: xp_earned,
        badge: newBadge,
        login_streak: activity_type === 'daily_login' ? 1 : 0,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }
    
    // Record this activity in gamification_history
    await db('gamification_history').insert({
      user_id,
      activity_type,
      xp_earned,
      step_id: step_id || null,
      roadmap_id: roadmap_id || null,
      created_at: db.fn.now()
    });
    
    // Check for achievements
    const newAchievements = [];
    
    // Get count of this activity type
    const activityCount = await db('gamification_history')
      .where({ user_id, activity_type })
      .count('id as count')
      .first();
    
    // Check if any achievements have been unlocked
    for (const achievement of ACHIEVEMENTS) {
      if (achievement.condition === activity_type && 
          activityCount.count >= achievement.threshold) {
        
        // Check if user already has this achievement
        const existingAchievement = await db('user_achievements')
          .where({ user_id, achievement_id: achievement.id })
          .first();
        
        if (!existingAchievement) {
          // Award the achievement
          await db('user_achievements').insert({
            user_id,
            achievement_id: achievement.id,
            earned_at: db.fn.now()
          });
          
          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description
          });
        }
      }
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Gamification updated successfully',
      data: {
        xp_earned,
        total_xp: newTotalXp,
        badge: newBadge,
        badge_upgraded: badgeUpgraded,
        streak: loginStreak,
        streak_updated: streakUpdated,
        new_achievements: newAchievements
      }
    });
  } catch (err) {
    console.error('Gamification update error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Gamification update failed', 
      detail: err.message 
    });
  }
};

// Get user's gamification data
exports.getUserGamification = async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const gamificationData = await db('gamification').where({ user_id: user_id }).first();
    
    if (!gamificationData) {
      return res.status(200).json({
        success: true,
        data: {
          xp: 0,
          badge: BADGE_LEVELS[0].name,
          next_badge: BADGE_LEVELS[1].name,
          xp_to_next_badge: BADGE_LEVELS[1].minXp,
          badge_progress: 0,
          achievements: [],
          streak: 0
        }
      });
    }
    
    // Calculate progress to next badge
    const currentXp = gamificationData.xp;
    const currentBadgeIndex = BADGE_LEVELS.findIndex(badge => badge.name === gamificationData.badge);
    const isMaxLevel = currentBadgeIndex === BADGE_LEVELS.length - 1;
    
    let nextBadge = isMaxLevel ? null : BADGE_LEVELS[currentBadgeIndex + 1].name;
    let xpToNextBadge = isMaxLevel ? 0 : BADGE_LEVELS[currentBadgeIndex + 1].minXp - currentXp;
    let badgeProgress = isMaxLevel ? 100 : Math.min(100, Math.round(
      ((currentXp - BADGE_LEVELS[currentBadgeIndex].minXp) / 
      (BADGE_LEVELS[currentBadgeIndex + 1].minXp - BADGE_LEVELS[currentBadgeIndex].minXp)) * 100
    ));
    
    // Get recent activities
    const recentActivities = await db('gamification_history')
      .where({ user_id: user_id })
      .orderBy('created_at', 'desc')
      .limit(10);
    
    // Get user achievements
    const userAchievements = await db('user_achievements')
      .where({ user_id: user_id })
      .select('achievement_id', 'earned_at');
    
    // Get login streak
    const loginStreak = gamificationData.login_streak || 0;
    
    res.status(200).json({
      success: true,
      data: {
        xp: currentXp,
        badge: gamificationData.badge,
        next_badge: nextBadge,
        xp_to_next_badge: xpToNextBadge,
        badge_progress: badgeProgress,
        recent_activities: recentActivities,
        achievements: userAchievements,
        streak: loginStreak
      }
    });
  } catch (err) {
    console.error('Get gamification error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get gamification data', 
      detail: err.message 
    });
  }
};

// Get leaderboard data
exports.getLeaderboard = async (req, res) => {
  try {
    // Get top users by XP
    const leaderboardData = await db('gamification')
      .join('users', 'gamification.user_id', '=', 'users.id')
      .select(
        'users.id as user_id',
        'users.name',
        'users.email',
        'gamification.xp',
        'gamification.badge',
        'gamification.login_streak as streak'
      )
      .orderBy('gamification.xp', 'desc')
      .limit(10);
    
    // Get achievement counts for each user
    const userIds = leaderboardData.map(user => user.user_id);
    const achievementCounts = await db('user_achievements')
      .whereIn('user_id', userIds)
      .select('user_id')
      .count('achievement_id as achievement_count')
      .groupBy('user_id');
    
    // Create a map of user_id to achievement count
    const achievementCountMap = {};
    achievementCounts.forEach(item => {
      achievementCountMap[item.user_id] = parseInt(item.achievement_count);
    });
    
    // Add achievement count to leaderboard data
    const enrichedLeaderboardData = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1,
      achievement_count: achievementCountMap[user.user_id] || 0
    }));
    
    res.status(200).json({
      success: true,
      data: enrichedLeaderboardData
    });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get leaderboard data', 
      detail: err.message 
    });
  }
};

// Get all available achievements
exports.getAchievements = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: ACHIEVEMENTS
    });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get achievements data', 
      detail: err.message 
    });
  }
};
