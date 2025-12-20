const mongoose = require('mongoose');

const areaStatisticsSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    trim: true
  },
  upazila: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  statistics: {
    totalAlerts: {
      type: Number,
      default: 0
    },
    activeAlerts: {
      type: Number,
      default: 0
    },
    resolvedAlerts: {
      type: Number,
      default: 0
    },
    totalReports: {
      type: Number,
      default: 0
    },
    missingPersons: {
      type: Number,
      default: 0
    },
    theftIncidents: {
      type: Number,
      default: 0
    },
    violenceIncidents: {
      type: Number,
      default: 0
    },
    otherIncidents: {
      type: Number,
      default: 0
    }
  },
  dangerLevel: {
    type: String,
    enum: ['safe', 'low', 'moderate', 'high', 'critical'],
    default: 'safe'
  },
  dangerScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  monthlyTrends: [{
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    alertCount: {
      type: Number,
      default: 0
    },
    reportCount: {
      type: Number,
      default: 0
    },
    dangerScore: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Compound index for location lookups
areaStatisticsSchema.index({ district: 1, upazila: 1 });
areaStatisticsSchema.index({ dangerLevel: 1 });
areaStatisticsSchema.index({ dangerScore: -1 });

// Method to calculate danger level based on statistics
areaStatisticsSchema.methods.calculateDangerLevel = function() {
  const { totalAlerts, activeAlerts, totalReports } = this.statistics;
  
  // Calculate danger score based on multiple factors
  let score = 0;
  
  // Active alerts impact (40% weight)
  score += (activeAlerts * 10) * 0.4;
  
  // Total alerts impact (30% weight)
  score += (totalAlerts * 2) * 0.3;
  
  // Total reports impact (30% weight)
  score += (totalReports * 1.5) * 0.3;
  
  // Cap at 100
  score = Math.min(score, 100);
  
  this.dangerScore = Math.round(score);
  
  // Determine danger level based on score
  if (score < 10) {
    this.dangerLevel = 'safe';
  } else if (score < 30) {
    this.dangerLevel = 'low';
  } else if (score < 50) {
    this.dangerLevel = 'moderate';
  } else if (score < 75) {
    this.dangerLevel = 'high';
  } else {
    this.dangerLevel = 'critical';
  }
  
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('AreaStatistics', areaStatisticsSchema);
