// 🧪 Quick Backend Test Script
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 Testing Backend Connection...\n');

// Test 1: MongoDB Connection
async function testMongoDB() {
  try {
    console.log('1️⃣ Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!\n');

    // Test database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));

    await mongoose.connection.close();
    console.log('\n✅ MongoDB test passed!\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    return false;
  }
}

// Test 2: Environment Variables
function testEnvVars() {
  console.log('2️⃣ Testing Environment Variables...');

  const required = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
  let allPresent = true;

  required.forEach(key => {
    if (process.env[key]) {
      console.log(`✅ ${key}: Found`);
    } else {
      console.log(`❌ ${key}: Missing!`);
      allPresent = false;
    }
  });

  console.log(allPresent ? '\n✅ All env vars present!\n' : '\n❌ Some env vars missing!\n');
  return allPresent;
}

// Test 3: Get Network IP
import os from 'os';

function getLocalIP() {
  console.log('3️⃣ Getting Local IP Address...');
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`✅ Found IP: ${iface.address}`);
        console.log(`   Interface: ${name}\n`);
        return iface.address;
      }
    }
  }

  console.log('❌ No external IP found!\n');
  return null;
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════');
  console.log('     SWASTH BACKEND CONNECTION TEST     ');
  console.log('═══════════════════════════════════════\n');

  const envTest = testEnvVars();
  const ip = getLocalIP();
  const mongoTest = await testMongoDB();

  console.log('═══════════════════════════════════════');
  console.log('              SUMMARY                   ');
  console.log('═══════════════════════════════════════');
  console.log(`Environment Variables: ${envTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Local IP Address: ${ip ? '✅ ' + ip : '❌ FAIL'}`);
  console.log(`MongoDB Connection: ${mongoTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═══════════════════════════════════════\n');

  if (envTest && ip && mongoTest) {
    console.log('🎉 All tests passed! Backend is ready!\n');
    console.log('📱 Update your mobile app API URL to:');
    console.log(`   http://${ip}:${process.env.PORT || 3000}/api\n`);
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
  }

  process.exit(mongoTest ? 0 : 1);
}

runTests();
