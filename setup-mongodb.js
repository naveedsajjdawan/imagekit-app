// MongoDB Setup Script
// Run this with: node setup-mongodb.js

const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  console.log('🔧 Setting up MongoDB connection...');
  
  // Test different connection strings
  const connectionStrings = [
    'mongodb://127.0.0.1:27017/ai-app',
    'mongodb://localhost:27017/ai-app',
    'mongodb://0.0.0.0:27017/ai-app'
  ];
  
  for (const uri of connectionStrings) {
    console.log(`\n📡 Testing: ${uri}`);
    
    try {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      
      await client.connect();
      console.log('✅ Connection successful!');
      
      const db = client.db('ai-app');
      const collections = await db.listCollections().toArray();
      console.log('📚 Collections:', collections.map(c => c.name));
      
      // Test creating a user
      const usersCollection = db.collection('users');
      const testUser = {
        email: 'test@example.com',
        password: 'testpassword',
        createdAt: new Date()
      };
      
      const result = await usersCollection.insertOne(testUser);
      console.log('👤 Test user created with ID:', result.insertedId);
      
      // Clean up
      await usersCollection.deleteOne({ _id: result.insertedId });
      console.log('🧹 Test user cleaned up');
      
      await client.close();
      console.log('🔌 Connection closed');
      
      console.log(`\n🎉 SUCCESS! Use this connection string in your .env.local:`);
      console.log(`MONGODB_URI=${uri}`);
      return uri;
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
    }
  }
  
  console.log('\n💡 No local MongoDB connection worked. You need to:');
  console.log('1. Install MongoDB Community Server');
  console.log('2. Start MongoDB service');
  console.log('3. Or use MongoDB Atlas (cloud)');
  
  return null;
}

setupMongoDB().catch(console.error);
