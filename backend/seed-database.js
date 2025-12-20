require('dotenv').config();
const mongoose = require('mongoose');
const Alert = require('./src/models/Alert');
const Report = require('./src/models/Report');
const User = require('./src/models/User');
const Police = require('./src/models/police');
const Notification = require('./src/models/Notification');
const SocialShare = require('./src/models/SocialShare');
const AreaStatistics = require('./src/models/AreaStatistics');

// Sample data
const districts = [
  { district: 'Dhaka', upazilas: ['Mirpur', 'Gulshan', 'Dhanmondi', 'Mohammadpur', 'Uttara'] },
  { district: 'Chittagong', upazilas: ['Panchlaish', 'Kotwali', 'Double Mooring', 'Pahartali'] },
  { district: 'Sylhet', upazilas: ['Sylhet Sadar', 'Jalalabad', 'Moglabazar', 'South Surma'] },
  { district: 'Rajshahi', upazilas: ['Rajpara', 'Boalia', 'Shah Makhdum', 'Motihar'] },
  { district: 'Khulna', upazilas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Doulatpur'] }
];

const alertTitles = [
  'Missing Person: Young Girl',
  'Lost Child at Shopping Mall',
  'Missing Elderly Person',
  'Stolen Motorcycle Alert',
  'Missing Person Last Seen Near Park',
  'Theft at Residential Area',
  'Missing Student',
  'Lost Pet - Dog',
  'Suspicious Activity Reported',
  'Missing Person - Urgent',
  'Vehicle Theft Alert',
  'Missing Teen',
  'Robbery Incident',
  'Missing Woman',
  'Lost Child at School'
];

const descriptions = [
  'Please help us find this person. Last seen wearing blue jeans and white shirt.',
  'Urgent: Missing since yesterday evening. Family is very worried.',
  'If you have any information, please contact immediately.',
  'Last seen in the local market area around 3 PM.',
  'Please share this alert to help spread awareness.',
  'Any information leading to finding will be appreciated.',
  'Contact police or family members if spotted.',
  'Height approximately 5\'6", dark hair, wearing glasses.',
  'Person has medical conditions, needs medication urgently.',
  'Reward offered for information leading to safe return.'
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('\n🗑️  Clearing existing data...');
  await Alert.deleteMany({});
  await Report.deleteMany({});
  await Notification.deleteMany({});
  await SocialShare.deleteMany({});
  await AreaStatistics.deleteMany({});
  console.log('✅ Database cleared');
}

async function createUsers() {
  console.log('\n👥 Checking for users...');
  
  let user = await User.findOne({ email: 'user@example.com' });
  if (!user) {
    // Don't hash password here - the User model will do it automatically
    user = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password123', // Plain password - will be hashed by pre-save hook
      dateOfBirth: new Date('1995-01-15'),
      bio: 'Test user account'
    });
    console.log('✅ Sample user created: user@example.com / password123');
  } else {
    console.log('✅ User already exists');
  }

  let police = await Police.findOne({ email: 'police@example.com' });
  if (!police) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('police123', 10);
    
    police = await Police.create({
      name: 'Officer Rahman',
      email: 'police@example.com',
      password: hashedPassword,
      policeId: 'PL2024001',
      badgeNumber: 'BADGE-001',
      rank: 'Inspector',
      department: 'Criminal Investigation',
      station: 'Mirpur Police Station',
      district: 'Dhaka',
      phoneNumber: '01798765432',
      dateOfBirth: new Date('1985-05-15'),
      joiningDate: new Date('2010-01-01')
    });
    console.log('✅ Sample police created: police@example.com / police123');
  } else {
    console.log('✅ Police already exists');
  }

  return { user, police };
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

async function seedAlerts(user, police) {
  console.log('\n🚨 Creating alerts...');
  const alerts = [];
  
  // Create 50 alerts across different areas
  for (let i = 0; i < 50; i++) {
    const districtData = getRandomElement(districts);
    const upazila = getRandomElement(districtData.upazilas);
    const isUserCreated = Math.random() > 0.3; // 70% user, 30% police
    
    const alert = {
      title: getRandomElement(alertTitles),
      description: getRandomElement(descriptions),
      district: districtData.district,
      upazila: upazila,
      location: `${upazila}, ${districtData.district}`,
      contact_info: isUserCreated ? user.phone : police.phone,
      status: getRandomElement(['active', 'active', 'active', 'resolved', 'archived']),
      createdBy: {
        userId: isUserCreated ? user._id : police._id,
        userType: isUserCreated ? 'User' : 'Police'
      },
      geo: {
        latitude: 23.8103 + (Math.random() - 0.5) * 0.5,
        longitude: 90.4125 + (Math.random() - 0.5) * 0.5
      },
      socialShares: {
        count: Math.floor(Math.random() * 100),
        platforms: {
          facebook: Math.floor(Math.random() * 30),
          twitter: Math.floor(Math.random() * 20),
          whatsapp: Math.floor(Math.random() * 40),
          telegram: Math.floor(Math.random() * 15),
          email: Math.floor(Math.random() * 10),
          other: Math.floor(Math.random() * 5)
        }
      },
      createdAt: getRandomDate(60),
      updatedAt: getRandomDate(30)
    };
    
    alerts.push(alert);
  }
  
  const createdAlerts = await Alert.insertMany(alerts);
  console.log(`✅ Created ${createdAlerts.length} alerts`);
  return createdAlerts;
}

async function seedReports(user, police) {
  console.log('\n📝 Creating reports...');
  const reports = [];
  
  const reportTitles = [
    'Suspicious Activity Near Market',
    'Traffic Accident Report',
    'Theft Incident at Night',
    'Vandalism in Park',
    'Lost Property',
    'Street Crime Incident',
    'Public Disturbance',
    'Safety Concern',
    'Missing Item Report',
    'Community Safety Issue'
  ];
  
  // Create 40 reports
  for (let i = 0; i < 40; i++) {
    const districtData = getRandomElement(districts);
    const upazila = getRandomElement(districtData.upazilas);
    const isUserCreated = Math.random() > 0.5;
    
    const report = {
      title: getRandomElement(reportTitles),
      description: getRandomElement(descriptions),
      district: districtData.district,
      upazila: upazila,
      location: `${upazila}, ${districtData.district}`,
      createdBy: isUserCreated ? {
        userId: user._id,
        userType: 'User'
      } : {
        userId: police._id,
        userType: 'Police'
      },
      geo: [{
        latitude: 23.8103 + (Math.random() - 0.5) * 0.5,
        longitude: 90.4125 + (Math.random() - 0.5) * 0.5
      }],
      media: [],
      createdAt: getRandomDate(60),
      updatedAt: getRandomDate(30)
    };
    
    reports.push(report);
  }
  
  const createdReports = await Report.insertMany(reports);
  console.log(`✅ Created ${createdReports.length} reports`);
  return createdReports;
}

async function seedNotifications(user, alerts) {
  console.log('\n🔔 Creating notifications...');
  const notifications = [];
  
  // Create 15 notifications
  for (let i = 0; i < 15; i++) {
    const alert = getRandomElement(alerts);
    const types = ['facial_recognition', 'alert_update', 'general'];
    const type = getRandomElement(types);
    
    let notification = {
      recipient: {
        userId: user._id,
        userType: 'User'
      },
      type: type,
      relatedAlert: alert._id,
      isRead: Math.random() > 0.5, // 50% read, 50% unread
      priority: getRandomElement(['low', 'medium', 'high', 'urgent']),
      createdAt: getRandomDate(30)
    };
    
    if (type === 'facial_recognition') {
      const confidence = 60 + Math.floor(Math.random() * 35);
      notification.title = 'Possible Match Found!';
      notification.message = `There is a ${confidence}% similarity match. This could be your missing person.`;
      notification.matchData = {
        confidence: confidence,
        matchedImageUrl: 'https://example.com/match.jpg',
        location: `${alert.upazila}, ${alert.district}`,
        timestamp: getRandomDate(5)
      };
      notification.priority = confidence > 80 ? 'urgent' : confidence > 60 ? 'high' : 'medium';
    } else if (type === 'alert_update') {
      notification.title = 'Alert Status Updated';
      notification.message = `Your alert "${alert.title}" has been updated.`;
    } else {
      notification.title = 'New Activity';
      notification.message = 'Someone has commented on your alert.';
    }
    
    notifications.push(notification);
  }
  
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`✅ Created ${createdNotifications.length} notifications`);
  return createdNotifications;
}

async function seedSocialShares(user, alerts) {
  console.log('\n🔗 Creating social shares...');
  const shares = [];
  
  // Create 100 social shares
  for (let i = 0; i < 100; i++) {
    const alert = getRandomElement(alerts);
    const platforms = ['facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'copy_link'];
    
    const share = {
      alert: alert._id,
      sharedBy: {
        userId: user._id,
        userType: 'User'
      },
      platform: getRandomElement(platforms),
      shareUrl: `https://example.com/alerts/${alert._id}`,
      metadata: {
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0',
        location: `${alert.district}`
      },
      createdAt: getRandomDate(60)
    };
    
    shares.push(share);
  }
  
  const createdShares = await SocialShare.insertMany(shares);
  console.log(`✅ Created ${createdShares.length} social shares`);
  return createdShares;
}

async function generateStatistics() {
  console.log('\n📊 Generating area statistics...');
  
  for (const districtData of districts) {
    for (const upazila of districtData.upazilas) {
      // Count alerts and reports for this area
      const totalAlerts = await Alert.countDocuments({
        district: districtData.district,
        upazila: upazila
      });
      
      const activeAlerts = await Alert.countDocuments({
        district: districtData.district,
        upazila: upazila,
        status: 'active'
      });
      
      const resolvedAlerts = await Alert.countDocuments({
        district: districtData.district,
        upazila: upazila,
        status: 'resolved'
      });
      
      const totalReports = await Report.countDocuments({
        district: districtData.district,
        upazila: upazila
      });
      
      if (totalAlerts === 0 && totalReports === 0) continue;
      
      // Calculate danger score
      let dangerScore = (activeAlerts * 10 * 0.4) + (totalAlerts * 2 * 0.3) + (totalReports * 1.5 * 0.3);
      dangerScore = Math.min(Math.round(dangerScore), 100);
      
      let dangerLevel = 'safe';
      if (dangerScore >= 75) dangerLevel = 'critical';
      else if (dangerScore >= 50) dangerLevel = 'high';
      else if (dangerScore >= 30) dangerLevel = 'moderate';
      else if (dangerScore >= 10) dangerLevel = 'low';
      
      // Create monthly trends
      const monthlyTrends = [];
      const months = ['December', 'November', 'October', 'September', 'August', 'July'];
      const currentYear = 2025;
      
      for (let i = 0; i < 6; i++) {
        monthlyTrends.push({
          month: months[i],
          year: i === 0 ? currentYear : currentYear - (i > 0 ? 1 : 0),
          alertCount: Math.floor(totalAlerts * (0.6 + Math.random() * 0.4)),
          reportCount: Math.floor(totalReports * (0.6 + Math.random() * 0.4)),
          dangerScore: Math.max(0, dangerScore + Math.floor((Math.random() - 0.5) * 20))
        });
      }
      
      await AreaStatistics.create({
        district: districtData.district,
        upazila: upazila,
        statistics: {
          totalAlerts,
          activeAlerts,
          resolvedAlerts,
          totalReports,
          missingPersons: Math.floor(totalAlerts * 0.4),
          theftIncidents: Math.floor(totalReports * 0.3),
          violenceIncidents: Math.floor(totalReports * 0.2),
          otherIncidents: Math.floor(totalReports * 0.5)
        },
        dangerLevel,
        dangerScore,
        monthlyTrends,
        lastUpdated: new Date()
      });
    }
  }
  
  const statsCount = await AreaStatistics.countDocuments();
  console.log(`✅ Generated statistics for ${statsCount} areas`);
}

async function seedDatabase() {
  console.log('\n🌱 Starting database seeding...\n');
  console.log('═══════════════════════════════════════');
  
  try {
    await connectDB();
    await clearDatabase();
    
    const { user, police } = await createUsers();
    const alerts = await seedAlerts(user, police);
    const reports = await seedReports(user, police);
    await seedNotifications(user, alerts);
    await seedSocialShares(user, alerts);
    await generateStatistics();
    
    console.log('\n═══════════════════════════════════════');
    console.log('\n✨ Database seeding completed successfully!\n');
    
    console.log('📊 Summary:');
    console.log(`   • Alerts: ${await Alert.countDocuments()}`);
    console.log(`   • Reports: ${await Report.countDocuments()}`);
    console.log(`   • Notifications: ${await Notification.countDocuments()}`);
    console.log(`   • Social Shares: ${await SocialShare.countDocuments()}`);
    console.log(`   • Area Statistics: ${await AreaStatistics.countDocuments()}`);
    console.log(`   • Users: ${await User.countDocuments()}`);
    console.log(`   • Police: ${await Police.countDocuments()}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   User: user@example.com / password123');
    console.log('   Police: police@example.com / police123');
    
    console.log('\n🚀 Your statistics dashboard is now ready!');
    console.log('   Visit: http://localhost:3000/statistics\n');
    
  } catch (error) {
    console.error('\n❌ Seeding Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
