const User = require('./src/models/User');
const Police = require('./src/models/police');
const mongoose = require('mongoose');
require('dotenv').config();

async function updateNotificationSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Update users without soundNotifications field
        const userResult = await User.updateMany(
            { soundNotifications: { $exists: false } },
            { $set: { soundNotifications: true } }
        );
        console.log(`Updated ${userResult.modifiedCount} users with soundNotifications field`);

        // Update police without soundNotifications field
        const policeResult = await Police.updateMany(
            { soundNotifications: { $exists: false } },
            { $set: { soundNotifications: true } }
        );
        console.log(`Updated ${policeResult.modifiedCount} police with soundNotifications field`);

        // Show sample user
        const sampleUser = await User.findOne({}).select('name emailNotifications inAppNotifications soundNotifications');
        console.log('\nSample user:', JSON.stringify(sampleUser, null, 2));

        // Show sample police
        const samplePolice = await Police.findOne({}).select('name emailNotifications inAppNotifications soundNotifications');
        if (samplePolice) {
            console.log('\nSample police:', JSON.stringify(samplePolice, null, 2));
        }

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateNotificationSettings();
