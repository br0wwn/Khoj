const AreaStatistics = require('../models/AreaStatistics');
const Alert = require('../models/Alert');
const Report = require('../models/Report');

// @desc    Get statistics for a specific area
// @route   GET /api/statistics/area
// @access  Public
exports.getAreaStatistics = async (req, res) => {
  try {
    const { district, upazila } = req.query;

    if (!district || !upazila) {
      return res.status(400).json({
        success: false,
        error: 'District and upazila are required'
      });
    }

    let stats = await AreaStatistics.findOne({ district, upazila });

    // If no statistics exist, create them
    if (!stats) {
      stats = await createOrUpdateAreaStatistics(district, upazila);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching area statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all statistics by district
// @route   GET /api/statistics/district/:district
// @access  Public
exports.getDistrictStatistics = async (req, res) => {
  try {
    const { district } = req.params;

    const stats = await AreaStatistics.find({ district })
      .sort({ dangerScore: -1 })
      .lean();

    // Calculate district-wide aggregates
    const aggregate = {
      totalAlerts: 0,
      activeAlerts: 0,
      totalReports: 0,
      averageDangerScore: 0,
      mostDangerousAreas: []
    };

    stats.forEach(stat => {
      aggregate.totalAlerts += stat.statistics.totalAlerts;
      aggregate.activeAlerts += stat.statistics.activeAlerts;
      aggregate.totalReports += stat.statistics.totalReports;
    });

    if (stats.length > 0) {
      aggregate.averageDangerScore = Math.round(
        stats.reduce((sum, stat) => sum + stat.dangerScore, 0) / stats.length
      );
      aggregate.mostDangerousAreas = stats
        .filter(stat => stat.dangerLevel !== 'safe')
        .slice(0, 5)
        .map(stat => ({
          upazila: stat.upazila,
          dangerLevel: stat.dangerLevel,
          dangerScore: stat.dangerScore
        }));
    }

    res.json({
      success: true,
      data: {
        district,
        areas: stats,
        aggregate
      }
    });
  } catch (error) {
    console.error('Error fetching district statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get top dangerous areas
// @route   GET /api/statistics/dangerous-areas
// @access  Public
exports.getDangerousAreas = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const dangerousAreas = await AreaStatistics.find({
      dangerLevel: { $in: ['high', 'critical'] }
    })
      .sort({ dangerScore: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: dangerousAreas
    });
  } catch (error) {
    console.error('Error fetching dangerous areas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get overall statistics
// @route   GET /api/statistics/overall
// @access  Public
exports.getOverallStatistics = async (req, res) => {
  try {
    const [totalAlerts, activeAlerts, totalReports, areaStats] = await Promise.all([
      Alert.countDocuments({}),
      Alert.countDocuments({ status: 'active' }),
      Report.countDocuments({}),
      AreaStatistics.find({}).lean()
    ]);

    const dangerLevelCounts = {
      safe: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0
    };

    areaStats.forEach(stat => {
      dangerLevelCounts[stat.dangerLevel]++;
    });

    res.json({
      success: true,
      data: {
        totalAlerts,
        activeAlerts,
        resolvedAlerts: totalAlerts - activeAlerts,
        totalReports,
        totalAreas: areaStats.length,
        dangerLevelCounts,
        criticalAreas: dangerLevelCounts.critical,
        highDangerAreas: dangerLevelCounts.high
      }
    });
  } catch (error) {
    console.error('Error fetching overall statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get trends data
// @route   GET /api/statistics/trends
// @access  Public
exports.getTrends = async (req, res) => {
  try {
    const { district, upazila, months = 6 } = req.query;

    let query = {};
    if (district) query.district = district;
    if (upazila) query.upazila = upazila;

    const stats = await AreaStatistics.find(query).lean();

    // Aggregate monthly trends
    const trendsMap = new Map();

    stats.forEach(stat => {
      if (stat.monthlyTrends) {
        stat.monthlyTrends.slice(-months).forEach(trend => {
          const key = `${trend.year}-${trend.month}`;
          if (!trendsMap.has(key)) {
            trendsMap.set(key, {
              month: trend.month,
              year: trend.year,
              alertCount: 0,
              reportCount: 0,
              avgDangerScore: 0,
              count: 0
            });
          }
          const existing = trendsMap.get(key);
          existing.alertCount += trend.alertCount;
          existing.reportCount += trend.reportCount;
          existing.avgDangerScore += trend.dangerScore;
          existing.count++;
        });
      }
    });

    const trends = Array.from(trendsMap.values()).map(trend => ({
      ...trend,
      avgDangerScore: Math.round(trend.avgDangerScore / trend.count)
    }));

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update area statistics (called automatically by alert/report creation)
// @route   POST /api/statistics/update
// @access  Private (System use)
exports.updateAreaStatistics = async (req, res) => {
  try {
    const { district, upazila } = req.body;

    if (!district || !upazila) {
      return res.status(400).json({
        success: false,
        error: 'District and upazila are required'
      });
    }

    const stats = await createOrUpdateAreaStatistics(district, upazila);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error updating area statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to create or update area statistics
async function createOrUpdateAreaStatistics(district, upazila) {
  const [alertStats, reportStats] = await Promise.all([
    Alert.aggregate([
      { $match: { district, upazila } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]),
    Report.countDocuments({ district, upazila })
  ]);

  const totalAlerts = alertStats[0]?.total || 0;
  const activeAlerts = alertStats[0]?.active || 0;
  const resolvedAlerts = alertStats[0]?.resolved || 0;
  const totalReports = reportStats || 0;

  let stats = await AreaStatistics.findOne({ district, upazila });

  if (!stats) {
    stats = new AreaStatistics({
      district,
      upazila,
      statistics: {
        totalAlerts,
        activeAlerts,
        resolvedAlerts,
        totalReports
      }
    });
  } else {
    stats.statistics.totalAlerts = totalAlerts;
    stats.statistics.activeAlerts = activeAlerts;
    stats.statistics.resolvedAlerts = resolvedAlerts;
    stats.statistics.totalReports = totalReports;
  }

  // Calculate danger level
  stats.calculateDangerLevel();

  // Update monthly trends
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  const existingTrendIndex = stats.monthlyTrends.findIndex(
    t => t.month === currentMonth && t.year === currentYear
  );

  if (existingTrendIndex >= 0) {
    stats.monthlyTrends[existingTrendIndex] = {
      month: currentMonth,
      year: currentYear,
      alertCount: totalAlerts,
      reportCount: totalReports,
      dangerScore: stats.dangerScore
    };
  } else {
    stats.monthlyTrends.push({
      month: currentMonth,
      year: currentYear,
      alertCount: totalAlerts,
      reportCount: totalReports,
      dangerScore: stats.dangerScore
    });

    // Keep only last 12 months
    if (stats.monthlyTrends.length > 12) {
      stats.monthlyTrends = stats.monthlyTrends.slice(-12);
    }
  }

  await stats.save();
  return stats;
}

module.exports = exports;
