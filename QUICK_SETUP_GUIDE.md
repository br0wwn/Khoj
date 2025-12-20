# 🚀 Quick Setup Guide - New Features

## Prerequisites
- Node.js installed
- MongoDB running
- Environment variables configured

## Step 1: Install Dependencies

No new dependencies needed! All features use existing packages.

## Step 2: Environment Variables

Make sure your `.env` file has:
```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## Step 3: Start the Application

### Backend:
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npm start
```

## Step 4: Test the Features

### 🔔 Test Notifications:
1. Open the app
2. Login/Register
3. Look for the bell icon in the navbar
4. Click to see notifications

### 📊 Test Statistics:
1. Navigate to http://localhost:3000/statistics
2. View overall metrics
3. Select a district from dropdown
4. Click on areas to see details

### 🔗 Test Social Sharing:
1. Open any alert details page
2. Scroll to "Share this Alert" section
3. Click any platform button
4. Verify share tracking

## Step 5: Create Sample Data

You can use the existing alerts and reports. The statistics will automatically generate as you create more alerts and reports.

### Create a Facial Recognition Notification (via API):
```bash
curl -X POST http://localhost:5000/api/notifications/facial-recognition \
  -H "Content-Type: application/json" \
  -d '{
    "recipientUserId": "YOUR_USER_ID",
    "alertId": "ALERT_ID",
    "confidence": 85,
    "matchedImageUrl": "https://example.com/image.jpg",
    "location": "Dhaka, Bangladesh"
  }'
```

## Features Ready to Use:

✅ Social Sharing (6 platforms)
✅ Notification System
✅ Statistics Dashboard
✅ Sensitive Content Support
✅ Area Danger Tracking
✅ Auto-updating Statistics

## API Testing with Postman/Thunder Client:

Import these endpoints:

### Notifications:
- GET http://localhost:5000/api/notifications
- GET http://localhost:5000/api/notifications/unread-count
- PUT http://localhost:5000/api/notifications/:id/read

### Statistics:
- GET http://localhost:5000/api/statistics/overall
- GET http://localhost:5000/api/statistics/dangerous-areas
- GET http://localhost:5000/api/statistics/area?district=Dhaka&upazila=Mirpur

### Social Shares:
- POST http://localhost:5000/api/social-shares
- GET http://localhost:5000/api/social-shares/alert/:alertId
- GET http://localhost:5000/api/social-shares/analytics

## Troubleshooting:

### Issue: Notifications not showing
**Solution**: Make sure you're logged in and have created some alerts

### Issue: Statistics showing zero
**Solution**: Create some alerts and reports first. Statistics auto-generate.

### Issue: Share buttons not working
**Solution**: Check browser console for errors. Ensure backend is running.

## Next Steps:

1. ✅ Create alerts and reports to populate statistics
2. ✅ Test social sharing on different platforms
3. ✅ Monitor notifications for updates
4. ✅ Check dangerous areas in statistics
5. ✅ Implement facial recognition integration (optional)

## Support:

If you encounter any issues:
1. Check console logs (browser and backend)
2. Verify all services are running
3. Check MongoDB connection
4. Review NEW_FEATURES_DOCUMENTATION.md for details

---

**All systems ready! 🎉**
