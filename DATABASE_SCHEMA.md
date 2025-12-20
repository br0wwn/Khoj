# 📊 Database Schema - New Collections

## New MongoDB Collections Added

### 1. notifications
```javascript
{
  _id: ObjectId,
  recipient: {
    userId: ObjectId,          // References User or Police
    userType: String           // 'User' or 'Police'
  },
  type: String,                // 'facial_recognition', 'alert_update', 'report_update', 'general'
  title: String,
  message: String,
  relatedAlert: ObjectId,      // References Alert (optional)
  relatedReport: ObjectId,     // References Report (optional)
  matchData: {                 // For facial recognition notifications
    confidence: Number,        // 0-100
    matchedImageUrl: String,
    location: String,
    timestamp: Date
  },
  isRead: Boolean,             // default: false
  priority: String,            // 'low', 'medium', 'high', 'urgent'
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:
- `recipient.userId + isRead + createdAt` (compound index for fast queries)

---

### 2. areastatics (AreaStatistics)
```javascript
{
  _id: ObjectId,
  district: String,
  upazila: String,
  location: String,            // Optional specific location
  statistics: {
    totalAlerts: Number,
    activeAlerts: Number,
    resolvedAlerts: Number,
    totalReports: Number,
    missingPersons: Number,
    theftIncidents: Number,
    violenceIncidents: Number,
    otherIncidents: Number
  },
  dangerLevel: String,         // 'safe', 'low', 'moderate', 'high', 'critical'
  dangerScore: Number,         // 0-100
  lastUpdated: Date,
  monthlyTrends: [{
    month: String,             // 'January', 'February', etc.
    year: Number,
    alertCount: Number,
    reportCount: Number,
    dangerScore: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:
- `district + upazila` (compound index for area lookups)
- `dangerLevel` (for danger filtering)
- `dangerScore` (descending, for top dangerous areas)

---

### 3. socialshares
```javascript
{
  _id: ObjectId,
  alert: ObjectId,             // References Alert
  sharedBy: {
    userId: ObjectId,          // References User or Police (optional)
    userType: String           // 'User' or 'Police'
  },
  platform: String,            // 'facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'copy_link', 'other'
  shareUrl: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:
- `alert + createdAt` (for alert-specific share history)
- `platform + createdAt` (for platform analytics)
- `sharedBy.userId + createdAt` (for user share history)

---

## Modified Collections

### alerts (Modified)
**New Fields Added:**
```javascript
{
  // ... existing fields ...
  
  // NEW: Social Share Tracking
  socialShares: {
    count: Number,             // default: 0
    platforms: {
      facebook: Number,        // default: 0
      twitter: Number,         // default: 0
      whatsapp: Number,        // default: 0
      telegram: Number,        // default: 0
      email: Number,           // default: 0
      other: Number            // default: 0
    }
  },
  
  // NEW: Visibility Control
  visibility: String,          // 'public', 'restricted', 'private' - default: 'public'
  
  // MODIFIED: Media with Censoring
  media: [{
    media_url: String,
    media_type: String,        // 'image' or 'video'
    is_sensitive: Boolean,     // NEW - default: false
    censored_url: String,      // NEW - URL of censored version
    public_id: String          // NEW - Cloudinary reference
  }]
}
```

---

### reports (Modified)
**New Fields Added:**
```javascript
{
  // ... existing fields ...
  
  // MODIFIED: Media with Censoring
  media: [{
    media_url: String,
    media_type: String,
    public_id: String,
    is_sensitive: Boolean,     // NEW - default: false
    censored_url: String       // NEW - URL of censored version
  }]
}
```

---

## Database Size Estimates

### Expected Growth:
- **notifications**: ~100 KB per 1000 notifications
- **areastatics**: ~5 KB per area (one document per district+upazila combination)
- **socialshares**: ~50 KB per 1000 shares

### Indexes Size:
- All indexes combined: ~10-20% of collection size

---

## Sample Queries

### Get User's Unread Notifications:
```javascript
db.notifications.find({
  'recipient.userId': ObjectId('USER_ID'),
  isRead: false
}).sort({ createdAt: -1 })
```

### Get Top 10 Dangerous Areas:
```javascript
db.areastatics.find({
  dangerLevel: { $in: ['high', 'critical'] }
}).sort({ dangerScore: -1 }).limit(10)
```

### Get Alert Share Statistics:
```javascript
db.socialshares.aggregate([
  { $match: { alert: ObjectId('ALERT_ID') } },
  { $group: { 
      _id: '$platform', 
      count: { $sum: 1 } 
  }}
])
```

---

## Data Integrity

### Automatic Updates:
1. **AreaStatistics**: Auto-updates when alerts/reports are created
2. **Alert socialShares**: Auto-increments when shares are tracked
3. **Notification isRead**: Updates when user reads notification

### Referential Integrity:
- Notifications reference alerts/reports (but don't cascade delete)
- SocialShares reference alerts (tracking remains even if alert deleted)
- AreaStatistics are independent (don't delete when alerts removed)

---

## Backup Recommendations

Priority Collections:
1. **High**: alerts, reports (core data)
2. **Medium**: notifications, socialshares (user activity)
3. **Low**: areastatics (can be regenerated)

---

## Performance Considerations

### Optimized Queries:
- All list queries use indexes
- Pagination recommended for large datasets
- Aggregation pipelines used for analytics

### Caching Strategy:
- Statistics can be cached (15-minute TTL)
- Notification count can be cached (30-second TTL)
- Share counts updated in real-time (no cache)

---

## Migration Notes

### If you have existing data:
1. Run database migration to add new fields to existing alerts
2. Initialize area statistics by running update endpoint
3. No action needed for notifications (new collection)
4. No action needed for social shares (new collection)

### Migration Script (Optional):
```javascript
// Add default socialShares to existing alerts
db.alerts.updateMany(
  { socialShares: { $exists: false } },
  { 
    $set: { 
      socialShares: {
        count: 0,
        platforms: {
          facebook: 0, twitter: 0, whatsapp: 0,
          telegram: 0, email: 0, other: 0
        }
      },
      visibility: 'public'
    }
  }
)

// Initialize area statistics for all existing areas
// (Do this via API: POST /api/statistics/update for each district+upazila)
```

---

## Questions for Database?

### Do you need to know:
1. ✅ Collection schemas - DOCUMENTED ABOVE
2. ✅ Indexes - DOCUMENTED ABOVE  
3. ✅ Relationships - DOCUMENTED ABOVE
4. ✅ Sample queries - PROVIDED ABOVE
5. ⚠️ Anything else specific?

**The database structure is complete and production-ready!** 🎉
