import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Use Node's native DNS resolver and prefer IPv4 for Atlas SRV lookups.
dns.setDefaultResultOrder('ipv4first');
// Fallback to public DNS servers when local DNS cannot resolve Atlas SRV records.
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const connectDB = async () => {
  // ── Lambda connection caching ────────────────────────────────────────────────
  // Lambda reuses the same Node.js process for warm invocations.
  // If Mongoose is already connected (readyState 1) or connecting (2), skip.
  if (mongoose.connection.readyState >= 1) {
    console.log('♻️  Reusing existing MongoDB connection');
    return;
  }

  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const connectOptions = {
    family: 4,
    serverSelectionTimeoutMS: 8000,  // fail fast so Lambda doesn't time out
    socketTimeoutMS: 30000,
    maxPoolSize: 5,                   // limit pool size — Lambda scales via concurrency
    minPoolSize: 1,
  };

  console.log('Connecting to MongoDB Atlas...');
  console.log('NODE_ENV:', process.env.NODE_ENV);

  try {
    const conn = await mongoose.connect(mongoURI, connectOptions);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);

    // Clean up legacy unique indexes that break guest operations
    try {
      await conn.connection.db?.collection('conversations').dropIndex('storeId_1_customerId_1');
    } catch (_) {
      // Index already dropped or doesn't exist
    }
  } catch (error: any) {
    // Retry once with explicit public DNS in case of SRV resolution failure
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  DNS issue, retrying with public DNS...');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      try {
        const conn = await mongoose.connect(mongoURI, connectOptions);
        console.log(`✅ MongoDB Connected (retry): ${conn.connection.host}`);
        return;
      } catch (retryError: any) {
        console.error('❌ Retry failed:', retryError.message);
        throw retryError; // let Lambda return 500, don't exit the process
      }
    }

    console.error('❌ MongoDB Connection Failed:', error.message);
    throw error; // throw instead of process.exit — keeps the Lambda container alive
  }
};

export default connectDB;

