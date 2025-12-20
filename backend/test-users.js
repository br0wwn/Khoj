require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Police = require('./src/models/police');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const citizens = await User.find({});
    const police = await Police.find({});

    console.log(`\nCitizens in database: ${citizens.length}`);
    citizens.forEach(c => console.log(`  - ${c.name} (${c.email})`));

    console.log(`\nPolice in database: ${police.length}`);
    police.forEach(p => console.log(`  - ${p.name} (${p.email})`));

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUsers();
