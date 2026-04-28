import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const findLogo = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const col of collections) {
      const docs = await db.collection(col.name).find({ 
        $or: [
          { logo: { $exists: true } },
          { logoUrl: { $exists: true } },
          { image: { $exists: true } },
          { content: { $exists: true } }
        ]
      }).limit(5).toArray();
      
      if (docs.length > 0) {
        console.log(`--- Collection: ${col.name} ---`);
        console.log(JSON.stringify(docs, (key, value) => {
            if (value && value.buffer) return `[Buffer ${value.length}]`;
            if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...';
            return value;
        }, 2));
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findLogo();
