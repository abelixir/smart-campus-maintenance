const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const Category = require('./models/Category');

(async () => {
  try {
    const possibleKeys = ['MONGODB_URI', 'MONGO_URI', 'DATABASE_URL', 'DB_URI'];
    let uri = null;
    let usedKey = null;

    for (const key of possibleKeys) {
      if (process.env[key]) {
        uri = process.env[key];
        usedKey = key;
        break;
      }
    }

    console.log('Found Mongo key:', usedKey || 'NONE');
    console.log('URI type:', typeof uri);

    if (!uri) {
      console.log('Available env keys:', Object.keys(process.env).filter((k) => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD')));
      throw new Error('No Mongo connection string found in .env');
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const deletedComplaints = await Complaint.deleteMany({});
    const deletedCategories = await Category.deleteMany({});

    console.log('Deleted complaints:', deletedComplaints.deletedCount);
    console.log('Deleted categories:', deletedCategories.deletedCount);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
})();