// Database Cleanup Script for Health Logs
// This script removes old incorrect records from the healthlogs collection
// 
// Issues it fixes:
// 1. Records with 'email' field instead of 'userEmail'
// 2. Records with invalid type values (glucose, oxygen, etc.)
// 3. Records with missing required fields
//
// Usage:
//   node backend/scripts/cleanup-health-logs.js
//   OR
//   npm run cleanup:health (if added to package.json)

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HealthLog from '../models/HealthLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const VALID_TYPES = [
  'weight',
  'height',
  'bmi',
  'bloodPressure',
  'sugar',
  'water',
  'symptoms',
  'heartRate',
  'temperature',
];

async function cleanupHealthLogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, { dbName: 'swasth' });
    console.log('✅ Connected to MongoDB');

    // Find all records with 'email' field (should be 'userEmail')
    const emailFieldRecords = await mongoose.connection.db
      .collection('healthlogs')
      .find({ email: { $exists: true } })
      .toArray();

    console.log(`\n📊 Found ${emailFieldRecords.length} records with 'email' field`);

    // Migrate email → userEmail
    if (emailFieldRecords.length > 0) {
      for (const record of emailFieldRecords) {
        await mongoose.connection.db.collection('healthlogs').updateOne(
          { _id: record._id },
          {
            $set: { userEmail: record.email },
            $unset: { email: '' },
          }
        );
      }
      console.log(`✅ Migrated ${emailFieldRecords.length} records from 'email' to 'userEmail'`);
    }

    // Find records with invalid type values
    const invalidTypeRecords = await mongoose.connection.db
      .collection('healthlogs')
      .find({
        type: { $nin: VALID_TYPES },
      })
      .toArray();

    console.log(`\n📊 Found ${invalidTypeRecords.length} records with invalid type values`);

    if (invalidTypeRecords.length > 0) {
      // Show sample invalid types
      const invalidTypes = [...new Set(invalidTypeRecords.map((r) => r.type))];
      console.log(`   Invalid types found: ${invalidTypes.join(', ')}`);

      // Map common invalid types to valid ones
      const typeMapping = {
        glucose: 'sugar',
        oxygen: null, // Remove oxygen records (not in enum)
      };

      let migrated = 0;
      let deleted = 0;

      for (const record of invalidTypeRecords) {
        const mappedType = typeMapping[record.type];

        if (mappedType) {
          // Migrate to valid type
          await mongoose.connection.db.collection('healthlogs').updateOne(
            { _id: record._id },
            { $set: { type: mappedType } }
          );
          migrated++;
        } else {
          // Delete records that can't be mapped
          await mongoose.connection.db.collection('healthlogs').deleteOne({ _id: record._id });
          deleted++;
        }
      }

      console.log(`✅ Migrated ${migrated} records to valid types`);
      console.log(`✅ Deleted ${deleted} records with unmappable types`);
    }

    // Find records missing required fields
    const invalidRecords = await mongoose.connection.db
      .collection('healthlogs')
      .find({
        $or: [
          { userEmail: { $exists: false } },
          { type: { $exists: false } },
          { value: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`\n📊 Found ${invalidRecords.length} records with missing required fields`);

    if (invalidRecords.length > 0) {
      const deleteResult = await mongoose.connection.db.collection('healthlogs').deleteMany({
        $or: [
          { userEmail: { $exists: false } },
          { type: { $exists: false } },
          { value: { $exists: false } },
        ],
      });

      console.log(`✅ Deleted ${deleteResult.deletedCount} invalid records`);
    }

    // Final summary
    const totalRecords = await mongoose.connection.db.collection('healthlogs').countDocuments();
    console.log(`\n✅ Cleanup complete! Total valid records: ${totalRecords}`);

    // Verify all remaining records are valid
    const remainingInvalid = await mongoose.connection.db
      .collection('healthlogs')
      .find({
        $or: [
          { userEmail: { $exists: false } },
          { type: { $nin: VALID_TYPES } },
          { value: { $exists: false } },
        ],
      })
      .countDocuments();

    if (remainingInvalid === 0) {
      console.log('✅ All remaining records are valid!');
    } else {
      console.log(`⚠️  Warning: ${remainingInvalid} invalid records still exist`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupHealthLogs();


