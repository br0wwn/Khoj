# 🎴 Quick Reference Card - New Features

## 🔔 Notifications

### Backend API:
```javascript
GET    /api/notifications                  // Get all
GET    /api/notifications/unread-count     // Count unread
PUT    /api/notifications/:id/read         // Mark read
POST   /api/notifications/facial-recognition // Create FR alert
```

### Frontend Usage:
```jsx
import NotificationDropdown from './NotificationDropdown';
<NotificationDropdown /> // Add to Navbar
```

### Create Notification:
```javascript
POST /api/notifications/facial-recognition
{
  "recipientUserId": "USER_ID",
  "alertId": "ALERT_ID",  
  "confidence": 85,
  "matchedImageUrl": "URL",
  "location": "Dhaka"
}
```

---

## 📊 Statistics

### Backend API:
```javascript
GET /api/statistics/overall               // Overall stats
GET /api/statistics/dangerous-areas       // Top 10 dangerous
GET /api/statistics/district/:district    // District stats
GET /api/statistics/area                  // Specific area
  ?district=Dhaka&upazila=Mirpur
```

### Frontend Usage:
```jsx
import statisticsService from '../services/statisticsService';

const stats = await statisticsService.getOverallStatistics();
const areas = await statisticsService.getDangerousAreas(10);
```

### Danger Levels:
- 🟢 Safe (0-10)
- 🔵 Low (10-30)
- 🟡 Moderate (30-50)
- 🟠 High (50-75)
- 🔴 Critical (75-100)

---

## 🔗 Social Sharing

### Backend API:
```javascript
POST /api/social-shares                   // Track share
GET  /api/social-shares/alert/:id         // Get shares
GET  /api/social-shares/generate-link/:id // Generate link
  ?platform=facebook
```

### Frontend Usage:
```jsx
import SocialShareButton from './SocialShareButton';
<SocialShareButton alertId={alertId} />
// or compact version
<SocialShareButton alertId={alertId} compact={true} />
```

### Platforms:
- facebook, twitter, whatsapp, telegram, email, copy_link

---

## 🔒 Sensitive Content

### Media Structure:
```javascript
{
  media_url: "original.jpg",
  censored_url: "censored.jpg",  // NEW
  is_sensitive: true,             // NEW
  media_type: "image",
  public_id: "cloudinary_id"
}
```

### Cloudinary Censoring:
```javascript
const censoredUrl = cloudinary.url(publicId, {
  effect: "blur:2000",
  quality: "auto"
});
```

---

## 🗄️ Database Collections

### New Collections:
- `notifications` - User notifications
- `areastatics` - Area danger tracking  
- `socialshares` - Share tracking

### Modified Collections:
- `alerts` - Added socialShares, censoring
- `reports` - Added censoring support

---

## 🎨 UI Components

### NotificationDropdown:
- Bell icon with badge
- Dropdown with list
- Auto-refresh (30s)
- Mark as read
- Priority colors

### SocialShareButton:
- 6 platform buttons
- Compact/full modes
- Share tracking
- Copy to clipboard
- Success feedback

### Statistics Dashboard:
- Metric cards
- Danger distribution
- Area ranking
- District selector
- Detail modals

---

## 🚀 Auto-Updates

### What Updates Automatically:
✅ Area statistics (when alert/report created)
✅ Danger levels (calculated on update)
✅ Share counts (on share action)
✅ Notification badge (on new notification)

### Manual Triggers:
- Statistics recalculation: Create/update alerts
- Notification refresh: Every 30 seconds
- Share count: On share button click

---

## 🎯 Common Use Cases

### Show Notification for Missing Person Match:
```javascript
const response = await notificationService.createFacialRecognitionNotification({
  recipientUserId: alertOwner._id,
  alertId: alert._id,
  confidence: 85,
  matchedImageUrl: matchPhoto.url,
  location: "Found at: Gulshan, Dhaka"
});
```

### Share Alert on WhatsApp:
```javascript
await socialShareService.shareToSocial(alertId, 'whatsapp');
```

### Get Area Danger Level:
```javascript
const { data } = await statisticsService.getAreaStatistics(
  'Dhaka', 
  'Mirpur'
);
console.log(data.dangerLevel); // 'high'
console.log(data.dangerScore); // 72
```

### Upload Sensitive Image:
```javascript
const mediaData = {
  media_url: uploadedUrl,
  media_type: 'image',
  is_sensitive: true,
  censored_url: censoredUrl // Generate with Cloudinary
};
```

---

## ⚙️ Configuration

### No New Dependencies!
All features use existing packages:
- express, mongoose, cloudinary
- react, axios, leaflet

### Environment Variables:
```env
MONGODB_URI=...
CLOUDINARY_CLOUD_NAME=...
FRONTEND_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Notifications Not Showing:
- Check: User is logged in
- Check: Backend is running
- Check: MongoDB connected

### Statistics Empty:
- Create some alerts/reports first
- Statistics auto-generate

### Share Not Working:
- Check: Popup blocker disabled
- Check: CORS configured
- Check: Backend API accessible

---

## 📱 Mobile Responsive

All features work on:
✅ Desktop (1920px+)
✅ Laptop (1024px-1920px)
✅ Tablet (768px-1024px)
✅ Mobile (320px-768px)

---

## 🔐 Security

- ✅ Authentication required for sensitive endpoints
- ✅ Owner-only edit/delete
- ✅ Sensitive content auto-censored
- ✅ Share tracking anonymous-friendly
- ✅ Input validation on all endpoints

---

## 📈 Performance

- ⚡ Indexed database queries
- ⚡ Async statistics updates
- ⚡ Lazy component loading
- ⚡ Efficient React rendering
- ⚡ Optimized Cloudinary images

---

## 🎉 Features Summary

4 Major Features:
1. ✅ Social Sharing (6 platforms)
2. ✅ Notifications (Facial Recognition)
3. ✅ Statistics (Danger Tracking)
4. ✅ Sensitive Content (Censoring)

15+ New Files:
- 3 Models
- 3 Controllers
- 3 Routes
- 3 Services
- 2 Components
- 1 Page Update

All Fabulous! ✨

---

**Keep this card handy for quick reference!** 🚀
