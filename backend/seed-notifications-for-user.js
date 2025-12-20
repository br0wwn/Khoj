require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Alert = require('./src/models/Alert');
const Notification = require('./src/models/Notification');

async function createNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'lamia@g.com' });
    if (!user) {
      console.log('❌ User lamia@g.com not found');
      process.exit(1);
    }
    console.log(`✅ Found user: ${user.name}`);

    // Get some alerts
    const alerts = await Alert.find().limit(5);
    if (alerts.length === 0) {
      console.log('❌ No alerts found. Please run seed-database.js first');
      process.exit(1);
    }

    // Delete existing notifications for this user
    await Notification.deleteMany({ 'recipient.userId': user._id });
    console.log('🗑️  Cleared existing notifications');

    const notifications = [];

    // Create facial recognition notifications
    for (let i = 0; i < 3; i++) {
      const alert = alerts[i];
      const confidence = 60 + Math.floor(Math.random() * 35);
      notifications.push({
        recipient: {
          userId: user._id,
          userType: 'User'
        },
        type: 'facial_recognition',
        title: 'Possible Match Found!',
        message: `There is a ${confidence}% similarity match. This could be your missing person.`,
        relatedAlert: alert._id,
        matchData: {
          confidence: confidence,
          matchedImageUrl: 'https://example.com/match.jpg',
          location: `${alert.upazila}, ${alert.district}`,
          timestamp: new Date()
        },
        isRead: false,
        priority: confidence > 80 ? 'urgent' : confidence > 60 ? 'high' : 'medium',
        createdAt: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
      });
    }

    // Create alert update notifications
    for (let i = 3; i < 5; i++) {
      const alert = alerts[i];
      notifications.push({
        recipient: {
          userId: user._id,
          userType: 'User'
        },
        type: 'alert_update',
        title: 'Alert Status Updated',
        message: `Your alert "${alert.title}" has been updated.`,
        relatedAlert: alert._id,
        isRead: Math.random() > 0.5,
        priority: 'medium',
        createdAt: new Date(Date.now() - Math.random() * 172800000) // Random time in last 2 days
      });
    }

    // Create general notifications
    notifications.push({
      recipient: {
        userId: user._id,
        userType: 'User'
      },
      type: 'general',
      title: 'Welcome to Khoj!',
      message: 'Thank you for using our platform to help keep the community safe.',
      isRead: false,
      priority: 'low',
      createdAt: new Date(Date.now() - 3600000) // 1 hour ago
    });

    const created = await Notification.insertMany(notifications);
    console.log(`✅ Created ${created.length} notifications for lamia@g.com`);
    console.log(`   • ${created.filter(n => !n.isRead).length} unread`);
    console.log(`   • ${created.filter(n => n.type === 'facial_recognition').length} facial recognition alerts`);
    
    console.log('\n🎉 Notifications ready! Refresh your app to see them.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createNotifications();
