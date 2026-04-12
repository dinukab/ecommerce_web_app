import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Use Node's native DNS resolver and prefer IPv4 for Atlas SRV lookups.
dns.setDefaultResultOrder('ipv4first');
// Fallback to public DNS servers when local DNS cannot resolve Atlas SRV records.
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!mongoURI);
  console.log('FULL MONGODB_URI:', mongoURI);
  console.log('Using DNS servers:', dns.getServers());

  if (!mongoURI) {
    console.error('❌ MongoDB Connection Failed');
    throw new Error('MONGODB_URI is not defined in .env file');
  }

  const connectOptions = {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  };

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoURI, connectOptions);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
  } catch (error) {
    if (error.message.includes('querySrv ECONNREFUSED')) {
      console.error('❌ MongoDB SRV DNS query failed. Retrying with public DNS servers...');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      try {
        const conn = await mongoose.connect(mongoURI, connectOptions);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database: ${conn.connection.name}`);
        return;
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError.message);
      }
    }

    console.error('❌ MongoDB Connection Failed');
    console.error('Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
